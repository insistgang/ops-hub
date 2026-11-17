#!/usr/bin/env python3
"""scripts/ops_common.py: Ops-Hub 纯标准库公共底座。

集中维护路径常量、终端配色、JSON 容错读取、原子写入（含 window 全局变量镜像）、
每日四勾跨天归档，以及前后端同源的三端任务分流规则。
"""

import json
import os
import tempfile
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
PUBLIC_DIR = DATA_DIR / "public"
PRIVATE_DIR = DATA_DIR / "private"

DAILY_CHECK_KEYS = ("起了", "动了", "写了", "关了")


class Colors:
    HEADER = "\033[95m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    WARNING = "\033[93m"
    FAIL = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"
    DIM = "\033[2m"


# 与前端 js/core.js 保持同源的三端分流关键词表
TASK_ROUTES = (
    {
        "target": "mac",
        "keywords": ("论文", "写作", "日记", "求职", "简历", "复盘", "思考", "typst", "前端"),
        "headline": "立即留在 MacBook Air (M5) 执行！",
        "advice": "抱上 Mac 前往图书馆专注完成，断网/静音深潜，严禁多开与发散。",
    },
    {
        "target": "windows",
        "keywords": ("cuda", "训练", "yolo", "冷备", "备份", "下载", "游戏", "渲染", "构建", "依赖"),
        "headline": "立即派发给 Windows 4070S 性能主机 执行！",
        "advice": "CUDA 训练 / 批量构建 / 冷备仓库",
    },
    {
        "target": "jetson",
        "keywords": ("jetson", "边缘", "机器人", "ros", "视觉", "传感器", "亚博"),
        "headline": "立即派发给 Jetson 边缘计算硬件 执行！",
        "advice": "端侧视觉与机器人感知部署（局域网直连）",
    },
)


def route_task(query):
    """根据关键词匹配最优执行设备，未命中时返回通用规则。"""
    normalized = str(query or "").strip().lower()
    if not normalized:
        return None
    for rule in TASK_ROUTES:
        if any(keyword in normalized for keyword in rule["keywords"]):
            return dict(rule)
    return {
        "target": "general",
        "keywords": (),
        "headline": "通用分流口诀",
        "advice": "思考/文字/求职留在 Mac（去图书馆），重跑/构建/冷备丢给 Win 4070S，端侧感知丢给 Jetson。",
    }


def career_stage_rank(status):
    """求职状态置顶权重：面试/笔试 > 录用/Offer > 初筛 > 已投递 > 其他。"""
    label = str(status or "")
    low = label.lower()
    if "面" in label:
        return 0
    if "笔试" in label:
        return 1
    if "offer" in low or "录用" in label:
        return 2
    if "初筛" in label:
        return 3
    if "投递" in label:
        return 4
    return 5


def load_json(path, default=None):
    """读取 JSON 文件；缺失或损坏时回退 default，不抛未捕获异常。"""
    try:
        with open(path, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, json.JSONDecodeError):
        return default


def atomic_write_text(path, content):
    """同目录临时文件 + os.replace 原子落盘，避免半截文件。"""
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    tmp_fd, tmp_path = tempfile.mkstemp(dir=str(target.parent), prefix=target.name + ".", suffix=".tmp")
    try:
        with os.fdopen(tmp_fd, "w", encoding="utf-8") as handle:
            handle.write(content)
        os.replace(tmp_path, target)
    except Exception:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
        raise


def atomic_write_json(path, data):
    """格式化 JSON 原子写入。"""
    atomic_write_text(path, json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def atomic_write_js_global(path, global_name, data):
    """生成供 file:/// 零 CORS 预加载的 window.<global_name> 镜像脚本。"""
    atomic_write_text(path, f"window.{global_name} = {json.dumps(data, ensure_ascii=False)};\n")


def default_daily_checks_payload(today_str=None):
    day = today_str or datetime.now().strftime("%Y-%m-%d")
    return {
        "date": day,
        "checks": {key: False for key in DAILY_CHECK_KEYS},
        "history": [],
    }


def rollover_daily_checks(data):
    """跨天归档旧四勾并重置今日基线，返回 (new_data, rolled_over)。"""
    today_str = datetime.now().strftime("%Y-%m-%d")
    if isinstance(data, dict) and data.get("date") == today_str:
        return data, False
    history = list((data or {}).get("history") or [])
    if isinstance(data, dict) and data.get("date") and data.get("checks"):
        history.append({"date": data["date"], "checks": data["checks"]})
    fresh = default_daily_checks_payload(today_str)
    fresh["history"] = history
    return fresh, True
