#!/usr/bin/env python3
"""scripts/cli_commands.py: ops 命令行各子命令的业务实现。

将终端展示与运维动作从根入口 ops 中拆出，统一复用 ops_common 公共底座。
"""

import json
import os
import plistlib
import shutil
import subprocess
import sys
import webbrowser
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import collector
import probe
from ops_common import (
    BASE_DIR,
    DATA_DIR,
    DAILY_CHECK_KEYS,
    Colors,
    atomic_write_js_global,
    atomic_write_json,
    career_stage_rank,
    default_daily_checks_payload,
    load_json,
    rollover_daily_checks,
    route_task,
)


def _status_color(status_text):
    st = str(status_text or "")
    if "面" in st or "录用" in st or "offer" in st.lower():
        return Colors.GREEN
    if "笔试" in st:
        return Colors.WARNING
    if "初筛" in st:
        return Colors.CYAN
    return Colors.DIM


def cmd_status(_args):
    status_file = DATA_DIR / "status.json"
    if not status_file.exists():
        print("⚡ 首次运行，正在采集全局真实状态...")
        collector.collect_all()

    data = load_json(status_file, {}) or {}
    meta = data.get("meta", {})
    topo = data.get("topology", {})
    mac = topo.get("mac", {})
    win = topo.get("windows", {})
    jetson = topo.get("jetson", {})
    career = data.get("career_summary", {})
    c_stats = career.get("stats", {})
    c_records = sorted(career.get("records", []), key=lambda r: career_stage_rank(r.get("status")))
    projects = [p for p in data.get("projects_and_exams", []) if p.get("id") != "e-jiaoxi"]
    checks = data.get("daily_checks", {}).get("checks", {})

    print(f"\n{Colors.BOLD}{Colors.CYAN}══════════════════════════════════════════════════════════════════{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.HEADER} 🚀 OPS-HUB // 个人数字化运营工作总台{Colors.ENDC}  {Colors.DIM}(v{meta.get('version', '2.0.0')}){Colors.ENDC}")
    print(f"{Colors.DIM} 最后同步: {meta.get('last_synced', '-')} ｜ 探针: {meta.get('sync_mode', 'Live')}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.CYAN}══════════════════════════════════════════════════════════════════{Colors.ENDC}\n")

    win_status_color = Colors.GREEN if win.get("status") == "Online" else Colors.FAIL
    lat_str = f"{win['latency_ms']} ms" if win.get("latency_ms") is not None else "N/A"
    jet_status = jetson.get("status", "Offline")
    jet_color = Colors.GREEN if "Online" in jet_status else Colors.DIM
    jet_lat_str = f"{jetson['latency_ms']} ms" if jetson.get("latency_ms") is not None else "局域网待命"

    print(f"{Colors.BOLD}🖥️  三端异构算力拓扑 (Compute Topology):{Colors.ENDC}")
    print(f"   💻 Mac 本地:   {Colors.GREEN}● 在线{Colors.ENDC}  [{mac.get('device', 'MacBook Air')}]  电量: {mac.get('battery')} ({mac.get('power_state')})")
    win_ssh = "22 Active" if win.get("ssh_active") else "Standby"
    win_smb = "445 Active" if win.get("smb_active") else "Standby"
    print(f"   🖥️  Win 4070S:  {win_status_color}● {win.get('status')}{Colors.ENDC} [{win.get('ip')}]  延迟: {Colors.CYAN}{lat_str}{Colors.ENDC}  SSH: {win_ssh}  SMB: {win_smb}")
    print(f"   🤖 Jetson 边缘: {jet_color}● {jet_status}{Colors.ENDC} [{jetson.get('ip')}]  延迟: {Colors.CYAN}{jet_lat_str}{Colors.ENDC}  SSH: {jetson.get('ssh_cmd')}")

    print(f"\n{Colors.BOLD}🎯 求职投递大盘 (Career Pipeline):{Colors.ENDC}")
    print(
        f"   总计: {c_stats.get('total')} 家 ｜ 面试中: {Colors.GREEN}{c_stats.get('interviewing')}{Colors.ENDC} "
        f"｜ 笔试中: {Colors.WARNING}{c_stats.get('tests')}{Colors.ENDC} ｜ 初筛: {Colors.CYAN}{c_stats.get('screening')}{Colors.ENDC} "
        f"｜ 已投递: {c_stats.get('applied')}"
    )
    for rec in c_records[:4]:
        st = rec.get("status")
        print(f"   • {Colors.BOLD}{rec.get('company')}{Colors.ENDC} - {rec.get('position')} [{_status_color(st)}{st}{Colors.ENDC}]")
    if len(c_records) > 4:
        print(f"     {Colors.DIM}...还有 {len(c_records) - 4} 家企业 (敲 ops career list 查看全部){Colors.ENDC}")

    print(f"\n{Colors.BOLD}⏳ 考期冲刺与项目推进:{Colors.ENDC}")
    for proj in projects:
        if proj.get("type") == "exam":
            days = proj.get("days_left")
            if isinstance(days, int):
                urgency = Colors.FAIL if days <= 20 else Colors.WARNING
                print(f"   🔴 {Colors.BOLD}{proj.get('name')}{Colors.ENDC} ➔ 剩余 {urgency}{days} 天{Colors.ENDC} (考期: {proj.get('target_date')})")
            else:
                print(f"   ⚪ {Colors.BOLD}{proj.get('name')}{Colors.ENDC} ➔ {Colors.DIM}{proj.get('next_action', '已办结')}{Colors.ENDC}")
        else:
            print(f"   📦 {Colors.BOLD}{proj.get('name')}{Colors.ENDC} ➔ {Colors.DIM}[{proj.get('commit_hash', '-')} @ {proj.get('commit_time', '-')}] {Colors.ENDC}{proj.get('next_action', '')}")

    knowledge = data.get("knowledge") or {}
    if knowledge.get("available"):
        plan = knowledge.get("today_plan") or {}
        nodes = knowledge.get("hard_nodes") or {}
        suffix = "" if plan.get("is_today", True) else Colors.WARNING + " 非今日回退" + Colors.ENDC
        print(f"\n{Colors.BOLD}📚 知识库 · 今日必做 ({plan.get('date', '-')}){Colors.ENDC}{suffix}")
        for item in plan.get("items", []):
            tag = f"[{item.get('tag')}] " if item.get("tag") else ""
            who = f"  {Colors.DIM}{item.get('assignee')}{Colors.ENDC}" if item.get("assignee") else ""
            print(f"   {item.get('n')}. {tag}{Colors.BOLD}{item.get('title')}{Colors.ENDC}{who}")
        if plan.get("direction"):
            print(f"   {Colors.DIM}{plan['direction'][:80]}{Colors.ENDC}")
        active = nodes.get("active", [])
        overdue = nodes.get("overdue", [])
        if active or overdue:
            print(f"\n{Colors.BOLD}⏰ 硬节点雷达:{Colors.ENDC} 活跃 {len(active)} 条 ｜ 逾期 {len(overdue)} 条")
            for row in (overdue + active)[:5]:
                days = row.get("days_left")
                if (isinstance(days, int) and days < 0) or row.get("kind") == "ledger":
                    label = f"{Colors.FAIL}逾期{Colors.ENDC}"
                elif isinstance(days, int):
                    color = Colors.FAIL if days <= 2 else (Colors.WARNING if days <= 14 else Colors.DIM)
                    label = f"{color}{days:>3} 天{Colors.ENDC}"
                else:
                    label = f"{Colors.DIM}  -  {Colors.ENDC}"
                print(f"   • {label}  {row.get('title', '')}")
    elif knowledge.get("error"):
        print(f"\n{Colors.DIM}📚 知识库同步不可用: {knowledge['error']}{Colors.ENDC}")

    weight_data = data.get("weight") or load_json(DATA_DIR / "weight_records.json", None)
    if isinstance(weight_data, dict):
        users = weight_data.get("users", [])
        recs = weight_data.get("records", [])
        user = users[0] if users else {"name": "Leo", "goal": 85.0}
        latest = recs[-1] if recs else None
        if latest:
            goal = user.get("goal")
            diff_str = f" ｜ 目标: {goal:.1f} kg (差 {round(latest['weight'] - goal, 1):+.1f} kg)" if goal else ""
            note = f" · {latest['note']}" if latest.get("note") else ""
            print(f"\n{Colors.BOLD}⚖️  Leo 的身体健康与体重追踪:{Colors.ENDC}")
            print(f"   最新体重: {Colors.GREEN}{latest['weight']:.1f} kg{Colors.ENDC} ({latest['date']}{note}){diff_str}")
            print(f"{Colors.DIM}   (快速更新: ops weight <数值> / 网页端实时同步){Colors.ENDC}")

    marks = "   ".join(f"[{'✅' if checks.get(k) else '⬜'} {k}]" for k in DAILY_CHECK_KEYS)
    print(f"\n{Colors.BOLD}🧠 今日四勾秩序基线:{Colors.ENDC}")
    print(f"   {marks}")
    print(f"{Colors.DIM}   (快速打卡: ops check 动了 / 查看分工: ops dispatch)\n{Colors.ENDC}")


