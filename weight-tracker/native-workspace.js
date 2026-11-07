(() => {
  const window = globalThis.window;
  if (window.__WeightNativeBundleLoaded) return;
  window.__WeightNativeBundleLoaded = true;
  (function (window) {
  if (window.OpsWeightNative) return;
  const root = document.getElementById('weight-native');
  if (!root) throw new Error('WeightTracker native mount #weight-native is missing.');
  const fragment = "<div class=\"weight-native-content\">\n        <section id=\"weight-overview\" class=\"overview-section\" aria-labelledby=\"weight-page-title\">\n          <div class=\"page-heading\">\n            <div>\n              <p class=\"eyebrow\">YOUR EVERYDAY RECORD</p>\n              <h1 id=\"weight-page-title\">把变化，记下来。</h1>\n              <p class=\"page-intro\">从一条体重记录开始，慢慢看见自己的变化。</p>\n            </div>\n            <div class=\"profile-switcher\">\n              <label for=\"weight-profile-select\">当前使用者</label>\n              <div class=\"profile-controls\">\n                <select id=\"weight-profile-select\" aria-describedby=\"weight-profile-summary\"><option value=\"\">请先创建使用者</option></select>\n                <button id=\"weight-profile-edit\" class=\"icon-button\" type=\"button\" title=\"编辑当前使用者\" aria-label=\"编辑当前使用者\"><svg viewBox=\"0 0 20 20\" fill=\"none\" aria-hidden=\"true\"><path d=\"m12.7 3.2 4.1 4.1M3 17l4.1-.8L16.6 6.7a1.5 1.5 0 0 0 0-2.1l-1.2-1.2a1.5 1.5 0 0 0-2.1 0L3.8 12.9 3 17Z\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/></svg></button>\n                <button id=\"weight-profile-add\" class=\"button button-primary\" type=\"button\"><span aria-hidden=\"true\">＋</span> 新建使用者</button>\n              </div>\n              <p id=\"weight-profile-summary\" class=\"field-hint\">各使用者的记录分开保存，可在本机切换查看。</p>\n            </div>\n          </div>\n\n          <div id=\"weight-notice\" class=\"notice\" role=\"status\" aria-live=\"polite\" hidden></div>\n\n          <div id=\"weight-empty-state\" class=\"welcome-card\">\n            <div class=\"welcome-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 32 32\" fill=\"none\"><path d=\"M7 7.5h18v19H7zM12 7.5V5h8v2.5M12 14h8M12 19h5\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></div>\n            <div><h2>给自己建一个记录空间</h2><p>点击右上方「新建使用者」，填写昵称，就可以开始记录。目标体重可以稍后再设。</p></div>\n            <span class=\"welcome-detail\">无需填写真实姓名</span>\n          </div>\n\n          <div class=\"stats-grid\" aria-label=\"体重记录摘要\">\n            <article class=\"stat-card stat-card-current\"><span class=\"stat-label\">最近体重</span><p class=\"stat-value\"><span id=\"weight-latest-value\">--</span><span class=\"unit\">kg</span></p><span class=\"stat-caption\">以最近一次记录为准</span></article>\n            <article class=\"stat-card\"><span class=\"stat-label\">目标体重</span><p class=\"stat-value\"><span id=\"weight-goal-value\">--</span><span class=\"unit\">kg</span></p><span class=\"stat-caption\">按自己的需要设置</span></article>\n            <article class=\"stat-card\"><span class=\"stat-label\">与首次记录相比</span><p class=\"stat-value\"><span id=\"weight-change-value\">--</span><span class=\"unit\">kg</span></p><span class=\"stat-caption\">关注变化，不急于下结论</span></article>\n            <article class=\"stat-card\"><span class=\"stat-label\">已记录</span><p class=\"stat-value\"><span id=\"weight-entry-count\">0</span><span class=\"unit\">次</span></p><span class=\"stat-caption\">每一条都是自己的足迹</span></article>\n          </div>\n        </section>\n\n        <div class=\"content-grid\">\n          <section class=\"panel trend-panel\" aria-labelledby=\"weight-trend-title\">\n            <div class=\"panel-header\"><div><p class=\"eyebrow\">THE BIGGER PICTURE</p><h2 id=\"weight-trend-title\">体重趋势</h2></div><span class=\"panel-tag\">按记录日期</span></div>\n            <div id=\"weight-chart-container\" class=\"chart-container\" aria-label=\"体重变化图表\"><div id=\"weight-chart-empty\" class=\"chart-empty\"><svg viewBox=\"0 0 80 48\" fill=\"none\" aria-hidden=\"true\"><path d=\"M4 42h72M6 5v37\" stroke=\"currentColor\" stroke-width=\"1.3\"/><path d=\"m15 32 14-9 14 5 15-13 14 4\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"72\" cy=\"19\" r=\"3\" fill=\"currentColor\"/></svg><p>还没有体重记录</p><span>保存记录后，变化会在这里展开。</span></div></div>\n            <p class=\"panel-footnote\">体重会随测量时间和身体状态波动，尽量在相近条件下记录。</p>\n          </section>\n\n          <section id=\"weight-new-entry\" class=\"panel entry-panel\" aria-labelledby=\"weight-form-title\">\n            <div class=\"panel-header\"><div><p class=\"eyebrow\">ONE SMALL STEP</p><h2 id=\"weight-form-title\">记录一次体重</h2></div><span class=\"entry-mark\" aria-hidden=\"true\">＋</span></div>\n            <p id=\"weight-record-subtitle\" class=\"section-description\">只需要日期与体重，其他的随意。</p>\n            <form id=\"weight-record-form\">\n              <input id=\"weight-record-id\" type=\"hidden\" value=\"\">\n              <div class=\"field\"><label for=\"weight-record-date\">记录日期</label><input id=\"weight-record-date\" name=\"date\" type=\"date\" required></div>\n              <div class=\"field\"><label for=\"weight-record-weight\">体重</label><div class=\"input-with-unit\"><input id=\"weight-record-weight\" name=\"weight\" type=\"number\" inputmode=\"decimal\" min=\"1\" max=\"500\" step=\"0.1\" placeholder=\"例如 68.5\" required><span aria-hidden=\"true\">kg</span></div></div>\n              <div class=\"field\"><label for=\"weight-record-note\">备注 <span class=\"optional\">选填</span></label><textarea id=\"weight-record-note\" name=\"note\" rows=\"2\" maxlength=\"300\" placeholder=\"记下这次测量的时间、状态，或一句想法。\"></textarea></div>\n              <div class=\"form-actions\"><button id=\"weight-record-submit\" class=\"button button-primary\" type=\"submit\">保存记录 <span aria-hidden=\"true\">↗</span></button><button id=\"weight-record-cancel\" class=\"button button-secondary\" type=\"button\" hidden>取消编辑</button><button id=\"weight-record-clear\" class=\"button button-secondary\" type=\"button\">清空输入</button></div>\n              <p class=\"form-note\">记录仅保存在当前浏览器，换设备不会自动同步。</p>\n            </form>\n          </section>\n        </div>\n\n        <section id=\"weight-history\" class=\"panel history-panel\" aria-labelledby=\"weight-history-title\">\n          <div class=\"panel-header\"><div><p class=\"eyebrow\">YOUR OWN TIMELINE</p><h2 id=\"weight-history-title\">历史记录</h2></div><span id=\"weight-records-summary\" class=\"history-summary\">按日期查看每一次记录</span></div>\n          <div id=\"weight-record-list\" class=\"record-list\" aria-live=\"polite\"><div class=\"list-empty\"><span class=\"empty-line\" aria-hidden=\"true\"></span><p>暂时没有记录</p><span>保存第一条体重后，会显示在这里。</span></div></div>\n        </section>\n        <section id=\"weight-groups\" class=\"panel groups-panel\" aria-labelledby=\"weight-groups-title\">\n          <div class=\"panel-header\"><div><p class=\"eyebrow\">A LITTLE COMPANY</p><h2 id=\"weight-groups-title\">一起记录，也保留自己的空间</h2></div><button id=\"weight-group-create\" class=\"button button-secondary\" type=\"button\">创建小组 <span aria-hidden=\"true\">＋</span></button></div>\n          <p class=\"group-description\">本机模拟，小组不跨设备同步，体重默认不展示。可以切换使用者，体验加入或退出同一个小组。</p>\n          <div id=\"weight-group-list\" class=\"group-list\"><p class=\"group-empty\">还没有小组。创建使用者后，可以体验本机小组。</p></div>\n        </section>\n        \n      </div><dialog id=\"weight-profile-dialog\" class=\"profile-dialog\" aria-labelledby=\"weight-profile-dialog-title\" aria-describedby=\"weight-profile-dialog-description\">\n    <form id=\"weight-profile-form\" method=\"dialog\">\n      <div class=\"dialog-heading\"><div><p class=\"eyebrow\">A SPACE FOR YOU</p><h2 id=\"weight-profile-dialog-title\">新建使用者</h2></div><button id=\"weight-profile-cancel\" class=\"icon-button\" type=\"button\" data-close-dialog aria-label=\"关闭使用者设置\">×</button></div>\n      <p id=\"weight-profile-dialog-description\" class=\"section-description\">使用昵称即可。在这台设备上，每位使用者都有自己的记录。</p>\n      <div class=\"field\"><label for=\"weight-profile-name\">昵称</label><input id=\"weight-profile-name\" name=\"name\" type=\"text\" maxlength=\"30\" placeholder=\"你希望怎么称呼自己\" autocomplete=\"off\" required autofocus></div>\n      <div class=\"field\"><label for=\"weight-profile-goal\">目标体重 <span class=\"optional\">选填</span></label><div class=\"input-with-unit\"><input id=\"weight-profile-goal\" name=\"goal\" type=\"number\" inputmode=\"decimal\" min=\"1\" max=\"500\" step=\"0.1\" placeholder=\"可以稍后再设置\"><span aria-hidden=\"true\">kg</span></div></div>\n      <p class=\"dialog-note\">这是本机使用者切换，不是账号登录。同一浏览器中的人可以切换查看。</p>\n      <div class=\"form-actions\"><button id=\"weight-profile-save\" class=\"button button-primary\" type=\"submit\">创建记录空间 <span aria-hidden=\"true\">↗</span></button></div>\n    </form>\n  </dialog>\n<dialog id=\"weight-group-dialog\" class=\"profile-dialog\" aria-labelledby=\"weight-group-dialog-title\" aria-describedby=\"weight-group-dialog-description\">\n    <form id=\"weight-group-form\" method=\"dialog\">\n      <div class=\"dialog-heading\"><div><p class=\"eyebrow\">A LITTLE COMPANY</p><h2 id=\"weight-group-dialog-title\">创建本机小组</h2></div><button id=\"weight-group-cancel\" class=\"icon-button\" type=\"button\" data-close-dialog aria-label=\"关闭小组设置\">×</button></div>\n      <p id=\"weight-group-dialog-description\" class=\"section-description\">给一起记录的人留一个位置。小组仅在当前浏览器内模拟使用。</p>\n      <div class=\"field\"><label for=\"weight-group-name\">小组名称</label><input id=\"weight-group-name\" name=\"name\" type=\"text\" maxlength=\"40\" placeholder=\"例如：一起坚持记录\" autocomplete=\"off\" required></div>\n      <p class=\"dialog-note\">体重默认不展示给小组；创建后，当前使用者会加入这个小组。</p>\n      <div class=\"form-actions\"><button class=\"button button-primary\" type=\"submit\">创建并加入 <span aria-hidden=\"true\">↗</span></button></div>\n    </form>\n  </dialog>";
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


(() => {
  const window = globalThis.window;
  const realDocument = window.document;
  const nativeRoot = realDocument.getElementById('weight-native');
  const prefixNativeId = id => String(id).startsWith('weight-') ? String(id) : 'weight-' + id;
  const mapSelector = selector => String(selector).replace(/#(?!weight-)([\w-]+)/g, '#weight-$1');
  const document = {
    getElementById(id) { return nativeRoot.querySelector('#' + prefixNativeId(id)); },
    querySelector(selector) { return nativeRoot.querySelector(mapSelector(selector)); },
    querySelectorAll(selector) { return nativeRoot.querySelectorAll(mapSelector(selector)); },
    createElement: realDocument.createElement.bind(realDocument),
    createElementNS: realDocument.createElementNS.bind(realDocument),
    createTextNode: realDocument.createTextNode.bind(realDocument),
  };
  window.__WeightNativeBootstrap = function () {
    nativeRoot.querySelectorAll('form button, #weight-profile-add, #weight-profile-edit, #weight-group-create').forEach(button => { button.disabled = false; });
    (function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WeightStore = api;
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // This key belongs only to the local universal version. It is not an account or sync service.
  var STORAGE_KEY = 'weight-tracker:universal:v1';
  var sequence = 0;

  class StoreError extends Error {
    constructor(code, message) {
      super(message);
      this.name = 'StoreError';
      this.code = code;
    }
  }

  function fail(code, message) { throw new StoreError(code, message); }
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function isObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
  function localDateKey(date) {
    date = date || new Date();
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }
  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    var date = new Date(value + 'T12:00:00Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }
  function dateValue(value) {
    if (!validDate(value) || value > localDateKey()) fail('INVALID_DATE', '请选择真实且不晚于今天的日期');
    return value;
  }
  function boundedName(value, isGroup) {
    if (typeof value !== 'string' || !value.trim() || value.trim().length > 40) {
      fail(isGroup ? 'INVALID_GROUP_NAME' : 'INVALID_NAME', isGroup ? '小组名称需为 1 至 40 个字符' : '使用者名称需为 1 至 40 个字符');
    }
    return value.trim();
  }
  function weightValue(value, isGoal) {
    var code = isGoal ? 'INVALID_GOAL' : 'INVALID_WEIGHT';
    if (!['number', 'string'].includes(typeof value) || (typeof value === 'string' && !value.trim())) {
      fail(code, '请输入 1 至 500 kg 范围内的数字');
    }
    var number = Number(value);
    if (!Number.isFinite(number) || number < 1 || number > 500) fail(code, '请输入 1 至 500 kg 范围内的数字');
    return Math.round((number + Number.EPSILON) * 10) / 10;
  }
  function goalValue(value) { return value === null || value === undefined || value === '' ? null : weightValue(value, true); }
  function noteValue(value) {
    if (value === undefined || value === null) return '';
    if (typeof value !== 'string' || value.length > 300) fail('INVALID_NOTE', '备注最多 300 个字符');
    return value.trim();
  }
  function timestamp() { return new Date().toISOString(); }
  function validTimestamp(value) { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }

  function validateState(value) {
    if (!isObject(value) || value.version !== 1 || !Array.isArray(value.users) || !Array.isArray(value.records) || !Array.isArray(value.groups)) {
      fail('INVALID_DATA', '本机数据格式异常，已保留原数据，请先备份后再处理');
    }
    var userIds = new Set();
    var recordIds = new Set();
    var groupIds = new Set();
    try {
      value.users.forEach(function (user) {
        if (!isObject(user) || typeof user.id !== 'string' || !user.id || userIds.has(user.id) || !validTimestamp(user.createdAt) || !validTimestamp(user.updatedAt)) throw new Error();
        boundedName(user.name, false);
        goalValue(user.goal);
        userIds.add(user.id);
      });
      if (value.activeUserId !== null && !userIds.has(value.activeUserId)) throw new Error();
      value.records.forEach(function (record) {
        if (!isObject(record) || typeof record.id !== 'string' || !record.id || recordIds.has(record.id) || !userIds.has(record.userId) || !validDate(record.date) || !validTimestamp(record.createdAt) || !validTimestamp(record.updatedAt)) throw new Error();
        weightValue(record.weight, false);
        noteValue(record.note);
        recordIds.add(record.id);
      });
      value.groups.forEach(function (group) {
        if (!isObject(group) || typeof group.id !== 'string' || !group.id || groupIds.has(group.id) || !Array.isArray(group.memberIds) || !validTimestamp(group.createdAt) || !validTimestamp(group.updatedAt)) throw new Error();
        boundedName(group.name, true);
        if (new Set(group.memberIds).size !== group.memberIds.length || group.memberIds.some(function (id) { return !userIds.has(id); })) throw new Error();
        groupIds.add(group.id);
      });
    } catch (error) {
      fail('INVALID_DATA', '本机数据格式异常，已保留原数据，请先备份后再处理');
    }
    return value;
  }

  function createStore(storage) {
    if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') fail('STORAGE_UNAVAILABLE', '此浏览器无法保存本机记录');
    var raw;
    try { raw = storage.getItem(STORAGE_KEY); }
    catch (error) { fail('STORAGE_UNAVAILABLE', '无法读取本机记录，请检查浏览器存储权限'); }
    var state = { version: 1, activeUserId: null, users: [], records: [], groups: [] };
    if (raw !== null && raw !== undefined) {
      try { state = validateState(JSON.parse(raw)); }
      catch (error) {
        if (error instanceof StoreError) throw error;
        fail('INVALID_DATA', '本机数据格式异常，已保留原数据，请先备份后再处理');
      }
    }

    function newId(prefix) {
      var ids = new Set(state.users.concat(state.records, state.groups).map(function (item) { return item.id; }));
      var id;
      do {
        sequence += 1;
        id = prefix + '-' + Date.now().toString(36) + '-' + sequence.toString(36) + '-' + Math.random().toString(36).slice(2, 9);
      } while (ids.has(id));
      return id;
    }
    function userFor(id) {
      if (id === undefined || id === null) {
        id = state.activeUserId;
        if (!id) fail('NO_ACTIVE_USER', '请先创建或选择本机使用者');
      }
      var user = state.users.find(function (item) { return item.id === id; });
      if (!user) fail('USER_NOT_FOUND', '未找到此本机使用者');
      return user;
    }
    function groupFor(id) {
      var group = state.groups.find(function (item) { return item.id === id; });
      if (!group) fail('GROUP_NOT_FOUND', '未找到此本机小组');
      return group;
    }
    function save(next, result) {
      var current;
      try { current = storage.getItem(STORAGE_KEY); }
      catch (error) { fail('STORAGE_UNAVAILABLE', '无法核对本机记录，请检查浏览器存储权限'); }
      // Detect a stale page before writing; localStorage is not a cross-process transaction.
      if (current !== raw) fail('STORAGE_CONFLICT', '本机记录已在另一个页面更新，请刷新后再保存');
      var serialized = JSON.stringify(next);
      try { storage.setItem(STORAGE_KEY, serialized); }
      catch (error) { fail('STORAGE_UNAVAILABLE', '保存失败，请检查浏览器存储空间或权限'); }
      raw = serialized;
      state = next;
      return copy(result);
    }
    function recordFor(id, userId) {
      var user = userFor(userId);
      var record = state.records.find(function (item) { return item.id === id && item.userId === user.id; });
      if (!record) fail('RECORD_NOT_FOUND', '当前使用者没有这条记录');
      return record;
    }

    return {
      getState: function () { return copy(state); },
      listUsers: function () { return copy(state.users); },
      getActiveUser: function () { return state.activeUserId ? copy(userFor(state.activeUserId)) : null; },
      createUser: function (input) {
        input = isObject(input) ? input : {};
        var now = timestamp();
        var user = { id: newId('user'), name: boundedName(input.name, false), goal: goalValue(input.goal), createdAt: now, updatedAt: now };
        var next = copy(state);
        next.users.push(user);
        next.activeUserId = user.id;
        return save(next, user);
      },
      switchUser: function (id) {
        var user = userFor(id);
        var next = copy(state);
        next.activeUserId = user.id;
        return save(next, user);
      },
      updateUser: function (id, patch) {
        var user = userFor(id);
        patch = isObject(patch) ? patch : {};
        var next = copy(state);
        var updated = next.users.find(function (item) { return item.id === user.id; });
        if (Object.hasOwn(patch, 'name')) updated.name = boundedName(patch.name, false);
        if (Object.hasOwn(patch, 'goal')) updated.goal = goalValue(patch.goal);
        updated.updatedAt = timestamp();
        return save(next, updated);
      },
      listRecords: function (userId) {
        var user = userFor(userId);
        return copy(state.records.filter(function (item) { return item.userId === user.id; }).sort(function (a, b) {
          return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
        }));
      },
      addRecord: function (input, userId) {
        var user = userFor(userId);
        input = isObject(input) ? input : {};
        var now = timestamp();
        var record = { id: newId('record'), userId: user.id, date: dateValue(input.date), weight: weightValue(input.weight, false), note: noteValue(input.note), createdAt: now, updatedAt: now };
        var next = copy(state);
        next.records.push(record);
        return save(next, record);
      },
      updateRecord: function (id, patch, userId) {
        var record = recordFor(id, userId);
        patch = isObject(patch) ? patch : {};
        var next = copy(state);
        var updated = next.records.find(function (item) { return item.id === record.id; });
        if (Object.hasOwn(patch, 'date')) updated.date = dateValue(patch.date);
        if (Object.hasOwn(patch, 'weight')) updated.weight = weightValue(patch.weight, false);
        if (Object.hasOwn(patch, 'note')) updated.note = noteValue(patch.note);
        updated.updatedAt = timestamp();
        return save(next, updated);
      },
      deleteRecord: function (id, userId) {
        var record = recordFor(id, userId);
        var next = copy(state);
        next.records = next.records.filter(function (item) { return item.id !== id; });
        return save(next, record);
      },
      createGroup: function (name) {
        var user = userFor();
        var now = timestamp();
        var group = { id: newId('group'), name: boundedName(name, true), memberIds: [user.id], createdAt: now, updatedAt: now };
        var next = copy(state);
        next.groups.push(group);
        return save(next, group);
      },
      listGroups: function () { return copy(state.groups); },
      joinGroup: function (id, userId) {
        var user = userFor(userId);
        var group = groupFor(id);
        if (group.memberIds.includes(user.id)) return copy(group);
        var next = copy(state);
        var updated = next.groups.find(function (item) { return item.id === id; });
        updated.memberIds.push(user.id);
        updated.updatedAt = timestamp();
        return save(next, updated);
      },
      leaveGroup: function (id, userId) {
        var user = userFor(userId);
        var group = groupFor(id);
        if (!group.memberIds.includes(user.id)) return copy(group);
        var next = copy(state);
        var updated = next.groups.find(function (item) { return item.id === id; });
        updated.memberIds = updated.memberIds.filter(function (memberId) { return memberId !== user.id; });
        updated.updatedAt = timestamp();
        return save(next, updated);
      }
    };
  }

  return { STORAGE_KEY: STORAGE_KEY, StoreError: StoreError, createStore: createStore, localDateKey: localDateKey };
});

    (() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const api = window.WeightStore;
  let store;
  try { store = api.createStore(window.localStorage); }
  catch (error) {
    const notice = $('notice');
    notice.hidden = false;
    notice.textContent = '浏览器存储无法读取，或数据格式异常。已保留原数据，请检查浏览器存储设置后重试。';
    document.querySelectorAll('form button, #profile-add, #profile-edit, #group-create').forEach(button => { button.disabled = true; });
    window.__WeightNativeBridge.fail(error);
    return;
  }
  let editingRecord = null;
  let editingProfile = null;
  const today = () => api.localDateKey();
  const showNotice = text => { $('notice').textContent = text; $('notice').hidden = !text; };
  const safe = (action) => { try { window.__WeightNativeBridge.setError(null); action(); } catch (error) { window.__WeightNativeBridge.setError(error); showNotice(error.code === 'STORAGE_CONFLICT' ? '其他页面已更新数据，请刷新页面后再试，当前输入不会自动保存。' : (error.message || '操作失败，请重试')); } };
  const element = (tag, text, cls) => { const e = document.createElement(tag); if (text != null) e.textContent = text; if (cls) e.className = cls; return e; };

  function renderChart(records) {
    const host = $('chart-container');
    let empty = $('chart-empty');
    if (!empty) { empty = element('div', '保存第一条记录后，这里会显示体重趋势。', 'chart-empty'); empty.id = 'weight-chart-empty'; }
    host.replaceChildren();
    if (!records.length) { host.appendChild(empty); empty.hidden = false; return; }
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 600 200');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `体重趋势图，共 ${records.length} 条记录，最新 ${records.at(-1).weight} 公斤`);
    const vals = records.map(r => r.weight);
    const low = Math.min(...vals), high = Math.max(...vals), pad = Math.max((high-low)*0.2, 1);
    const points = records.map((r, i) => ({ x: records.length === 1 ? 300 : 35 + i*530/(records.length-1), y: 165-(r.weight-low+pad)/(high-low+pad*2)*130 }));
    const axis = document.createElementNS(ns, 'line');
    for (const [k,v] of Object.entries({x1:35,y1:165,x2:565,y2:165,stroke:'#dbe5f1','stroke-width':1})) axis.setAttribute(k,v);
    svg.appendChild(axis);
    if (points.length > 1) { const line = document.createElementNS(ns, 'polyline'); line.setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' ')); line.setAttribute('fill', 'none'); line.setAttribute('stroke', '#2864d7'); line.setAttribute('stroke-width', '3'); line.setAttribute('stroke-linejoin', 'round'); svg.appendChild(line); }
    points.forEach((p,i) => { const circle = document.createElementNS(ns, 'circle'); circle.setAttribute('cx',p.x); circle.setAttribute('cy',p.y); circle.setAttribute('r','4'); circle.setAttribute('fill','#2864d7'); const title=document.createElementNS(ns,'title');title.textContent=`${records[i].date} · ${records[i].weight} kg`;circle.appendChild(title);svg.appendChild(circle); });
    const label=document.createElementNS(ns,'text');label.setAttribute('x','35');label.setAttribute('y','190');label.setAttribute('fill','#657b99');label.setAttribute('font-size','13');label.textContent=records[0].date;svg.appendChild(label);
    const end=document.createElementNS(ns,'text');end.setAttribute('x','565');end.setAttribute('y','190');end.setAttribute('text-anchor','end');end.setAttribute('fill','#657b99');end.setAttribute('font-size','13');end.textContent=records.at(-1).date;svg.appendChild(end);
    host.appendChild(svg);
  }

  function resetRecordForm() { editingRecord=null; $('record-form').reset(); $('record-date').value=today(); $('record-date').max=today(); $('record-submit').textContent='保存记录'; $('record-cancel').hidden=true; if ($('form-title')) $('form-title').textContent='记录体重'; }
  function renderRecords(records) {
    const list=$('record-list'); list.replaceChildren();
    if ($('records-summary')) $('records-summary').textContent=records.length ? `共 ${records.length} 条记录` : '还没有记录';
    if (!records.length) list.appendChild(element('p', '还没有记录。保存第一条体重后，会显示在这里。', 'list-empty'));
    [...records].reverse().forEach(record => {
      const row=element('li',null,'record-item');
      const details=element('div',null,'record-details');
      const first=element('div',null,'record-primary');first.append(element('strong',`${record.weight.toFixed(1)} kg`), element('time',record.date));
      details.appendChild(first);if(record.note) details.appendChild(element('p',record.note,'record-note'));
      const actions=element('div',null,'record-actions');
      const edit=element('button','编辑','record-action');edit.type='button';edit.setAttribute('aria-label',`编辑 ${record.date} 的记录`);
      edit.onclick=()=>{editingRecord=record.id;$('record-date').value=record.date;$('record-weight').value=record.weight;$('record-note').value=record.note || '';$('record-submit').textContent='保存修改';$('record-cancel').hidden=false;if($('form-title'))$('form-title').textContent='编辑记录';$('record-weight').focus();};
      const del=element('button','删除','record-action danger');del.type='button';del.setAttribute('aria-label',`删除 ${record.date} 的记录`);
      del.onclick=()=>{if(!window.confirm(`删除 ${record.date} 的 ${record.weight} kg 记录？`))return;safe(()=>{store.deleteRecord(record.id);if(editingRecord===record.id)resetRecordForm();showNotice('记录已删除');render();});};
      actions.append(edit,del);row.append(details,actions);list.appendChild(row);
    });
  }
  function renderGroups(user) {
    const list=$('group-list'); if(!list)return;list.replaceChildren();if ($('group-create')) $('group-create').disabled=!user;const groups=store.listGroups();
    if (!groups.length) { list.appendChild(element('p','还没有小组。可以创建一个，在本机体验加入和退出。','group-empty')); return; }
    groups.forEach(group => {
      const row=element('div',null,'group-item');const info=element('div',null,'group-info');
      info.append(element('strong',group.name),element('span',`${group.memberIds.length} 位本机成员`));
      const joined=user && group.memberIds.includes(user.id);const btn=element('button',joined?'退出':'加入', 'group-action');btn.type='button';btn.disabled=!user;
      btn.onclick=()=>safe(()=>{if(joined)store.leaveGroup(group.id);else store.joinGroup(group.id);showNotice(joined?'已退出本机小组':'已加入本机小组');render();});row.append(info,btn);list.appendChild(row);
    });
  }
  function render() {
    const users=store.listUsers(), user=store.getActiveUser();
    if ($('empty-state')) $('empty-state').hidden=!!user;
    const select=$('profile-select');select.replaceChildren();
    if (!users.length) { const op=element('option','请先创建使用者');op.value='';select.appendChild(op); }
    users.forEach(u=>{const opt=element('option',u.name);opt.value=u.id;select.appendChild(opt);});select.value=user?.id || '';select.disabled=!user;
    $('profile-edit').disabled=!user; $('record-submit').disabled=!user;
    const records=user ? store.listRecords(user.id) : [];
    const first=records[0], last=records.at(-1);
    $('latest-value').textContent=last?last.weight.toFixed(1):'--';
    $('goal-value').textContent=user?.goal != null?Number(user.goal).toFixed(1):'--';
    const diff=first&&last?Math.round((last.weight-first.weight)*10)/10:null;
    $('change-value').textContent=diff==null?'--':`${diff>0?'+':''}${diff.toFixed(1)}`;
    $('entry-count').textContent=String(records.length);
    if($('profile-summary')) $('profile-summary').textContent=user?`当前使用者：${user.name}`:'创建本机使用者后开始记录';
    renderChart(records);renderRecords(records);renderGroups(user);window.__WeightNativeBridge.dataChanged();
  }
  $('profile-add').addEventListener('click',()=>{editingProfile=null;$('profile-form').reset();if($('profile-dialog-title'))$('profile-dialog-title').textContent='创建使用者';$('profile-dialog').showModal();$('profile-name').focus();});
  $('profile-edit').addEventListener('click',()=>{const u=store.getActiveUser();if(!u)return;editingProfile=u.id;$('profile-name').value=u.name;$('profile-goal').value=u.goal??'';if($('profile-dialog-title'))$('profile-dialog-title').textContent='编辑使用者';$('profile-dialog').showModal();$('profile-name').focus();});
  $('profile-form').addEventListener('submit',e=>{e.preventDefault();safe(()=>{const data={name:$('profile-name').value.trim(),goal:$('profile-goal').value.trim() || null};if(editingProfile)store.updateUser(editingProfile,data);else store.createUser(data);$('profile-dialog').close();resetRecordForm();showNotice('使用者已保存');render();});});
  $('profile-select').addEventListener('change',e=>safe(()=>{store.switchUser(e.target.value);resetRecordForm();showNotice('已切换本机使用者');render();}));
  $('record-form').addEventListener('submit',e=>{e.preventDefault();safe(()=>{const data={date:$('record-date').value,weight:$('record-weight').value,note:$('record-note').value};if(editingRecord)store.updateRecord(editingRecord,data);else store.addRecord(data);resetRecordForm();showNotice('记录已保存在本机浏览器');render();});});
  $('record-cancel').addEventListener('click',resetRecordForm);
  if($('group-create'))$('group-create').addEventListener('click',()=>{$('group-form').reset();$('group-dialog').showModal();$('group-name').focus();});
  if($('group-form'))$('group-form').addEventListener('submit',e=>{e.preventDefault();safe(()=>{store.createGroup($('group-name').value.trim());$('group-dialog').close();showNotice('本机小组已创建并加入');render();});});
  document.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  const nativeClearButton = $('record-clear');
  if (nativeClearButton) nativeClearButton.addEventListener('click', () => {
    resetRecordForm();
    showNotice('已清空未保存的体重输入。');
    window.__WeightNativeBridge.setError(null);
  });
  resetRecordForm();render();
  window.__WeightNativeBridge.connect({
    refresh() {
      if (this.hasUnsavedDraft()) {
        const error = new Error('本机记录已更新，当前页面有未保存输入。请保存或取消编辑，或点击“清空输入”后再重读。');
        window.__WeightNativeBridge.setError(error);
        this.notifyRefreshBlocked();
        return false;
      }
      store = api.createStore(window.localStorage);
      window.__WeightNativeBridge.setError(null);
      showNotice('');
      render();
      return true;
    },
    hasUnsavedDraft() {
      const date = $('record-date').value;
      const profileDialog = $('profile-dialog');
      const groupDialog = $('group-dialog');
      return editingRecord !== null || Boolean($('record-weight').value.trim() || $('record-note').value.trim() || (date && date !== today())) ||
        Boolean(profileDialog.open && ($('profile-name').value.trim() || $('profile-goal').value.trim())) ||
        Boolean(groupDialog.open && $('group-name').value.trim());
    },
    notifyRefreshBlocked() {
      showNotice('当前有未保存输入，已保留输入内容。先保存/取消编辑，或点击“清空输入”，再重读本机记录。');
    },
    activate(view) {
      const targets = { overview: 'overview', 'new-entry': 'new-entry', record: 'new-entry', entry: 'new-entry', history: 'history', groups: 'groups' };
      const target = $(targets[view] || view || 'overview');
      if (target && typeof target.scrollIntoView === 'function') target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return Boolean(target);
    },
    getSummary() {
      const user = store.getActiveUser();
      const records = user ? store.listRecords(user.id) : [];
      const first = records[0], last = records.at(-1);
      return {
        latest: last ? { date: last.date, weight: last.weight } : null,
        goal: user?.goal ?? null,
        change: first && last ? Math.round((last.weight - first.weight) * 10) / 10 : null,
        count: records.length,
        user: user ? { name: user.name, id: user.id } : null,
        error: null,
      };
    },
  });
})();

  };
  window.__WeightNativeBootstrap();
})();

})();