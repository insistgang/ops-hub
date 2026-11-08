/* Generated VitaFlow runs in one lexical scope; this file supplies the native shell. */
// Vendor code must capture the browser's actual globals, outside the app facades.
(function () {
  if (window.OpsVitaFlowNative) return;
  /* NATIVE_VENDOR */
})();

(function (realWindow, realDocument) {
  if (realWindow.OpsVitaFlowNative) return;
  const nativeRoot = realDocument.getElementById('vitaflow-native');
  if (!nativeRoot) return;
  const nativeBody = /* NATIVE_BODY */ '';
  const nativeNames = /* NATIVE_NAMES */ [];
  for (const name of nativeNames) {
    if (typeof realWindow[name] !== 'undefined') throw new Error('VitaFlow UI function conflicts with the host: ' + name);
  }
  nativeRoot.innerHTML = nativeBody;
  nativeRoot.classList.add('ops-hub-native', 'ops-hub-embed');
  const scriptUrl = realDocument.currentScript?.src || new URL('vitaflow/native-workspace.js', realWindow.location.href).href;
  const nativeSourceUrl = new URL('schedule-system-2.0.html', scriptUrl).href;
  const nativeContext = { mode: 'browser', origin: null, key: '', generation: 0 };
  const nativeRequests = new Set();
  let nativeReady = false;
  let nativeBoot;
  const document = {
    getElementById(id) {
      const escaped = realWindow.CSS?.escape ? realWindow.CSS.escape(String(id)) : String(id).replace(/[^a-zA-Z0-9_-]/g, character => '\\' + character);
      return nativeRoot.querySelector('#' + escaped);
    },
    querySelector: selector => nativeRoot.querySelector(selector),
    querySelectorAll: selector => nativeRoot.querySelectorAll(selector),
    createElement: (...args) => realDocument.createElement(...args),
    body: nativeRoot,
    get readyState() { return realDocument.readyState; },
    addEventListener: (...args) => realDocument.addEventListener(...args)
  };
  const location = {
    get href() { return nativeSourceUrl; },
    get search() { return nativeContext.mode === 'browser' ? '?mode=browser' : '?key=' + encodeURIComponent(nativeContext.key); },
    get protocol() { return nativeContext.origin ? new URL(nativeContext.origin).protocol : realWindow.location.protocol; },
    reload() { nativeRefresh(); }
  };
  const window = new Proxy(realWindow, {
    get(target, name) {
      if (name === 'location') return location;
      if (name === 'parent') return window;
      const value = target[name];
      return ['addEventListener', 'dispatchEvent', 'matchMedia', 'showSaveFilePicker'].includes(name) && typeof value === 'function' ? value.bind(target) : value;
    },
    set(target, name, value) {
      target[name] = value;
      if (target[name] !== value) throw new Error('VitaFlow window field could not be saved: ' + String(name));
      return true;
    }
  });
  const fetch = async (input, options = {}) => {
    const syncRequest = typeof input === 'string' && /^\/api\/data(?:[?]|$)/.test(input);
    if (!syncRequest) return realWindow.fetch(input, options);
    if (nativeContext.mode !== 'private' || !nativeContext.origin) throw new Error('Private sync is disabled');
    const generation = nativeContext.generation;
    const controller = new realWindow.AbortController();
    nativeRequests.add(controller);
    try {
      const headers = { ...options.headers };
      for (const name of Object.keys(headers)) if (name.toLowerCase() === 'x-vitaflow-token') delete headers[name];
      if (nativeContext.key) headers['x-vitaflow-token'] = nativeContext.key;
      const response = await realWindow.fetch(new URL(input, nativeContext.origin).href, { ...options, headers, signal: controller.signal });
      const current = () => {
        if (generation !== nativeContext.generation) {
          const error = new Error('VitaFlow connection changed');
          error.name = 'AbortError';
          throw error;
        }
      };
      current();
      if (!response.ok || response.status === 304) nativeRequests.delete(controller);
      return {
        get ok() { current(); return response.ok; },
        get status() { current(); return response.status; },
        async json() {
          try { const value = await response.json(); current(); return value; }
          finally { nativeRequests.delete(controller); }
        }
      };
    } catch (error) { nativeRequests.delete(controller); throw error; }
  };
  // Native input always starts empty; it never restores a host or repository snapshot.
  const EMBEDDED_DATA = undefined;
  const Chart = realWindow.Chart;
  /* NATIVE_APP */
  const nativeUi = { /* NATIVE_UI */ };
  const nativeViews = new Set(['energyOverview', 'dailyPlan', 'energyTrends', 'creativeSpace', 'physical', 'emotional', 'focus', 'meaning']);
  const nativeAccounts = ['physical', 'emotional', 'focus', 'meaning'];
  const originalVisibleRefresh = refreshVisibleData;
  const originalMarkChanged = markLocalDataChanged;
  const originalResolveConflict = resolveLocalSyncConflict;

  function nativeStorage() { return nativeContext.mode === 'private' && localSyncAvailable ? 'server' : 'browser'; }
  function nativeNotify(type = 'ops:vitaflow-data') {
    realWindow.dispatchEvent(new realWindow.CustomEvent(type, { detail: { storage: nativeStorage() } }));
  }
  function nativeRead(key, fallback) {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  }
  function importDiaryTodo(item) {
    if (!nativeReady) throw new Error('日程工作区尚未就绪');
    if (localSyncConflict) throw new Error('请先处理数据同步冲突');
    const id = item?.id, title = typeof item?.title === 'string' ? item.title.trim() : '', day = item?.date;
    if (typeof id !== 'string' || !/^diary-[a-f0-9]{24}$/.test(id) || !title || title.length > 500 ||
        typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error('待办数据无效');
    const parsed = new Date(day + 'T00:00:00Z');
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== day) throw new Error('待办日期无效');
    const todos = nativeRead('vitaflow_todos', []);
    if (!Array.isArray(todos)) throw new Error('待办记录格式有误，原记录已保留');
    const canonical = text => text.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
    if (todos.some(todo => todo && (todo.id === id || (todo.date === day && typeof todo.text === 'string' && canonical(todo.text) === canonical(title))))) {
      return { added: false };
    }
    todos.push({ id, text: title, account: null, happy: null, date: day, completed: false });
    localStorage.setItem('vitaflow_todos', JSON.stringify(todos));
    syncLocalDataNow('vitaflow_todos');
    renderTodoList();
    renderTodoKanban();
    nativeNotify();
    return { added: true };
  }
  function nativeSummary(day) {
    let savedAccounts = {}, savedTodos = [], error = '';
    try {
      savedAccounts = nativeRead('vitaflow_accounts', {});
      if (!savedAccounts || typeof savedAccounts !== 'object' || Array.isArray(savedAccounts)) throw new Error('Invalid account records');
    } catch (_) { savedAccounts = {}; error = '精力记录读取失败，原记录已保留。'; }
    try {
      savedTodos = nativeRead('vitaflow_todos', []);
      if (!Array.isArray(savedTodos)) throw new Error('Invalid todo records');
    } catch (_) { savedTodos = []; error += '待办记录读取失败，原记录已保留。'; }
    const accounts = nativeAccounts.map(key => {
      const score = savedAccounts?.[key]?.score;
      const valid = typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100;
      if (score !== undefined && score !== null && !valid) error = error || '精力记录格式有误，原记录已保留。';
      return { key, label: accountNames[key], score: valid ? score : null };
    });
    const todos = (Array.isArray(savedTodos) ? savedTodos : []).filter(item => item && item.date === day && typeof item.text === 'string' && ['string', 'number'].includes(typeof item.id))
      .map(item => ({ id: item.id, text: item.text, completed: item.completed === true, account: item.account }));
    return { accounts, todos, completed: todos.filter(item => item.completed).length, total: todos.length, storage: nativeStorage(), conflict: !!localSyncConflict, error };
  }
  function nativeRefresh() {
    try {
      initData();
      originalVisibleRefresh();
      initChartsAfterAssetsReady();
      nativeNotify();
      return true;
    } catch (_) {
      updateSaveStatus('记录读取失败，原记录已保留；请检查浏览器存储。');
      return false;
    }
  }
  refreshVisibleData = nativeRefresh;
  markLocalDataChanged = function (key, deleted) {
    originalMarkChanged(key, deleted);
    if (nativeReady) nativeNotify();
  };
  resolveLocalSyncConflict = async function (choice) {
    try { return await originalResolveConflict(choice); }
    finally { nativeNotify(); }
  };
  function nativeStopSync() {
    nativeContext.generation++;
    for (const request of nativeRequests) request.abort();
    nativeRequests.clear();
    clearTimeout(localSyncSaveTimer);
    clearInterval(localSyncPollTimer);
    clearInterval(localSyncDirtyTimer);
    localSyncSaveTimer = localSyncPollTimer = localSyncDirtyTimer = null;
    localSyncAvailable = localSyncReady = localSyncUploading = localSyncUploadAgain = localSyncShouldSeed = false;
  }
  function nativeUseBrowser() {
    nativeStopSync();
    nativeContext.mode = 'browser';
    nativeContext.origin = null;
    showLocalSyncDiagnostic('当前浏览器本机保存（未启用跨设备同步）');
    nativeNotify();
  }
  async function nativeConnect(value, key = '') {
    await nativeBoot;
    let url;
    try {
      url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('protocol');
    } catch (_) {
      showLocalSyncDiagnostic('私有服务地址无效，当前记录已保留。', true);
      return { connected: false, conflict: !!localSyncConflict };
    }
    nativeStopSync();
    nativeContext.mode = 'private';
    nativeContext.origin = url.origin;
    nativeContext.key = String(key ?? '').trim();
    const generation = nativeContext.generation;
    await initLocalSync({ force: true });
    if (generation !== nativeContext.generation) return { connected: false, conflict: false };
    if (localSyncAvailable) enableLocalSyncAfterInitialRender();
    nativeRefresh();
    return { connected: localSyncAvailable, conflict: !!localSyncConflict };
  }
  function nativeActivate(view, day) {
    if (!nativeReady || !nativeViews.has(view)) return false;
    const date = typeof day === 'string' ? parseLocalDate(day) : null;
    if (date) {
      selectedDate = day;
      currentYear = date.getFullYear();
      currentMonth = date.getMonth();
      for (const key of nativeAccounts) document.getElementById(key + 'DateInput').value = day;
    }
    if (nativeAccounts.includes(view)) openDetail(view);
    else {
      goBack();
      document.getElementById(view)?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
    const resize = () => {
      for (const chart of Object.values(accountCharts)) chart?.resize?.();
      for (const chart of [mainChart, streakChart, tasksChart, avgChart, compareChart, realWindow.emotionChart, realWindow.pomodoroChartInstance]) chart?.resize?.();
      for (const name of ['physicalTrend', 'emotionalTrend', 'focusTrend', 'meaningTrend']) realWindow[name]?.resize?.();
    };
    if (typeof realWindow.requestAnimationFrame === 'function') realWindow.requestAnimationFrame(resize);
    else setTimeout(resize, 0);
    return true;
  }
  for (const [name, fn] of Object.entries(nativeUi)) {
    realWindow[name] = function (...args) {
      const result = fn.apply(this, args);
      if (result && typeof result.then === 'function') return result.then(value => { nativeNotify(); return value; });
      nativeNotify();
      return result;
    };
  }
  realWindow.OpsVitaFlowNative = {
    isReady: () => nativeReady,
    activate: nativeActivate,
    setTheme(theme) { if (['dark', 'light'].includes(theme)) nativeRoot.setAttribute('data-ops-theme', theme); },
    getSummary: nativeSummary,
    importDiaryTodo,
    toggleTodo(id) { const result = toggleTodo(id); nativeNotify(); return result; },
    connect: nativeConnect,
    useBrowser: nativeUseBrowser,
    refresh: nativeRefresh
  };
  nativeBoot = bootVitaFlow().then(() => {
    nativeReady = true;
    nativeNotify('ops:vitaflow-ready');
  }).catch(error => {
    updateSaveStatus('工作区初始化失败，原记录已保留。');
    console.error('Native VitaFlow initialization failed:', error);
  });
})(window, document);
