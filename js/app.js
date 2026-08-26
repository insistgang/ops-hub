/**
 * Ops-Hub Frontend Application Logic
 * Zero-dependency Vanilla JS, reads data/status.json and renders high-density dashboard
 */

let globalStatus = null;
let memoryRules = null;
let currentCareerFilter = "all";

document.addEventListener("DOMContentLoaded", async () => {
  initTabs();
  await loadData();
  lucide.createIcons();
});

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
      document.getElementById(target).classList.remove("hidden");
      lucide.createIcons();
    });
  });
}

async function loadData() {
  try {
    const statusRes = await fetch("data/status.json?t=" + Date.now());
    globalStatus = await statusRes.json();

    const rulesRes = await fetch("data/memory_rules.json?t=" + Date.now());
    memoryRules = await rulesRes.json();

    renderHeader();
    renderHeroMetrics();
    renderCareerPipeline();
    renderProjectsRadar();
    renderMemoryHub();
    renderComputeTopology();
  } catch (err) {
    console.error("加载数据失败:", err);
  }
}

function renderHeader() {
  const meta = globalStatus.meta || {};
  const topo = globalStatus.topology || {};
  const win = topo.windows || {};

  document.getElementById("last-synced-time").innerText = meta.last_synced || "-";
  
  // Win status pill
  const winPill = document.getElementById("win-status-pill");
  const winDot = document.getElementById("win-status-dot");
  const winText = document.getElementById("win-status-text");

  if (win.status === "Online") {
    winDot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
    winText.innerText = `Win 4070S: ${win.latency_ms}ms`;
    winPill.className = "flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-800/50";
  } else {
    winDot.className = "w-2 h-2 rounded-full bg-rose-500";
    winText.innerText = "Win 4070S: Offline";
    winPill.className = "flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-rose-950/40 text-rose-300 border border-rose-800/50";
  }
}

function renderHeroMetrics() {
  const career = globalStatus.career_summary || {};
  const stats = career.stats || {};
  const weight = globalStatus.weight_challenge || {};
  const exams = (globalStatus.projects_and_exams || []).filter(p => p.type === "exam");
  const win = globalStatus.topology?.windows || {};

  // 1. Career Metric
  document.getElementById("metric-career-total").innerText = stats.total || 0;
  document.getElementById("metric-career-sub").innerText = `初筛 ${stats.screening || 0} · 投递 ${stats.applied || 0} · 面试 ${stats.interviewing || 0}`;

  // 2. Exam Metric (Focus on Jiaoshi 9/12)
  const jiaoshi = exams.find(e => e.id === "e-jiaoxi") || {};
  const cet6 = exams.find(e => e.id === "e-cet6") || {};
  document.getElementById("metric-exam-days").innerText = jiaoshi.days_left !== undefined ? jiaoshi.days_left : "-";
  document.getElementById("metric-exam-sub").innerText = `教资9/12冲刺 ｜ 六级剩 ${cet6.days_left || 0} 天`;

  // 3. Weight Metric
  document.getElementById("metric-weight-day").innerText = `D${weight.current_day || 3}`;
  document.getElementById("metric-weight-sub").innerText = `决战剩余 ${weight.days_left || 0} 天 ｜ ${weight.members?.join(' · ')}`;

  // 4. Compute Metric
  document.getElementById("metric-compute-lat").innerText = win.latency_ms ? `${win.latency_ms}ms` : "离线";
  document.getElementById("metric-compute-sub").innerText = `Win 4070S 12G ｜ ${win.ollama_active ? 'Ollama:就绪' : 'Ollama:待命'}`;
}

function renderCareerPipeline() {
  const records = globalStatus.career_summary?.records || [];
  const container = document.getElementById("career-records-list");
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
          ${r.company.substring(0, 2)}
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="font-bold text-slate-100">${r.company}</h4>
            <span class="px-2 py-0.5 rounded text-xs border font-medium ${statusClass}">${r.status}</span>
            ${priorityBadge}
          </div>
          <p class="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span class="text-indigo-300 font-medium">${r.position}</span>
            <span>·</span>
            <span>投递于 ${r.apply_date}</span>
          </p>
          ${r.notes ? `<p class="text-xs text-slate-400/90 mt-2 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800 font-mono">${r.notes}</p>` : ''}
        </div>
      </div>
      <div class="flex items-center gap-2 self-end md:self-center shrink-0">
        ${r.resume_file ? `
          <div class="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1.5 rounded-md border border-zinc-800 flex items-center gap-1.5">
            <i data-lucide="file-text" class="w-3.5 h-3.5 text-indigo-400"></i>
            <span>${r.resume_file}</span>
          </div>
        ` : ''}
      </div>
    `;
    container.appendChild(card);
  });

  // Filter click handlers
  document.querySelectorAll(".career-filter-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".career-filter-btn").forEach(b => b.classList.remove("bg-indigo-600", "text-white"));
      btn.classList.add("bg-indigo-600", "text-white");
      currentCareerFilter = btn.getAttribute("data-filter");
      renderCareerPipeline();
      lucide.createIcons();
    };
  });
}

function renderProjectsRadar() {
  const projects = globalStatus.projects_and_exams || [];
  const container = document.getElementById("projects-radar-list");
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
              ${p.category}
            </span>
            <span class="text-xs text-slate-400 font-mono">考期: ${p.target_date}</span>
          </div>
          <h4 class="text-base font-bold text-slate-100 mt-1">${p.name}</h4>
          <div class="my-4 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold font-mono ${isUrgent ? 'text-rose-400' : 'text-amber-400'}">${p.days_left}</span>
            <span class="text-xs text-slate-400">天后开考</span>
          </div>
          <div class="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 text-xs text-slate-300">
            <span class="text-indigo-400 font-semibold">下一步冲刺：</span>${p.next_action}
          </div>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              ${p.category}
            </span>
            <span class="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              ${p.status}
            </span>
          </div>
          <h4 class="text-base font-bold text-slate-100 mt-1">${p.name}</h4>
          <p class="text-xs text-indigo-300 font-mono mt-1">${p.tech_stack}</p>

          <div class="my-3 py-2 px-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80 text-xs font-mono text-slate-400">
            <div class="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
              <span>最新提交 / 动态</span>
              <span>${p.commit_time || '-'}</span>
            </div>
            <div class="text-slate-300 truncate">
              <span class="text-indigo-400 font-semibold">[${p.commit_hash || 'LOCAL'}]</span> ${p.commit_msg || '-'}
            </div>
          </div>

          <div class="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 text-xs text-slate-300 mt-2">
            <span class="text-indigo-400 font-semibold">下一步行动：</span>${p.next_action}
          </div>
        </div>
      `;
    }
    container.appendChild(card);
  });
}

