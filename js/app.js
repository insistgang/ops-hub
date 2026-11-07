/**
 * Ops-Hub Frontend Application Logic
 * Dual-engine data loading: Supports fetch() AND zero-CORS direct file:/// loading!
 */

let globalStatus = window.__OPS_STATUS__ || null;
let memoryRules = window.__OPS_MEMORY__ || null;
let currentCareerFilter = "all";
let snapshotSource = globalStatus ? "embedded" : "none";
let snapshotLoadError = "";
let dataLoadPromise = null;
let memoryRulesSource = memoryRules ? "embedded" : "none";
const DAILY_CHECK_KEYS = ["起了", "动了", "写了", "关了"];
let dailyChecksEventsBound = false;

function calendarDay(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(now);
  const value = type => parts.find(part => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function normalizeDailyChecks(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const checks = Object.fromEntries(DAILY_CHECK_KEYS.map(key => [key, false]));
  for (const key of DAILY_CHECK_KEYS) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      if (typeof value[key] !== "boolean") return null;
      checks[key] = value[key];
    }
  }
  return checks;
}

function readDailyChecks(day) {
  const storageKey = `ops_checks_${day}`;
  let raw;
  try {
    raw = localStorage.getItem(storageKey);
  } catch (error) {
    return {
      checks: readSnapshotDailyChecks(day), raw: null, valid: false,
      error: "浏览器本机存储读取失败，四勾暂时不能保存。"
    };
  }

  if (raw !== null) {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      return { checks: defaultDailyChecks(), raw, valid: false, error: "本机四勾记录损坏，已保留原记录，无法写入。" };
    }
    const checks = normalizeDailyChecks(parsed);
    if (!checks) {
      return { checks: defaultDailyChecks(), raw, valid: false, error: "本机四勾记录格式无效，已保留原记录，无法写入。" };
    }
    return { checks, raw, valid: true, error: "" };
  }

  return { checks: readSnapshotDailyChecks(day), raw: null, valid: true, error: "" };
}

function defaultDailyChecks() {
  return Object.fromEntries(DAILY_CHECK_KEYS.map(key => [key, false]));
}

function readSnapshotDailyChecks(day) {
  const record = globalStatus?.daily_checks;
  if (record?.date !== day) return defaultDailyChecks();
  if (!record.checks || typeof record.checks !== "object" || Array.isArray(record.checks)) return defaultDailyChecks();
  return Object.fromEntries(DAILY_CHECK_KEYS.map(key => [
    key, typeof record.checks[key] === "boolean" ? record.checks[key] : false
  ]));
}

function setDailyChecksFeedback(message, kind = "") {
  const feedback = document.getElementById("daily-checks-feedback");
  if (feedback) {
    feedback.textContent = message;
    feedback.dataset.kind = kind;
    feedback.dataset.day = calendarDay();
  }
}

function bindDailyChecksEvents() {
  if (dailyChecksEventsBound) return;
  dailyChecksEventsBound = true;
  window.addEventListener?.("storage", event => {
    if (event.key !== null && !String(event.key || "").startsWith("ops_checks_")) return;
    renderMemoryHub();
    safeCreateIcons();
  });
  window.addEventListener?.("ops:day-changed", event => {
    if (event?.detail?.day && event.detail.day !== calendarDay()) return;
    renderMemoryHub();
    safeCreateIcons();
  });
  document.addEventListener?.("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    renderMemoryHub();
    safeCreateIcons();
  });
}

function dateOrdinal(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? date.getTime() / 86400000 : null;
}

function getExamState(entry, now = new Date()) {
  if (["awaiting_result", "result_recorded"].includes(entry.phase)) return { ...entry, days_left: null };
  const target = dateOrdinal(entry.target_date);
  const today = dateOrdinal(calendarDay(now));
  const days = target === null ? null : target - today;
  const action = String(entry.next_action || "").replace(/^(?:考前\s*\d+\s*天\s*[·:：]?\s*|今日考试\s*[·:：]?\s*)/, "");
  return {
    ...entry,
    days_left: days,
    next_action: days === null ? action : days < 0 ? "考试日期已过，请核对后续安排" : `${days === 0 ? "今日考试" : `考前 ${days} 天`} · ${action}`
  };
}

