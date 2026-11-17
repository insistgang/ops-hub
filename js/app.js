/**
 * Ops-Hub Frontend Host Application Logic
 *
 * 负责总台状态快照拉取、时效计算、顶栏/Hero 指标、求职看板、项目与考期雷达、
 * 个人记忆与四勾打卡，以及八大工作区 Tab 的切换调度。
 * 三端算力拓扑与任务分流已抽离至 js/compute.js；公共原语见 js/core.js。
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
  if (window.OpsCore?.calendarDay && now instanceof Date) {
    return window.OpsCore.calendarDay(now);
  }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(now);
  const value = type => parts.find(part => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function dateOrdinal(value) {
  if (window.OpsCore?.dateOrdinal) return window.OpsCore.dateOrdinal(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? date.getTime() / 86400000 : null;
}

function esc(s) {
  if (window.OpsCore?.esc) return window.OpsCore.esc(s);
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function careerStageRank(status) {
  if (window.OpsCore?.careerStageRank) return window.OpsCore.careerStageRank(status);
  const label = String(status || "");
  const low = label.toLowerCase();
  if (label.includes("面")) return 0;
  if (label.includes("笔试")) return 1;
  if (low.includes("offer") || label.includes("录用")) return 2;
  if (label.includes("初筛")) return 3;
  if (label.includes("投递")) return 4;
  return 5;
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

function readDailyChecks(day) {
  const storageKey = `ops_checks_${day}`;
  let raw;
  try {
    raw = localStorage.getItem(storageKey);
  } catch (_) {
    return {
      checks: readSnapshotDailyChecks(day), raw: null, valid: false,
      error: "浏览器本机存储读取失败，四勾暂时不能保存。"
    };
  }

  if (raw !== null) {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (_) {
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
  const normalized = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(value)
    ? value.replace(" ", "T") + "+08:00" : value;
  const timestamp = new Date(normalized).getTime();
  if (!Number.isFinite(timestamp)) return { state: "invalid", label: "快照时间无效", ageSeconds: null };
  const seconds = Math.floor((now.getTime() - timestamp) / 1000);
  if (seconds < 0) return { state: "future", label: "快照时间在未来，请核对", ageSeconds: seconds };
  const age = Math.max(0, seconds);
  const relative = age < 60 ? "不足 1 分钟" : age < 3600 ? `${Math.floor(age / 60)} 分钟前` : age < 86400 ? `${Math.floor(age / 3600)} 小时前` : `${Math.floor(age / 86400)} 天前`;
  const STALE_AFTER = 13 * 3600;
  return { state: age >= STALE_AFTER ? "stale" : "snapshot", label: `快照 · ${relative}${age >= STALE_AFTER ? "，需同步" : ""}`, ageSeconds: age };
}

function safeCreateIcons() {
  try {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  } catch (e) {
    console.warn("Lucide icons init warning:", e);
  }
}
window.safeCreateIcons = safeCreateIcons;

function initWeightTracker() {
  document.getElementById("weight-native")?.setAttribute("aria-label", "体重记录工作区");
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.innerHTML = `<i data-lucide="${isDark ? "sun" : "moon"}" class="w-4 h-4"></i>`;
    btn.title = isDark ? "切换到日间模式" : "切换到夜间模式";
  }
  safeCreateIcons();
  window.OpsVitaFlow?.setTheme(theme);
  window.OpsFinanceNative?.setTheme(theme);
}

function initTheme() {
  let saved = "dark";
  try { saved = localStorage.getItem("ops_theme") || "dark"; } catch (_) {}
  applyTheme(saved);
}

function toggleTheme() {
  const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("ops_theme", next); } catch (_) {}
}

function startLiveClock() {
  const clockEl = document.getElementById("live-clock");
  let displayedDay = calendarDay();
  const update = () => {
    const now = new Date();
    const pad = n => String(n).padStart(2, "0");
    if (clockEl) clockEl.innerText = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
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
    notice.textContent = snapshotLoadError || (!globalStatus
      ? "尚未取得状态快照，请检查连接后重新读取。"
      : snapshotSource === "local" ? "已读取本机快照" : "已读取公开快照；个人日程和浏览器打卡分别保存");
    notice.dataset.state = snapshotLoadError ? "warning" : info.state;
  }
}

async function manualRefresh() {
  const icon = document.getElementById("sync-refresh-icon");
  if (icon) icon.classList.add("animate-spin");
  await Promise.all([
    loadData(false),
    window.OpsCore?.refreshPublicKnowledge ? window.OpsCore.refreshPublicKnowledge() : Promise.resolve(),
  ]);
  setTimeout(() => {
    if (icon) icon.classList.remove("animate-spin");
  }, 600);
}

function initTabs() {
  const tabButtons = document.querySelectorAll("[data-ops-tab][data-tab]");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active", "bg-indigo-950/60", "text-indigo-400", "border-indigo-500"));
      btn.classList.add("active", "bg-indigo-950/60", "text-indigo-400", "border-indigo-500");

      const target = btn.getAttribute("data-tab");
      document.querySelectorAll("[data-ops-workspace]").forEach(content => content.classList.add("hidden"));
      document.getElementById(target)?.classList.remove("hidden");
      if (target === "tab-vitaflow") window.OpsVitaFlow?.activate();
      if (target === "tab-weight") window.OpsWeightNative?.activate();
      if (target === "tab-finance") window.OpsFinanceNative?.activate();
      safeCreateIcons();
    });
  });
}

async function loadData() {
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
      } catch (_) {
        // Fallback to public snapshot on local preview when private files are absent.
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
    snapshotLoadError = failed.length
      ? `${failed.join("、")}读取失败；${globalStatus ? "保留上次可用数据，请稍后重试" : "暂无可用数据，请检查连接"}。`
      : rules.value.warning || "";
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
    window.OpsCompute?.render(globalStatus);
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
  const topo = globalStatus.topology || {};
  const win = topo.windows || {};
  const jetson = topo.jetson || {};

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
  const stats = globalStatus.career_summary?.stats || {};
  const exams = (globalStatus.projects_and_exams || []).filter(p => p.type === "exam").map(p => getExamState(p));
  const topo = globalStatus.topology || {};
  const win = topo.windows || {};
  const jetson = topo.jetson || {};

  const cTot = document.getElementById("metric-career-total");
  const cSub = document.getElementById("metric-career-sub");
  if (cTot) cTot.innerText = stats.total || 0;
  if (cSub) {
    const offerSeg = stats.offer ? `录用 ${stats.offer} · ` : "";
    cSub.innerText = `${offerSeg}初筛 ${stats.screening || 0} · 投递 ${stats.applied || 0} · 面试 ${stats.interviewing || 0}`;
  }

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
  if (compSub) {
    const winState = win.latency_ms != null ? `${win.latency_ms}ms` : (win.status === "Online" ? "在线" : "离线");
    const jetState = jetson.latency_ms != null ? `${jetson.latency_ms}ms` : (jetson.status === "Online" ? "在线" : "待命");
    compSub.innerText = `采集时在线 · 4070S:${winState} ｜ Jetson:${jetState}`;
  }
}

function matchesCareerFilter(record, filter) {
  const st = String(record?.status || "");
  const low = st.toLowerCase();
  if (filter === "all") return true;
  if (filter === "interview") return st.includes("面");
  if (filter === "test") return st.includes("笔试");
  if (filter === "offer") return low.includes("offer") || st.includes("录用");
  if (filter === "screening") return st.includes("初筛");
  if (filter === "applied") return st.includes("投递");
  return true;
}

function renderCareerPipeline() {
  const rawRecords = globalStatus.career_summary?.records || [];
  const container = document.getElementById("career-records-list");
  if (!container) return;
  container.innerHTML = "";

  const sorted = rawRecords.slice().sort((a, b) => careerStageRank(a.status) - careerStageRank(b.status));
  const filtered = sorted.filter(r => matchesCareerFilter(r, currentCareerFilter));

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "glass-panel p-5 rounded-xl text-xs text-zinc-400";
    empty.textContent = rawRecords.length ? "当前筛选条件下暂无记录。" : "暂无投递记录快照。";
    container.appendChild(empty);
  }

  filtered.forEach(r => {
    const st = String(r.status || "");
    const low = st.toLowerCase();
    let statusClass = "bg-zinc-800 text-zinc-300 border-zinc-700";
    if (st.includes("面") || low.includes("offer") || st.includes("录用")) {
      statusClass = "bg-emerald-950/80 text-emerald-300 border-emerald-600";
    } else if (st.includes("初筛")) {
      statusClass = "bg-sky-950/80 text-sky-300 border-sky-600";
    } else if (st.includes("笔试")) {
      statusClass = "bg-amber-950/80 text-amber-300 border-amber-600";
    }

    const priorityBadge = (r.priority === "High" || r.priority === "Critical")
      ? `<span class="px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-rose-950/60 text-rose-300 border border-rose-800/40 rounded">High</span>`
      : "";

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
            <span class="px-2 py-0.5 rounded text-xs border font-medium ${statusClass}">${esc(st)}</span>
            ${priorityBadge}
          </div>
          <p class="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span class="text-indigo-300 font-medium">${esc(r.position)}</span>
            <span>·</span>
            <span>更新于 ${esc(r.apply_date || "-")}</span>
          </p>
          ${r.notes ? `<p class="text-xs text-slate-400/90 mt-2 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800 font-mono">${esc(r.notes)}</p>` : ""}
        </div>
      </div>
      <div class="flex items-center gap-2 self-end md:self-center shrink-0">
        ${r.resume_file ? `
          <div class="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1.5 rounded-md border border-zinc-800 flex items-center gap-1.5">
            <i data-lucide="file-text" class="w-3.5 h-3.5 text-indigo-400"></i>
            <span>${esc(r.resume_file)}</span>
          </div>
        ` : ""}
      </div>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll(".career-filter-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".career-filter-btn").forEach(b => b.classList.remove("bg-indigo-600", "text-white"));
      btn.classList.add("bg-indigo-600", "text-white");
      currentCareerFilter = btn.getAttribute("data-filter") || "all";
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
    const card = document.createElement("div");
    card.className = "glass-panel p-5 rounded-xl flex flex-col justify-between";

    if (p.type === "exam") {
      const waiting = p.phase === "awaiting_result";
      const recorded = p.phase === "result_recorded";
      const isUrgent = !waiting && p.days_left !== null && p.days_left >= 0 && p.days_left <= 20;
      const elapsed = p.days_left !== null && p.days_left < 0;
      const daysLabel = recorded ? "已归档" : waiting ? "等成绩" : p.days_left === null ? "待核对" : elapsed ? "已结束" : p.days_left === 0 ? "今天" : p.days_left;
      const unitLabel = recorded ? "查分已办结" : waiting ? "成绩状态待核对" : p.days_left === null ? "日期无效或未登记" : elapsed ? "登记考期已过" : p.days_left === 0 ? "考试日" : "天后开考";
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-mono uppercase px-2 py-0.5 rounded ${isUrgent ? "bg-rose-950 text-rose-300 border border-rose-800/60 danger-pulse" : "bg-indigo-950 text-indigo-300 border border-indigo-800/60"}">
              ${esc(p.category)}
            </span>
            <span class="text-xs text-slate-400 font-mono">${recorded ? "查分已办结" : waiting ? "笔试已结束" : "考期: " + esc(p.target_date)}</span>
          </div>
          <h4 class="text-base font-bold text-slate-100 mt-1">${esc(p.name)}</h4>
          <div class="my-4 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold font-mono ${isUrgent ? "text-rose-400" : "text-amber-400"}">${esc(daysLabel)}</span>
            <span class="text-xs text-slate-400">${esc(unitLabel)}</span>
          </div>
          <div class="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 text-xs text-slate-300">
            <span class="text-indigo-400 font-semibold">${recorded ? "后续：" : waiting ? "当前：" : "下一步冲刺："}</span>${esc(p.next_action)}
          </div>
        </div>
      `;
    } else {
      const hasActivity = p.git_available === true
        || (typeof p.commit_hash === "string" && p.commit_hash !== "-" && p.commit_hash !== "");
      const staleDays = (() => {
        if (!hasActivity || !p.commit_time || p.commit_time === "-") return null;
        const when = new Date(String(p.commit_time).replace(" ", "T"));
        if (Number.isNaN(when.getTime())) return null;
        const days = Math.floor((Date.now() - when.getTime()) / 86400000);
        return days >= 0 ? days : null;
      })();
      const stale = staleDays !== null && staleDays > 14;
      const staleNote = stale ? ` · 已 ${staleDays} 天无提交` : "";
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-xs font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
              ${esc(p.category)}
            </span>
            <span class="text-xs font-mono text-emerald-400 flex items-center gap-1 min-w-0" title="${esc(p.status)}">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
              <span class="truncate">${esc(p.status)}</span>
            </span>
          </div>
          <h4 class="text-base font-bold text-slate-100 mt-1">${esc(p.name)}</h4>
          <p class="text-xs text-indigo-300 font-mono mt-1">${esc(p.tech_stack)}</p>

          <div class="my-3 py-2 px-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80 text-xs font-mono text-slate-400">
            <div class="flex items-center justify-between text-[11px] ${stale ? "text-amber-400" : "text-zinc-500"} mb-1">
              <span>${hasActivity ? "快照中的工程活动" : "工程路径或活动待核对"}</span>
              <span>${esc(p.commit_time || "-")}${esc(staleNote)}</span>
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
    const labels = {
      "起了": ["起床", "开始今天的节奏"],
      "动了": ["活动", "按自己的状态活动身体"],
      "写了": ["专注", "推进一件重要的事"],
      "关了": ["收工", "结束工作并休息"]
    };
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
        isChecked ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-200" : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
      }`;
      item.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg ${isChecked ? "bg-emerald-900/50 text-emerald-400" : "bg-zinc-800 text-zinc-400"} flex items-center justify-center">
            <i data-lucide="${esc(def.icon || "check")}" class="w-4 h-4"></i>
          </div>
          <div>
            <h5 class="text-sm font-bold text-slate-200">${esc(labels[def.key]?.[0] || def.key)} (${esc(def.key)})</h5>
            <p class="text-[11px] text-slate-400">${esc(labels[def.key]?.[1] || "按当前计划记录")}</p>
          </div>
        </div>
        <div class="w-6 h-6 rounded-md border flex items-center justify-center ${isChecked ? "bg-emerald-600 border-emerald-500 text-white" : "border-zinc-700"}">
          ${isChecked ? '<i data-lucide="check" class="w-4 h-4"></i>' : ""}
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
        } catch (_) {
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
          ${(sc.rules || []).map(r => `<li class="flex items-start gap-1.5"><span class="text-indigo-400">▹</span><span>${esc(r)}</span></li>`).join("")}
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

function boot() {
  initTheme();
  initTabs();
  if (typeof initVitaFlow === "function") initVitaFlow();
  initWeightTracker();
  startLiveClock();

  document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);
  document.getElementById("sync-refresh-btn")?.addEventListener("click", manualRefresh);

  if (window.__OPS_STATUS__) globalStatus = window.__OPS_STATUS__;
  if (window.__OPS_MEMORY__) memoryRules = window.__OPS_MEMORY__;
  if (globalStatus) renderAll();

  loadData(true);
  setInterval(() => loadData(true), 30000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
