#!/usr/bin/env python3
"""
scripts/probe.py: Tri-Device Network & Hardware Probe
Probes:
1. Mac M5 (Local)
2. Windows 4070S (Tailscale)
3. NVIDIA Jetson Yahboom (LAN)

设备地址解析优先级：环境变量 > 本地真源 data/private_devices.json > 占位默认值。
本机部署时导出 OPSHUB_WIN_IP、OPSHUB_MAC_IP、OPSHUB_JETSON_IP 可覆盖；
也可直接编辑本地真源文件。公开仓库中不出现任何真实内网地址。
"""

import sys
import os
import socket
import subprocess
import json
import re
import time
from pathlib import Path
from datetime import datetime

# 设备地址解析优先级：环境变量 > 本地真源 data/private_devices.json > 占位默认值。
# 本地真源已 git-ignore，公开仓库中不出现任何真实内网地址。
DEVICE_CONFIG_PATH = Path(__file__).resolve().parent.parent / "data" / "private_devices.json"


def _load_device_config():
    """读取本机设备配置（本地真源，缺失时返回空字典）。"""
    try:
        with open(DEVICE_CONFIG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


_DEVICE_CFG = _load_device_config()


def _device(key, field, env_name, default):
    """按环境变量 → 本地真源 → 默认值的顺序解析设备字段。"""
    env_value = os.environ.get(env_name)
    if env_value:
        return env_value
    section = _DEVICE_CFG.get(key) or {}
    value = section.get(field)
    return value if value else default


def _device_ips(key, env_name, default):
    """解析候选地址列表：环境变量(逗号分隔) > ip_candidates > ip > 默认值。

    局域网设备是 DHCP 分配，地址会漂移；保留候选列表可以避免每次换地址就显示离线。
    """
    env_value = os.environ.get(env_name)
    if env_value:
        return [v.strip() for v in env_value.split(",") if v.strip()]
    section = _DEVICE_CFG.get(key) or {}
    candidates = section.get("ip_candidates")
    if isinstance(candidates, list) and candidates:
        return [str(v).strip() for v in candidates if str(v).strip()]
    single = section.get("ip")
    if single:
        return [str(single).strip()]
    return [default]


# Windows 4070S
WIN_IP = _device("windows", "ip", "OPSHUB_WIN_IP", "已隐藏")
WIN_NAME = _device("windows", "name", "OPSHUB_WIN_NAME", "windows-host")
WIN_SSH_PORT = 22
WIN_SMB_PORT = 445

# Mac M5
MAC_NAME = _device("mac", "name", "OPSHUB_MAC_NAME", "mac-host")
MAC_IP = _device("mac", "ip", "OPSHUB_MAC_IP", "已隐藏")

# Jetson Edge Device (Yahboom)
JETSON_IP = _device("jetson", "ip", "OPSHUB_JETSON_IP", "已隐藏")
JETSON_IPS = _device_ips("jetson", "OPSHUB_JETSON_IP", JETSON_IP)
WIN_IPS = _device_ips("windows", "OPSHUB_WIN_IP", WIN_IP)
JETSON_NAME = _device("jetson", "name", "OPSHUB_JETSON_NAME", "jetson-host")
JETSON_USER = _device("jetson", "user", "OPSHUB_JETSON_USER", "jetson")
JETSON_SSH_PORT = 22

def _ping_cmd(ip, timeout):
    """构造 ping 命令。

    注意 macOS/BSD 的 `-t` 是 TTL，不是超时；用它当超时会退化成「只允许 2 跳」，
    Tailscale 走 DERP 中继时会被误判离线。等待时间统一用 -W：
    macOS 单位是毫秒，Linux 单位是秒。
    """
    if sys.platform == "darwin":
        wait = ["-W", str(max(1, int(timeout * 1000)))]
    else:
        wait = ["-W", str(max(1, int(round(timeout))))]
    return ["ping", "-c", "2"] + wait + [ip]


def probe_ping(ip, timeout=2):
    try:
        cmd = _ping_cmd(ip, timeout)
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=timeout * 2 + 2)
        if res.returncode == 0:
            m = re.search(r'min/avg/max/[a-z]+ = ([\d\.]+)/([\d\.]+)/([\d\.]+)', res.stdout)
            if m:
                avg_lat = float(m.group(2))
                return True, round(avg_lat, 1)
            # Reachable but latency unparsable — report honestly (Zero-Mock Axiom)
            return True, None
        return False, None
    except Exception:
        return False, None

