/**
 * Ops-Hub Frontend Application Logic
 * Dual-engine data loading: Supports fetch() AND zero-CORS direct file:/// loading!
 */

let globalStatus = window.__OPS_STATUS__ || null;
let memoryRules = window.__OPS_MEMORY__ || null;
let currentCareerFilter = "all";

/**
 * Escape external/user-controlled text before injecting into innerHTML (XSS guard).
 * All data rendered via innerHTML MUST pass through esc() first.
 */
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function boot() {
  console.log("🚀 Ops-Hub 正在初始化启动...");
  initTheme();
  initTabs();
  startLiveClock();

  if (window.__OPS_STATUS__) {
    globalStatus = window.__OPS_STATUS__;
  }
  if (window.__OPS_MEMORY__) {
    memoryRules = window.__OPS_MEMORY__;
  }

  // 1. If preloaded from status.js, render immediately with 0 delay!
  if (globalStatus) {
    renderAll();
  }

  // 2. Fetch fresh data (works on http/https, gracefully handles file:///)
  loadData(true);

  // Background auto-fetch every 30 seconds
  setInterval(() => {
    loadData(true);
  }, 30000);
}

// Immediate execution or on DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

function safeCreateIcons() {
  try {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  } catch (e) {
    console.warn("Lucide icons init warning:", e);
  }
}

/* ---------- Day/Night Theme ---------- */

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    // Show the icon of the theme you will switch TO
    btn.innerHTML = `<i data-lucide="${isDark ? 'sun' : 'moon'}" class="w-4 h-4"></i>`;
    btn.title = isDark ? "切换到日间模式" : "切换到夜间模式";
  }
  safeCreateIcons();
}

function initTheme() {
  let saved = "dark";
  try { saved = localStorage.getItem("ops_theme") || "dark"; } catch (e) {}
  applyTheme(saved);
}

function toggleTheme() {
  const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("ops_theme", next); } catch (e) {}
}

function startLiveClock() {
  const clockEl = document.getElementById("live-clock");
  const update = () => {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    if (clockEl) clockEl.innerText = timeStr;
    updateSyncAge();
  };
  update();
  setInterval(update, 1000);
}

function updateSyncAge() {
  const ageEl = document.getElementById("sync-age-text");
  if (!ageEl) return;

  if (!globalStatus?.meta?.last_synced) {
    ageEl.innerText = "已加载";
    return;
  }

  const syncDate = new Date(globalStatus.meta.last_synced.replace(/-/g, "/"));
  const now = new Date();
  const diffSec = Math.floor((now - syncDate) / 1000);

  if (isNaN(diffSec) || diffSec < 60) {
    ageEl.innerText = "刚刚同步";
  } else if (diffSec < 3600) {
    ageEl.innerText = `${Math.floor(diffSec / 60)} 分钟前同步`;
  } else if (diffSec < 86400) {
    ageEl.innerText = `${Math.floor(diffSec / 3600)} 小时前同步`;
  } else {
    ageEl.innerText = `${Math.floor(diffSec / 86400)} 天前同步`;
  }
}

async function manualRefresh() {
  const icon = document.getElementById("sync-refresh-icon");
  if (icon) icon.classList.add("animate-spin");
  await loadData(false);
  setTimeout(() => {
    if (icon) icon.classList.remove("animate-spin");
  }, 600);
}

function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active", "bg-indigo-950/60", "text-indigo-400", "border-indigo-500"));
      btn.classList.add("active", "bg-indigo-950/60", "text-indigo-400", "border-indigo-500");
      
      const target = btn.getAttribute("data-tab");
      document.querySelectorAll(".tab-content").forEach(content => {
        content.classList.add("hidden");
      });
      const targetEl = document.getElementById(target);
      if (targetEl) targetEl.classList.remove("hidden");
      safeCreateIcons();
    });
  });
}