def cmd_dispatch(args):
    data = load_json(DATA_DIR / "device_allocation.json", None)
    if not data:
        print("未找到 device_allocation.json")
        return

    if args.query and args.query.strip():
        route = route_task(args.query)
        print(f"\n{Colors.BOLD}{Colors.CYAN}🔍 任务智能分流诊断: [{args.query}]{Colors.ENDC}\n")
        target = route["target"]
        if target == "mac":
            print(f"👉 {Colors.BOLD}{Colors.GREEN}{route['headline']}{Colors.ENDC}")
            print(f"   📌 场景指引: {route['advice']}")
        elif target == "windows":
            win_user = probe._device("windows", "user", "OPSHUB_WIN_USER", "<user>")
            print(f"👉 {Colors.BOLD}{Colors.CYAN}{route['headline']}{Colors.ENDC}")
            print(f"   📌 快捷登录: {Colors.BOLD}ssh {win_user}@{probe.WIN_IP}{Colors.ENDC} ({route['advice']})")
        elif target == "jetson":
            print(f"👉 {Colors.BOLD}{Colors.GREEN}{route['headline']}{Colors.ENDC}")
            print(f"   📌 快捷登录: {Colors.BOLD}ssh {probe.JETSON_USER}@{probe.JETSON_IP}{Colors.ENDC} ({route['advice']})")
        else:
            print(f"💡 {route['headline']}：{route['advice']}")
        print()
        return

    print(f"\n{Colors.BOLD}{Colors.CYAN}══════════════════════════════════════════════════════════════════{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.HEADER} 🖥️  三端设备专属任务分工与协作矩阵{Colors.ENDC}")
    print(f"{Colors.DIM} 原则: {data.get('principle')}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.CYAN}══════════════════════════════════════════════════════════════════{Colors.ENDC}\n")

    for dev in data.get("devices", []):
        dev_color = Colors.GREEN if dev["id"] == "mac" else (Colors.CYAN if dev["id"] == "win" else Colors.WARNING)
        print(f"{dev_color}{Colors.BOLD}【{dev['name']}】{Colors.ENDC} - {dev['hardware']}")
        print(f"   定位: {dev['role']}")
        print(f"   {Colors.BOLD}✓ 专属主责任务:{Colors.ENDC}")
        for task in dev.get("primary_tasks", []):
            print(f"     • {task}")
        print(f"   {Colors.FAIL}✕ 设备使用红线:{Colors.ENDC}")
        for redline in dev.get("redlines", []):
            print(f"     {redline}")
        print()

    print(f"{Colors.BOLD}📋 实际项目双机/三端流转指引表:{Colors.ENDC}\n")
    for wf in data.get("project_workflows", []):
        print(f"   📦 {Colors.BOLD}{wf['project']}{Colors.ENDC}")
        print(f"      💻 Mac 端:     {wf['mac_role']}")
        print(f"      🖥️  Win 端:     {wf['win_role']}")
        print(f"      🔗 协同方式:   {Colors.CYAN}{wf['collab_mode']}{Colors.ENDC}\n")


