#!/usr/bin/env python3
"""scripts/finance_publish.py: 把日记里的个人消费同步进财务账本并发布到服务器。

流程
----
读取线上账本 → 从知识库日记解析「当日个人实付支出合计」→ 合并进账本 →
同事与外部导师姓名代号化 → 上传到新的 release 目录 → 切换符号链接 → 线上核验。

口径
----
只加不改：日记里没写的日期不动账本；重复运行不产生重复记录。
应急借款按账本既有口径记入应收，不计消费。
账本文件不进仓库，只存在服务器上；本脚本不在本地留存账本副本。
"""

import argparse
import hashlib
import json
import os
import subprocess
import sys
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "scripts"))

import finance_sync

LEDGER_URL = "https://finance.insistgang.top/data/financial_data.json"
SSH_HOST = os.environ.get("OPS_ALIYUN_HOST", "aliyun")
RELEASE_ROOT = "/var/www/.finance-releases"
LIVE_LINK = "/var/www/finance/data/financial_data.json"

REMOTE_SCRIPT = r"""#!/bin/bash
set -euo pipefail
SHA="$1"
TS=$(date -u +%Y%m%dT%H%M%SZ)
DIR="$2"
if [ ! -e "$DIR" ]; then
  mkdir -p "$DIR/data"
  cp /tmp/financial_data-$SHA.json "$DIR/data/financial_data.json"
  chown -R root:root "$DIR"
fi
# 旧目标留档，便于回滚
if [ -e "$3" ]; then
  cp -a "$3" "/root/financial_data.json.before-$SHA.bak" 2>/dev/null || true
fi
ln -sfn "$DIR/data/financial_data.json" "$3"
echo "LINK $(readlink -f "$3")"
rm -f /tmp/financial_data-$SHA.json
"""


def scrub_deep(node, aliases):
    """把账本里出现的第三方姓名统一代号化。"""
    if isinstance(node, dict):
        return {key: scrub_deep(value, aliases) for key, value in node.items()}
    if isinstance(node, list):
        return [scrub_deep(item, aliases) for item in node]
    if isinstance(node, str):
        return finance_sync.scrub(node, aliases)
    return node


def fetch_ledger():
    with urllib.request.urlopen(LEDGER_URL, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def sync_from_diary(ledger, knowledge_dir=None):
    """把日记里写明实付合计的日期合并进账本，返回 (变更说明, 是否变化)。"""
    period = str(ledger.get("period") or "2026-11")
    year, month = int(period.split("-")[0]), int(period.split("-")[1])
    root = Path(knowledge_dir) if knowledge_dir else Path.home() / "Documents" / "knowledge"
    daily_dir = root / "01-Daily" / period
    if not daily_dir.exists():
        print(f"⚠️ 日记目录不存在：{daily_dir}")
        return [], False

    aliases = finance_sync.load_aliases()
    applied = []
    changed = False
    for path in sorted(daily_dir.glob("*.md")):
        parsed = finance_sync.parse_day(path.read_text(encoding="utf-8"), 0)
        if parsed is None:
            continue
        match = __import__("re").search(r"(\d{4})-(\d{2})-(\d{2})", path.name)
        if not match:
            continue
        parsed["day"] = int(match.group(3))
        if parsed.get("error"):
            print(f"❌ {path.name}: {parsed['error']}")
            continue
        did_change, message = finance_sync.apply_day(ledger, parsed, aliases, year, month)
        if did_change:
            changed = True
            applied.append(message)
            print(f"✅ {message}")
        else:
            print(f"ℹ️  {message}")
    return applied, changed


def publish(ledger, dry_run=False):
    content = json.dumps(ledger, ensure_ascii=False, indent=2) + "\n"
    digest = hashlib.sha256(content.encode("utf-8")).hexdigest()[:32]
    sha = digest[:12]
    if dry_run:
        print(f"（dry-run）将发布 release-{digest}，asOf={ledger.get('asOf')} "
              f"total={ledger.get('transactions', {}).get('total')}")
        return True

    local = Path("/tmp") / f"financial_data-{sha}.json"
    local.write_text(content, encoding="utf-8")
    upload = subprocess.run(["scp", "-q", str(local), f"{SSH_HOST}:/tmp/"],
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=300)
    if upload.returncode != 0:
        print(f"⚠️ 账本上传失败（服务器仍用旧快照）: {upload.stderr.strip()}")
        return False
    result = subprocess.run(
        ["ssh", "-o", "BatchMode=yes", SSH_HOST, "bash", "-s", "--", sha,
         f"{RELEASE_ROOT}/release-{digest}", LIVE_LINK],
        input=REMOTE_SCRIPT, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        text=True, timeout=300)
    if result.returncode != 0:
        print(f"⚠️ 账本发布失败: {result.stderr.strip()[:400]}")
        return False
    print(result.stdout.strip())
    print(f"✅ 账本已发布 release-{digest}")
    local.unlink(missing_ok=True)
    return True


def verify():
    ledger = fetch_ledger()
    transactions = ledger.get("transactions", {})
    print(f"  asOf={ledger.get('asOf')}  total={transactions.get('total')}  "
          f"count={transactions.get('count')}  maxDay={transactions.get('maxDay')}")
    receivables = ledger.get("receivables") or []
    print(f"  应收条数={len(receivables)}  应收合计="
          f"{ledger.get('summary', {}).get('receivablesTotal')}")
    return True


def main(argv=None):
    parser = argparse.ArgumentParser(description="把日记消费同步进财务账本并发布")
    parser.add_argument("--dry-run", action="store_true", help="只本地同步不发布")
    parser.add_argument("--verify", action="store_true", help="只做线上核验")
    parser.add_argument("--knowledge-dir", help="知识库根目录，默认 ~/Documents/knowledge")
    args = parser.parse_args(argv)

    if args.verify:
        return 0 if verify() else 1

    ledger = fetch_ledger()
    print(f"📖 已读取线上账本：asOf={ledger.get('asOf')} "
          f"total={ledger.get('transactions', {}).get('total')}")
    before = json.dumps(ledger, ensure_ascii=False, sort_keys=True)
    applied, changed = sync_from_diary(ledger, args.knowledge_dir)

    # 姓名代号化本身也是内容变更：即使没有新日记，脱敏结果不同也要发布
    aliases = finance_sync.load_aliases()
    ledger = scrub_deep(ledger, aliases)
    after = json.dumps(ledger, ensure_ascii=False, sort_keys=True)
    changed = changed or before != after

    if not changed:
        print("ℹ️  账本已是最新，无需发布。")
        return 0

    return 0 if publish(ledger, args.dry_run) else 1


if __name__ == "__main__":
    sys.exit(main())