def probe_port(ip, port, timeout=1.5):
    ok, _ = probe_tcp(ip, port, timeout)
    return ok


def probe_tcp(ip, port, timeout=1.5):
    """TCP 连接探测，返回 (是否连通, 连接耗时毫秒)。

    Tailscale 走 DERP 中继时不转发 ICMP，只看 ping 会把在线主机判成离线；
    TCP 握手才是真正代表「服务可达」的信号。
    """
    started = time.monotonic()
    sock = None
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((ip, port))
        elapsed = round((time.monotonic() - started) * 1000, 1)
        return result == 0, (elapsed if result == 0 else None)
    except Exception:
        return False, None
    finally:
        if sock is not None:
            try:
                sock.close()
            except Exception:
                pass


TAILSCALE_BINARIES = [
    "tailscale",
    "/Applications/Tailscale.app/Contents/MacOS/Tailscale",
]


def tailscale_status():
    """读取 Tailscale 控制面状态，按 Tailscale IP 建索引。

    返回 {} 表示本机没有 Tailscale CLI，此时退回纯网络探测。
    """
    for binary in TAILSCALE_BINARIES:
        try:
            res = subprocess.run([binary, "status", "--json"], stdout=subprocess.PIPE,
                                 stderr=subprocess.PIPE, text=True, timeout=4)
        except Exception:
            continue
        if res.returncode != 0 or not res.stdout.strip():
            continue
        try:
            payload = json.loads(res.stdout)
        except ValueError:
            continue
        index = {}
        for peer in (payload.get("Peer") or {}).values():
            entry = {
                "online": bool(peer.get("Online")),
                "relay": peer.get("Relay") or "",
                "direct": bool(peer.get("CurAddr")),
                "os": peer.get("OS") or "",
                "last_seen": peer.get("LastSeen") or "",
                "host": peer.get("HostName") or "",
            }
            for ip in peer.get("TailscaleIPs") or []:
                index[ip] = entry
        return index
    return {}


def _via_label(peer):
    if not peer:
        return ""
    if peer.get("direct"):
        return "直连"
    if peer.get("relay"):
        return f"DERP · {peer['relay']}"
    return ""

def get_mac_stats():
    batt_pct = "100%"
    batt_status = "AC Connected"
    try:
        res = subprocess.run(["pmset", "-g", "batt"], stdout=subprocess.PIPE, text=True, timeout=2)
        m = re.search(r'(\d+)%', res.stdout)
        if m:
            batt_pct = f"{m.group(1)}%"
        if "discharging" in res.stdout.lower():
            batt_status = "Discharging (Battery)"
        elif "charging" in res.stdout.lower():
            batt_status = "Charging"
        else:
            batt_status = "AC Power"
    except Exception:
        pass

    load = "0.8"
    try:
        res = subprocess.run(["uptime"], stdout=subprocess.PIPE, text=True, timeout=2)
        m = re.search(r'load averages?:\s*([\d\.,\s]+)', res.stdout)
        if m:
            load = m.group(1).split(",")[0].strip()
    except Exception:
        pass

    return {
        "device": "MacBook Air (Apple M5, 16GB)",
        "ip": MAC_IP,
        "name": MAC_NAME,
        "role": "移动生产力中枢 // 图书馆深度工作主场",
        "battery": batt_pct,
        "power_state": batt_status,
        "load_avg": load,
        "status": "Online",
        "services": ["Ops-Hub Console", "Obsidian Knowledge", "Career-Copilot"]
    }