async function loadData(silent = false) {
  try {
    const statusRes = await fetch("data/status.json?t=" + Date.now());
    if (statusRes.ok) {
      globalStatus = await statusRes.json();
    }

    const rulesRes = await fetch("data/memory_rules.json?t=" + Date.now());
    if (rulesRes.ok) {
      memoryRules = await rulesRes.json();
    }

    renderAll();
  } catch (err) {
    if (window.__OPS_STATUS__) {
      globalStatus = window.__OPS_STATUS__;
    }
    if (window.__OPS_MEMORY__) {
      memoryRules = window.__OPS_MEMORY__;
    }
    renderAll();
  }
}

function renderAll() {
  if (!globalStatus) return;
  try {
    renderHeader();
    renderHeroMetrics();
    renderCareerPipeline();
    renderProjectsRadar();
    renderMemoryHub();
    renderComputeTopology();
    renderDeviceAllocation();
    updateSyncAge();
    safeCreateIcons();
  } catch (err) {
    console.error("renderAll 异常:", err);
  }
}

function renderHeader() {
  const meta = globalStatus.meta || {};
  const topo = globalStatus.topology || {};
  const win = topo.windows || {};
  const jetson = topo.jetson || {};

  const exactTimeEl = document.getElementById("last-synced-exact");
  if (exactTimeEl) exactTimeEl.innerText = meta.last_synced || "-";
  
  // Win status pill
  const winPill = document.getElementById("win-status-pill");
  const winDot = document.getElementById("win-status-dot");
  const winText = document.getElementById("win-status-text");

  if (winPill && winDot && winText) {
    if (win.status === "Online") {
      winDot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
      winText.innerText = win.latency_ms != null ? `Win 4070S: ${win.latency_ms}ms` : "Win 4070S: Online";
      winPill.className = "flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-800/50";
    } else {
      winDot.className = "w-2 h-2 rounded-full bg-rose-500";
      winText.innerText = "Win 4070S: Offline";
      winPill.className = "flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-rose-950/40 text-rose-300 border border-rose-800/50";
    }
  }

  // Jetson status pill
  const jetPill = document.getElementById("jetson-status-pill");
  const jetDot = document.getElementById("jetson-status-dot");
  const jetText = document.getElementById("jetson-status-text");

  if (jetPill && jetDot && jetText) {
    if (jetson.status === "Online") {
      jetDot.className = "w-2 h-2 rounded-full bg-emerald-400";
      jetText.innerText = jetson.latency_ms != null ? `Jetson: ${jetson.latency_ms}ms` : "Jetson: Online";
      jetPill.className = "hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-800/50";
    } else {
      jetDot.className = "w-2 h-2 rounded-full bg-zinc-500";
      jetText.innerText = "Jetson: 局域网待命";
      jetPill.className = "hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-zinc-900/60 text-zinc-400 border border-zinc-800";
    }
  }
}

