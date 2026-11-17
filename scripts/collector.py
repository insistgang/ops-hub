#!/usr/bin/env python3
"""
scripts/collector.py: 全量状态采集与 GitOps 自动提交核心。

聚合三端网络硬件探针、Career-Copilot 求职台账投影、本地项目 Git 状态、
考期倒计时、每日四勾打卡、知识库只读投影与个人体重记录；
原子写入本机真源快照，并调用 sanitize_public 生成 data/public/ 公开脱敏产物。
"""

import fcntl
import os
import re
import subprocess
import sys
from contextlib import contextmanager
from datetime import date, datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import probe
from ops_common import (
    BASE_DIR,
    DATA_DIR,
    atomic_write_js_global,
    atomic_write_json,
    atomic_write_text,
    career_stage_rank,
    default_daily_checks_payload,
    load_json,
    rollover_daily_checks,
)

# GitOps 托管的公开脱敏产物白名单（脏工作区保护仅放行这些文件）
GITOPS_FILES = [
    "data/public/status.json",
    "data/public/status.js",
    "data/public/memory_rules.js",
    "data/public/energy.json",
    "data/public/energy.js",
    "data/public/diary-todos.json",
    "data/public/diary-todos.js",
    "data/public/weight.json",
    "data/public/weight.js",
    "data/public/knowledge.json",
    "data/public/knowledge.js",
]

_EXAM_COUNTDOWN_PREFIX = re.compile(r"^(?:考前\s*\d+\s*天|今日考试)[·•\s]*")
COPILOT_APPLICATIONS = BASE_DIR.parent / "Career-Copilot" / "data" / "applications.json"


@contextmanager
def ops_lock():
    """文件锁防止 CLI 与 launchd 并发采集或推送。"""
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
            "branch": "-",
        }

    target_repo = p if (p / ".git").exists() else next(
        (sub for sub in p.iterdir() if sub.is_dir() and (sub / ".git").exists()),
        None,
    )

    if not target_repo:
        try:
            latest_mtime = 0
            for root, _, files in os.walk(p):
                for fname in files:
                    if not fname.startswith("."):
                        latest_mtime = max(latest_mtime, os.path.getmtime(os.path.join(root, fname)))
            if latest_mtime > 0:
                t_str = datetime.fromtimestamp(latest_mtime).strftime("%Y-%m-%d %H:%M")
                return {
                    "git_available": False,
                    "commit_hash": "LOCAL",
                    "commit_time": t_str,
                    "commit_msg": f"本地文件活跃 (更新于 {t_str})",
                    "branch": "local",
                }
        except Exception:
            pass
        return {
            "git_available": False,
            "commit_hash": "-",
            "commit_time": "-",
            "commit_msg": "本地就绪",
            "branch": "-",
        }

    try:
        cmd = [
            "git", "-C", str(target_repo), "log", "-1",
            "--format=%h|%an|%ad|%s", "--date=format:%Y-%m-%d %H:%M",
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=2)
        if res.returncode == 0 and res.stdout.strip():
            parts = res.stdout.strip().split("|")
            b_res = subprocess.run(
                ["git", "-C", str(target_repo), "branch", "--show-current"],
                stdout=subprocess.PIPE, text=True, timeout=2,
            )
            return {
                "git_available": True,
                "sub_repo": target_repo.name if target_repo != p else "",
                "commit_hash": parts[0] if len(parts) > 0 else "-",
                "author": parts[1] if len(parts) > 1 else "-",
                "commit_time": parts[2] if len(parts) > 2 else "-",
                "commit_msg": parts[3] if len(parts) > 3 else "-",
                "branch": b_res.stdout.strip() or "main",
            }
    except Exception:
        pass

    return {
        "git_available": False,
        "commit_hash": "-",
        "commit_time": "-",
        "commit_msg": "读取 Git 失败",
        "branch": "-",
    }


def resolve_project_path(entry):
    """按候选顺序取第一个存在的路径，防止目录搬迁后整条配置失效。"""
    candidates = entry.get("paths")
    if not isinstance(candidates, list):
        candidates = [entry.get("path")] if entry.get("path") else []
    for raw in candidates:
        if not raw:
            continue
        candidate = Path(str(raw)).expanduser()
        if candidate.exists():
            return str(candidate)
    return ""


def calculate_days_left(target_date_str, today=None):
    try:
        target = datetime.strptime(target_date_str, "%Y-%m-%d").date()
        today = today or date.today()
        return max((target - today).days, 0)
    except Exception:
        return 0


def career_label(item):
    """将 Career-Copilot 阶段文案映射为总台标准阶段标签。"""
    stage = str(item.get("stage") or "")
    status = str(item.get("status") or "")
    if status == "offer" or "Offer" in stage or "录用" in stage:
        return "已录用"
    if "面" in stage or status == "interviewing":
        return "面试中"
    if "笔试" in stage or status == "test":
        return "笔试中"
    if "初筛" in stage:
        return "初筛"
    if "暂停" in stage:
        return "暂停"
    if status == "applied" or "已投递" in stage or "邮件已发送" in stage:
        return "已投递"
    return "准备中"


