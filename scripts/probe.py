#!/usr/bin/env python3
"""
scripts/probe.py: Tri-Device Network & Hardware Probe
Probes:
1. Mac M5 (Local)
2. Windows 4070S (Tailscale 100.98.218.25)
3. NVIDIA Jetson Yahboom (LAN 10.8.20.74)
"""

import sys
import os
import socket
import subprocess
import json
import re
from datetime import datetime

# Windows 4070S
WIN_IP = "100.98.218.25"
WIN_NAME = "pc-20240911pzjo"
WIN_SSH_PORT = 22
WIN_SMB_PORT = 445

# Mac M5
MAC_NAME = "insistgangmacbook-air"
MAC_IP = "100.86.36.75"

# Jetson Edge Device (Yahboom)
JETSON_IP = "10.8.20.74"
JETSON_NAME = "yahboom"
JETSON_USER = "jetson"
JETSON_SSH_PORT = 22

def probe_ping(ip, timeout=2):
    try:
        cmd = ["ping", "-c", "2", "-t", str(timeout), ip]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=timeout + 1)
        if res.returncode == 0:
            m = re.search(r'min/avg/max/[a-z]+ = ([\d\.]+)/([\d\.]+)/([\d\.]+)', res.stdout)
            if m:
                avg_lat = float(m.group(2))
                return True, round(avg_lat, 1)
            return True, 10.0
        return False, None
    except Exception:
        return False, None

def probe_port(ip, port, timeout=1.5):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        result = s.connect_ex((ip, port))
        s.close()
        return result == 0
    except Exception:
        return False

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

def probe_all():
    # 1. Probe Windows
    win_online, win_lat = probe_ping(WIN_IP, timeout=2)
    win_ssh_ok = False
    win_smb_ok = False
    if win_online:
        win_ssh_ok = probe_port(WIN_IP, WIN_SSH_PORT, timeout=1.5)
        win_smb_ok = probe_port(WIN_IP, WIN_SMB_PORT, timeout=1.5)

    # 2. Probe Jetson (LAN)
    jetson_online, jetson_lat = probe_ping(JETSON_IP, timeout=1.5)
    jetson_ssh_ok = False
    if jetson_online:
        jetson_ssh_ok = probe_port(JETSON_IP, JETSON_SSH_PORT, timeout=1.2)

    mac_info = get_mac_stats()

    win_info = {
        "device": "Windows 性能主机 (i5-12600KF, 32GB, RTX 4070S 12GB)",
        "ip": WIN_IP,
        "name": WIN_NAME,
        "role": "算力后端 // CUDA 训练 // 批量构建 // 冷备仓库",
        "status": "Online" if win_online else "Offline",
        "latency_ms": win_lat if win_online else None,
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
        "ip": JETSON_IP,
        "name": JETSON_NAME,
        "user": JETSON_USER,
        "role": "边缘感知节点 // 端侧视觉与机器人感知部署",
        "network_type": "局域网 (LAN Only)",
        "status": "Online" if jetson_online else "LAN Standby",
        "latency_ms": jetson_lat if jetson_online else None,
        "ssh_port": JETSON_SSH_PORT,
        "ssh_active": jetson_ssh_ok,
        "ssh_cmd": f"ssh {JETSON_USER}@{JETSON_IP}",
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
        "mesh_latency_ms": win_lat if win_online else None
    }

if __name__ == "__main__":
    result = probe_all()
    print(json.dumps(result, indent=2, ensure_ascii=False))