function getSnapshotInfo(now = new Date()) {
  const value = globalStatus?.meta?.last_synced;
  if (!value) return { state: "unknown", label: globalStatus ? "快照时间未知" : "暂无数据", ageSeconds: null };
  if (typeof value !== "string" || dateOrdinal(value.slice(0, 10)) === null) return { state: "invalid", label: "快照时间无效", ageSeconds: null };
  // Collector timestamps without an offset are generated on the owner's Shanghai clock.
  const normalized = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(value)
    ? value.replace(" ", "T") + "+08:00" : value;
  const timestamp = new Date(normalized).getTime();
  if (!Number.isFinite(timestamp)) return { state: "invalid", label: "快照时间无效", ageSeconds: null };
  const seconds = Math.floor((now.getTime() - timestamp) / 1000);
  if (seconds < 0) return { state: "future", label: "快照时间在未来，请核对", ageSeconds: seconds };
  const age = Math.max(0, seconds);
  const relative = age < 60 ? "不足 1 分钟" : age < 3600 ? `${Math.floor(age / 60)} 分钟前` : age < 86400 ? `${Math.floor(age / 3600)} 小时前` : `${Math.floor(age / 86400)} 天前`;
  return { state: age >= 86400 ? "stale" : "snapshot", label: `快照 · ${relative}${age >= 86400 ? "，需同步" : ""}`, ageSeconds: age };
}

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
  initVitaFlow();
  initWeightTracker();
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

function initWeightTracker() {
  // The native workspace mounts once and keeps the original browser records.
  document.getElementById("weight-native")?.setAttribute("aria-label", "体重记录工作区");
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
  window.OpsVitaFlow?.setTheme(theme);
  window.OpsFinanceNative?.setTheme(theme);
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
  let displayedDay = calendarDay();
  const update = () => {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    if (clockEl) clockEl.innerText = timeStr;
    updateSyncAge();
    const day = calendarDay(now);
    if (day !== displayedDay) {
      displayedDay = day;
      window.dispatchEvent(new CustomEvent("ops:day-changed", { detail: { day } }));
      renderAll();
    }
  };
  update();
  setInterval(update, 1000);
}

function updateSyncAge() {
  const ageEl = document.getElementById("sync-age-text");
  if (!ageEl) return;

  const info = getSnapshotInfo();
  ageEl.innerText = info.label;
  ageEl.dataset.state = info.state;
  ageEl.title = `采集时间：${globalStatus?.meta?.last_synced || "未知"}。页面刷新只重新读取快照，不执行设备探测。${snapshotLoadError}`;
  const notice = document.getElementById("data-load-notice");
  if (notice) {
    notice.textContent = snapshotLoadError || (!globalStatus ? "尚未取得状态快照，请检查连接后重新读取。" : snapshotSource === "local" ? "已读取本机快照" : "已读取公开快照；个人日程和浏览器打卡分别保存");
    notice.dataset.state = snapshotLoadError ? "warning" : info.state;
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
  const tabButtons = document.querySelectorAll('[data-ops-tab][data-tab]');
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active", "bg-indigo-950/60", "text-indigo-400", "border-indigo-500"));
      btn.classList.add("active", "bg-indigo-950/60", "text-indigo-400", "border-indigo-500");
      
      const target = btn.getAttribute("data-tab");
      document.querySelectorAll('[data-ops-workspace]').forEach(content => {
        content.classList.add("hidden");
      });
      const targetEl = document.getElementById(target);
      if (targetEl) targetEl.classList.remove("hidden");
      if (target === 'tab-vitaflow') window.OpsVitaFlow?.activate();
      if (target === 'tab-weight') window.OpsWeightNative?.activate();
      if (target === 'tab-finance') window.OpsFinanceNative?.activate();
      safeCreateIcons();
    });
  });
}

