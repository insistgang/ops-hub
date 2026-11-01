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
