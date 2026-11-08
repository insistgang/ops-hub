/* VitaFlow is a native workspace in the same document and storage context. */
function initVitaFlow() {
  const defaultCloudOrigin = 'https://finance.insistgang.top';
  const ownerBridgeOrigin = 'http://127.0.0.1:18789';
  const connectionStorageKey = 'ops_vitaflow_connection';
  const bridgeInitializedKey = 'ops_vitaflow_bridge_initialized';
  const bridgeOwnerEnabledKey = 'ops_vitaflow_bridge_owner_enabled';
  const bridgeOptOutKey = 'ops_vitaflow_bridge_optout';
  // 注意：不再包含 'open'——独立版入口已移除，缺失的必需节点会让整个控制器静默罢工
  const ids = ['url', 'key', 'connect', 'status', 'builtin', 'source', 'native'];
  const nodes = Object.fromEntries(ids.map(id => [id, document.getElementById('vitaflow-' + id)]));
  if (Object.values(nodes).some(node => !node) || nodes.native.dataset.opsHostBound) return;
  const bridgeEnable = document.getElementById('vitaflow-enable-bridge');
  nodes.native.dataset.opsHostBound = 'true';
  nodes.url.value = defaultCloudOrigin + '/';
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
  let bridgeProbeController = null;
  let bridgeInitialized = false;
  let bridgeOwnerEnabled = false;
  let bridgeOptedOut = false;
  let connectionKind = 'browser';
  let automaticStopped = false;
  let bridgePermission = 'unknown';
  let bridgePermissionStatus = null;
  let bridgeAttemptInFlight = false;
  let bridgeRetryTimer = null;
  let bridgeRetryDelay = 30000;
  let bridgeNextAllowedAt = 0;

  function clearBridgeRetry() {
    if (bridgeRetryTimer !== null) clearTimeout(bridgeRetryTimer);
    bridgeRetryTimer = null;
  }

  function cancelAutomaticConnection() {
    automaticStopped = true;
    clearBridgeRetry();
    connectionGeneration += 1;
    bridgeProbeController?.abort();
    bridgeProbeController = null;
  }

  function status(message) { nodes.status.textContent = message + notice; }
  function source() {
    let summary = { storage: 'browser', conflict: false };
    try { summary = native()?.getSummary(calendarDay()) || summary; } catch (_) {}
    nodes.source.textContent = summary.error ? '记录读取异常，原数据已保留，请检查日程工作区。'
      : summary.conflict ? (connectionKind === 'bridge' ? '本机与后台记录待核对，当前仍显示浏览器中的记录；部分内容公开只读。' : '本机与服务的数据待核对，当前仍显示浏览器中的记录。')
      : summary.storage === 'server'
      ? (connectionKind === 'bridge' ? '日程、待办与精力记录已连接本机后台同步；部分内容公开只读。' : '日程、待办与精力记录由私有同步服务维护，并与今日入口共用。')
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
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('protocol');
    // Native sync uses the origin and sends the key separately in a request header.
    // Strip query/fragment credentials before displaying, saving or passing a URL.
    url.search = '';
    url.hash = '';
    return url;
  }
  async function connect(url, key, save, kind = 'manual') {
    if (!native()?.isReady()) { status('工作区尚未就绪，请稍后再连接。'); return; }
    const generation = ++connectionGeneration;
    connectionKind = kind;
    if (save) {
      bridgeOptedOut = true;
      const savedBridgeChoice = remember(bridgeOptOutKey, '1');
      const savedConnection = remember(connectionStorageKey, JSON.stringify({ url: url.href, key }));
      const savedMode = remember('ops_vitaflow_mode', 'private');
      notice = savedConnection && savedMode && savedBridgeChoice ? '' : '浏览器未保存本次连接设置。';
    }
    status('正在连接原日程数据，本机记录会保留并按已有冲突规则处理。');
    let result = null;
    try {
      result = await native().connect(url.href, key);
      if (generation !== connectionGeneration) return;
      hadConflict = !!result.conflict;
      connectionMessage = result.conflict ? (kind === 'bridge' ? '后台同步存在数据差异，请在工作区核对后选择；部分内容公开只读。' : '服务存在数据差异，请在工作区核对后选择。')
        : result.connected ? (kind === 'bridge' ? '已连接本机后台同步；部分内容公开只读。' : '已连接私有同步服务。')
        : (kind === 'bridge' ? '后台同步暂时未连接，现有浏览器记录保持可用。' : '私有服务未连接，仍可使用浏览器中的现有记录。');
    } catch (_) {
      if (generation !== connectionGeneration) return;
      connectionMessage = '连接失败，浏览器中的现有记录保持可用。';
    }
    source();
    status(connectionMessage);
    return result;
  }

  navigation.forEach(button => {
    button.disabled = !native()?.isReady();
    button.addEventListener('click', () => activate(button.getAttribute('data-vf-view')));
  });
  shortcuts.forEach(button => button.addEventListener('click', () => open(button.getAttribute('data-vita-view'))));
  nodes.builtin.addEventListener('click', () => {
    cancelAutomaticConnection();
    bridgeOptedOut = true;
    connectionKind = 'browser';
    native()?.useBrowser();
    const savedMode = remember('ops_vitaflow_mode', 'builtin');
    const savedBridgeChoice = remember(bridgeOptOutKey, '1');
    notice = savedMode && savedBridgeChoice ? '' : '浏览器未保存本次入口选择。';
    connectionMessage = '';
    source();
    status('已使用当前浏览器中的原有记录。');
  });
  nodes.url.addEventListener('input', cancelAutomaticConnection);
  nodes.key.addEventListener('input', cancelAutomaticConnection);
  nodes.connect.addEventListener('click', async () => {
    cancelAutomaticConnection();
    let url;
    try { url = validUrl(nodes.url.value.trim()); } catch (_) {
      status('请输入完整的 http:// 或 https:// 私有服务地址。');
      return;
    }
    const key = nodes.key.value.trim();
    nodes.url.value = url.href;
    if (url.origin === defaultCloudOrigin && !key) {
      status('请填写同步口令；网站和本机记录仍可直接使用。');
      return;
    }
    await connect(url, key, true);
  });

  let savedUrl = null;
  let savedConnection = null;
  let savedMode = null;
  let settingsReadable = true;
  try {
    savedConnection = localStorage.getItem(connectionStorageKey);
    savedUrl = localStorage.getItem('ops_vitaflow_url');
    savedMode = localStorage.getItem('ops_vitaflow_mode');
    bridgeInitialized = localStorage.getItem(bridgeInitializedKey) === '1';
    bridgeOwnerEnabled = localStorage.getItem(bridgeOwnerEnabledKey) === '1';
    bridgeOptedOut = localStorage.getItem(bridgeOptOutKey) === '1';
  } catch (_) { settingsReadable = false; notice = '浏览器未允许读取连接设置。'; }
  let privateUrl = null;
  if (savedConnection !== null) {
    try {
      const settings = JSON.parse(savedConnection);
      if (!settings || typeof settings.url !== 'string' || typeof settings.key !== 'string') throw new Error('settings');
      privateUrl = validUrl(settings.url);
      nodes.key.value = settings.key;
      nodes.url.value = privateUrl.href;
    } catch (_) { privateUrl = null; notice = '旧连接设置无效，已保留原设置并使用浏览器记录。'; }
  } else if (savedUrl) {
    try {
      const legacy = new URL(savedUrl);
      privateUrl = validUrl(savedUrl);
      nodes.key.value = legacy.searchParams.get('key') || '';
      nodes.url.value = privateUrl.href;
    } catch (_) { notice = '旧连接地址无效，已保留原设置并使用浏览器记录。'; }
  }

  function validBridgeSnapshot(payload) {
    return payload && typeof payload === 'object' && !Array.isArray(payload) &&
      payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data) &&
      typeof payload.revision === 'string' && payload.revision.length > 0 && payload.revision.length <= 128 &&
      Object.entries(payload.data).every(([key, value]) => key.startsWith('vitaflow_') && typeof value === 'string');
  }

  function automaticBridgePermissionAllowed() {
    // Chrome can permit an explicit owner request while still reporting prompt.
    // That application-level choice is retained only after the click actually
    // connected; the browser continues to enforce every request and denial wins.
    return bridgePermission === 'granted' ||
      (bridgePermission === 'unsupported' && bridgeInitialized) ||
      (bridgePermission === 'prompt' && bridgeInitialized && bridgeOwnerEnabled);
  }

  function updateBridgeButton() {
    if (!bridgeEnable) return;
    bridgeEnable.hidden = automaticBridgePermissionAllowed() && !bridgeOptedOut;
    bridgeEnable.disabled = !native()?.isReady() || bridgeAttemptInFlight;
    bridgeEnable.textContent = bridgePermission === 'denied' ? '检查本机同步权限' : '启用本机后台同步';
  }

  function permissionNotice() {
    if (bridgePermission === 'denied') status('本机网络权限已关闭，请在浏览器的网站设置中允许后启用后台同步。');
    else status('日程与精力已就绪；本机后台同步需浏览器允许访问本机网络，可点击“启用本机后台同步”。');
  }

  function applyBridgePermission() {
    const next = bridgePermissionStatus?.state;
    bridgePermission = ['granted', 'prompt', 'denied'].includes(next) ? next : 'unsupported';
    if (!automaticBridgePermissionAllowed()) clearBridgeRetry();
    updateBridgeButton();
  }

  function bridgePermissionChanged() {
    applyBridgePermission();
    if (automaticBridgePermissionAllowed()) resumeAutomaticBridge();
    else {
      if (bridgeAttemptInFlight) connectionGeneration += 1;
      bridgeProbeController?.abort();
      if (!bridgeOptedOut && !automaticStopped) permissionNotice();
    }
  }

  async function readBridgePermission() {
    const permissions = window.navigator?.permissions;
    if (!permissions || typeof permissions.query !== 'function') {
      bridgePermission = 'unsupported';
      updateBridgeButton();
      return bridgePermission;
    }
    try {
      const result = await permissions.query({ name: 'loopback-network' });
      if (bridgePermissionStatus !== result) {
        bridgePermissionStatus?.removeEventListener?.('change', bridgePermissionChanged);
        bridgePermissionStatus = result;
        result?.addEventListener?.('change', bridgePermissionChanged);
      }
      applyBridgePermission();
    } catch (_) {
      bridgePermissionStatus = null;
      bridgePermission = 'unsupported';
      updateBridgeButton();
    }
    return bridgePermission;
  }

  function automaticBridgeBlocked() {
    if (automaticStopped || bridgeOptedOut || !settingsReadable || !native()?.isReady() || document.hidden || window.navigator?.onLine === false) return true;
    let summary;
    try { summary = native().getSummary(calendarDay()); } catch (_) { return true; }
    // The native engine already polls an active connection. Never restart it or a pending conflict.
    return !!summary?.conflict || summary?.storage === 'server';
  }

  function scheduleBridgeRetry() {
    if (bridgeRetryTimer !== null || !automaticBridgePermissionAllowed() || automaticBridgeBlocked() ||
        typeof window.fetch !== 'function' || typeof window.AbortController !== 'function') return;
    const delay = Math.max(30000, bridgeRetryDelay, bridgeNextAllowedAt - Date.now());
    bridgeRetryTimer = setTimeout(() => {
      bridgeRetryTimer = null;
      void attemptAutomaticBridge();
    }, delay);
    bridgeRetryDelay = Math.min(300000, bridgeRetryDelay * 2);
  }

  function resumeAutomaticBridge() {
    if (bridgeAttemptInFlight) return;
    bridgeRetryDelay = 30000;
    scheduleBridgeRetry();
  }

  async function connectOwnerBridge() {
    if (typeof window.fetch !== 'function' || typeof window.AbortController !== 'function') return { attempted: false };
    const generation = connectionGeneration;
    const controller = new window.AbortController();
    bridgeProbeController = controller;
    const timeout = setTimeout(() => controller.abort(), 2500);
    let available = false;
    try {
      const response = await window.fetch(ownerBridgeOrigin + '/api/data', {
        method: 'GET', cache: 'no-store', credentials: 'omit', redirect: 'error', signal: controller.signal, targetAddressSpace: 'loopback',
      });
      if (!response.ok || controller.signal.aborted || generation !== connectionGeneration) return { attempted: false };
      const payload = await response.json();
      available = validBridgeSnapshot(payload) && !controller.signal.aborted && generation === connectionGeneration;
    } catch (_) {
      // Public visitors and browsers blocking local-network access keep their own records.
    } finally {
      clearTimeout(timeout);
      if (bridgeProbeController === controller) bridgeProbeController = null;
    }
    if (available && generation === connectionGeneration && native()?.isReady()) {
      const bridgeGeneration = connectionGeneration + 1;
      const result = await connect(new URL(ownerBridgeOrigin + '/'), '', false, 'bridge');
      if (result?.connected && bridgeGeneration === connectionGeneration && !bridgeOptedOut) {
        bridgeInitialized = true;
        notice = remember(bridgeInitializedKey, '1') ? '' : '浏览器未保存后台连接偏好；当前连接仍可使用。';
        status(connectionMessage);
      }
      return { attempted: true, connected: !!result?.connected };
    }
    return { attempted: false };
  }

  async function attemptAutomaticBridge({ gesture = false, initial = false } = {}) {
    if (bridgeAttemptInFlight || automaticBridgeBlocked() || (!gesture && !automaticBridgePermissionAllowed())) return;
    if (!gesture && Date.now() < bridgeNextAllowedAt) { scheduleBridgeRetry(); return; }
    clearBridgeRetry();
    const generation = connectionGeneration;
    bridgeAttemptInFlight = true;
    bridgeNextAllowedAt = Date.now() + 30000;
    updateBridgeButton();
    let outcome;
    try { outcome = await connectOwnerBridge(); }
    finally { bridgeAttemptInFlight = false; updateBridgeButton(); }
    if (gesture) await readBridgePermission();
    if (automaticStopped || bridgeOptedOut) return;
    if (gesture && outcome?.connected) {
      bridgeOwnerEnabled = true;
      if (!remember(bridgeOwnerEnabledKey, '1')) notice = '浏览器未保存后台连接偏好；当前连接仍可使用。';
      updateBridgeButton();
      status(connectionMessage);
    }
    const loopbackPrivate = privateUrl && ['127.0.0.1', 'localhost', '::1', '[::1]'].includes(privateUrl.hostname);
    if (!outcome?.attempted && initial && !bridgeInitialized && generation === connectionGeneration && privateUrl && savedMode !== 'builtin' && (!loopbackPrivate || bridgePermission === 'granted')) {
      await connect(privateUrl, nodes.key.value, false);
    }
    if (outcome?.connected) bridgeRetryDelay = 30000;
    else scheduleBridgeRetry();
  }

  async function startInitialConnection() {
    if (!settingsReadable) return;
    const generation = connectionGeneration;
    await readBridgePermission();
    if (automaticStopped || generation !== connectionGeneration) return;
    if (!bridgeOptedOut && automaticBridgePermissionAllowed()) {
      await attemptAutomaticBridge({ initial: true });
      return;
    }
    const loopbackPrivate = privateUrl && ['127.0.0.1', 'localhost', '::1', '[::1]'].includes(privateUrl.hostname);
    if (privateUrl && savedMode !== 'builtin' && (!loopbackPrivate || bridgePermission === 'granted')) {
      await connect(privateUrl, nodes.key.value, false);
    } else if (!bridgeOptedOut) permissionNotice();
  }

  bridgeEnable?.addEventListener('click', () => {
    if (bridgePermission === 'denied') { permissionNotice(); return; }
    if (!native()?.isReady() || bridgeAttemptInFlight) return;
    const wasOptedOut = bridgeOptedOut;
    automaticStopped = false;
    bridgeOptedOut = false;
    if (wasOptedOut) remember(bridgeOptOutKey, '0');
    // Keep the first local-network request in this click's user gesture.
    return attemptAutomaticBridge({ gesture: true });
  });

  window.addEventListener('online', resumeAutomaticBridge);
  window.addEventListener('offline', () => {
    clearBridgeRetry();
    bridgeProbeController?.abort();
  });
  document.addEventListener?.('visibilitychange', () => {
    if (document.hidden) clearBridgeRetry();
    else resumeAutomaticBridge();
  });

  function ready() {
    if (!native()?.isReady()) return;
    navigation.forEach(button => { button.disabled = false; });
    source();
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    status(connectionMessage || '日程与精力已就绪，与今日入口共用记录。');
    if (!readyHandled) {
      readyHandled = true;
      void startInitialConnection();
    }
    updateBridgeButton();
    if (pendingView) { const request = pendingView; pendingView = null; activate(request.view, request.day); }
  }
  window.addEventListener('ops:vitaflow-ready', ready);
  window.addEventListener('ops:vitaflow-data', () => {
    const summary = source();
    if (hadConflict && !summary.conflict) {
      connectionMessage = summary.storage === 'server' ? (connectionKind === 'bridge' ? '数据核对已完成，后台同步已连接；部分内容公开只读。' : '数据核对已完成，已连接私有同步服务。') : '数据核对已完成，继续使用浏览器记录。';
      status(connectionMessage);
    }
    hadConflict = !!summary.conflict;
    if (summary.conflict || summary.storage === 'server') clearBridgeRetry();
    else if (connectionKind === 'bridge') scheduleBridgeRetry();
  });
  // 原生模块在宿主脚本之前加载，可能在监听器注册前就已就绪，
  // 这里等到 DOMContentLoaded 再补一次检查，避免状态行永远停在占位文案。
  function settle(attempt = 0) {
    if (native()?.isReady()) { ready(); return; }
    if (attempt === 0) status('正在准备日程工具。');
    // 原生模块可能晚于本脚本完成初始化，且它的就绪事件只发一次，
    // 这里做有限重试，避免状态停永远留在占位文案、导航按钮一直禁用。
    if (attempt < 40) setTimeout(() => settle(attempt + 1), 100);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => settle(), { once: true });
  else settle();
}