def cmd_sync(args):
    if getattr(args, "all", False):
        print("🔄 正在执行全链路同步（采集 + GitOps + 阿里云发布 + 账本同步）...")
        res = subprocess.run([sys.executable, str(BASE_DIR / "scripts" / "sync_all.py")])
        if res.returncode != 0:
            sys.exit(res.returncode)
        return

    print("🔄 正在执行全量探测与状态刷新...")
    if collector.run_pipeline(push=args.push):
        print("✅ 状态快照已更新至 data/status.json")
    else:
        print(f"{Colors.FAIL}❌ 同步流程未完全成功，请检查上方日志。{Colors.ENDC}")
        sys.exit(1)


def cmd_career(args):
    career_file = DATA_DIR / "career_records.json"
    records = load_json(career_file, []) or []

    if args.career_action == "list":
        ordered = sorted(records, key=lambda r: career_stage_rank(r.get("status")))
        print(f"\n{Colors.BOLD}📋 Career Pipeline 全量投递清单 ({len(ordered)} 家):{Colors.ENDC}\n")
        for idx, rec in enumerate(ordered, 1):
            st = rec.get("status")
            print(f"[{idx:02d}] {Colors.BOLD}{rec.get('company')}{Colors.ENDC} ｜ {rec.get('position')}")
            print(f"     状态: [{_status_color(st)}{st}{Colors.ENDC}] ｜ 更新日: {rec.get('apply_date')} ｜ 优先级: {rec.get('priority')}")
            if rec.get("notes"):
                print(f"     备注: {Colors.DIM}{rec['notes']}{Colors.ENDC}")
            print()
        return

    if collector.COPILOT_APPLICATIONS.exists():
        print(f"{Colors.WARNING}⚠️  检测到上游真源 ../Career-Copilot/data/applications.json 存在；本地修改将在下次采集时被上游覆盖。{Colors.ENDC}")

    if args.career_action == "update":
        if not args.company or not args.status:
            print(f"{Colors.FAIL}❌ 用法: ops career update <公司名> --status <新状态> [--notes 备注] [--push]{Colors.ENDC}")
            sys.exit(2)
        target = args.company.lower()
        matched = next((c for c in records if target in c.get("company", "").lower()), None)
        if not matched:
            print(f"❌ 未找到公司包含 '{args.company}' 的记录，如需新增请使用 ops career add")
            return
        old_status = matched.get("status")
        matched["status"] = args.status
        if args.notes:
            matched["notes"] = args.notes
        print(f"✅ 已更新 [{matched.get('company')}]: {old_status} ➔ {Colors.GREEN}{args.status}{Colors.ENDC}")
    elif args.career_action == "add":
        if not args.company:
            print(f"{Colors.FAIL}❌ 用法: ops career add <公司名> [--pos 岗位] [--status 状态] [--date 日期] [--notes 备注]{Colors.ENDC}")
            sys.exit(2)
        new_item = {
            "id": f"c-{len(records) + 1:03d}",
            "company": args.company,
            "position": args.pos or "研发工程师",
            "apply_date": args.date or datetime.now().strftime("%Y-%m-%d"),
            "status": args.status or "已投递",
            "priority": args.priority or "Medium",
            "notes": args.notes or "",
        }
        records.append(new_item)
        print(f"✅ 已新增企业投递记录: [{args.company}] - {new_item['position']}")

    atomic_write_json(career_file, records)
    if not collector.run_pipeline(push=args.push):
        sys.exit(1)