async function loadData(silent = false) {
  if (dataLoadPromise) return dataLoadPromise;
  if (window.location.protocol === "file:") {
    snapshotLoadError = "文件模式显示随页面载入的快照；重新打开页面可重读，本机同步请使用 ops sync。";
    renderAll();
    updateSyncAge();
    return;
  }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
  const load = async name => {
    const isRules = name === "memory_rules";
    // Public rules are shipped as memory_rules.js, not a JSON endpoint.
    // Only a local preview may read the private JSON source.
    const sources = isRules ? (local ? ["data/memory_rules.json"] : [])
      : local ? [`data/${name}.json`, `data/public/${name}.json`] : [`data/public/${name}.json`];
    for (const path of sources) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(`${path}?t=${Date.now()}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) continue;
        const data = await response.json();
        if (!data || typeof data !== "object" || Array.isArray(data)) continue;
        if (name === "status" && (!data.meta || !Array.isArray(data.projects_and_exams))) continue;
        return { data, source: path.startsWith("data/public/") ? "public" : "local" };
      } catch (error) {
        // Try the public snapshot on a local preview without private source files.
      } finally {
        clearTimeout(timeout);
      }
    }
    if (isRules) {
      const previousLocal = local && memoryRulesSource === "local" && memoryRules;
      const embedded = window.__OPS_MEMORY__;
      const data = previousLocal || embedded;
      if (data && typeof data === "object" && !Array.isArray(data)) {
        return {
          data, source: previousLocal ? "local" : "embedded",
          warning: previousLocal ? "本机秩序规则未能重新读取，沿用上次载入的规则。" : ""
        };
      }
    }
    throw new Error(name);
  };
  dataLoadPromise = (async () => {
    const [status, rules] = await Promise.allSettled([load("status"), load("memory_rules")]);
    if (status.status === "fulfilled") {
      globalStatus = status.value.data;
      snapshotSource = status.value.source;
    }
    if (rules.status === "fulfilled") {
      memoryRules = rules.value.data;
      memoryRulesSource = rules.value.source;
    }
    const failed = [status.status === "rejected" ? "状态快照" : "", rules.status === "rejected" ? "秩序规则" : ""].filter(Boolean);
    snapshotLoadError = failed.length ? `${failed.join("、")}读取失败；${globalStatus ? "保留上次可用数据，请稍后重试" : "暂无可用数据，请检查连接"}。` : rules.value.warning || "";
    renderAll();
    updateSyncAge();
  })();
  try { await dataLoadPromise; } finally { dataLoadPromise = null; }
}

function renderAll() {
  if (!globalStatus) {
    const emptyLabels = {
      "metric-career-total": "—", "metric-career-sub": "暂无投递快照",
      "metric-exam-days": "—", "metric-exam-unit": "考期未载入", "metric-exam-sub": "暂无考试快照",
      "metric-compute-lat": "—", "metric-compute-sub": "暂无设备快照",
      "win-status-text": "Win 4070S: 尚未探测", "jetson-status-text": "Jetson: 尚未探测",
      "career-records-list": "暂无可用投递快照，请重新读取数据。",
      "projects-radar-list": "暂无可用项目快照，请重新读取数据。"
    };
    Object.entries(emptyLabels).forEach(([id, label]) => {
      const element = document.getElementById(id);
      if (element) element.innerText = label;
    });
    renderMemoryHub();
    safeCreateIcons();
    updateSyncAge();
    window.dispatchEvent(new CustomEvent("ops:data-updated", {
      detail: { status: null, memoryRules, source: snapshotSource, error: snapshotLoadError }
    }));
    return;
  }
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
  } finally {
    window.dispatchEvent(new CustomEvent("ops:data-updated", {
      detail: { status: globalStatus, memoryRules, source: snapshotSource, error: snapshotLoadError }
    }));
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
      winDot.className = "w-2 h-2 rounded-full bg-emerald-400";
      winText.innerText = win.latency_ms != null ? `Win 4070S: ${win.latency_ms}ms（快照）` : "Win 4070S: 采集时在线";
      winPill.className = "hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-800/50";
    } else {
      winDot.className = "w-2 h-2 rounded-full bg-rose-500";
      winText.innerText = win.status === "Offline" ? "Win 4070S: 采集时离线" : "Win 4070S: 尚未探测";
      winPill.className = "hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-rose-950/40 text-rose-300 border border-rose-800/50";
    }
  }

  // Jetson status pill
  const jetPill = document.getElementById("jetson-status-pill");
  const jetDot = document.getElementById("jetson-status-dot");
  const jetText = document.getElementById("jetson-status-text");

  if (jetPill && jetDot && jetText) {
    if (jetson.status === "Online") {
      jetDot.className = "w-2 h-2 rounded-full bg-emerald-400";
      jetText.innerText = jetson.latency_ms != null ? `Jetson: ${jetson.latency_ms}ms（快照）` : "Jetson: 采集时在线";
      jetPill.className = "hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-800/50";
    } else {
      jetDot.className = "w-2 h-2 rounded-full bg-zinc-500";
      jetText.innerText = jetson.status ? "Jetson: 采集时未在线" : "Jetson: 尚未探测";
      jetPill.className = "hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-zinc-900/60 text-zinc-400 border border-zinc-800";
    }
  }
}

function renderHeroMetrics() {
  const career = globalStatus.career_summary || {};
  const stats = career.stats || {};
  const exams = (globalStatus.projects_and_exams || []).filter(p => p.type === "exam").map(p => getExamState(p));
  const topo = globalStatus.topology || {};
  const win = topo.windows || {};
  const jetson = topo.jetson || {};

  const cTot = document.getElementById("metric-career-total");
  const cSub = document.getElementById("metric-career-sub");
  if (cTot) cTot.innerText = stats.total || 0;
  if (cSub) cSub.innerText = `初筛 ${stats.screening || 0} · 投递 ${stats.applied || 0} · 面试 ${stats.interviewing || 0}`;

  const cet6 = exams.find(e => e.id === "e-cet6") || {};
  const eDays = document.getElementById("metric-exam-days");
  const eUnit = document.getElementById("metric-exam-unit");
  const eSub = document.getElementById("metric-exam-sub");
  const cet6Days = cet6.days_left;
  if (cet6.phase === "result_recorded") {
    if (eDays) eDays.innerText = "已归档";
    if (eUnit) eUnit.innerText = "六级成绩已记录";
  } else if (cet6.phase === "awaiting_result") {
    if (eDays) eDays.innerText = "等成绩";
    if (eUnit) eUnit.innerText = "六级笔试已结束";
  } else {
    if (eDays) eDays.innerText = cet6Days == null ? "待核对" : cet6Days < 0 ? "已结束" : cet6Days === 0 ? "今天" : cet6Days;
    if (eUnit) eUnit.innerText = cet6Days == null ? "六级考期未确认" : cet6Days < 0 ? "登记考期已过" : cet6Days === 0 ? "六级考试" : "天后考试";
  }
  if (eSub) eSub.innerText = dateOrdinal(cet6.target_date) === null ? "尚未载入有效的六级考试日期" : `登记考期：${cet6.target_date}`;

  const compLat = document.getElementById("metric-compute-lat");
  const compSub = document.getElementById("metric-compute-sub");
  const onlineCount = [topo.mac, win, jetson].filter(device => device?.status === "Online").length;
  if (compLat) compLat.innerText = `${onlineCount} 节点`;
  if (compSub) compSub.innerText = `采集时在线 · 4070S:${win.latency_ms != null ? win.latency_ms + 'ms' : (win.status === "Online" ? '在线' : '离线')} ｜ Jetson:${jetson.latency_ms != null ? jetson.latency_ms + 'ms' : (jetson.status === "Online" ? '在线' : '待命')}`;
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
  const projects = (globalStatus.projects_and_exams || []).filter(entry => entry.id !== "e-jiaoxi");
  const container = document.getElementById("projects-radar-list");
  if (!container) return;
  container.innerHTML = "";

  projects.forEach(entry => {
    const p = entry.type === "exam" ? getExamState(entry) : entry;
    const isExam = p.type === "exam";
    const card = document.createElement("div");
    card.className = "glass-panel p-5 rounded-xl flex flex-col justify-between";

    if (isExam) {
      const waiting = p.phase === "awaiting_result";
      const recorded = p.phase === "result_recorded";
      const isUrgent = !waiting && p.days_left !== null && p.days_left >= 0 && p.days_left <= 20;
      const elapsed = p.days_left !== null && p.days_left < 0;
      const daysLabel = recorded ? "已归档" : waiting ? "等成绩" : p.days_left === null ? "待核对" : elapsed ? "已结束" : p.days_left === 0 ? "今天" : p.days_left;
      const unitLabel = recorded ? "查分已办结" : waiting ? "成绩状态待核对" : p.days_left === null ? "日期无效或未登记" : elapsed ? "登记考期已过" : p.days_left === 0 ? "考试日" : "天后开考";
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-mono uppercase px-2 py-0.5 rounded ${isUrgent ? 'bg-rose-950 text-rose-300 border border-rose-800/60 danger-pulse' : 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'}">
              ${esc(p.category)}
            </span>
            <span class="text-xs text-slate-400 font-mono">${recorded ? "查分已办结" : waiting ? "笔试已结束" : "考期: " + esc(p.target_date)}</span>
          </div>
          <h4 class="text-base font-bold text-slate-100 mt-1">${esc(p.name)}</h4>
          <div class="my-4 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold font-mono ${isUrgent ? 'text-rose-400' : 'text-amber-400'}">${esc(daysLabel)}</span>
            <span class="text-xs text-slate-400">${esc(unitLabel)}</span>
          </div>
          <div class="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 text-xs text-slate-300">
            <span class="text-indigo-400 font-semibold">${recorded ? "后续：" : waiting ? "当前：" : "下一步冲刺："}</span>${esc(p.next_action)}
          </div>
        </div>
      `;
    } else {
      const hasActivity = p.commit_hash && p.commit_hash !== "-" && p.commit_msg !== "路径不存在";
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
              <span>${hasActivity ? "快照中的工程活动" : "工程路径或活动待核对"}</span>
              <span>${esc(p.commit_time || '-')}</span>
            </div>
            <div class="text-slate-300 truncate">
              ${hasActivity ? `<span class="text-indigo-400 font-semibold">[${esc(p.commit_hash)}]</span> ${esc(p.commit_msg || "")}` : esc(p.commit_msg || "尚无工程活动记录")}
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
  // Web check-ins persist in localStorage (static site: browser is the only writable store).
  // CLI (`ops check`) remains the cross-device source of truth via daily_checks.json.
  bindDailyChecksEvents();
  const todayStr = calendarDay();
  const storageKey = `ops_checks_${todayStr}`;

  const dateBadge = document.getElementById("daily-checks-date");
  if (dateBadge) dateBadge.innerText = todayStr;

  const renderedRecord = readDailyChecks(todayStr);
  const feedback = document.getElementById("daily-checks-feedback");
  if (!renderedRecord.valid) setDailyChecksFeedback(renderedRecord.error, "read");
  else if (feedback?.dataset.kind === "read" || (feedback?.dataset.day && feedback.dataset.day !== todayStr)) setDailyChecksFeedback("");

  const checksContainer = document.getElementById("daily-checks-container");
  if (checksContainer) {
    const focusedKey = document.activeElement?.getAttribute("data-check-key");
    let focusedButton = null;
    const labels = {"起了": ["起床", "开始今天的节奏"], "动了": ["活动", "按自己的状态活动身体"], "写了": ["专注", "推进一件重要的事"], "关了": ["收工", "结束工作并休息"]};
    checksContainer.innerHTML = "";

    const configured = Array.isArray(memoryRules?.four_checks_definition) ? memoryRules.four_checks_definition : [];
    DAILY_CHECK_KEYS.forEach(key => {
      const def = configured.find(entry => entry?.key === key) || { key };
      const isChecked = renderedRecord.checks[key] === true;
      const item = document.createElement("button");
      item.type = "button";
      item.setAttribute("aria-pressed", String(isChecked));
      item.setAttribute("data-check-key", key);
      if (focusedKey === key) focusedButton = item;
      item.className = `w-full text-left p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
        isChecked ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
      }`;
      item.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg ${isChecked ? 'bg-emerald-900/50 text-emerald-400' : 'bg-zinc-800 text-zinc-400'} flex items-center justify-center">
            <i data-lucide="${esc(def.icon || 'check')}" class="w-4 h-4"></i>
          </div>
          <div>
            <h5 class="text-sm font-bold text-slate-200">${esc(labels[def.key]?.[0] || def.key)} (${esc(def.key)})</h5>
            <p class="text-[11px] text-slate-400">${esc(labels[def.key]?.[1] || "按当前计划记录")}</p>
          </div>
        </div>
        <div class="w-6 h-6 rounded-md border flex items-center justify-center ${isChecked ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-zinc-700'}">
          ${isChecked ? '<i data-lucide="check" class="w-4 h-4"></i>' : ''}
        </div>
      `;
      item.onclick = () => {
        if (calendarDay() !== todayStr) {
          renderMemoryHub();
          setDailyChecksFeedback("日期已变化，已切换到今天；请核对后再打卡。");
          safeCreateIcons();
          return;
        }

        const currentRecord = readDailyChecks(todayStr);
        if (!currentRecord.valid) {
          setDailyChecksFeedback(currentRecord.error || "本机四勾记录无法读取，暂时不能保存。", "read");
          return;
        }
        if (!renderedRecord.valid || currentRecord.raw !== renderedRecord.raw) {
          renderMemoryHub();
          setDailyChecksFeedback("本机四勾记录已在其他标签页更改，已刷新；请核对后重试。");
          safeCreateIcons();
          return;
        }

        const nextRecord = { ...currentRecord.checks, [key]: !currentRecord.checks[key] };
        try {
          localStorage.setItem(storageKey, JSON.stringify(nextRecord));
        } catch (error) {
          setDailyChecksFeedback("本机四勾保存失败，当前勾选未改变；请检查浏览器存储后重试。");
          return;
        }

        setDailyChecksFeedback("");
        renderMemoryHub();
        safeCreateIcons();
      };
      checksContainer.appendChild(item);
    });
    focusedButton?.focus();
  }

  const scenesContainer = document.getElementById("scenes-container");
  if (scenesContainer) {
    scenesContainer.innerHTML = "";
    (memoryRules?.scene_contracts || []).forEach(sc => {
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
    (memoryRules?.focus_principles || []).forEach(fp => {
      const card = document.createElement("div");
      card.className = "p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs";
      card.innerHTML = `
        <span class="font-bold text-indigo-300 block mb-1">⚡ ${esc(fp.principle)}</span>
        <span class="text-slate-400 leading-relaxed">${esc(fp.desc)}</span>
      `;
      principlesContainer.appendChild(card);
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
  if (macIp) macIp.innerText = mac.ip || "已隐藏";
  if (macBatt) macBatt.innerText = `${mac.battery} (${mac.power_state})`;
  if (macLoad) macLoad.innerText = mac.load_avg || "-";

  const winIp = document.getElementById("win-ip-text");
  const winLat = document.getElementById("win-latency-badge");
  const winSsh = document.getElementById("win-ssh-badge");
  const winSmb = document.getElementById("win-smb-badge");
  if (winIp) winIp.innerText = win.ip || "已隐藏";
  if (winLat) winLat.innerText = win.latency_ms != null ? `${win.latency_ms} ms` : (win.status === "Online" ? "在线" : "Offline");
  if (winSsh) winSsh.innerText = win.ssh_active ? "22 (Active)" : "22 (Standby)";
  if (winSmb) winSmb.innerText = win.smb_active ? "445 (Active)" : "445 (Standby)";

  const jetIp = document.getElementById("jetson-ip-text");
  const jetLat = document.getElementById("jetson-latency-badge");
  const jetSsh = document.getElementById("jetson-ssh-badge");
  if (jetIp) jetIp.innerText = jetson.ip || "已隐藏";
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
          <p class="text-xs text-zinc-400 mt-0.5">快捷登录：<code class="text-sky-300 bg-zinc-900 px-1.5 py-0.5 rounded cursor-pointer" onclick="copySSH('地址已隐藏')">地址已隐藏</code> ｜ CUDA 训练 / 批量构建 / 冷备</p>
        </div>
      </div>
    `;
  } else if (query.includes("jetson") || query.includes("边缘") || query.includes("机器人") || query.includes("ros") || query.includes("视觉") || query.includes("传感器")) {
    resBox.innerHTML = `
      <div class="flex items-center gap-3 text-emerald-300">
        <i data-lucide="bot" class="w-5 h-5 text-emerald-400 shrink-0"></i>
        <div>
          <span class="font-bold text-sm text-white">👉 立即派发给 Jetson 边缘计算硬件 执行！</span>
          <p class="text-xs text-zinc-400 mt-0.5">快捷登录：<code class="text-emerald-300 bg-zinc-900 px-1.5 py-0.5 rounded cursor-pointer" onclick="copySSH('地址已隐藏')">地址已隐藏</code> (局域网)</p>
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