function renderMemoryHub() {
  if (!memoryRules) return;

  // Render Checks
  const checksData = globalStatus.daily_checks?.checks || {};
  const checksContainer = document.getElementById("daily-checks-container");
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
          <i data-lucide="${def.icon || 'check'}" class="w-4 h-4"></i>
        </div>
        <div>
          <h5 class="text-sm font-bold text-slate-200">${def.name} (${def.key})</h5>
          <p class="text-[11px] text-slate-400">${def.desc}</p>
        </div>
      </div>
      <div class="w-6 h-6 rounded-md border flex items-center justify-center ${isChecked ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-zinc-700'}">
        ${isChecked ? '<i data-lucide="check" class="w-4 h-4"></i>' : ''}
      </div>
    `;
    item.onclick = () => {
      // Toggle locally
      checksData[def.key] = !isChecked;
      renderMemoryHub();
      lucide.createIcons();
    };
    checksContainer.appendChild(item);
  });

  // Render Scenes
  const scenesContainer = document.getElementById("scenes-container");
  scenesContainer.innerHTML = "";
  (memoryRules.scene_contracts || []).forEach(sc => {
    const card = document.createElement("div");
    card.className = "p-4 rounded-xl bg-zinc-900/70 border border-zinc-800";
    card.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <h5 class="font-bold text-slate-100">${sc.scene}</h5>
        <span class="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">${sc.mode}</span>
      </div>
      <ul class="text-xs text-slate-400 space-y-1.5 mt-2">
        ${sc.rules.map(r => `<li class="flex items-start gap-1.5"><span class="text-indigo-400">▹</span><span>${r}</span></li>`).join('')}
      </ul>
    `;
    scenesContainer.appendChild(card);
  });

  // Render Principles
  const principlesContainer = document.getElementById("principles-container");
  principlesContainer.innerHTML = "";
  (memoryRules.focus_principles || []).forEach(fp => {
    const card = document.createElement("div");
    card.className = "p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs";
    card.innerHTML = `
      <span class="font-bold text-indigo-300 block mb-1">⚡ ${fp.principle}</span>
      <span class="text-slate-400 leading-relaxed">${fp.desc}</span>
    `;
    principlesContainer.appendChild(card);
  });

  // Render Health
  const hs = memoryRules.health_supplements || {};
  document.getElementById("health-rule-text").innerText = hs.rule || "";
  const healthList = document.getElementById("health-schedule-list");
  healthList.innerHTML = "";
  (hs.schedule || []).forEach(s => {
    const li = document.createElement("div");
    li.className = "flex items-center justify-between text-xs py-1 border-b border-zinc-800/50 last:border-0";
    li.innerHTML = `<span class="text-indigo-300 font-mono font-medium">${s.period}</span><span class="text-slate-300">${s.items}</span>`;
    healthList.appendChild(li);
  });
}

function renderComputeTopology() {
  const topo = globalStatus.topology || {};
  const mac = topo.mac || {};
  const win = topo.windows || {};

  document.getElementById("mac-ip-text").innerText = mac.ip || "100.86.36.75";
  document.getElementById("mac-battery-text").innerText = `${mac.battery} (${mac.power_state})`;
  document.getElementById("mac-load-text").innerText = mac.load_avg || "-";

  document.getElementById("win-ip-text").innerText = win.ip || "100.98.218.25";
  document.getElementById("win-latency-badge").innerText = win.latency_ms ? `${win.latency_ms} ms` : "Offline";
  document.getElementById("win-ollama-badge").innerText = win.ollama_active ? "11434 (Active)" : "11434 (Standby)";
}

function copySSH() {
  const cmd = "ssh insistgang@100.98.218.25";
  navigator.clipboard.writeText(cmd).then(() => {
    const toast = document.getElementById("toast");
    toast.innerText = "已复制 SSH 登录命令到剪贴板！";
    toast.classList.remove("opacity-0", "pointer-events-none");
    setTimeout(() => toast.classList.add("opacity-0", "pointer-events-none"), 2000);
  });
}