def cmd_check(args):
    checks_file = DATA_DIR / "daily_checks.json"
    data = load_json(checks_file, default_daily_checks_payload())
    data, rolled = rollover_daily_checks(data)
    if rolled and data.get("history"):
        print(f"🗓️  已跨天：自动归档 {data['history'][-1]['date']} 的打卡记录，开启今日新基线。")

    target_key = args.item
    if target_key not in DAILY_CHECK_KEYS:
        print(f"❌ 打卡项必须是以下之一: {', '.join(DAILY_CHECK_KEYS)}")
        return

    curr = data.get("checks", {}).get(target_key, False)
    new_val = (not curr) if args.toggle else True
    data["checks"][target_key] = new_val
    atomic_write_json(checks_file, data)

    icon = "✅" if new_val else "⬜"
    print(f"🎯 今日秩序打卡: [{target_key}] ➔ {icon} ({'已完成' if new_val else '未完成'})")
    if not collector.run_pipeline(push=args.push):
        sys.exit(1)


def cmd_memory(_args):
    rules = load_json(DATA_DIR / "memory_rules.json", None)
    if not rules:
        print("未找到 memory_rules.json")
        return

    print(f"\n{Colors.BOLD}{Colors.HEADER}🧠 {rules.get('title')}{Colors.ENDC}")
    print(f"{Colors.DIM}座右铭: {rules.get('motto')}{Colors.ENDC}\n")

    print(f"{Colors.BOLD}1. 场景分工契约 (一个地方，一种模式):{Colors.ENDC}")
    for sc in rules.get("scene_contracts", []):
        print(f"   {Colors.BOLD}{sc.get('scene')}{Colors.ENDC} ➔ {Colors.CYAN}{sc.get('mode')}{Colors.ENDC}")
        for rule in sc.get("rules", []):
            print(f"     • {rule}")

    print(f"\n{Colors.BOLD}2. 聚焦防散铁律:{Colors.ENDC}")
    for fp in rules.get("focus_principles", []):
        print(f"   • {Colors.BOLD}{fp.get('principle')}{Colors.ENDC}: {fp.get('desc')}")

    print(f"\n{Colors.BOLD}3. 健康安排:{Colors.ENDC}")
    print(f"   {Colors.DIM}旧补剂计划已结束。健康安排以当前确认的计划为准。{Colors.ENDC}\n")


