#!/usr/bin/env python3
"""scripts/sync_all.py: 统一同步入口（定时任务与 ops sync 都走这里）。

顺序
----
1. 采集：探针 + 知识库投影 + 公开脱敏产物
2. GitOps：提交并推送 GitHub（GitHub Pages 由此刷新）
3. 阿里云：发布到独立 release 目录并切换 nginx（GitHub 推送不会自动更新它）
4. 财务：把日记里的个人消费同步进账本并发布

失败策略
--------
每一步独立执行。后一步失败只记 Warning，不回滚前面已完成的结果——
网络故障时本地文件照常更新，下次网络恢复自动同步，与 Git push 失败的处理一致。
"""

import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SCRIPTS = BASE_DIR / "scripts"
sys.path.insert(0, str(SCRIPTS))


def step(title, command):
    print(f"\n=== {title} ===")
    try:
        result = subprocess.run(command, cwd=str(BASE_DIR))
    except Exception as error:
        print(f"⚠️ {title} 执行异常: {error}")
        return False
    if result.returncode != 0:
        print(f"⚠️ {title} 未完全成功（退出码 {result.returncode}），后续步骤继续。")
        return False
    return True


def main():
    import collector

    ok = True
    ok &= step("1/4 采集 + GitOps 推送", [sys.executable, str(SCRIPTS / "collector.py"), "--push"])
    ok &= step("2/4 发布阿里云", [sys.executable, str(SCRIPTS / "publish_aliyun.py")])
    ok &= step("3/4 账本同步与发布", [sys.executable, str(SCRIPTS / "finance_publish.py")])
    step("4/4 线上核验", [sys.executable, str(SCRIPTS / "publish_aliyun.py"), "--verify"])
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