function renderHeroMetrics() {
  const career = globalStatus.career_summary || {};
  const stats = career.stats || {};
  const weight = globalStatus.weight_challenge || {};
  const exams = (globalStatus.projects_and_exams || []).filter(p => p.type === "exam");
  const topo = globalStatus.topology || {};
  const win = topo.windows || {};
  const jetson = topo.jetson || {};

  const cTot = document.getElementById("metric-career-total");
  const cSub = document.getElementById("metric-career-sub");
  if (cTot) cTot.innerText = stats.total || 0;
  if (cSub) cSub.innerText = `初筛 ${stats.screening || 0} · 投递 ${stats.applied || 0} · 面试 ${stats.interviewing || 0}`;

  const jiaoshi = exams.find(e => e.id === "e-jiaoxi") || {};
  const cet6 = exams.find(e => e.id === "e-cet6") || {};
  const eDays = document.getElementById("metric-exam-days");
  const eSub = document.getElementById("metric-exam-sub");
  if (eDays) eDays.innerText = jiaoshi.days_left !== undefined ? jiaoshi.days_left : "-";
  if (eSub) eSub.innerText = `教资9/12冲刺 ｜ 六级剩 ${cet6.days_left || 0} 天`;

  const wDay = document.getElementById("metric-weight-day");
  const wSub = document.getElementById("metric-weight-sub");
  if (wDay) wDay.innerText = `D${weight.current_day || 3}`;
  if (wSub) wSub.innerText = `决战剩余 ${weight.days_left || 0} 天 ｜ ${weight.members?.join(' · ')}`;

  const compLat = document.getElementById("metric-compute-lat");
  const compSub = document.getElementById("metric-compute-sub");
  const onlineCount = (win.status === "Online" ? 1 : 0) + (jetson.status === "Online" ? 1 : 0) + 1;
  if (compLat) compLat.innerText = `${onlineCount} 节点在线`;
  if (compSub) compSub.innerText = `4070S:${win.latency_ms != null ? win.latency_ms + 'ms' : (win.status === "Online" ? '在线' : '离线')} ｜ Jetson:${jetson.latency_ms != null ? jetson.latency_ms + 'ms' : (jetson.status === "Online" ? '在线' : '待命')}`;
}

function renderCareerPipeline() {
  const records = globalStatus.career_summary?.records || [];
  const container = document.getElementById("career-records-list");
  if (!container) return;
  container.innerHTML = "";

  const filtered = records.filter(r => {
    if (currentCareerFilter === "all") return true;
    if (currentCareerFilter === "interview") return r.status.includes("面");
    if (currentCareerFilter === "screening") return r.status.includes("初筛");
    if (currentCareerFilter === "applied") return r.status.includes("投递");
    return true;
  });

  filtered.forEach(r => {
    let statusClass = "bg-zinc-800 text-zinc-300 border-zinc-700";
    if (r.status.includes("面")) statusClass = "bg-emerald-950/80 text-emerald-300 border-emerald-600";
    else if (r.status.includes("初筛")) statusClass = "bg-sky-950/80 text-sky-300 border-sky-600";
    else if (r.status.includes("笔试")) statusClass = "bg-amber-950/80 text-amber-300 border-amber-600";

    let priorityBadge = "";
    if (r.priority === "High" || r.priority === "Critical") {
      priorityBadge = `<span class="px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-rose-950/60 text-rose-300 border border-rose-800/40 rounded">High</span>`;
    }

    const card = document.createElement("div");
    card.className = "glass-panel p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4";
    card.innerHTML = `
      <div class="flex items-start gap-3.5">
        <div class="w-10 h-10 rounded-lg bg-zinc-800/80 border border-zinc-700 flex items-center justify-center shrink-0 text-indigo-400 font-bold">
          ${esc((r.company || "").substring(0, 2))}
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="font-bold text-slate-100">${esc(r.company)}</h4>
            <span class="px-2 py-0.5 rounded text-xs border font-medium ${statusClass}">${esc(r.status)}</span>
            ${priorityBadge}
          </div>
          <p class="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span class="text-indigo-300 font-medium">${esc(r.position)}</span>
            <span>·</span>
            <span>投递于 ${esc(r.apply_date)}</span>
          </p>
          ${r.notes ? `<p class="text-xs text-slate-400/90 mt-2 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800 font-mono">${esc(r.notes)}</p>` : ''}
        </div>
      </div>
      <div class="flex items-center gap-2 self-end md:self-center shrink-0">
        ${r.resume_file ? `
          <div class="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1.5 rounded-md border border-zinc-800 flex items-center gap-1.5">
            <i data-lucide="file-text" class="w-3.5 h-3.5 text-indigo-400"></i>
            <span>${esc(r.resume_file)}</span>
          </div>
        ` : ''}
      </div>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll(".career-filter-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".career-filter-btn").forEach(b => b.classList.remove("bg-indigo-600", "text-white"));
      btn.classList.add("bg-indigo-600", "text-white");
      currentCareerFilter = btn.getAttribute("data-filter");
      renderCareerPipeline();
      safeCreateIcons();
    };
  });
}

function renderProjectsRadar() {
  const projects = globalStatus.projects_and_exams || [];
  const container = document.getElementById("projects-radar-list");
  if (!container) return;
  container.innerHTML = "";

  projects.forEach(p => {
    const isExam = p.type === "exam";
    const card = document.createElement("div");
    card.className = "glass-panel p-5 rounded-xl flex flex-col justify-between";

    if (isExam) {
      const isUrgent = p.days_left <= 20;
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-mono uppercase px-2 py-0.5 rounded ${isUrgent ? 'bg-rose-950 text-rose-300 border border-rose-800/60 danger-pulse' : 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'}">
              ${esc(p.category)}
            </span>
            <span class="text-xs text-slate-400 font-mono">考期: ${esc(p.target_date)}</span>
          </div>
          <h4 class="text-base font-bold text-slate-100 mt-1">${esc(p.name)}</h4>
          <div class="my-4 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold font-mono ${isUrgent ? 'text-rose-400' : 'text-amber-400'}">${esc(p.days_left)}</span>
            <span class="text-xs text-slate-400">天后开考</span>
          </div>
          <div class="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 text-xs text-slate-300">
            <span class="text-indigo-400 font-semibold">下一步冲刺：</span>${esc(p.next_action)}
          </div>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              ${esc(p.category)}
            </span>
            <span class="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              ${esc(p.status)}
            </span>
          </div>
          <h4 class="text-base font-bold text-slate-100 mt-1">${esc(p.name)}</h4>
          <p class="text-xs text-indigo-300 font-mono mt-1">${esc(p.tech_stack)}</p>

          <div class="my-3 py-2 px-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80 text-xs font-mono text-slate-400">
            <div class="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
              <span>最新代码动态</span>
              <span>${esc(p.commit_time || '-')}</span>
            </div>
            <div class="text-slate-300 truncate">
              <span class="text-indigo-400 font-semibold">[${esc(p.commit_hash || 'LOCAL')}]</span> ${esc(p.commit_msg || '-')}
            </div>
          </div>

          <div class="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 text-xs text-slate-300 mt-2">
            <span class="text-indigo-400 font-semibold">下一步行动：</span>${esc(p.next_action)}
          </div>
        </div>
      `;
    }
    container.appendChild(card);
  });
}

