/**
 * js/compute.js: 三端算力拓扑、分工矩阵、智能任务分流与 SSH 快捷复制模块。
 */
(() => {
  'use strict';

  const esc = value => (window.OpsCore ? window.OpsCore.esc(value) : String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch])));

  let bound = false;
  let latestTopology = {};

  function resolveSshCommand(deviceKey) {
    const dev = latestTopology?.[deviceKey] || {};
    if (dev.ssh_cmd && !String(dev.ssh_cmd).includes('已隐藏')) {
      return String(dev.ssh_cmd);
    }
    if (dev.ip && !String(dev.ip).includes('已隐藏') && !String(dev.ip).includes('.x')) {
      const user = dev.user || (deviceKey === 'jetson' ? 'jetson' : 'user');
      return `ssh ${user}@${dev.ip}`;
    }
    return '';
  }

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = message;
    toast.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => toast.classList.add('opacity-0', 'pointer-events-none'), 2000);
  }

  function copySSH(cmd) {
    const value = String(cmd || '').trim();
    if (!value || value.includes('已隐藏')) {
      showToast('公开脱敏版已隐藏真实主机地址，请在本机环境复制。');
      return;
    }
    navigator.clipboard?.writeText(value).then(() => {
      showToast(`已复制 [${value}] 到剪贴板！`);
    }).catch(() => {
      showToast('复制失败，请检查浏览器剪贴板权限。');
    });
  }

  function renderComputeTopology(status) {
    const topo = status?.topology || {};
    latestTopology = topo;
    const mac = topo.mac || {};
    const win = topo.windows || {};
    const jetson = topo.jetson || {};

    const set = (id, text) => {
      const node = document.getElementById(id);
      if (node) node.innerText = text;
    };

    set('mac-ip-text', mac.ip || '已隐藏');
    set('mac-battery-text', `${mac.battery || '-'} (${mac.power_state || '-'})`);
    set('mac-load-text', mac.load_avg || '-');

    set('win-ip-text', win.ip || '已隐藏');
    const winVia = win.via ? ` · ${win.via}` : '';
    set(
      'win-latency-badge',
      win.latency_ms != null
        ? `${win.latency_ms} ms${winVia}`
        : (win.status === 'Online' ? `在线${winVia}` : `Offline${winVia}`)
    );
    set('win-ssh-badge', win.ssh_active ? '22 (Active)' : '22 (Standby)');
    set('win-smb-badge', win.smb_active ? '445 (Active)' : '445 (Standby)');

    set('jetson-ip-text', jetson.ip || '已隐藏');
    const jetVia = jetson.via ? ` · ${jetson.via}` : '';
    set(
      'jetson-latency-badge',
      jetson.latency_ms != null
        ? `${jetson.latency_ms} ms${jetVia}`
        : (jetson.status === 'Online' ? '在线' : `局域网待命${jetVia}`)
    );
    set('jetson-ssh-badge', jetson.ssh_active ? '22 (Active)' : '22 (Standby)');

    const winSshCmd = resolveSshCommand('windows');
    const jetSshCmd = resolveSshCommand('jetson');
    set('win-ssh-cmd-text', winSshCmd || '地址已隐藏（公开脱敏）');
    set('jetson-ssh-cmd-text', jetSshCmd || '地址已隐藏（公开脱敏）');
  }

  function renderDeviceAllocation(status) {
    const alloc = status?.device_allocation || {};
    const devices = alloc.devices || [];
    const workflows = alloc.project_workflows || [];

    const allocContainer = document.getElementById('device-allocation-cards');
    if (allocContainer) {
      allocContainer.innerHTML = '';
      devices.forEach(dev => {
        const isMac = dev.id === 'mac';
        const isWin = dev.id === 'win';
        const borderClass = isMac ? 'border-indigo-800/40' : (isWin ? 'border-sky-800/40' : 'border-emerald-800/40');
        const headerColor = isMac ? 'text-indigo-400' : (isWin ? 'text-sky-400' : 'text-emerald-400');
        const badgeColor = isMac
          ? 'bg-indigo-950 text-indigo-300 border-indigo-800/60'
          : (isWin ? 'bg-sky-950 text-sky-300 border-sky-800/60' : 'bg-emerald-950 text-emerald-300 border-emerald-800/60');

        const card = document.createElement('div');
        card.className = `glass-panel p-5 rounded-2xl border ${borderClass} flex flex-col justify-between`;
        card.innerHTML = `
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono uppercase px-2 py-0.5 rounded border ${badgeColor}">
                ${esc(dev.badge)}
              </span>
              ${dev.network ? `<span class="text-xs font-mono text-zinc-400 truncate max-w-[58%]" title="${esc(dev.network)}">${esc(dev.network)}</span>` : ''}
            </div>
            <h4 class="text-lg font-bold text-white mt-1">${esc(dev.name)}</h4>
            <p class="text-xs text-zinc-400 font-mono mt-0.5">${esc(dev.hardware)}</p>
            <p class="text-xs ${headerColor} font-medium mt-1 mb-3">${esc(dev.role)}</p>

            <div class="mb-4">
              <div class="text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1">
                <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-400"></i>
                <span>专属主责任务清单</span>
              </div>
              <ul class="text-xs text-slate-300 space-y-1.5 bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800/80">
                ${(dev.primary_tasks || []).map(t => `<li class="flex items-start gap-1.5"><span class="text-indigo-400 font-bold shrink-0">✓</span><span>${esc(t)}</span></li>`).join('')}
              </ul>
            </div>

            <div>
              <div class="text-xs font-bold text-rose-300 mb-1.5 flex items-center gap-1">
                <i data-lucide="shield-alert" class="w-3.5 h-3.5 text-rose-400"></i>
                <span>设备使用绝不越界红线</span>
              </div>
              <ul class="text-xs text-rose-200/80 space-y-1 bg-rose-950/20 p-2.5 rounded-xl border border-rose-900/40 font-mono">
                ${(dev.redlines || []).map(r => `<li class="flex items-start gap-1.5"><span>${esc(r)}</span></li>`).join('')}
              </ul>
            </div>
          </div>
        `;
        allocContainer.appendChild(card);
      });
    }

    const wfContainer = document.getElementById('workflows-table-body');
    if (wfContainer) {
      wfContainer.innerHTML = '';
      workflows.forEach(wf => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-zinc-800/60 hover:bg-zinc-900/30 transition-all text-xs';
        tr.innerHTML = `
          <td class="py-3 px-4 font-bold text-slate-200 whitespace-nowrap">${esc(wf.project)}</td>
          <td class="py-3 px-4 text-indigo-300 bg-indigo-950/10">${esc(wf.mac_role)}</td>
          <td class="py-3 px-4 text-sky-300 bg-sky-950/10">${esc(wf.win_role)}</td>
          <td class="py-3 px-4 text-zinc-400 font-mono">${esc(wf.collab_mode || '-')}</td>
        `;
        wfContainer.appendChild(tr);
      });
    }
  }

  function handleTaskRoute(preset) {
    const inputEl = document.getElementById('task-route-input');
    if (typeof preset === 'string' && inputEl) {
      inputEl.value = preset;
    }
    const query = (typeof preset === 'string' ? preset : (inputEl ? inputEl.value : '')).trim();
    const resBox = document.getElementById('task-route-result');
    if (!resBox) return;

    const route = window.OpsCore?.routeTask ? window.OpsCore.routeTask(query) : null;
    if (!route) {
      resBox.classList.add('hidden');
      return;
    }

    resBox.classList.remove('hidden');
    if (route.target === 'general') {
      resBox.innerHTML = `
        <div class="text-xs text-zinc-300">
          <span class="font-bold text-white">${esc(route.headline)}</span>${esc(route.advice)}
        </div>
      `;
    } else {
      const sshKey = route.target === 'windows' ? 'windows' : (route.target === 'jetson' ? 'jetson' : '');
      const sshCmd = sshKey ? resolveSshCommand(sshKey) : '';
      const sshSnippet = sshKey
        ? `快捷登录：<button type="button" data-inline-ssh="${esc(sshKey)}" class="${route.target === 'windows' ? 'text-sky-300' : 'text-emerald-300'} bg-zinc-900 px-1.5 py-0.5 rounded font-mono">${esc(sshCmd || '地址已隐藏')}</button> ｜ `
        : '';
      resBox.innerHTML = `
        <div class="flex items-center gap-3 ${route.toneClass}">
          <i data-lucide="${esc(route.icon)}" class="w-5 h-5 ${route.iconClass} shrink-0"></i>
          <div>
            <span class="font-bold text-sm text-white">${esc(route.headline)}</span>
            <p class="text-xs text-zinc-400 mt-0.5">${sshSnippet}${esc(route.advice)}</p>
          </div>
        </div>
      `;
      resBox.querySelectorAll('[data-inline-ssh]').forEach(btn => {
        btn.addEventListener('click', () => copySSH(resolveSshCommand(btn.getAttribute('data-inline-ssh'))));
      });
    }
    window.safeCreateIcons?.();
  }

  function bindEvents() {
    if (bound) return;
    bound = true;
    document.getElementById('task-route-input')?.addEventListener('input', () => handleTaskRoute());
    document.querySelectorAll('[data-route-preset]').forEach(btn => {
      btn.addEventListener('click', () => handleTaskRoute(btn.getAttribute('data-route-preset') || ''));
    });
    document.querySelectorAll('[data-ssh-device]').forEach(btn => {
      btn.addEventListener('click', () => copySSH(resolveSshCommand(btn.getAttribute('data-ssh-device'))));
    });
  }

  function render(status) {
    bindEvents();
    renderComputeTopology(status);
    renderDeviceAllocation(status);
  }

  window.OpsCompute = { render, renderComputeTopology, renderDeviceAllocation, handleTaskRoute, copySSH };
  window.handleTaskRoute = handleTaskRoute;
  window.copySSH = copySSH;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindEvents, { once: true });
  } else {
    bindEvents();
  }
})();
