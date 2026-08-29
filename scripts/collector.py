#!/usr/bin/env python3
"""
scripts/collector.py: Aggregates real data from probe, git repos, career records, memory checks,
and device task allocation matrix.
Saves to data/status.json AND data/status.js (for zero-CORS offline file:/// compatibility).
Supports --push to trigger GitOps auto-commit & push to GitHub.
"""

import os
import sys
import json
import fcntl
import tempfile
import subprocess
from contextlib import contextmanager
from datetime import datetime, date
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

sys.path.insert(0, str(Path(__file__).resolve().parent))
import probe

# Files managed by the GitOps pipeline (used for dirty-worktree protection)
GITOPS_FILES = [
    "data/status.json",
    "data/status.js",
    "data/memory_rules.js",
    "data/daily_checks.json",
    "data/career_records.json",
    "data/device_allocation.json",
]

def load_json(path, default):
    """Read a JSON file gracefully; fall back to default on corruption/missing."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return default

def atomic_write_text(path, content):
    """Write a file atomically: temp file in same directory + os.replace()."""
    tmp_fd, tmp_path = tempfile.mkstemp(dir=str(path.parent), prefix=path.name + ".", suffix=".tmp")
    try:
        with os.fdopen(tmp_fd, "w", encoding="utf-8") as f:
            f.write(content)
        os.replace(tmp_path, path)
    except Exception:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
        raise

def rollover_daily_checks(data):
    """
    Cross-day rollover: if the record is not today's, archive it into history
    and reset the four checks. Returns (data, rolled_over: bool).
    """
    today_str = datetime.now().strftime("%Y-%m-%d")
    if data.get("date") == today_str:
        return data, False
    history = data.get("history") or []
    if data.get("date") and data.get("checks"):
        history.append({"date": data["date"], "checks": data["checks"]})
    new_data = {
        "date": today_str,
        "checks": {"起了": False, "动了": False, "写了": False, "关了": False},
        "history": history,
    }
    return new_data, True

@contextmanager
def ops_lock():
    """Advisory file lock preventing concurrent collect/gitops runs (CLI vs launchd)."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    fd = os.open(DATA_DIR / ".opshub.lock", os.O_CREAT | os.O_RDWR)
    try:
        fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        os.close(fd)
        raise RuntimeError("另一个 ops 采集/同步进程正在运行，本次已跳过。")
    try:
        yield
    finally:
        fcntl.flock(fd, fcntl.LOCK_UN)
        os.close(fd)

def get_git_info(repo_path):
    p = Path(repo_path).expanduser()
    if not p.exists():
        return {
            "git_available": False,
            "commit_hash": "-",
            "commit_time": "-",
            "commit_msg": "路径不存在",
            "branch": "-"
        }
    
    target_repo = None
    if (p / ".git").exists():
        target_repo = p
    else:
        for sub in p.iterdir():
            if sub.is_dir() and (sub / ".git").exists():
                target_repo = sub
                break

    if not target_repo:
        try:
            latest_mtime = 0
            for root, _, files in os.walk(p):
                for f in files:
                    if not f.startswith("."):
                        fp = os.path.join(root, f)
                        latest_mtime = max(latest_mtime, os.path.getmtime(fp))
            if latest_mtime > 0:
                t_str = datetime.fromtimestamp(latest_mtime).strftime("%Y-%m-%d %H:%M")
                return {
                    "git_available": False,
                    "commit_hash": "LOCAL",
                    "commit_time": t_str,
                    "commit_msg": f"本地代码活跃 (更新于 {t_str})",
                    "branch": "local"
                }
        except Exception:
            pass

        return {
            "git_available": False,
            "commit_hash": "-",
            "commit_time": "-",
            "commit_msg": "本地就绪",
            "branch": "-"
        }

    try:
        cmd = ["git", "-C", str(target_repo), "log", "-1", "--format=%h|%an|%ad|%s", "--date=format:%Y-%m-%d %H:%M"]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=2)
        if res.returncode == 0 and res.stdout.strip():
            parts = res.stdout.strip().split("|")
            h = parts[0] if len(parts) > 0 else "-"
            author = parts[1] if len(parts) > 1 else "-"
            t = parts[2] if len(parts) > 2 else "-"
            msg = parts[3] if len(parts) > 3 else "-"
            
            b_res = subprocess.run(["git", "-C", str(target_repo), "branch", "--show-current"], stdout=subprocess.PIPE, text=True, timeout=2)
            branch = b_res.stdout.strip() or "main"
            repo_label = target_repo.name if target_repo != p else ""
            
            return {
                "git_available": True,
                "sub_repo": repo_label,
                "commit_hash": h,
                "author": author,
                "commit_time": t,
                "commit_msg": msg,
                "branch": branch
            }
    except Exception:
        pass

    return {
        "git_available": False,
        "commit_hash": "-",
        "commit_time": "-",
        "commit_msg": "读取 Git 失败",
        "branch": "-"
    }