function renderMemoryHub() {
  if (!memoryRules) return;

  // Web check-ins persist in localStorage (static site: browser is the only writable store).
  // CLI (`ops check`) remains the cross-device source of truth via daily_checks.json.
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const storageKey = `ops_checks_${todayStr}`;

  const dateBadge = document.getElementById("daily-checks-date");
  if (dateBadge) dateBadge.innerText = todayStr;

  let checksData = null;
  try {
    checksData = JSON.parse(localStorage.getItem(storageKey) || "null");
  } catch (e) { checksData = null; }
  if (!checksData || typeof checksData !== "object") {
    // Fall back to JSON snapshot only when it is actually today's record
    const jsonChecks = globalStatus.daily_checks || {};
    checksData = Object.assign(
      { "起了": false, "动了": false, "写了": false, "关了": false },
      jsonChecks.date === todayStr ? (jsonChecks.checks || {}) : {}
    );
  }

  const checksContainer = document.getElementById("daily-checks-container");
  if (checksContainer) {
    checksContainer.innerHTML = "";

    (memoryRules.four_checks_definition || []).forEach(def => {
      const isChecked = checksData[def.key] === true;
      const item = document.createElement("div");
      item.className = `p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
        isChecked ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
      }`;
      item.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg ${isChecked ? 'bg-emerald-900/50 text-emerald-400' : 'bg-zinc-800 text-zinc-400'} flex items-center justify-center">
            <i data-lucide="${esc(def.icon || 'check')}" class="w-4 h-4"></i>
          </div>
          <div>
            <h5 class="text-sm font-bold text-slate-200">${esc(def.name)} (${esc(def.key)})</h5>
            <p class="text-[11px] text-slate-400">${esc(def.desc)}</p>
          </div>
        </div>
        <div class="w-6 h-6 rounded-md border flex items-center justify-center ${isChecked ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-zinc-700'}">
          ${isChecked ? '<i data-lucide="check" class="w-4 h-4"></i>' : ''}
        </div>
      `;
      item.onclick = () => {
        checksData[def.key] = !isChecked;
        try { localStorage.setItem(storageKey, JSON.stringify(checksData)); } catch (e) {
          console.warn("打卡持久化失败 (localStorage 不可用):", e);
        }
        renderMemoryHub();
        safeCreateIcons();
      };
      checksContainer.appendChild(item);
    });
  }

  const scenesContainer = document.getElementById("scenes-container");
  if (scenesContainer) {
    scenesContainer.innerHTML = "";
    (memoryRules.scene_contracts || []).forEach(sc => {
      const card = document.createElement("div");
      card.className = "p-4 rounded-xl bg-zinc-900/70 border border-zinc-800";
      card.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <h5 class="font-bold text-slate-100">${esc(sc.scene)}</h5>
          <span class="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">${esc(sc.mode)}</span>
        </div>
        <ul class="text-xs text-slate-400 space-y-1.5 mt-2">
          ${sc.rules.map(r => `<li class="flex items-start gap-1.5"><span class="text-indigo-400">▹</span><span>${esc(r)}</span></li>`).join('')}
        </ul>
      `;
      scenesContainer.appendChild(card);
    });
  }

  const principlesContainer = document.getElementById("principles-container");
  if (principlesContainer) {
    principlesContainer.innerHTML = "";
    (memoryRules.focus_principles || []).forEach(fp => {
      const card = document.createElement("div");
      card.className = "p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs";
      card.innerHTML = `
        <span class="font-bold text-indigo-300 block mb-1">⚡ ${esc(fp.principle)}</span>
        <span class="text-slate-400 leading-relaxed">${esc(fp.desc)}</span>
      `;
      principlesContainer.appendChild(card);
    });
  }

  const hs = memoryRules.health_supplements || {};
  const healthRuleEl = document.getElementById("health-rule-text");
  if (healthRuleEl) healthRuleEl.innerText = hs.rule || "";
  const healthList = document.getElementById("health-schedule-list");
  if (healthList) {
    healthList.innerHTML = "";
    (hs.schedule || []).forEach(s => {
      const li = document.createElement("div");
      li.className = "flex items-center justify-between text-xs py-1 border-b border-zinc-800/50 last:border-0";
      li.innerHTML = `<span class="text-indigo-300 font-mono font-medium">${esc(s.period)}</span><span class="text-slate-300">${esc(s.items)}</span>`;
      healthList.appendChild(li);
    });
  }
}