def load_career_records():
    """优先单向读取 Career-Copilot 台账（剥离备注、薪资与简历文件名），缺失时回退本地快照。"""
    if COPILOT_APPLICATIONS.exists():
        raw = load_json(COPILOT_APPLICATIONS, [])
        records = []
        for item in raw or []:
            if not isinstance(item, dict):
                continue
            records.append({
                "id": item.get("id"),
                "company": item.get("company") or "",
                "position": item.get("position") or "",
                "status": career_label(item),
                "priority": item.get("priority") or "",
                "apply_date": str(item.get("last_updated") or "")[:10],
                "source": "Career-Copilot",
            })
        records.sort(key=lambda r: career_stage_rank(r.get("status")))
        atomic_write_json(DATA_DIR / "career_records.json", records)
        return records
    fallback = load_json(DATA_DIR / "career_records.json", []) or []
    return sorted(fallback, key=lambda r: career_stage_rank(r.get("status")))


def stamp_exam_next_action(action, days):
    """用实时剩余天数重写考期前导戳，防止手写天数过期。"""
    try:
        days = int(days)
    except (TypeError, ValueError):
        days = 0
    stripped = _EXAM_COUNTDOWN_PREFIX.sub("", (action or "").strip()).strip(" ·•")
    lead = "今日考试" if days <= 0 else f"考前 {days} 天"
    return f"{lead} · {stripped}" if stripped else lead


def apply_exam_state(entry, today=None):
    """已办结/等成绩的考期不计倒计时；未来考期动态写入倒计时。"""
    entry = dict(entry)
    if entry.get("phase") in ("awaiting_result", "result_recorded"):
        entry["days_left"] = None
        fallback = "查分已办结，后续按需安排" if entry.get("phase") == "result_recorded" else "等待初试成绩公布"
        entry["next_action"] = (entry.get("next_action") or fallback).strip()
        return entry
    days = calculate_days_left(entry.get("target_date", "2026-12-31"), today=today)
    entry["days_left"] = days
    entry["next_action"] = stamp_exam_next_action(entry.get("next_action"), days)
    return entry


def collect_all():
    network_probe = probe.probe_all()
    career_list = load_career_records()

    career_stats = {
        "total": len(career_list),
        "interviewing": sum(1 for c in career_list if "面" in c.get("status", "")),
        "tests": sum(1 for c in career_list if "笔试" in c.get("status", "")),
        "screening": sum(1 for c in career_list if "初筛" in c.get("status", "")),
        "applied": sum(1 for c in career_list if "投递" in c.get("status", "")),
        "offer": sum(
            1 for c in career_list
            if "offer" in c.get("status", "").lower() or "录用" in c.get("status", "")
        ),
    }

    raw_projects = load_json(DATA_DIR / "projects.json", []) or []
    enriched_projects = []
    for item in raw_projects:
        entry = dict(item)
        if entry.get("type") == "exam":
            entry = apply_exam_state(entry)
        else:
            resolved = resolve_project_path(entry)
            entry.pop("paths", None)
            if resolved:
                entry["path"] = resolved
                entry.update(get_git_info(resolved))
            else:
                entry.pop("path", None)
                entry.update({
                    "git_available": False,
                    "commit_hash": "-",
                    "commit_time": "-",
                    "commit_msg": "配置的候选路径都不可达，请更新 data/projects.json",
                    "branch": "-",
                })
        enriched_projects.append(entry)

    checks_file = DATA_DIR / "daily_checks.json"
    daily_checks = load_json(checks_file, default_daily_checks_payload())
    daily_checks, rolled = rollover_daily_checks(daily_checks)
    if rolled:
        archived = daily_checks["history"][-1]["date"] if daily_checks["history"] else "昨日"
        print(f"🗓️  检测到跨天，已归档 {archived} 的打卡记录并重置今日四勾。")
        atomic_write_json(checks_file, daily_checks)

    device_allocation = load_json(DATA_DIR / "device_allocation.json", {}) or {}
    memory_rules = load_json(DATA_DIR / "memory_rules.json", {}) or {}

    # 知识库单向只读投影（真源：~/Documents/knowledge 或 OPS_KNOWLEDGE_DIR）
    try:
        import knowledge_source
        knowledge = knowledge_source.collect()
        if not knowledge.get("available"):
            print("⚠️  知识库投影不可用：" + (knowledge.get("error") or "真源未解析出内容"))
        for warning in knowledge.get("warnings", []):
            print(f"⚠️  知识库投影：{warning}")
    except Exception as exc:
        today_iso = datetime.now().astimezone().date().isoformat()
        knowledge = {
            "available": False,
            "generated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
            "today": today_iso,
            "diary_todos": {"date": today_iso, "items": []},
            "error": f"{type(exc).__name__}: {exc}",
            "warnings": [],
            "today_plan": None,
            "hard_nodes": None,
        }
        print(f"⚠️  知识库投影失败：{type(exc).__name__}: {exc}")

    weight_records = load_json(DATA_DIR / "weight_records.json", None)

    status_snapshot = {
        "meta": {
            "title": "Ops-Hub // Personal Operations Console",
            "author": "Leo (insistgang)",
            "version": "2.0.0",
            "last_synced": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "sync_mode": "Level 2 Real Probe (Zero Mock)",
            "github_repo": "https://github.com/insistgang/ops-hub",
        },
        "topology": network_probe,
        "career_summary": {
            "stats": career_stats,
            "records": career_list,
        },
        "projects_and_exams": enriched_projects,
        "daily_checks": daily_checks,
        "device_allocation": device_allocation,
        "knowledge": knowledge,
        "weight": weight_records,
    }

    private_dir = DATA_DIR / "private"
    atomic_write_json(DATA_DIR / "status.json", status_snapshot)
    atomic_write_js_global(DATA_DIR / "status.js", "__OPS_STATUS__", status_snapshot)
    atomic_write_js_global(DATA_DIR / "memory_rules.js", "__OPS_MEMORY__", memory_rules)
    atomic_write_json(DATA_DIR / "knowledge.json", knowledge)
    atomic_write_js_global(private_dir / "knowledge.js", "__OPS_KNOWLEDGE__", knowledge)
    if weight_records:
        atomic_write_js_global(private_dir / "weight.js", "__OPS_WEIGHT__", weight_records)

    try:
        import sanitize_public
        if not sanitize_public.write_public_files():
            raise RuntimeError("公开脱敏验证未通过")
    except Exception as exc:
        raise RuntimeError("公开脱敏产物生成失败；本地快照已保留，已阻止提交与推送。") from exc

    return status_snapshot


