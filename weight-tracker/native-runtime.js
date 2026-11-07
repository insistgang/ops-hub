(function (window) {
  if (window.OpsWeightNative) return;
  const root = document.getElementById('weight-native');
  if (!root) throw new Error('WeightTracker native mount #weight-native is missing.');
  const fragment = /* WEIGHT_NATIVE_FRAGMENT */ '';
  if (root.dataset.weightNativeMounted !== 'true') {
    root.innerHTML = fragment;
    root.dataset.weightNativeMounted = 'true';
  }

  let app = null;
  let ready = false;
  let lastError = null;

  function emptySummary() {
    return { latest: null, goal: null, change: null, count: 0, user: null, error: lastError };
  }

  function publishData() {
    const summary = getSummary();
    window.dispatchEvent(new CustomEvent('ops:weight-data', {
      detail: {
        count: summary.count,
        hasUser: summary.user !== null,
        hasLatest: summary.latest !== null,
        hasGoal: summary.goal !== null,
        error: summary.error !== null,
      },
    }));
  }

  function publishReady() {
    window.dispatchEvent(new CustomEvent('ops:weight-ready', {
      detail: { ready, error: lastError !== null },
    }));
  }

  function getSummary() {
    if (!app) return emptySummary();
    try {
      const summary = app.getSummary();
      return { ...summary, error: lastError };
    } catch (error) {
      lastError = error?.message || '体重记录读取失败。';
      return emptySummary();
    }
  }

  window.__WeightNativeBridge = {
    connect(nativeApp) {
      if (app) return;
      app = nativeApp;
      ready = true;
      lastError = null;
      window.__WeightNativeBootstrap = null;
      publishReady();
      publishData();
    },
    fail(error) {
      app = null;
      ready = true;
      lastError = error?.message || '本机体重数据无法读取。';
      publishReady();
      publishData();
    },
    setError(error) {
      lastError = error ? (error.message || '体重记录操作失败。') : null;
    },
    dataChanged() { if (ready && app) publishData(); },
  };

  window.OpsWeightNative = {
    isReady() { return ready; },
    activate(view = 'overview') {
      if (!app) return false;
      return app.activate(view);
    },
    refresh() {
      if (app) {
        lastError = null;
        try { app.refresh(); }
        catch (error) { lastError = error?.message || '本机体重数据刷新失败。'; }
        if (lastError) publishData();
        return getSummary();
      }
      const bootstrap = window.__WeightNativeBootstrap;
      if (bootstrap) {
        ready = false;
        lastError = null;
        try { bootstrap(); }
        catch (error) {
          ready = true;
          lastError = error?.message || '本机体重数据刷新失败。';
          publishReady();
        }
      }
      publishData();
      return getSummary();
    },
    getSummary,
  };
})(window);
