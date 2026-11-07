(function (window) {
  const STORAGE_KEY = 'ops_style';
  const STYLE_LABELS = {
    classic: '经典极客',
    paper: '纸感阅读',
    forest: '森林秩序',
    mono: '黑白极简',
  };
  const VALID_STYLES = new Set(Object.keys(STYLE_LABELS));
  let currentStyle = 'classic';
  let initialized = false;
  let bound = false;

  /* 顶部右侧的四个风格按钮；用 querySelectorAll 而不是缓存引用，
     便于测试与后续增减风格时无需改动初始化逻辑。 */
  function styleButtons() {
    const nodes = document.querySelectorAll('[data-ops-style-option]');
    return nodes ? Array.from(nodes) : [];
  }

  function syncControls(style) {
    for (const button of styleButtons()) {
      const option = button.dataset ? button.dataset.opsStyleOption : null;
      const active = option === style;
      if (button.setAttribute) button.setAttribute('aria-pressed', active ? 'true' : 'false');
      if (button.classList && button.classList.toggle) button.classList.toggle('is-active', active);
    }
  }

  function setStatus(message, state = 'info') {
    const element = document.getElementById('site-style-status');
    if (!element) return;
    element.textContent = message;
    if (element.dataset) element.dataset.state = state;
  }

  function applyStyle(style, announce = true) {
    const normalized = VALID_STYLES.has(style) ? style : 'classic';
    const root = document.documentElement;
    const previous = root.getAttribute('data-ops-style');
    currentStyle = normalized;
    root.setAttribute('data-ops-style', normalized);
    syncControls(normalized);

    if (announce && previous !== normalized) {
      window.dispatchEvent(new CustomEvent('ops:style-changed', { detail: { style: normalized } }));
    }
    return normalized;
  }

  function onStorage(event) {
    if (event.key !== STORAGE_KEY) return;
    const stored = event.newValue;
    if (stored === null) {
      const changed = currentStyle !== 'classic';
      applyStyle('classic', changed);
      setStatus('已恢复经典风格。');
      return;
    }
    if (!VALID_STYLES.has(stored)) {
      const changed = currentStyle !== 'classic';
      applyStyle('classic', changed);
      setStatus('其他标签页的风格值无效，已恢复经典风格。', 'warning');
      return;
    }
    const changed = currentStyle !== stored;
    applyStyle(stored, changed);
    setStatus(`已从其他标签页同步为${STYLE_LABELS[stored]}。`);
  }

  function init() {
    if (initialized) return currentStyle;
    if (document.readyState === 'loading') return currentStyle;
    initialized = true;

    let stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      applyStyle('classic');
      setStatus('无法读取已保存的风格，当前使用经典风格。', 'warning');
    }

    if (stored !== null) {
      if (VALID_STYLES.has(stored)) {
        applyStyle(stored);
      } else {
        applyStyle('classic');
        setStatus('已忽略无效的已保存风格，当前使用经典风格。', 'warning');
      }
    } else {
      applyStyle('classic');
    }

    if (!bound) {
      bound = true;
      for (const button of styleButtons()) {
        button.addEventListener('click', () => setStyle(button.dataset ? button.dataset.opsStyleOption : null));
      }
    }
    window.addEventListener('storage', onStorage);
    return currentStyle;
  }

  function setStyle(style) {
    if (!VALID_STYLES.has(style)) {
      syncControls(currentStyle);
      setStatus('风格值无效，已保持当前设置。', 'warning');
      return false;
    }
    if (!initialized) init();

    const changed = currentStyle !== style;
    applyStyle(style, changed);
    try {
      localStorage.setItem(STORAGE_KEY, style);
      setStatus(`已切换为${STYLE_LABELS[style]}。`);
      return true;
    } catch (error) {
      setStatus(`已切换为${STYLE_LABELS[style]}，但保存失败；刷新后可能恢复上次风格。`, 'warning');
      return false;
    }
  }

  const api = {
    init,
    setStyle,
    getStyle: () => currentStyle,
  };
  window.OpsAppearance = api;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(window);
