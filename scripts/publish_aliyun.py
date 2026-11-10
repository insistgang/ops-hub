#!/usr/bin/env python3
"""scripts/publish_aliyun.py: 把公开产物发布到阿里云 ops-hub 站点。

背景
----
GitOps 只负责推 GitHub Pages。阿里云用独立的发布目录
（/var/www/ops-hub-releases/<commit>）并由 nginx root 指向它，
所以「推 GitHub」不会自动更新阿里云，两站会一天天分叉。

本脚本把阿里云发布接进流水线：打包 → 上传 → 建发布目录 → 逐文件校验 →
切换 nginx 指向 → reload → 线上核验。

失败策略
--------
网络或 SSH 不可用时只记录 Warning，不影响本地采集与 Git 推送
（与 Git push 失败的处理一致：本地文件照常更新，下次网络恢复自动同步）。
"""

import argparse
import os
import subprocess
import sys
import tempfile
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SSH_HOST = os.environ.get("OPS_ALIYUN_HOST", "aliyun")
RELEASE_ROOT = "/var/www/ops-hub-releases"
OPS_CONF = "/etc/nginx/sites-available/ops.insistgang.top"
FINANCE_CONF = "/etc/nginx/sites-available/finance.insistgang.top"

# 公开站需要托管的文件（与 GitOps 打包口径一致）
PUBLIC_PATHS = [
    "index.html", "favicon.svg", "favicon-32.png", "favicon-192.png",
    "css", "js", "data/public",
    "finance/native-workspace.css", "finance/native-workspace.js",
    "vitaflow/native-workspace.css", "vitaflow/native-workspace.js",
    "weight-tracker/native-workspace.css", "weight-tracker/native-workspace.js",
]

REMOTE_SCRIPT = r"""#!/bin/bash
set -euo pipefail
SHA="$1"
DIR="$2"
TS=$(date -u +%Y%m%dT%H%M%SZ)

if [ -e "$DIR" ]; then
  echo "ALREADY_EXISTS"
else
  mkdir -p "$DIR"
  tar -xf "/tmp/ops-hub-$SHA-public.tar" -C "$DIR"
  chown -R root:root "$DIR"
  cd "$DIR"
  OK=$(md5sum -c "/tmp/ops-checksums-$SHA.txt" 2>/dev/null | grep -c ': OK' || true)
  FAILED=$(md5sum -c "/tmp/ops-checksums-$SHA.txt" 2>/dev/null | grep -c FAILED || true)
  echo "CHECKSUM ok=$OK failed=$FAILED"
  if [ "$FAILED" != "0" ]; then
    rm -rf "$DIR"
    echo "CHECKSUM_FAILED"
    exit 1
  fi
fi

# 切换两个站点的 ops-hub 指向（阿里云站 root，财务站 alias）
cp -a "$3" "/root/ops-nginx-before-$SHA-$TS.conf"
cp -a "$4" "/root/finance-nginx-before-$SHA-$TS.conf"
sed -i "s#ops-hub-releases/[0-9a-f]\{7,\}#ops-hub-releases/$SHA#g" "$3" "$4"
grep -n 'ops-hub-releases' "$3" "$4"

nginx -t
systemctl reload nginx
sleep 1
echo "NGINX $(systemctl is-active nginx)"

# 发布目录只保留最近 10 个，避免每天两次同步把磁盘堆满
KEEP=10
COUNT=$(ls -1dt "$5"/*/ 2>/dev/null | wc -l)
if [ "$COUNT" -gt "$KEEP" ]; then
  ls -1dt "$5"/*/ 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
    case "$old" in
      *"$SHA"/*) continue ;;
    esac
    rm -rf "$old"
    echo "PRUNED $(basename "$old")"
  done
fi
rm -f "/tmp/ops-hub-$SHA-public.tar" "/tmp/ops-checksums-$SHA.txt"
"""


def run(cmd, timeout=120):
    return subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                          text=True, timeout=timeout)


def build_tar(sha, workdir):
    """用 git archive 从该提交导出公开子集，保证内容 == 提交本身。"""
    tar_path = workdir / f"ops-hub-{sha}-public.tar"
    args = ["git", "-C", str(BASE_DIR), "archive", "--format=tar", sha, "--"] + PUBLIC_PATHS
    with open(tar_path, "wb") as handle:
        result = subprocess.run(args, stdout=handle, stderr=subprocess.PIPE, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"git archive 失败: {result.stderr.strip()}")
    return tar_path