def cmd_weight(args):
    weight_file = DATA_DIR / "weight_records.json"
    now_iso = datetime.now().isoformat()
    data = load_json(weight_file, None) or {
        "version": 1,
        "activeUserId": "usr-leo",
        "users": [{"id": "usr-leo", "name": "Leo (insistgang)", "goal": 85.0, "createdAt": now_iso, "updatedAt": now_iso}],
        "records": [],
        "groups": [],
    }

    if args.value is None:
        recs = data.get("records", [])
        if not recs:
            print("目前还没有体重记录。可以使用 ops weight <数值> 来记录今天体重。")
            return
        goal = (data.get("users") or [{"goal": 85.0}])[0].get("goal", 85.0)
        latest = recs[-1]
        diff = round(latest["weight"] - goal, 1)
        print(f"\n{Colors.BOLD}⚖️  Leo 的体重管理档案 (真源: data/weight_records.json){Colors.ENDC}")
        print(f"   当前目标: {goal:.1f} kg")
        print(f"   最新记录: {Colors.GREEN}{latest['weight']:.1f} kg{Colors.ENDC} ({latest['date']}) ｜ 较目标: {diff:+.1f} kg\n")
        print("   最近历史记录:")
        for rec in recs[-5:]:
            note_str = f" ({rec['note']})" if rec.get("note") else ""
            print(f"   • {rec['date']}: {rec['weight']:.1f} kg{note_str}")
        print()
        return

    try:
        val = float(args.value)
        if val < 30 or val > 300:
            print(f"{Colors.FAIL}❌ 体重数值超出合理范围 (30-300 kg)。{Colors.ENDC}")
            return
    except ValueError:
        print(f"{Colors.FAIL}❌ 请输入合法的数字。{Colors.ENDC}")
        return

    today_str = datetime.now().strftime("%Y-%m-%d")
    note = args.note or "日常称重"
    existing = next((r for r in data["records"] if r["date"] == today_str), None)
    if existing:
        existing.update({"weight": val, "note": note, "updatedAt": now_iso})
    else:
        data["records"].append({
            "id": f"rec-{today_str}-{len(data['records']) + 1:02d}",
            "userId": data.get("activeUserId", "usr-leo"),
            "date": today_str,
            "weight": val,
            "note": note,
            "createdAt": now_iso,
            "updatedAt": now_iso,
        })

    atomic_write_json(weight_file, data)
    atomic_write_js_global(DATA_DIR / "private" / "weight.js", "__OPS_WEIGHT__", data)

    goal = (data.get("users") or [{}])[0].get("goal", 85.0)
    print(f"{Colors.GREEN}✅ 已更新今日 ({today_str}) 体重记录: {val:.1f} kg ({note}){Colors.ENDC}")
    print(f"   当前目标: {goal:.1f} kg ｜ 距目标还需: {round(val - goal, 1):+.1f} kg")
    print("   数据真源已原子写入 data/weight_records.json，并同步至 private/weight.js 镜像。")


def cmd_publish(_args):
    print("🚀 正在发布公开产物到阿里云 ops-hub 站点...")
    result = subprocess.run([sys.executable, str(BASE_DIR / "scripts" / "publish_aliyun.py")])
    if result.returncode != 0:
        print(f"{Colors.FAIL}❌ 阿里云发布失败，请检查上方日志。{Colors.ENDC}")
        sys.exit(1)
    print(f"{Colors.GREEN}✅ 阿里云发布完成。{Colors.ENDC}")


def cmd_finance(_args):
    print("💰 正在把日记里的个人消费同步进财务账本...")
    result = subprocess.run([sys.executable, str(BASE_DIR / "scripts" / "finance_publish.py")])
    if result.returncode != 0:
        print(f"{Colors.FAIL}❌ 账本同步失败，请检查上方日志。{Colors.ENDC}")
        sys.exit(1)