def calculate_days_left(target_date_str):
    try:
        target = datetime.strptime(target_date_str, "%Y-%m-%d").date()
        today = date.today()
        diff = (target - today).days
        return max(diff, 0)
    except Exception:
        return 0

def collect_all():
    # 1. Network Probe (Tri-Device)
    network_probe = probe.probe_all()

    # 2. Career Records
    career_list = load_json(DATA_DIR / "career_records.json", [])
    
    career_stats = {
        "total": len(career_list),
        "interviewing": len([c for c in career_list if "面" in c.get("status", "")]),
        "tests": len([c for c in career_list if "笔试" in c.get("status", "")]),
        "screening": len([c for c in career_list if "初筛" in c.get("status", "")]),
        "applied": len([c for c in career_list if "投递" in c.get("status", "")]),
        "offer": len([c for c in career_list if "offer" in c.get("status", "").lower() or "录用" in c.get("status", "")])
    }

    # 3. Projects & Exams
    raw_projects = load_json(DATA_DIR / "projects.json", [])
    
    enriched_projects = []
    for item in raw_projects:
        entry = dict(item)
        if entry.get("type") == "exam":
            days = calculate_days_left(entry.get("target_date", "2026-12-31"))
            entry["days_left"] = days
        else:
            path = entry.get("path")
            if path:
                git_meta = get_git_info(path)
                entry.update(git_meta)
        enriched_projects.append(entry)

    # 4. Daily Checks (with cross-day rollover & archive)
    checks_file = DATA_DIR / "daily_checks.json"
    daily_checks = load_json(checks_file, {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "checks": {"起了": False, "动了": False, "写了": False, "关了": False},
        "history": []
    })
    daily_checks, rolled = rollover_daily_checks(daily_checks)
    if rolled:
        archived = daily_checks["history"][-1]["date"] if daily_checks["history"] else "昨日"
        print(f"🗓️  检测到跨天，已归档 {archived} 的打卡记录并重置今日四勾。")
        atomic_write_text(checks_file, json.dumps(daily_checks, ensure_ascii=False, indent=2) + "\n")

    # 5. Weight Tracker Challenge
    start_date = date(2026, 8, 24)
    end_date = date(2026, 9, 30)
    today = date.today()
    total_days = (end_date - start_date).days + 1
    current_day = max(min((today - start_date).days + 1, total_days), 1)
    weight_challenge = {
        "title": "2026 秋季三人减重决战",
        "live_url": "https://insistgang.top/weight-tracker/",
        "period": "2026-08-24 ~ 2026-09-30",
        "total_days": total_days,
        "current_day": current_day,
        "days_left": max((end_date - today).days, 0),
        "members": ["刘钢", "张庭磊", "卢轩"],
        "target": "不找借口 · 真实记录 · 早晚双测 · 责任捆绑 · 顶峰相见"
    }

    # 6. Device Allocation Matrix
    device_allocation = load_json(DATA_DIR / "device_allocation.json", {})

    # 7. Memory Rules
    memory_rules = load_json(DATA_DIR / "memory_rules.json", {})

    # 8. Assemble Snapshot
    status_snapshot = {
        "meta": {
            "title": "Ops-Hub // Personal Operations Console",
            "author": "Leo (insistgang)",
            "version": "1.2.1",
            "last_synced": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "sync_mode": "Level 2 Real Probe (Zero Mock)",
            "github_repo": "https://github.com/insistgang/ops-hub"
        },
        "topology": network_probe,
        "career_summary": {
            "stats": career_stats,
            "records": career_list
        },
        "projects_and_exams": enriched_projects,
        "weight_challenge": weight_challenge,
        "daily_checks": daily_checks,
        "device_allocation": device_allocation
    }

    # Write status.json (atomic: temp file + os.replace, no half-written files)
    atomic_write_text(DATA_DIR / "status.json", json.dumps(status_snapshot, ensure_ascii=False, indent=2) + "\n")

    # Write status.js (window.__OPS_STATUS__) for instant file:/// zero-CORS loading!
    atomic_write_text(DATA_DIR / "status.js", "window.__OPS_STATUS__ = " + json.dumps(status_snapshot, ensure_ascii=False) + ";\n")

    # Write memory_rules.js (window.__OPS_MEMORY__)
    atomic_write_text(DATA_DIR / "memory_rules.js", "window.__OPS_MEMORY__ = " + json.dumps(memory_rules, ensure_ascii=False) + ";\n")

    return status_snapshot

