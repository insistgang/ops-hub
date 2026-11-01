        // 数据备份 / 单文件携带 / 跨设备迁移 系统
        // ============================================
        let fileHandle = null;
        let jsonFileHandle = null;
        let lastSavedDataSnapshot = null;
        let lastSavedJsonDataSnapshot = null;
        let autoSaveEnabled = true;
        let isSaving = false;
        let isSavingJson = false;
        let localSyncAvailable = false;
        let localSyncReady = false;
        let localSyncApplyingRemote = false;
        let localSyncSaveTimer = null;
        let localSyncPollTimer = null;
        let localSyncDirtyTimer = null;
        let localSyncUploading = false;
        let localSyncUploadAgain = false;
	        let localSyncLastUpdatedAt = null;
	        let localSyncLastSyncedSnapshot = null;
	        let localSyncLastRevision = null;
	        let localSyncChangedKeys = new Set();
	        let localSyncDeletedKeys = new Set();
	        let localSyncSupportsPatch = false;
	        let localSyncShouldSeed = false;
	        let localSyncHasRemoteData = false;
	        let localSyncConflict = null;
	        let localSyncForceReplace = false;

        const embeddedRestoreSignatureKey = '__vitaflow_embedded_restore_signature';
	        const localSyncApiPath = '/api/data';
	        const localSyncKeyStorageName = '__vitaflow_sync_key';
	        const localSyncPendingStorageName = '__vitaflow_sync_pending';
	        const localSyncDirtyFallbackIntervalMs = 30000;
	        const structuredBackupDataKeys = new Set([
	            'vitaflow_accounts', 'vitaflow_ads', 'vitaflow_ai_chat', 'vitaflow_analysis',
	            'vitaflow_calendar', 'vitaflow_canvas', 'vitaflow_completed', 'vitaflow_deepseek',
	            'vitaflow_deepseek_categories', 'vitaflow_deepseek_docs', 'vitaflow_emotion_activities',
	            'vitaflow_emotion_notes', 'vitaflow_film', 'vitaflow_film_categories',
	            'vitaflow_film_notes', 'vitaflow_food', 'vitaflow_happiness', 'vitaflow_idea_vault',
	            'vitaflow_ideas', 'vitaflow_ip', 'vitaflow_lazyy', 'vitaflow_learning_categories',
	            'vitaflow_learning_notes', 'vitaflow_literature', 'vitaflow_literature_categories',
	            'vitaflow_literature_docs', 'vitaflow_meaning_quiz', 'vitaflow_media_calendar',
	            'vitaflow_novel', 'vitaflow_novel_outlines', 'vitaflow_pomodoro', 'vitaflow_reading',
	            'vitaflow_reading_categories', 'vitaflow_reading_notes', 'vitaflow_reflection',
	            'vitaflow_reviews', 'vitaflow_rituals', 'vitaflow_sandwich', 'vitaflow_skills',
	            'vitaflow_streak', 'vitaflow_streak_records', 'vitaflow_support', 'vitaflow_todos',
	            'vitaflow_values', 'vitaflow_water', 'vitaflow_writing'
	        ]);

        // 访问口令：优先取地址栏 ?key=，并存入 localStorage 作为后备（该键不以 vitaflow_ 开头，不会被同步出去）
        function getLocalSyncKey() {
            try {
                const search = (typeof location !== 'undefined' && location.search) ? location.search : '';
                const match = search.match(/[?&]key=([^&]+)/);
                if (match) {
                    const key = decodeURIComponent(match[1]);
                    try { localStorage.setItem(localSyncKeyStorageName, key); } catch (e) {}
                    return key;
                }
            } catch (e) {}
            try { return localStorage.getItem(localSyncKeyStorageName) || ''; } catch (e) {}
            return '';
        }

	        function localSyncHeaders(extra) {
	            const headers = Object.assign({}, extra || {});
	            const key = getLocalSyncKey();
	            if (key) headers['x-vitaflow-token'] = key;
	            return headers;
	        }

	        function setLocalSyncPending(pending) {
	            try {
	                if (pending) localStorage.setItem(localSyncPendingStorageName, '1');
	                else localStorage.removeItem(localSyncPendingStorageName);
	            } catch (e) {
	                console.warn('记录本地同步待处理状态失败:', e);
	            }
	        }

	        function hasLocalSyncPending() {
	            try {
	                return localStorage.getItem(localSyncPendingStorageName) === '1';
	            } catch (e) {
	                return false;
	            }
	        }

	        function getEmbeddedDataSignature(data) {
            const embeddedJson = JSON.stringify(data || {});
            let hash = 0;
            for (let i = 0; i < embeddedJson.length; i++) {
                hash = ((hash << 5) - hash + embeddedJson.charCodeAt(i)) | 0;
            }
            return 'v2:' + embeddedJson.length + ':' + hash;
        }

	        function showLocalSyncDiagnostic(message, isError = false) {
            if (typeof document === 'undefined') return;
            let el = document.getElementById('localSyncDiagnostic');
            if (!el && document.body) {
                el = document.createElement('div');
                el.id = 'localSyncDiagnostic';
                el.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:9999;max-width:280px;padding:9px 12px;border-radius:14px;font-size:12px;line-height:1.4;box-shadow:0 8px 24px rgba(40,20,50,.18);background:rgba(255,255,255,.95);border:1px solid rgba(180,140,190,.35);color:#5a3a66;';
                document.body.appendChild(el);
            }
            if (el) {
                el.textContent = message;
                el.style.borderColor = isError ? 'rgba(220,70,70,.45)' : 'rgba(120,170,120,.45)';
                el.style.color = isError ? '#9f2f2f' : '#38633b';
            }
        }

        function markCurrentEmbeddedDataAsRestored() {
            try {
                if (typeof EMBEDDED_DATA !== 'undefined' && EMBEDDED_DATA && typeof EMBEDDED_DATA === 'object') {
                    localStorage.setItem(embeddedRestoreSignatureKey, getEmbeddedDataSignature(EMBEDDED_DATA));
                }
	            } catch (e) {
	                console.warn('记录嵌入数据恢复状态失败:', e);
	            }
	        }

	        function showLocalSyncConflictDiagnostic() {
	            showLocalSyncDiagnostic('检测到其他设备的新版本，请选择保留哪一份。', true);
	            if (typeof document === 'undefined') return;
	            const el = document.getElementById('localSyncDiagnostic');
	            if (!el) return;
	            const actions = document.createElement('div');
	            actions.style.cssText = 'display:flex;gap:6px;margin-top:8px;';
	            const keepLocalButton = document.createElement('button');
	            keepLocalButton.type = 'button';
	            keepLocalButton.textContent = '保留本机';
	            keepLocalButton.style.cssText = 'border:1px solid #8db8d8;background:#eaf6ff;color:#245c82;padding:5px 8px;border-radius:6px;cursor:pointer;';
	            keepLocalButton.addEventListener('click', () => resolveLocalSyncConflict('local'));
	            const useRemoteButton = document.createElement('button');
	            useRemoteButton.type = 'button';
	            useRemoteButton.textContent = '采用服务器';
	            useRemoteButton.style.cssText = 'border:1px solid #b7c1c8;background:#fff;color:#46525a;padding:5px 8px;border-radius:6px;cursor:pointer;';
	            useRemoteButton.addEventListener('click', () => resolveLocalSyncConflict('remote'));
	            actions.appendChild(keepLocalButton);
	            actions.appendChild(useRemoteButton);
	            el.appendChild(actions);
	        }

        // 读取全部 localStorage 数据
        function getAllData() {
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('vitaflow_')) {
                    data[k] = localStorage.getItem(k);
                }
            }
            return data;
        }

	        function normalizeBackupData(data) {
            if (!data || typeof data !== 'object' || Array.isArray(data)) {
                throw new Error('JSON 根内容必须是对象');
            }
            const normalized = {};
            Object.keys(data).forEach(k => {
                if (k.startsWith('vitaflow_')) {
                    normalized[k] = typeof data[k] === 'string' ? data[k] : JSON.stringify(data[k]);
                }
            });
	            return normalized;
	        }

	        function validateBackupData(normalized) {
	            Object.keys(normalized).forEach(key => {
	                if (!structuredBackupDataKeys.has(key)) return;
	                try {
	                    JSON.parse(normalized[key]);
	                } catch (error) {
	                    throw new Error(key + ' 数据格式损坏，已取消恢复');
	                }
	            });
	        }

	        function writeVitaFlowStorage(normalized) {
	            const currentKeys = [];
	            for (let i = 0; i < localStorage.length; i++) {
	                const key = localStorage.key(i);
	                if (key && key.startsWith('vitaflow_')) currentKeys.push(key);
	            }
	            currentKeys.forEach(key => localStorage.removeItem(key));
	            Object.keys(normalized).forEach(key => localStorage.setItem(key, normalized[key]));
	        }

	        function replaceVitaFlowStorage(normalized) {
	            validateBackupData(normalized);
	            const previousData = getAllData();
	            try {
	                writeVitaFlowStorage(normalized);
	            } catch (error) {
	                try {
	                    writeVitaFlowStorage(previousData);
	                } catch (rollbackError) {
	                    console.error('VitaFlow 数据回滚失败:', rollbackError);
	                    error.message += '；自动回滚也失败：' + rollbackError.message;
	                }
	                throw error;
	            }
	        }

	        function restoreBackupData(data) {
	            const normalized = normalizeBackupData(data);
	            const keys = Object.keys(normalized);
	            if (keys.length === 0) {
	                throw new Error('没有找到 vitaflow_ 开头的数据项');
	            }
	            const wasApplyingRemote = localSyncApplyingRemote;
	            localSyncApplyingRemote = true;
	            try {
	                replaceVitaFlowStorage(normalized);
	                markCurrentEmbeddedDataAsRestored();
	                lastSavedDataSnapshot = JSON.stringify(getAllData());
	                lastSavedJsonDataSnapshot = lastSavedDataSnapshot;
	            } finally {
	                localSyncApplyingRemote = wasApplyingRemote;
	            }
	            if (!wasApplyingRemote) {
	                localSyncChangedKeys.clear();
	                localSyncDeletedKeys.clear();
	                localSyncSupportsPatch = false;
	                setLocalSyncPending(true);
	                scheduleLocalSyncUpload(300);
	            }
	            return keys.length;
	        }

	        function installLocalSyncHook() {
	            if (Storage.prototype.__vitaflowSyncPatched) return;
	            const originalSetItem = Storage.prototype.setItem;
	            const originalRemoveItem = Storage.prototype.removeItem;
	            const originalClear = Storage.prototype.clear;
	            Storage.prototype.setItem = function(key, value) {
	                originalSetItem.call(this, key, value);
	                if (this === localStorage && key && key.startsWith('vitaflow_') && !localSyncApplyingRemote) {
	                    markLocalDataChanged(key);
	                }
	            };
	            Storage.prototype.removeItem = function(key) {
	                const shouldSync = this === localStorage && key && key.startsWith('vitaflow_') && !localSyncApplyingRemote;
	                originalRemoveItem.call(this, key);
	                if (shouldSync) {
	                    markLocalDataChanged(key, true);
	                }
	            };
	            Storage.prototype.clear = function() {
	                const removedKeys = [];
	                if (this === localStorage && !localSyncApplyingRemote) {
	                    for (let i = 0; i < localStorage.length; i++) {
	                        const key = localStorage.key(i);
	                        if (key && key.startsWith('vitaflow_')) removedKeys.push(key);
                    }
                }
                originalClear.call(this);
                removedKeys.forEach(key => markLocalDataChanged(key, true));
            };
            Storage.prototype.__vitaflowSyncPatched = true;
        }

        function isLocalSyncPossible() {
            return location.protocol === 'http:' || location.protocol === 'https:';
        }

        async function initLocalSync() {
            if (!isLocalSyncPossible()) return;
            localSyncHasRemoteData = false;
            localSyncConflict = null;
            try {
                const response = await fetch(localSyncApiPath + '?t=' + Date.now(), { cache: 'no-store', headers: localSyncHeaders() });
                if (response.status === 401) throw new Error('缺少访问口令，请用终端里带 ?key= 的地址打开本页面');
                if (!response.ok) throw new Error('HTTP ' + response.status);
                const payload = await response.json();
                const remoteData = normalizeBackupData(payload.data || payload);
                const hasPendingLocalChanges = hasLocalSyncPending();
                localSyncAvailable = true;
                localSyncSupportsPatch = !!(payload.features && payload.features.patch);
                localSyncLastUpdatedAt = payload.updatedAt || null;
                localSyncLastRevision = payload.revision || null;
                if (hasPendingLocalChanges) {
                    localSyncHasRemoteData = true;
                    localSyncLastSyncedSnapshot = JSON.stringify(remoteData);
                    handleLocalSyncConflict({ ...payload, data: remoteData });
                } else if (Object.keys(remoteData).length > 0) {
                    localSyncApplyingRemote = true;
                    try {
                        restoreBackupData(remoteData);
                    } finally {
                        localSyncApplyingRemote = false;
                    }
                    localSyncHasRemoteData = true;
                    localSyncLastSyncedSnapshot = JSON.stringify(getAllData());
                    updateSaveStatus('☁️ 已连接本地同步：' + Object.keys(remoteData).length + ' 项');
                    showLocalSyncDiagnostic('本地同步已连接：' + Object.keys(remoteData).length + ' 项');
                } else {
                    localSyncShouldSeed = true;
                    updateSaveStatus('☁️ 本地同步已连接，等待写入初始数据');
                    showLocalSyncDiagnostic('本地同步已连接：0 项');
                }
            } catch (e) {
                localSyncAvailable = false;
                showLocalSyncDiagnostic('本地同步未连接：' + (e && e.message ? e.message : '无法访问 /api/data'), true);
            }
        }

	        function enableLocalSyncAfterInitialRender() {
	            if (!localSyncAvailable) return;
	            localSyncReady = true;
            if (localSyncLastSyncedSnapshot === null) {
                localSyncLastSyncedSnapshot = JSON.stringify(getAllData());
            }
            if (localSyncShouldSeed) {
                setLocalSyncPending(true);
                scheduleLocalSyncUpload();
            }
            startLocalSyncDirtyWatcher();
            startLocalSyncPolling();
        }

	        function markLocalDataChanged(key, deleted = false) {
	            if (key && key.startsWith('vitaflow_')) {
	                if (deleted) {
	                    localSyncChangedKeys.delete(key);
	                    localSyncDeletedKeys.add(key);
                } else {
                    localSyncDeletedKeys.delete(key);
	                    localSyncChangedKeys.add(key);
	                }
	                setLocalSyncPending(true);
	            }
	            scheduleLocalSyncUpload(300);
	        }

        function syncLocalDataNow(key, deleted = false) {
            if (key && key.startsWith('vitaflow_')) {
                if (deleted) {
                    localSyncChangedKeys.delete(key);
                    localSyncDeletedKeys.add(key);
                } else {
                    localSyncDeletedKeys.delete(key);
                    localSyncChangedKeys.add(key);
                }
                setLocalSyncPending(true);
            }
	            if (!localSyncAvailable || !localSyncReady || localSyncApplyingRemote) {
	                scheduleLocalSyncUpload(300);
	                return;
	            }
	            clearTimeout(localSyncSaveTimer);
	            uploadLocalSyncData();
	        }

	        function scheduleLocalSyncUpload(delay = 1200) {
	            if (!localSyncAvailable || !localSyncReady || localSyncConflict) return;
            clearTimeout(localSyncSaveTimer);
            localSyncSaveTimer = setTimeout(uploadLocalSyncData, delay);
        }

	        function reconcileLocalSyncUpload(uploadedData, serverData) {
            const remoteData = normalizeBackupData(serverData);
            const currentData = getAllData();
            const concurrentKeys = new Set();
            const comparedKeys = new Set([...Object.keys(uploadedData), ...Object.keys(currentData)]);

            comparedKeys.forEach(key => {
                if (uploadedData[key] !== currentData[key]) concurrentKeys.add(key);
            });

            const reconciledData = { ...remoteData };
            concurrentKeys.forEach(key => {
                if (Object.prototype.hasOwnProperty.call(currentData, key)) {
                    reconciledData[key] = currentData[key];
                } else {
                    delete reconciledData[key];
                }
            });

            const beforeApply = JSON.stringify(currentData);
            const wasApplyingRemote = localSyncApplyingRemote;
            localSyncApplyingRemote = true;
            try {
                replaceVitaFlowStorage(reconciledData);
            } finally {
                localSyncApplyingRemote = wasApplyingRemote;
            }

            localSyncChangedKeys.clear();
            localSyncDeletedKeys.clear();
            concurrentKeys.forEach(key => {
                if (Object.prototype.hasOwnProperty.call(currentData, key)) {
                    localSyncChangedKeys.add(key);
                } else {
                    localSyncDeletedKeys.add(key);
                }
            });

            localSyncLastSyncedSnapshot = concurrentKeys.size > 0
                ? JSON.stringify(remoteData)
                : JSON.stringify(getAllData());
	            return beforeApply !== JSON.stringify(getAllData());
	        }

        function handleLocalSyncConflict(payload) {
            const remoteData = normalizeBackupData(payload.data || {});
            localSyncConflict = {
                remoteData,
                revision: payload.revision || null,
                updatedAt: payload.updatedAt || null
            };
            localSyncUploadAgain = false;
            setLocalSyncPending(true);
            updateSaveStatus('⚠️ 检测到同步冲突，等待选择保留版本');
            showLocalSyncConflictDiagnostic();
        }

        async function resolveLocalSyncConflict(choice) {
            if (!localSyncConflict) return;
            const conflict = localSyncConflict;
            if (choice === 'remote') {
                const wasApplyingRemote = localSyncApplyingRemote;
                localSyncApplyingRemote = true;
                try {
                    replaceVitaFlowStorage(conflict.remoteData);
                } finally {
                    localSyncApplyingRemote = wasApplyingRemote;
                }
                localSyncLastRevision = conflict.revision;
                localSyncLastUpdatedAt = conflict.updatedAt;
                localSyncLastSyncedSnapshot = JSON.stringify(getAllData());
                localSyncChangedKeys.clear();
                localSyncDeletedKeys.clear();
                localSyncConflict = null;
                localSyncForceReplace = false;
                localSyncHasRemoteData = Object.keys(conflict.remoteData).length > 0;
                setLocalSyncPending(false);
                lastSavedDataSnapshot = localSyncLastSyncedSnapshot;
                lastSavedJsonDataSnapshot = localSyncLastSyncedSnapshot;
                if (typeof refreshVisibleData === 'function') refreshVisibleData();
                updateSaveStatus('☁️ 已采用服务器版本');
                showLocalSyncDiagnostic('已采用服务器版本，恢复自动同步');
                return;
            }
            if (choice !== 'local') return;
            if (!conflict.revision) {
                showLocalSyncDiagnostic('服务器未返回版本号，暂时无法安全覆盖', true);
                return;
            }
            localSyncLastRevision = conflict.revision;
            localSyncLastUpdatedAt = conflict.updatedAt;
            localSyncLastSyncedSnapshot = JSON.stringify(conflict.remoteData);
            localSyncConflict = null;
            localSyncForceReplace = true;
            setLocalSyncPending(true);
            showLocalSyncDiagnostic('正在用本机版本覆盖服务器…');
            await uploadLocalSyncData();
        }

        async function uploadLocalSyncData() {
            if (!localSyncAvailable || localSyncApplyingRemote || localSyncConflict) return;
            if (localSyncUploading) {
                localSyncUploadAgain = true;
                return;
            }
            localSyncUploading = true;
            try {
                const data = getAllData();
                const body = { baseRevision: localSyncLastRevision };
                if (!localSyncForceReplace && localSyncSupportsPatch && (localSyncChangedKeys.size > 0 || localSyncDeletedKeys.size > 0)) {
                    body.patch = {};
                    localSyncChangedKeys.forEach(key => {
                        if (Object.prototype.hasOwnProperty.call(data, key)) body.patch[key] = data[key];
                    });
                    localSyncDeletedKeys.forEach(key => {
                        body.patch[key] = null;
                    });
                } else {
                    body.data = data;
                }
                const response = await fetch(localSyncApiPath, {
                    method: 'POST',
                    headers: localSyncHeaders({ 'content-type': 'application/json' }),
                    body: JSON.stringify(body)
                });
                let payload = {};
                try {
                    payload = await response.json();
                } catch (error) {
                    if (response.ok) throw error;
                }
                if (response.status === 409 || response.status === 428) {
                    handleLocalSyncConflict(payload);
                    return;
                }
                if (!response.ok) throw new Error(payload.error || ('HTTP ' + response.status));
                localSyncSupportsPatch = !!(payload.features && payload.features.patch);
                localSyncLastUpdatedAt = payload.updatedAt || localSyncLastUpdatedAt;
                localSyncLastRevision = payload.revision || localSyncLastRevision;
                let appliedServerMerge = false;
                if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
                    appliedServerMerge = reconcileLocalSyncUpload(data, payload.data);
                } else {
                    localSyncLastSyncedSnapshot = JSON.stringify(data);
                    localSyncChangedKeys.clear();
                    localSyncDeletedKeys.clear();
                }
                localSyncShouldSeed = false;
                localSyncForceReplace = false;
                if (appliedServerMerge && typeof refreshVisibleData === 'function') refreshVisibleData();
                if (localSyncChangedKeys.size > 0 || localSyncDeletedKeys.size > 0) {
                    localSyncUploadAgain = true;
                } else {
                    setLocalSyncPending(false);
                }
                updateSaveStatus('☁️ 已同步到本地服务 ' + new Date().toLocaleTimeString('zh-CN'));
                showLocalSyncDiagnostic('已同步到本地 JSON：' + new Date().toLocaleTimeString('zh-CN'));
            } catch (e) {
                updateSaveStatus('⚠️ 本地同步失败，已保存在当前浏览器');
                showLocalSyncDiagnostic('本地同步失败：' + (e && e.message ? e.message : '请求失败'), true);
            } finally {
                localSyncUploading = false;
                if (localSyncUploadAgain && !localSyncConflict) {
                    localSyncUploadAgain = false;
                    scheduleLocalSyncUpload(300);
                }
            }
        }

        function startLocalSyncDirtyWatcher() {
            if (localSyncDirtyTimer) return;
            localSyncDirtyTimer = setInterval(checkLocalSyncDirty, localSyncDirtyFallbackIntervalMs);
        }

        function checkLocalSyncDirty() {
            if (!localSyncAvailable || !localSyncReady || localSyncApplyingRemote || localSyncConflict) return;
            const currentSnapshot = JSON.stringify(getAllData());
            if (localSyncLastSyncedSnapshot === null) {
                localSyncLastSyncedSnapshot = currentSnapshot;
                return;
            }
            if (currentSnapshot !== localSyncLastSyncedSnapshot) {
                setLocalSyncPending(true);
                if (localSyncChangedKeys.size === 0 && localSyncDeletedKeys.size === 0) {
                    localSyncSupportsPatch = false;
                }
                scheduleLocalSyncUpload();
            }
        }

        function startLocalSyncPolling() {
            if (localSyncPollTimer) return;
            localSyncPollTimer = setInterval(fetchLocalSyncUpdates, 10000);
        }

        async function fetchLocalSyncUpdates() {
            if (!localSyncAvailable || !localSyncReady || localSyncApplyingRemote || localSyncConflict || localSyncUploading) return;
            const snapshotAtRequest = JSON.stringify(getAllData());
            const revisionAtRequest = localSyncLastRevision;
            if (localSyncLastSyncedSnapshot && snapshotAtRequest !== localSyncLastSyncedSnapshot) {
                setLocalSyncPending(true);
                scheduleLocalSyncUpload(300);
                return;
            }
            try {
                const query = new URLSearchParams({ t: String(Date.now()) });
                if (localSyncLastRevision) query.set('revision', localSyncLastRevision);
                const response = await fetch(localSyncApiPath + '?' + query.toString(), { cache: 'no-store', headers: localSyncHeaders() });
                if (response.status === 304) return;
                if (!response.ok) throw new Error('HTTP ' + response.status);
                const payload = await response.json();
                // A local edit or upload may have happened while the request was in flight.
                // Never replace that newer state with the older polling response.
                if (JSON.stringify(getAllData()) !== snapshotAtRequest) {
                    setLocalSyncPending(true);
                    scheduleLocalSyncUpload(300);
                    return;
                }
                if (localSyncUploading || localSyncConflict || localSyncLastRevision !== revisionAtRequest) return;
                localSyncSupportsPatch = !!(payload.features && payload.features.patch);
                if (payload.revision && payload.revision === localSyncLastRevision) return;
                if (!payload.revision && (!payload.updatedAt || payload.updatedAt === localSyncLastUpdatedAt)) return;
                const remoteData = normalizeBackupData(payload.data || {});
                if (JSON.stringify(remoteData) === JSON.stringify(getAllData())) {
                    localSyncLastUpdatedAt = payload.updatedAt;
                    localSyncLastRevision = payload.revision || localSyncLastRevision;
                    localSyncLastSyncedSnapshot = JSON.stringify(getAllData());
                    setLocalSyncPending(false);
                    return;
                }
                localSyncApplyingRemote = true;
                try {
                    restoreBackupData(remoteData);
                } finally {
                    localSyncApplyingRemote = false;
                }
                localSyncLastUpdatedAt = payload.updatedAt;
                localSyncLastRevision = payload.revision || localSyncLastRevision;
                localSyncLastSyncedSnapshot = JSON.stringify(getAllData());
                setLocalSyncPending(false);
                refreshVisibleData();
                updateSaveStatus('☁️ 已拉取其他设备更新 ' + new Date().toLocaleTimeString('zh-CN'));
            } catch (e) {
                console.warn('拉取其他设备更新失败:', e);
                showLocalSyncDiagnostic('拉取其他设备更新失败：' + (e && e.message ? e.message : '请求失败'), true);
            }
        }

