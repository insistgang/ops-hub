        const mediaDocModules = {
            writing: {
                storageKey: 'vitaflow_writing',
                createInputId: 'writingTitleInput',
                titleInputId: 'writingDocTitle',
                contentInputId: 'writingContent',
                listId: 'writingDocsList',
                openFunctionName: 'openWritingDoc',
                emptyText: '暂无文档，点击上方创建第一篇',
                createTitleMessage: '请输入文档标题',
                saveTitleMessage: '请输入标题',
                savedMessage: '✅ 文档已保存',
                showStatus: true,
                showUpdatedDate: true
            },
            lazyy: {
                storageKey: 'vitaflow_lazyy',
                createInputId: 'lazyyTitleInput',
                titleInputId: 'lazyyDocTitle',
                contentInputId: 'lazyyContent',
                listId: 'lazyyDocsList',
                openFunctionName: 'openLazyyDoc',
                emptyText: '暂无想法记录，开始记录吧',
                createTitleMessage: '请输入想法标题',
                savedMessage: '✅ 已保存'
            },
            ads: {
                storageKey: 'vitaflow_ads',
                createInputId: 'adsTitleInput',
                titleInputId: 'adsDocTitle',
                contentInputId: 'adsContent',
                listId: 'adsDocsList',
                openFunctionName: 'openAdsDoc',
                emptyText: '暂无广告记录',
                createTitleMessage: '请输入记录标题',
                savedMessage: '✅ 已保存'
            },
            ideas: {
                storageKey: 'vitaflow_ideas',
                createInputId: 'ideasTitleInput',
                titleInputId: 'ideasDocTitle',
                contentInputId: 'ideasContent',
                listId: 'ideasDocsList',
                openFunctionName: 'openIdeasDoc',
                emptyText: '暂无灵感记录',
                createTitleMessage: '请输入灵感标题',
                savedMessage: '✅ 已保存'
            }
        };

        function getMediaDocModule(moduleName) {
            const config = mediaDocModules[moduleName];
            if (!config) throw new Error('未知文档模块：' + moduleName);
            return config;
        }

        function readMediaDocs(config) {
            return JSON.parse(localStorage.getItem(config.storageKey) || '[]');
        }

        function writeMediaDocs(config, docs) {
            localStorage.setItem(config.storageKey, JSON.stringify(docs));
        }

        function formatMediaDocMeta(doc, config) {
            const created = new Date(doc.created).toLocaleDateString();
            if (!config.showUpdatedDate) return created;
            return '创建于 ' + created + ' | 更新于 ' + new Date(doc.updated).toLocaleDateString();
        }

        function renderMediaDocCard(doc, config) {
            const status = config.showStatus ? `<span class="doc-status ${doc.content ? 'active' : 'pending'}">${doc.content ? '已写' : '草稿'}</span>` : '';
            return `
                <div class="doc-card" onclick="${config.openFunctionName}(${inlineHandlerArg(doc.id)})">
                    <div class="doc-title">
                        <span>${escapeHtml(doc.title)}</span>
                        ${status}
                    </div>
                    <div class="doc-preview">${escapeHtml(doc.content) || '暂无内容'}</div>
                    <div class="doc-meta">${formatMediaDocMeta(doc, config)}</div>
                </div>
            `;
        }

        function createMediaDoc(moduleName) {
            const config = getMediaDocModule(moduleName);
            const titleInput = document.getElementById(config.createInputId);
            const title = titleInput.value.trim();
            if (!title) { alert(config.createTitleMessage); return; }
            const docs = readMediaDocs(config);
            const now = new Date().toISOString();
            docs.unshift({ id: Date.now(), title, content: '', created: now, updated: now });
            writeMediaDocs(config, docs);
            titleInput.value = '';
            renderMediaDocs(moduleName);
            updateMediaCounts();
        }

        function renderMediaDocs(moduleName) {
            const config = getMediaDocModule(moduleName);
            const docs = readMediaDocs(config);
            const listEl = document.getElementById(config.listId);
            if (docs.length === 0) {
                listEl.innerHTML = `<div style="text-align: center; color: #aa9a9a; padding: 30px;">${config.emptyText}</div>`;
                return;
            }
            listEl.innerHTML = docs.map(doc => renderMediaDocCard(doc, config)).join('');
        }

        function openMediaDoc(moduleName, id) {
            const config = getMediaDocModule(moduleName);
            const docs = readMediaDocs(config);
            const doc = docs.find(d => d.id === id);
            if (doc) {
                const contentInput = document.getElementById(config.contentInputId);
                document.getElementById(config.titleInputId).value = doc.title;
                contentInput.value = doc.content;
                contentInput.dataset.docId = id;
                switchMediaTab(moduleName, 'editor');
            }
        }

        function saveMediaDoc(moduleName) {
            const config = getMediaDocModule(moduleName);
            const title = document.getElementById(config.titleInputId).value.trim();
            const contentInput = document.getElementById(config.contentInputId);
            const content = contentInput.value;
            const docId = parseInt(contentInput.dataset.docId);
            if (config.saveTitleMessage && !title) { alert(config.saveTitleMessage); return; }
            const docs = readMediaDocs(config);
            const index = docs.findIndex(d => d.id === docId);
            if (index >= 0) {
                docs[index].title = title;
                docs[index].content = content;
                docs[index].updated = new Date().toISOString();
                writeMediaDocs(config, docs);
                alert(config.savedMessage);
                switchMediaTab(moduleName, 'list');
                renderMediaDocs(moduleName);
            }
        }

        function createWriting() { createMediaDoc('writing'); }
        function renderWritingDocs() { renderMediaDocs('writing'); }
        function openWritingDoc(id) { openMediaDoc('writing', id); }
        function saveWriting() { saveMediaDoc('writing'); }
        function createLazyy() { createMediaDoc('lazyy'); }
        function renderLazyyDocs() { renderMediaDocs('lazyy'); }
        function openLazyyDoc(id) { openMediaDoc('lazyy', id); }
        function saveLazyy() { saveMediaDoc('lazyy'); }
        function createAds() { createMediaDoc('ads'); }
        function renderAdsDocs() { renderMediaDocs('ads'); }
        function openAdsDoc(id) { openMediaDoc('ads', id); }
        function saveAds() { saveMediaDoc('ads'); }
        function createIdeas() { createMediaDoc('ideas'); }
        function renderIdeasDocs() { renderMediaDocs('ideas'); }
        function openIdeasDoc(id) { openMediaDoc('ideas', id); }
        function saveIdeas() { saveMediaDoc('ideas'); }

