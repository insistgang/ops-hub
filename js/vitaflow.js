/* VitaFlow is a native workspace in the same document and storage context. */
function initVitaFlow() {
  const ids = ['url', 'key', 'connect', 'status', 'builtin', 'open', 'source', 'native'];
  const nodes = Object.fromEntries(ids.map(id => [id, document.getElementById('vitaflow-' + id)]));
  if (Object.values(nodes).some(node => !node) || nodes.native.dataset.opsHostBound) return;
  nodes.native.dataset.opsHostBound = 'true';
  const navigation = Array.from(document.querySelectorAll('[data-vf-view]'));
  const shortcuts = Array.from(document.querySelectorAll('[data-vita-view]'));
  const views = new Set(['energyOverview', 'dailyPlan', 'energyTrends', 'creativeSpace', 'physical', 'emotional', 'focus', 'meaning']);
  const native = () => window.OpsVitaFlowNative;
  let readyHandled = false;
  let notice = '';
  let connectionMessage = '';
  let pendingView = null;
  let hadConflict = false;
  let connectionGeneration = 0;

  function status(message) { nodes.status.textContent = message + notice; }
  function source() {
    let summary = { storage: 'browser', conflict: false };
    try { summary = native()?.getSummary(calendarDay()) || summary; } catch (_) {}
    nodes.source.textContent = summary.error ? '记录读取异常，原数据已保留，请检查日程工作区。'
      : summary.conflict ? '本机与服务的数据待核对，当前仍显示浏览器中的记录。'
      : summary.storage === 'server'
      ? '日程、待办与精力记录由私有同步服务维护，并与今日入口共用。'
      : '日程、待办与精力记录保存在当前浏览器，并与今日入口共用。';
    return summary;
  }
  function setTheme(theme) { native()?.setTheme(theme); }
  function activate(view = 'energyOverview', day) {
    if (!views.has(view)) return;
    if (!native()?.isReady()) { pendingView = { view, day }; return; }
    native().activate(view, day);
  }
  function open(view = 'dailyPlan') {
    const tab = document.querySelector('.tab-btn[data-tab="tab-vitaflow"]');
    if (tab && !tab.classList.contains('active')) tab.click();
    activate(view, calendarDay());
  }
  window.OpsVitaFlow = { setTheme, activate, open };

  function remember(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (_) { return false; }
  }
  function validUrl(value) {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('protocol');
    return url;
  }
  async function connect(url, key, save) {
    if (!native()?.isReady()) { status('工作区尚未就绪，请稍后再连接。'); return; }
    const generation = ++connectionGeneration;
    if (save) {
      const savedUrl = remember('ops_vitaflow_url', url.href);
      const savedMode = remember('ops_vitaflow_mode', 'private');
      notice = savedUrl && savedMode ? '' : '浏览器未保存本次连接设置。';
    }
    status('正在连接原日程数据，本机记录会保留并按已有冲突规则处理。');
    try {
      const result = await native().connect(url.href, key);
      if (generation !== connectionGeneration) return;
      hadConflict = !!result.conflict;
      connectionMessage = result.conflict ? '服务存在数据差异，请在工作区核对后选择。'
        : result.connected ? '已连接私有同步服务。' : '私有服务未连接，仍可使用浏览器中的现有记录。';
    } catch (_) {
      if (generation !== connectionGeneration) return;
      connectionMessage = '连接失败，浏览器中的现有记录保持可用。';
    }
    source();
    status(connectionMessage);
  }

  navigation.forEach(button => {
    button.disabled = !native()?.isReady();
    button.addEventListener('click', () => activate(button.getAttribute('data-vf-view')));
  });
  shortcuts.forEach(button => button.addEventListener('click', () => open(button.getAttribute('data-vita-view'))));
  nodes.builtin.addEventListener('click', () => {
    connectionGeneration += 1;
    native()?.useBrowser();
    notice = remember('ops_vitaflow_mode', 'builtin') ? '' : '浏览器未保存本次入口选择。';
    connectionMessage = '';
    source();
    status('已使用当前浏览器中的原有记录。');
  });
  nodes.connect.addEventListener('click', async () => {
    let url;
    try { url = validUrl(nodes.url.value.trim()); } catch (_) {
      status('请输入完整的 http:// 或 https:// 私有服务地址。');
      return;
    }
    const key = nodes.key.value.trim();
    if (key) url.searchParams.set('key', key); else url.searchParams.delete('key');
    await connect(url, key, true);
  });

  let savedUrl = null;
  let savedMode = null;
  try {
    savedUrl = localStorage.getItem('ops_vitaflow_url');
    savedMode = localStorage.getItem('ops_vitaflow_mode');
  } catch (_) { notice = '浏览器未允许读取连接设置。'; }
  let privateUrl = null;
  if (savedUrl) {
    try {
      privateUrl = validUrl(savedUrl);
      nodes.key.value = privateUrl.searchParams.get('key') || '';
      const editable = new URL(privateUrl);
      editable.searchParams.delete('key');
      editable.searchParams.delete('embed');
      editable.searchParams.delete('mode');
      nodes.url.value = editable.href;
    } catch (_) { notice = '旧连接地址无效，已保留原设置并使用浏览器记录。'; }
  }
  function ready() {
    navigation.forEach(button => { button.disabled = false; });
    source();
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    status(connectionMessage || '日程与精力已就绪，与今日入口共用记录。');
    if (!readyHandled) {
      readyHandled = true;
      if (privateUrl && savedMode !== 'builtin') void connect(privateUrl, nodes.key.value, false);
    }
    if (pendingView) { const request = pendingView; pendingView = null; activate(request.view, request.day); }
  }
  window.addEventListener('ops:vitaflow-ready', ready);
  window.addEventListener('ops:vitaflow-data', () => {
    const summary = source();
    if (hadConflict && !summary.conflict) {
      connectionMessage = summary.storage === 'server' ? '数据核对已完成，已连接私有同步服务。' : '数据核对已完成，继续使用浏览器记录。';
      status(connectionMessage);
    }
    hadConflict = !!summary.conflict;
  });
  if (native()?.isReady()) ready();
  else status('正在准备日程工具。');
}
