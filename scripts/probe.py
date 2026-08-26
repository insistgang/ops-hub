#!/usr/bin/env python3
"""
scripts/probe.py: Level 2 Double-Machine Network & Hardware Probe
Probes local Mac M5 status and remote Windows 4070S (Tailscale 100.98.218.25)
"""

import sys
import os
import socket
import subprocess
import json
import re
from datetime import datetime

WIN_IP = "100.98.218.25"
WIN_NAME = "pc-20240911pzjo"
WIN_OLLAMA_PORT = 11434
MAC_NAME = "insistgangmacbook-air"
MAC_IP = "100.86.36.75"

def probe_ping(ip, timeout=2):
    try:
        cmd = ["ping", "-c", "2", "-t", str(timeout), ip]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=timeout + 1)
        if res.returncode == 0:
            # Parse round-trip avg latency: round-trip min/avg/max/stddev = 7.827/20.081/32.336/12.255 ms
            m = re.search(r'min/avg/max/[a-z]+ = ([\d\.]+)/([\d\.]+)/([\d\.]+)', res.stdout)
            if m:
                avg_lat = float(m.group(2))
                return True, round(avg_lat, 1)
            return True, 20.0
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
    # Battery info
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

    # Uptime & Load
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
    is_online, latency = probe_ping(WIN_IP, timeout=2)
    ollama_ok = False
    if is_online:
        ollama_ok = probe_port(WIN_IP, WIN_OLLAMA_PORT, timeout=1.5)

    mac_info = get_mac_stats()

    win_info = {
        "device": "Windows 性能主机 (i5-12600KF, 32GB, RTX 4070S 12GB)",
        "ip": WIN_IP,
        "name": WIN_NAME,
        "role": "算力后端 // CUDA 训练 // Ollama 本地模型 // 冷备仓库",
        "status": "Online" if is_online else "Offline",
        "latency_ms": latency if is_online else None,
        "ollama_port": WIN_OLLAMA_PORT,
        "ollama_active": ollama_ok,
        "services": [
            f"Ollama AI ({'Active :11434' if ollama_ok else 'Standby'})",
            "CUDA 12 Compute",
            "SMB Storage",
            "Tailscale Mesh"
        ]
    }

    return {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "mac": mac_info,
        "windows": win_info,
        "mesh_latency_ms": latency if is_online else None
    }

if __name__ == "__main__":
    result = probe_all()
    print(json.dumps(result, indent=2, ensure_ascii=False))