def cmd_sync_service(args):
    action = getattr(args, "sync_action", "status")
    script = BASE_DIR / "scripts" / "deploy_vita_sync.py"
    command = [sys.executable, str(script), "--deploy" if action == "deploy" else "--check"]
    if action == "deploy":
        print("🚀 正在部署阿里云 VitaFlow 同步服务...")
    else:
        print("🔎 正在核对阿里云 VitaFlow 同步服务与仓库是否一致...")
    result = subprocess.run(command)
    if result.returncode != 0:
        print(f"{Colors.FAIL}❌ 同步服务{'部署' if action == 'deploy' else '核对'}未通过，请检查上方输出。{Colors.ENDC}")
        sys.exit(1)
    print(f"{Colors.GREEN}✅ 同步服务{('部署完成' if action == 'deploy' else '核对完成')}。{Colors.ENDC}")


def _remaining(used_pct):
    """快照存的是已用百分比，换算成剩余；缺失返回 None（不换算成 0）。"""
    if used_pct is None:
        return None
    try:
        return round(max(0.0, min(100.0, 100.0 - float(used_pct))), 1)
    except (TypeError, ValueError):
        return None


def cmd_quota(_args):
    cache = Path.home() / ".cache" / "ai-quota-monitor" / "last-good.json"
    if not cache.exists():
        print(f"{Colors.WARNING}⚠️  未找到额度快照：{cache}{Colors.ENDC}")
        print("   请先在本机运行 ai-quota-monitor 的 quota_report.py 生成快照。")
        sys.exit(1)
    try:
        data = json.loads(cache.read_text(encoding="utf-8"))
    except (OSError, ValueError) as error:
        print(f"{Colors.FAIL}❌ 额度快照读取失败：{error}{Colors.ENDC}")
        sys.exit(1)

    rows = data.get("rows") or {}
    items = rows.items() if isinstance(rows, dict) else enumerate(rows)
    print(f"🕐 快照时间：{data.get('captured_at')}\n")
    exhausted = []
    for key, row in items:
        if not isinstance(row, dict):
            continue
        name = str(row.get("name") or key)
        weekly = _remaining(row.get("used_pct"))
        fiveh = _remaining(row.get("fiveh_pct"))
        w_str = f"{weekly:.1f}%" if weekly is not None else "未知"
        f_str = f"{fiveh:.1f}%" if fiveh is not None else "未知"
        raw_reset = str(row.get("reset") or "").strip()
        raw_fiveh_reset = str(row.get("fiveh_reset") or "").strip()
        reset = raw_reset if raw_reset and raw_reset != "?" else "未知"
        fiveh_reset = raw_fiveh_reset if raw_fiveh_reset and raw_fiveh_reset != "?" else "未知"
        flag = ""
        if weekly is not None and weekly <= 3:
            flag = f" {Colors.FAIL}[周额度已用尽]{Colors.ENDC}"
            exhausted.append(name)
        elif weekly is not None and weekly <= 20:
            flag = f" {Colors.WARNING}[偏低]{Colors.ENDC}"
        print(
            f"  {name:<32} 周剩余 {w_str:>7}  5h剩余 {f_str:>7}  "
            f"周重置 {reset:<12} 5h重置 {fiveh_reset}{flag}"
        )
    print()
    if exhausted:
        print(f"{Colors.FAIL}🔴 已用尽的账号：{'、'.join(exhausted)}{Colors.ENDC}")
        print("   早停建议：剩余额度不足时收敛任务规模，在可恢复点停下后再继续。")
    else:
        print(f"{Colors.GREEN}🟢 没有账号触及用尽阈值，可继续推进。{Colors.ENDC}")


def cmd_serve(args):
    port = args.port or 3000
    print("🌐 正在启动 Ops-Hub Web 总台本地预览（仅监听本机回环 127.0.0.1）...")
    print(f"👉 访问地址: http://localhost:{port}")
    webbrowser.open(f"http://localhost:{port}")
    try:
        subprocess.run(["python3", "-m", "http.server", str(port), "--bind", "127.0.0.1"], cwd=str(BASE_DIR))
    except KeyboardInterrupt:
        print("\n👋 Web 预览服务已停止。")