def build_checksums(tar_path, workdir, sha):
    """解包后逐文件算 md5，供服务器端复核。"""
    extract_dir = workdir / "extract"
    extract_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run(["tar", "-xf", str(tar_path), "-C", str(extract_dir)], check=True)
    listing = []
    for path in sorted(extract_dir.rglob("*")):
        if path.is_file():
            listing.append(path.relative_to(extract_dir).as_posix())
    if not listing:
        raise RuntimeError("公开子集为空，拒绝发布")
    digest = subprocess.run(
        ["md5sum"] + listing, cwd=str(extract_dir),
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if digest.returncode != 0:
        raise RuntimeError(f"md5sum 失败: {digest.stderr.strip()}")
    checksum_path = workdir / f"ops-checksums-{sha}.txt"
    checksum_path.write_text(digest.stdout, encoding="utf-8")
    return checksum_path, len(listing)


def publish(sha=None, dry_run=False):
    if sha is None:
        sha = subprocess.run(["git", "-C", str(BASE_DIR), "rev-parse", "--short", "HEAD"],
                             stdout=subprocess.PIPE, text=True).stdout.strip()
    with tempfile.TemporaryDirectory(prefix="ops-publish-") as tmp:
        workdir = Path(tmp)
        try:
            tar_path = build_tar(sha, workdir)
            checksum_path, count = build_checksums(tar_path, workdir, sha)
        except Exception as error:
            print(f"⚠️ 打包失败，跳过阿里云发布: {error}")
            return False

        if dry_run:
            print(f"（dry-run）将发布 {sha}，共 {count} 个文件")
            return True

        upload = run(["scp", "-q", str(tar_path), str(checksum_path), f"{SSH_HOST}:/tmp/"], timeout=300)
        if upload.returncode != 0:
            print(f"⚠️ 上传阿里云失败（本地文件照常，GitHub 已推送）: {upload.stderr.strip()}")
            return False

        # bash -s 从 stdin 读脚本，必须用 input 传，不能走 run()
        result = subprocess.run(
            ["ssh", "-o", "BatchMode=yes", SSH_HOST, "bash", "-s", "--", sha,
             f"{RELEASE_ROOT}/{sha}", OPS_CONF, FINANCE_CONF, RELEASE_ROOT],
            input=REMOTE_SCRIPT, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            text=True, timeout=300)
        if result.returncode != 0:
            print(f"⚠️ 阿里云发布失败（本地文件照常，GitHub 已推送）: {result.stderr.strip()[:400]}")
            return False
        print(result.stdout.strip())
        print(f"✅ 阿里云已发布 {sha}（{count} 个文件）")
        return True


def verify(sha=None):
    """线上核验：文件校验和与首页可达。"""
    import urllib.request
    if sha is None:
        sha = subprocess.run(["git", "-C", str(BASE_DIR), "rev-parse", "--short", "HEAD"],
                             stdout=subprocess.PIPE, text=True).stdout.strip()
    with tempfile.TemporaryDirectory(prefix="ops-verify-") as tmp:
        workdir = Path(tmp)
        tar_path = build_tar(sha, workdir)
        checksum_path, count = build_checksums(tar_path, workdir, sha)
        expected = {}
        for line in checksum_path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                digest, name = line.split(None, 1)
                expected[name.strip()] = digest
        import hashlib
        ok = fail = 0
        for name, digest in expected.items():
            url = f"https://ops.insistgang.top/{name}"
            try:
                with urllib.request.urlopen(url, timeout=20) as response:
                    body = response.read()
            except Exception as error:
                print(f"  ❌ {name}: {error}")
                fail += 1
                continue
            if hashlib.md5(body).hexdigest() == digest:
                ok += 1
            else:
                print(f"  ❌ 校验和不符 {name}")
                fail += 1
        print(f"✅ 线上核验: 通过 {ok} / 共 {count}，失败 {fail}")
        return fail == 0


def main(argv=None):
    parser = argparse.ArgumentParser(description="发布公开产物到阿里云 ops-hub 站点")
    parser.add_argument("--sha", help="要发布的提交（默认当前 HEAD）")
    parser.add_argument("--dry-run", action="store_true", help="只打包不发布")
    parser.add_argument("--verify", action="store_true", help="只做线上核验")
    args = parser.parse_args(argv)
    if args.verify:
        return 0 if verify(args.sha) else 1
    return 0 if publish(args.sha, args.dry_run) else 1


if __name__ == "__main__":
    sys.exit(main())