function renderComputeTopology() {
  const topo = globalStatus.topology || {};
  const mac = topo.mac || {};
  const win = topo.windows || {};
  const jetson = topo.jetson || {};

  const macIp = document.getElementById("mac-ip-text");
  const macBatt = document.getElementById("mac-battery-text");
  const macLoad = document.getElementById("mac-load-text");
  if (macIp) macIp.innerText = mac.ip || "100.86.36.75";
  if (macBatt) macBatt.innerText = `${mac.battery} (${mac.power_state})`;
  if (macLoad) macLoad.innerText = mac.load_avg || "-";

  const winIp = document.getElementById("win-ip-text");
  const winLat = document.getElementById("win-latency-badge");
  const winSsh = document.getElementById("win-ssh-badge");
  const winSmb = document.getElementById("win-smb-badge");
  if (winIp) winIp.innerText = win.ip || "100.98.218.25";
  if (winLat) winLat.innerText = win.latency_ms != null ? `${win.latency_ms} ms` : (win.status === "Online" ? "在线" : "Offline");
  if (winSsh) winSsh.innerText = win.ssh_active ? "22 (Active)" : "22 (Standby)";
  if (winSmb) winSmb.innerText = win.smb_active ? "445 (Active)" : "445 (Standby)";

  const jetIp = document.getElementById("jetson-ip-text");
  const jetLat = document.getElementById("jetson-latency-badge");
  const jetSsh = document.getElementById("jetson-ssh-badge");
  if (jetIp) jetIp.innerText = jetson.ip || "10.8.20.74";
  if (jetLat) jetLat.innerText = jetson.latency_ms != null ? `${jetson.latency_ms} ms` : (jetson.status === "Online" ? "在线" : "局域网待命");
  if (jetSsh) jetSsh.innerText = jetson.ssh_active ? "22 (Active)" : "22 (Standby)";
}