def cmd_schedule(args):
    action = args.sched_action
    dest = Path.home() / "Library" / "LaunchAgents" / "com.insistgang.opshub.plist"

    if action == "install":
        print("⚙️  正在注册 macOS 原生 launchd 早晚定时同步服务...")
        python_bin = os.path.realpath(
            os.environ.get("OPS_PYTHON") or shutil.which("python3.11") or "/usr/bin/python3"
        )
        print(f"🐍 定时任务解释器: {python_bin}")
        tcc_dirs = [Path.home() / d for d in ("Desktop", "Documents", "Downloads")]
        if any(str(BASE_DIR).startswith(str(d)) for d in tcc_dirs):
            print(f"{Colors.WARNING}⚠️  项目位于 macOS 隐私保护目录 ({BASE_DIR})。")
            print(f"   若定时任务日志出现 'Operation not permitted'，请给 {python_bin} 授予完全磁盘访问权限。{Colors.ENDC}")
        dest.parent.mkdir(parents=True, exist_ok=True)
        plist_payload = {
            "Label": "com.insistgang.opshub",
            "ProgramArguments": [python_bin, f"{BASE_DIR}/scripts/sync_all.py"],
            "StartCalendarInterval": [
                {"Hour": 9, "Minute": 0},
                {"Hour": 21, "Minute": 0},
            ],
            "StandardOutPath": "/tmp/opshub_sync.log",
            "StandardErrorPath": "/tmp/opshub_sync_err.log",
        }
        with open(dest, "wb") as handle:
            plistlib.dump(plist_payload, handle)
        subprocess.run(["launchctl", "unload", str(dest)], stderr=subprocess.DEVNULL)
        subprocess.run(["launchctl", "load", str(dest)], check=True)
        print(f"✅ 已成功安装 launchd 服务: {dest}")
        print("🕒 自动执行时间: 每天 09:00 与 21:00 (休眠唤醒后自动对齐)")
        return

    if action == "status":
        res = subprocess.run(["launchctl", "list"], stdout=subprocess.PIPE, text=True)
        line = next((row for row in res.stdout.splitlines() if "com.insistgang.opshub" in row and "vitaflow" not in row), None)
        if not line:
            print("⚪ launchd 定时服务当前状态: [未安装/未加载]")
            return
        parts = line.split("\t")
        pid = parts[0] if len(parts) > 0 else "-"
        last_exit = parts[1] if len(parts) > 1 else "?"
        if pid != "-":
            print(f"🟢 launchd 定时服务当前状态: [正在执行中] (PID {pid})")
            return
        if last_exit == "0":
            print("🟢 launchd 定时服务当前状态: [已加载，等待调度] (上次执行成功)")
            return

        print(f"🔴 launchd 定时服务已加载，但上次执行失败 (退出码 {last_exit})！")
        err_log = Path("/tmp/opshub_sync_err.log")
        out_log = Path("/tmp/opshub_sync.log")
        err_text = err_log.read_text(encoding="utf-8", errors="replace") if err_log.exists() else ""
        tail = [row for row in err_text.strip().splitlines() if row.strip()][-3:]
        source = "错误日志"
        if not tail and out_log.exists():
            out_text = out_log.read_text(encoding="utf-8", errors="replace")
            tail = [
                row.strip() for row in out_text.splitlines()
                if any(mark in row for mark in ("⚠️", "❌", "失败", "跳过"))
            ][-3:]
            source = "运行日志"
        if tail:
            print(f"{Colors.DIM}   最近{source}:{Colors.ENDC}")
            for row in tail:
                print(f"   {Colors.FAIL}{row}{Colors.ENDC}")
        if "Operation not permitted" in err_text:
            interp = "/usr/bin/python3"
            try:
                with open(dest, "rb") as handle:
                    interp = plistlib.load(handle).get("ProgramArguments", [interp])[0]
            except Exception:
                pass
            print(f"   {Colors.WARNING}💡 macOS 隐私权限 (TCC) 拦截：请将 {interp} 加入完全磁盘访问权限后执行 ops schedule install。{Colors.ENDC}")
        sys.exit(1)

    if action == "uninstall":
        if dest.exists():
            subprocess.run(["launchctl", "unload", str(dest)], stderr=subprocess.DEVNULL)
            dest.unlink()
            print("✅ 已成功卸载 launchd 服务。")
        else:
            print("ℹ️ 未发现已安装的 launchd 服务文件。")
