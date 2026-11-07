/* Host the complete VitaFlow app while keeping its data modes explicit. */
function initVitaFlow() {
  const ids = ['url', 'key', 'connect', 'frame', 'frame-wrap', 'status', 'builtin', 'open', 'source'];
  const nodes = Object.fromEntries(ids.map(id => [id, document.getElementById(`vitaflow-${id}`)]));
  if (Object.values(nodes).some(node => !node)) return;
  const navigation = Array.from(document.querySelectorAll('[data-vf-view]'));
  const views = new Set(['energyOverview', 'dailyPlan', 'energyTrends', 'creativeSpace']);
  const builtin = new URL('vitaflow/schedule-system-2.0.html', window.location.href);
  let displayed = null;
  let mode = 'builtin';
  let ready = false;
  let activeNotice = '';
  let timer;

  function validUrl(value) {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid protocol');
    return url;
  }
  function post(message) {
    if (!displayed || !ready) return;
    nodes.frame.contentWindow.postMessage(message, displayed.protocol === 'file:' ? '*' : displayed.origin);
  }
  function theme(value) { post({ type: 'ops:vitaflow:theme', theme: value }); }
  function open(url, nextMode, notice = '') {
    displayed = new URL(url);
    displayed.searchParams.set('embed', 'ops-hub');
    mode = nextMode;
    if (mode === 'builtin') displayed.searchParams.set('mode', 'browser');
    else if (displayed.searchParams.get('mode') === 'browser') displayed.searchParams.delete('mode');
    activeNotice = notice;
    ready = false;
    clearTimeout(timer);
    navigation.forEach(button => { button.disabled = true; });
    nodes.frame.src = displayed.href;
    nodes.open.href = displayed.href;
    nodes['frame-wrap'].classList.remove('hidden');
    nodes.source.textContent = mode === 'builtin'
      ? '内置工作区：记录保存在当前浏览器；不会自动读取原来的私人日程文件。'
      : '私有服务模式：正在确认服务，实际数据来源以工作区内的同步提示为准。';
    nodes.status.textContent = `正在载入完整 VitaFlow 工作区。${notice}`;
    timer = setTimeout(() => {
      if (!ready) nodes.status.textContent = `尚未收到工作区就绪确认。可在新窗口检查页面；私有服务不可用时，可切回内置工作区。${notice}`;
    }, 15000);
  }
  function remember(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (_) { return false; }
  }
  window.OpsVitaFlow = { setTheme: theme };
  window.addEventListener('message', event => {
    if (!displayed || event.source !== nodes.frame.contentWindow) return;
    const origin = displayed.protocol === 'file:' ? 'null' : displayed.origin;
    if (event.origin !== origin) return;
    if (event.data?.type !== 'ops:vitaflow:ready') return;
    ready = true;
    clearTimeout(timer);
    navigation.forEach(button => { button.disabled = false; });
    nodes.status.textContent = `完整工作区已就绪，可使用下方全部功能或上方快捷导航。${activeNotice}`;
    nodes.source.textContent = event.data.storage === 'server'
      ? '已接入私有同步服务，日程由服务端真源维护。'
      : '记录保存在当前浏览器；原有私人日程需通过私有服务连接或主动导入。';
    theme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });
  navigation.forEach(button => button.addEventListener('click', () => {
    const view = button.getAttribute('data-vf-view');
    if (views.has(view)) post({ type: 'ops:vitaflow:navigate', view });
  }));
  nodes.builtin.addEventListener('click', () => {
    const saved = remember('ops_vitaflow_mode', 'builtin');
    open(builtin, 'builtin', saved ? '' : '浏览器未保存本次入口选择。');
  });
  nodes.connect.addEventListener('click', () => {
    try {
      const url = validUrl(nodes.url.value.trim());
      const key = nodes.key.value.trim();
      if (key) url.searchParams.set('key', key);
      else url.searchParams.delete('key');
      const savedUrl = remember('ops_vitaflow_url', url.href);
      const savedMode = remember('ops_vitaflow_mode', 'private');
      open(url, 'private', savedUrl && savedMode ? '' : '浏览器未保存本次连接设置。');
    } catch (_) {
      nodes.status.textContent = '请输入完整的 http:// 或 https:// 私有服务地址。';
    }
  });
  nodes.frame.addEventListener('error', () => {
    clearTimeout(timer);
    nodes.status.textContent = `工作区载入失败，请检查页面地址或私有服务；也可在新窗口打开查看。${activeNotice}`;
  });

  let savedUrl = null;
  let savedMode = null;
  let notice = '';
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
      nodes.url.value = editable.href;
    } catch (_) { notice = '旧连接地址无效，已保留原设置并使用内置工作区。'; }
  }
  if (privateUrl && savedMode !== 'builtin') open(privateUrl, 'private', notice);
  else open(builtin, 'builtin', notice);
}