function renderDeviceAllocation() {
  const alloc = globalStatus.device_allocation || {};
  const devices = alloc.devices || [];
  const workflows = alloc.project_workflows || [];

  const allocContainer = document.getElementById("device-allocation-cards");
  if (allocContainer) {
    allocContainer.innerHTML = "";

    devices.forEach(dev => {
      const isMac = dev.id === "mac";
      const isWin = dev.id === "win";
      const borderClass = isMac ? "border-indigo-800/40" : (isWin ? "border-sky-800/40" : "border-emerald-800/40");
      const headerColor = isMac ? "text-indigo-400" : (isWin ? "text-sky-400" : "text-emerald-400");
      const badgeColor = isMac ? "bg-indigo-950 text-indigo-300 border-indigo-800/60" : (isWin ? "bg-sky-950 text-sky-300 border-sky-800/60" : "bg-emerald-950 text-emerald-300 border-emerald-800/60");

      const card = document.createElement("div");
      card.className = `glass-panel p-5 rounded-2xl border ${borderClass} flex flex-col justify-between`;
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-mono uppercase px-2 py-0.5 rounded border ${badgeColor}">
              ${esc(dev.badge)}
            </span>
            <span class="text-xs font-mono text-zinc-400">${esc((dev.network || "").split(' ')[0])}</span>
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
              ${dev.primary_tasks.map(t => `<li class="flex items-start gap-1.5"><span class="text-indigo-400 font-bold shrink-0">✓</span><span>${esc(t)}</span></li>`).join('')}
            </ul>
          </div>

          <div>
            <div class="text-xs font-bold text-rose-300 mb-1.5 flex items-center gap-1">
              <i data-lucide="shield-alert" class="w-3.5 h-3.5 text-rose-400"></i>
              <span>设备使用绝不越界红线</span>
            </div>
            <ul class="text-xs text-rose-200/80 space-y-1 bg-rose-950/20 p-2.5 rounded-xl border border-rose-900/40 font-mono">
              ${dev.redlines.map(r => `<li class="flex items-start gap-1.5"><span>${esc(r)}</span></li>`).join('')}
            </ul>
          </div>
        </div>
      `;
      allocContainer.appendChild(card);
    });
  }

  const wfContainer = document.getElementById("workflows-table-body");
  if (wfContainer) {
    wfContainer.innerHTML = "";
    workflows.forEach(wf => {
      const tr = document.createElement("tr");
      tr.className = "border-b border-zinc-800/60 hover:bg-zinc-900/30 transition-all text-xs";
      tr.innerHTML = `
        <td class="py-3 px-4 font-bold text-slate-200 whitespace-nowrap">${esc(wf.project)}</td>
        <td class="py-3 px-4 text-indigo-300 bg-indigo-950/10">${esc(wf.mac_role)}</td>
        <td class="py-3 px-4 text-sky-300 bg-sky-950/10">${esc(wf.win_role)}</td>
        <td class="py-3 px-4 text-zinc-400 font-mono">${esc(wf.collab_mode)}</td>
      `;
      wfContainer.appendChild(tr);
    });
  }
}

function handleTaskRoute(val) {
  const inputEl = document.getElementById("task-route-input");
  const query = (val || (inputEl ? inputEl.value : "")).trim().toLowerCase();
  const resBox = document.getElementById("task-route-result");
  if (!resBox) return;

  if (!query) {
    resBox.classList.add("hidden");
    return;
  }

  resBox.classList.remove("hidden");
  if (query.includes("论文") || query.includes("写作") || query.includes("日记") || query.includes("求职") || query.includes("简历") || query.includes("思考") || query.includes("typst") || query.includes("前端")) {
    resBox.innerHTML = `
      <div class="flex items-center gap-3 text-emerald-300">
        <i data-lucide="laptop" class="w-5 h-5 text-indigo-400 shrink-0"></i>
        <div>
          <span class="font-bold text-sm text-white">👉 立即留在 MacBook Air (M5) 执行！</span>
          <p class="text-xs text-zinc-400 mt-0.5">场景指引：抱上 Mac 前往图书馆专注完成，断网/静音深潜，严禁多开与发散。</p>
        </div>
      </div>
    `;
  } else if (query.includes("cuda") || query.includes("训练") || query.includes("yolo") || query.includes("冷备") || query.includes("备份") || query.includes("下载") || query.includes("游戏") || query.includes("渲染") || query.includes("构建") || query.includes("依赖")) {
    resBox.innerHTML = `
      <div class="flex items-center gap-3 text-sky-300">
        <i data-lucide="server" class="w-5 h-5 text-sky-400 shrink-0"></i>
        <div>
          <span class="font-bold text-sm text-white">👉 立即派发给 Windows 4070S 性能主机 执行！</span>
          <p class="text-xs text-zinc-400 mt-0.5">快捷登录：<code class="text-sky-300 bg-zinc-900 px-1.5 py-0.5 rounded cursor-pointer" onclick="copySSH('ssh insistgang@100.98.218.25')">ssh insistgang@100.98.218.25</code> ｜ CUDA 训练 / 批量构建 / 冷备</p>
        </div>
      </div>
    `;
  } else if (query.includes("jetson") || query.includes("边缘") || query.includes("机器人") || query.includes("ros") || query.includes("视觉") || query.includes("传感器")) {
    resBox.innerHTML = `
      <div class="flex items-center gap-3 text-emerald-300">
        <i data-lucide="bot" class="w-5 h-5 text-emerald-400 shrink-0"></i>
        <div>
          <span class="font-bold text-sm text-white">👉 立即派发给 Jetson 边缘计算硬件 执行！</span>
          <p class="text-xs text-zinc-400 mt-0.5">快捷登录：<code class="text-emerald-300 bg-zinc-900 px-1.5 py-0.5 rounded cursor-pointer" onclick="copySSH('ssh jetson@10.8.20.74')">ssh jetson@10.8.20.74</code> (局域网)</p>
        </div>
      </div>
    `;
  } else {
    resBox.innerHTML = `
      <div class="text-xs text-zinc-300">
        💡 <span class="font-bold text-white">通用分流口诀：</span>思考/文字/求职留在 Mac（去图书馆），重跑/构建/冷备丢给 Win 4070S，端侧感知丢给 Jetson。
      </div>
    `;
  }
  safeCreateIcons();
}

function copySSH(cmd) {
  navigator.clipboard.writeText(cmd).then(() => {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.innerText = `已复制 [${cmd}] 到剪贴板！`;
      toast.classList.remove("opacity-0", "pointer-events-none");
      setTimeout(() => toast.classList.add("opacity-0", "pointer-events-none"), 2000);
    }
  });
}