def probe_first_reachable(ips, timeout=2):
    """按候选顺序探测，返回 (是否在线, 延迟, 命中的地址)。全部失败时用首个候选回报。"""
    for candidate in ips:
        online, latency = probe_ping(candidate, timeout=timeout)
        if online:
            return True, latency, candidate
    return False, None, ips[0] if ips else "已隐藏"


def probe_all():
    tailscale = tailscale_status()

    # 1. Probe Windows（候选地址逐个尝试；在线判定 = TCP 可达或 ICMP 可达）
    _, _, win_ip = probe_first_reachable(WIN_IPS, timeout=2)
    win_ssh_ok, win_ssh_ms = probe_tcp(win_ip, WIN_SSH_PORT, timeout=2.0)
    win_smb_ok, win_smb_ms = probe_tcp(win_ip, WIN_SMB_PORT, timeout=2.0)
    win_icmp_ok, win_icmp_ms = probe_ping(win_ip, timeout=2)
    win_online = win_ssh_ok or win_smb_ok or win_icmp_ok
    win_lat = win_icmp_ms or win_ssh_ms or win_smb_ms
    win_peer = tailscale.get(win_ip) or {}

    # 2. Probe Jetson (LAN)
    jetson_icmp_ok, jetson_icmp_ms, jetson_ip = probe_first_reachable(JETSON_IPS, timeout=1.5)
    jetson_ssh_ok, jetson_ssh_ms = probe_tcp(jetson_ip, JETSON_SSH_PORT, timeout=1.5)
    jetson_online = jetson_icmp_ok or jetson_ssh_ok
    jetson_lat = jetson_icmp_ms or jetson_ssh_ms

    mac_info = get_mac_stats()

    win_info = {
        "device": "Windows 性能主机 (i5-12600KF, 32GB, RTX 4070S 12GB)",
        "ip": win_ip,
        "name": WIN_NAME,
        "role": "算力后端 // CUDA 训练 // 批量构建 // 冷备仓库",
        "status": "Online" if win_online else "Offline",
        "latency_ms": win_lat if win_online else None,
        "via": _via_label(win_peer),
        "control_online": bool(win_peer.get("online")),
        "last_seen": win_peer.get("last_seen") or "",
        "ssh_port": WIN_SSH_PORT,
        "ssh_active": win_ssh_ok,
        "smb_port": WIN_SMB_PORT,
        "smb_active": win_smb_ok,
        "services": [
            f"SSH Remote ({'Active :22' if win_ssh_ok else 'Standby'})",
            f"SMB Storage ({'Active :445' if win_smb_ok else 'Standby'})",
            "CUDA 12 Compute",
            "Tailscale Mesh"
        ]
    }

    jetson_info = {
        "device": "NVIDIA Jetson 边缘计算硬件 (Yahboom 亚博智能, Tegra aarch64)",
        "ip": jetson_ip,
        "name": JETSON_NAME,
        "user": JETSON_USER,
        "role": "边缘感知节点 // 端侧视觉与机器人感知部署",
        "network_type": "局域网 (LAN Only)",
        "status": "Online" if jetson_online else "LAN Standby",
        "latency_ms": jetson_lat if jetson_online else None,
        "via": _via_label(tailscale.get(jetson_ip) or {}),
        "control_online": bool((tailscale.get(jetson_ip) or {}).get("online")),
        "ssh_port": JETSON_SSH_PORT,
        "ssh_active": jetson_ssh_ok,
        "ssh_cmd": f"ssh {JETSON_USER}@{jetson_ip}",
        "services": [
            f"SSH 访问 ({'Active :22' if jetson_ssh_ok else 'Standby'})",
            "NVIDIA JetPack 6 / Tegra R36",
            "CUDA Edge Runtime",
            "Edge AI Perception"
        ]
    }

    return {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "mac": mac_info,
        "windows": win_info,
        "jetson": jetson_info,
        "mesh_latency_ms": win_lat if win_online else None,
        "tailscale_checked": bool(tailscale)
    }

if __name__ == "__main__":
    result = probe_all()
    print(json.dumps(result, indent=2, ensure_ascii=False))