def gitops_push():
    """提交托管的公开脱敏产物并推送到 origin/main。"""
    print("🚀 启动 GitOps 自动化提交流水线...")
    try:
        status_res = subprocess.run(
            ["git", "-C", str(BASE_DIR), "status", "--porcelain"],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
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

        subprocess.run(
            ["git", "-C", str(BASE_DIR), "add"] + GITOPS_FILES,
            check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
        )

        now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
        commit_res = subprocess.run(
            ["git", "-C", str(BASE_DIR), "commit", "-m", f"chore: sync ops status [{now_str}]"],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
        )
        if commit_res.returncode != 0:
            if "nothing to commit" in commit_res.stdout:
                print("ℹ️ 本地状态无变更，跳过提交。")
            else:
                detail = (commit_res.stderr.strip() or commit_res.stdout.strip()).splitlines()[0]
                print(f"❌ Git 提交失败，已中止推送: {detail}")
                return False
        else:
            summary = commit_res.stdout.strip().splitlines()[0] if commit_res.stdout.strip() else now_str
            print(f"✅ 本地已提交: {summary}")

        remotes = subprocess.run(
            ["git", "-C", str(BASE_DIR), "remote", "-v"],
            stdout=subprocess.PIPE, text=True,
        ).stdout
        if "origin" not in remotes:
            print("ℹ️ 未配置 origin 远端，跳过推送。")
            return True

        print("📡 正在推送到 GitHub 远端...")
        push_res = subprocess.run(
            ["git", "-C", str(BASE_DIR), "push", "origin", "main"],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=15,
        )
        if push_res.returncode == 0:
            print("🎉 成功推送到 GitHub 远端！GitHub Pages 即将刷新。")
            return True
        print(f"⚠️ Git 推送失败（本地已提交，网络恢复后可再次同步）: {push_res.stderr.strip()}")
        return False
    except subprocess.TimeoutExpired:
        print("⚠️ Git 推送超时（15s），本地已提交，网络恢复后可再次同步。")
        return False
    except Exception as exc:
        print(f"❌ GitOps 流水线失败: {exc}")
        return False


def run_pipeline(push=False):
    """加锁执行采集（及可选 GitOps 推送）。"""
    try:
        with ops_lock():
            collect_all()
            return gitops_push() if push else True
    except RuntimeError as exc:
        print(f"⚠️ {exc}")
        return False
    except Exception as exc:
        print(f"❌ 数据采集失败: {exc}")
        return False


if __name__ == "__main__":
    ok = run_pipeline(push="--push" in sys.argv)
    if ok:
        print(f"✅ 全量数据采集完毕（JSON + JS 双模防卡死）: {DATA_DIR / 'status.json'}")
    sys.exit(0 if ok else 1)
