#!/usr/bin/env python3
"""
scripts/collector.py: Aggregates real data from probe, git repos, career records, and memory checks.
Saves to data/status.json.
Supports --push to trigger GitOps auto-commit & push to GitHub.
"""

import os
import sys
import json
import subprocess
from datetime import datetime, date
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

sys.path.insert(0, str(Path(__file__).resolve().parent))
import probe

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
    
    # Check if target is a git repo, or search immediate subdirs
    target_repo = None
    if (p / ".git").exists():
        target_repo = p
    else:
        for sub in p.iterdir():
            if sub.is_dir() and (sub / ".git").exists():
                target_repo = sub
                break

    if not target_repo:
        # Get latest mtime of files in directory as fallback
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
    network_probe = probe.probe_all()

    career_file = DATA_DIR / "career_records.json"
    career_list = []
    if career_file.exists():
        with open(career_file, "r", encoding="utf-8") as f:
            career_list = json.load(f)
    
    career_stats = {
        "total": len(career_list),
        "interviewing": len([c for c in career_list if "面" in c.get("status", "")]),
        "tests": len([c for c in career_list if "笔试" in c.get("status", "")]),
        "screening": len([c for c in career_list if "初筛" in c.get("status", "")]),
        "applied": len([c for c in career_list if "投递" in c.get("status", "")]),
        "offer": len([c for c in career_list if "offer" in c.get("status", "").lower() or "录用" in c.get("status", "")])
    }

    projects_file = DATA_DIR / "projects.json"
    raw_projects = []
    if projects_file.exists():
        with open(projects_file, "r", encoding="utf-8") as f:
            raw_projects = json.load(f)
    
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

    checks_file = DATA_DIR / "daily_checks.json"
    daily_checks = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "checks": { "起了": True, "动了": False, "写了": True, "关了": False }
    }
    if checks_file.exists():
        with open(checks_file, "r", encoding="utf-8") as f:
            daily_checks = json.load(f)

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

    status_snapshot = {
        "meta": {
            "title": "Ops-Hub // Personal Operations Console",
            "author": "Leo (insistgang)",
            "version": "1.0.0",
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
        "daily_checks": daily_checks
    }

    status_file = DATA_DIR / "status.json"
    with open(status_file, "w", encoding="utf-8") as f:
        json.dump(status_snapshot, f, ensure_ascii=False, indent=2)

    return status_snapshot

def gitops_push():
    print("🚀 启动 GitOps 自动化提交流水线...")
    try:
        subprocess.run(["git", "-C", str(BASE_DIR), "add", "data/status.json", "data/daily_checks.json", "data/career_records.json"], check=True)
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
        commit_res = subprocess.run(["git", "-C", str(BASE_DIR), "commit", "-m", f"chore: sync ops status [{now_str}]"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if "nothing to commit" in commit_res.stdout:
            print("ℹ️ 本地状态无变更，跳过提交。")
        else:
            print(f"✅ 本地已提交: {commit_res.stdout.strip()}")

        remotes = subprocess.run(["git", "-C", str(BASE_DIR), "remote", "-v"], stdout=subprocess.PIPE, text=True).stdout
        if "origin" in remotes:
            print("📡 正在推送到 GitHub 远端...")
            push_res = subprocess.run(["git", "-C", str(BASE_DIR), "push", "origin", "main"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=10)
            if push_res.returncode == 0:
                print("🎉 成功推送到 GitHub 远端！GitHub Pages 即将刷新。")
            else:
                print(f"⚠️ Git 推送遇到警告（将在下次同步时重试）: {push_res.stderr.strip()}")
        else:
            print("ℹ️ 尚未配置 origin 远端，状态已在本地更新。")
    except Exception as e:
        print(f"⚠️ GitOps 操作提示: {e}")

if __name__ == "__main__":
    push_flag = "--push" in sys.argv
    res = collect_all()
    print(f"✅ 全量数据采集与状态快照生成完毕: {DATA_DIR / 'status.json'}")
    if push_flag:
        gitops_push()