def gitops_push():
    """
    Commit managed data files and push to origin.
    Returns True on success (or nothing to do), False on any failure.
    """
    print("🚀 启动 GitOps 自动化提交流水线...")
    try:
        # 1. Dirty-worktree guard: refuse to touch the repo when unrelated changes exist
        status_res = subprocess.run(
            ["git", "-C", str(BASE_DIR), "status", "--porcelain"],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )
        if status_res.returncode != 0:
            print(f"❌ 无法读取 Git 状态，已中止: {status_res.stderr.strip()}")
            return False
        foreign = []
        for line in status_res.stdout.splitlines():
            if not line.strip():
                continue
            path = line[3:].strip().strip('"').split(" -> ")[-1]
            if path not in GITOPS_FILES:
                foreign.append(path)
        if foreign:
            shown = ", ".join(foreign[:5]) + (" ..." if len(foreign) > 5 else "")
            print(f"⚠️ 工作区存在非托管文件变更 ({shown})，为避免误提交，本次 GitOps 已跳过。")
            print("   请先手动整理工作区（commit 或 stash）后再执行同步。")
            return False

        # 2. Stage only managed files
        subprocess.run(
            ["git", "-C", str(BASE_DIR), "add"] + GITOPS_FILES,
            check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )

        # 3. Commit — failure MUST stop the pipeline (no push on broken state)
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
        commit_res = subprocess.run(
            ["git", "-C", str(BASE_DIR), "commit", "-m", f"chore: sync ops status [{now_str}]"],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )
        if commit_res.returncode != 0:
            if "nothing to commit" in commit_res.stdout:
                print("ℹ️ 本地状态无变更，跳过提交。")
            else:
                detail = (commit_res.stderr.strip() or commit_res.stdout.strip()).splitlines()[0]
                print(f"❌ Git 提交失败，已中止推送: {detail}")
                return False
        else:
            print(f"✅ 本地已提交: {commit_res.stdout.strip().splitlines()[0] if commit_res.stdout.strip() else now_str}")

        # 4. Push
        remotes = subprocess.run(["git", "-C", str(BASE_DIR), "remote", "-v"], stdout=subprocess.PIPE, text=True).stdout
        if "origin" not in remotes:
            print("ℹ️ 未配置 origin 远端，跳过推送。")
            return True
        print("📡 正在推送到 GitHub 远端...")
        push_res = subprocess.run(
            ["git", "-C", str(BASE_DIR), "push", "origin", "main"],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=15
        )
        if push_res.returncode == 0:
            print("🎉 成功推送到 GitHub 远端！GitHub Pages 即将刷新。")
            return True
        print(f"⚠️ Git 推送失败（本地已提交，网络恢复后可再次同步）: {push_res.stderr.strip()}")
        return False
    except subprocess.TimeoutExpired:
        print("⚠️ Git 推送超时（15s），本地已提交，网络恢复后可再次同步。")
        return False
    except Exception as e:
        print(f"❌ GitOps 流水线失败: {e}")
        return False

def run_pipeline(push=False):
    """
    Full pipeline under advisory lock: collect -> (optional) gitops push.
    Returns True when fully successful, False otherwise.
    """
    try:
        with ops_lock():
            collect_all()
            if push:
                return gitops_push()
            return True
    except RuntimeError as e:
        print(f"⚠️ {e}")
        return False
    except Exception as e:
        print(f"❌ 数据采集失败: {e}")
        return False

if __name__ == "__main__":
    push_flag = "--push" in sys.argv
    ok = run_pipeline(push=push_flag)
    if ok:
        print(f"✅ 全量数据采集完毕（JSON + JS 双模防卡死）: {DATA_DIR / 'status.json'}")
    sys.exit(0 if ok else 1)
