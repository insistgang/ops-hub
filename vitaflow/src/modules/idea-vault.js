        const ideaVaultStorageKey = 'vitaflow_idea_vault';
        const ideaVaultDefaultMotifs = ['AI 产品想法', '个人知识管理', '内容创作', '项目灵感', '反复思考的问题'];
        const ideaVaultActionTypes = ['问题', '假设', '待验证点', '行动任务', '文章/产品/方案骨架'];

        function generateIdeaVaultId() {
            return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        }

        function normalizeIdeaVaultId(value) {
            const id = String(value || '');
            return /^[a-z0-9_-]+$/i.test(id) ? id : generateIdeaVaultId();
        }

        function normalizeIdeaVaultText(value) {
            return value === null || value === undefined ? '' : String(value);
        }

        function createDefaultIdeaVault() {
            const now = new Date().toISOString();
            return {
                fragments: [],
                motifs: ideaVaultDefaultMotifs.map(name => ({ id: generateIdeaVaultId(), name, created: now })),
                actions: []
            };
        }

        function normalizeIdeaVault(vault) {
            const now = new Date().toISOString();
            const rawMotifs = Array.isArray(vault?.motifs) ? vault.motifs : [];
            const motifs = rawMotifs
                .map(motif => ({
                    id: normalizeIdeaVaultId(motif.id),
                    name: normalizeIdeaVaultText(motif.name).trim(),
                    created: motif.created || now
                }))
                .filter(motif => motif.name);

            ideaVaultDefaultMotifs.forEach(name => {
                if (!motifs.some(motif => motif.name === name)) {
                    motifs.push({ id: generateIdeaVaultId(), name, created: now });
                }
            });

            const fragments = (Array.isArray(vault?.fragments) ? vault.fragments : [])
                .map(fragment => ({
                    id: normalizeIdeaVaultId(fragment.id),
                    idea: normalizeIdeaVaultText(fragment.idea).trim(),
                    trigger: normalizeIdeaVaultText(fragment.trigger).trim(),
                    motif: normalizeIdeaVaultText(fragment.motif).trim(),
                    uncertainty: normalizeIdeaVaultText(fragment.uncertainty).trim(),
                    nextStep: normalizeIdeaVaultText(fragment.nextStep).trim(),
                    status: fragment.status === 'promoted' ? 'promoted' : 'inbox',
                    created: fragment.created || now,
                    updated: fragment.updated || fragment.created || now
                }))
                .filter(fragment => fragment.idea);

            const actions = (Array.isArray(vault?.actions) ? vault.actions : [])
                .map(action => ({
                    id: normalizeIdeaVaultId(action.id),
                    sourceId: action.sourceId ? normalizeIdeaVaultId(action.sourceId) : '',
                    type: ideaVaultActionTypes.includes(action.type) ? action.type : '待验证点',
                    title: normalizeIdeaVaultText(action.title).trim(),
                    nextAction: normalizeIdeaVaultText(action.nextAction).trim(),
                    status: action.status === 'done' ? 'done' : 'open',
                    created: action.created || now,
                    updated: action.updated || action.created || now
                }))
                .filter(action => action.title);

            return { fragments, motifs, actions };
        }

        function readIdeaVault() {
            const raw = localStorage.getItem(ideaVaultStorageKey);
            if (!raw) return createDefaultIdeaVault();
            try {
                return normalizeIdeaVault(JSON.parse(raw));
            } catch (e) {
                return createDefaultIdeaVault();
            }
        }

        function saveIdeaVault(vault) {
            localStorage.setItem(ideaVaultStorageKey, JSON.stringify(normalizeIdeaVault(vault)));
            updateMediaCounts();
        }

        function ensureIdeaVaultStorage() {
            if (!localStorage.getItem(ideaVaultStorageKey)) {
                localStorage.setItem(ideaVaultStorageKey, JSON.stringify(createDefaultIdeaVault()));
            }
        }

        function formatIdeaVaultDate(value) {
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return '';
            return date.toLocaleDateString();
        }

        function getIdeaVaultFieldValue(id) {
            const field = document.getElementById(id);
            return field ? field.value.trim() : '';
        }

        function setIdeaVaultFieldValue(id, value) {
            const field = document.getElementById(id);
            if (field) field.value = value;
        }

        function createIdeaVaultFragment() {
            const idea = getIdeaVaultFieldValue('ideaVaultIdea');
            if (!idea) {
                alert('先写一句原话就行');
                return;
            }

            const vault = readIdeaVault();
            const now = new Date().toISOString();
            const motif = getIdeaVaultFieldValue('ideaVaultMotif');

            if (motif && !vault.motifs.some(item => item.name === motif)) {
                vault.motifs.push({ id: generateIdeaVaultId(), name: motif, created: now });
            }

            vault.fragments.unshift({
                id: generateIdeaVaultId(),
                idea,
                trigger: getIdeaVaultFieldValue('ideaVaultTrigger'),
                motif,
                uncertainty: getIdeaVaultFieldValue('ideaVaultUncertainty'),
                nextStep: getIdeaVaultFieldValue('ideaVaultNextStep'),
                status: 'inbox',
                created: now,
                updated: now
            });

            saveIdeaVault(vault);
            ['ideaVaultIdea', 'ideaVaultTrigger', 'ideaVaultMotif', 'ideaVaultUncertainty', 'ideaVaultNextStep'].forEach(id => setIdeaVaultFieldValue(id, ''));
            renderIdeaVault();
        }

        function addIdeaVaultMotif() {
            const name = getIdeaVaultFieldValue('ideaVaultMotifName');
            if (!name) {
                alert('请输入母题名称');
                return;
            }

            const vault = readIdeaVault();
            if (vault.motifs.some(motif => motif.name === name)) {
                alert('这个母题已经存在');
                return;
            }

            vault.motifs.push({ id: generateIdeaVaultId(), name, created: new Date().toISOString() });
            saveIdeaVault(vault);
            setIdeaVaultFieldValue('ideaVaultMotifName', '');
            renderIdeaVault();
        }

        function promoteIdeaVaultFragment(id) {
            const vault = readIdeaVault();
            const fragment = vault.fragments.find(item => item.id === id);
            if (!fragment) return;

            setIdeaVaultFieldValue('ideaVaultActionSource', fragment.id);
            setIdeaVaultFieldValue('ideaVaultActionType', fragment.nextStep ? '行动任务' : '待验证点');
            setIdeaVaultFieldValue('ideaVaultActionTitle', fragment.nextStep || fragment.idea);
            setIdeaVaultFieldValue('ideaVaultActionNext', fragment.nextStep || '');

            const titleInput = document.getElementById('ideaVaultActionTitle');
            if (titleInput) titleInput.focus();
        }

        function createIdeaVaultAction() {
            const vault = readIdeaVault();
            const sourceId = getIdeaVaultFieldValue('ideaVaultActionSource');
            const source = vault.fragments.find(fragment => fragment.id === sourceId);
            const type = getIdeaVaultFieldValue('ideaVaultActionType') || '待验证点';
            const fallbackTitle = source ? (source.nextStep || source.idea) : '';
            const title = getIdeaVaultFieldValue('ideaVaultActionTitle') || fallbackTitle;

            if (!title) {
                alert('请输入可推进条目');
                return;
            }

            const now = new Date().toISOString();
            vault.actions.unshift({
                id: generateIdeaVaultId(),
                sourceId: source ? source.id : '',
                type,
                title,
                nextAction: getIdeaVaultFieldValue('ideaVaultActionNext'),
                status: 'open',
                created: now,
                updated: now
            });

            if (source) {
                source.status = 'promoted';
                source.updated = now;
            }

            saveIdeaVault(vault);
            setIdeaVaultFieldValue('ideaVaultActionSource', '');
            setIdeaVaultFieldValue('ideaVaultActionTitle', '');
            setIdeaVaultFieldValue('ideaVaultActionNext', '');
            renderIdeaVault();
        }

        function deleteIdeaVaultFragment(id) {
            if (!confirm('删除这条碎片想法？')) return;
            const vault = readIdeaVault();
            vault.fragments = vault.fragments.filter(fragment => fragment.id !== id);
            vault.actions = vault.actions.filter(action => action.sourceId !== id);
            saveIdeaVault(vault);
            renderIdeaVault();
        }

        function deleteIdeaVaultAction(id) {
            if (!confirm('删除这个可推进条目？')) return;
            const vault = readIdeaVault();
            vault.actions = vault.actions.filter(action => action.id !== id);
            saveIdeaVault(vault);
            renderIdeaVault();
        }

        function toggleIdeaVaultAction(id) {
            const vault = readIdeaVault();
            const action = vault.actions.find(item => item.id === id);
            if (!action) return;
            action.status = action.status === 'done' ? 'open' : 'done';
            action.updated = new Date().toISOString();
            saveIdeaVault(vault);
            renderIdeaVault();
        }

        function renderIdeaVaultOptions(vault) {
            const motifList = document.getElementById('ideaVaultMotifList');
            if (motifList) {
                motifList.innerHTML = vault.motifs.map(motif => `<option value="${escapeHtml(motif.name)}"></option>`).join('');
            }

            const sourceSelect = document.getElementById('ideaVaultActionSource');
            if (sourceSelect) {
                const options = vault.fragments.map(fragment => {
                    const status = fragment.status === 'promoted' ? '已推进' : '收集箱';
                    return `<option value="${escapeHtml(fragment.id)}">${escapeHtml(fragment.idea.slice(0, 36))} · ${status}</option>`;
                }).join('');
                sourceSelect.innerHTML = `<option value="">不绑定来源</option>${options}`;
            }
        }

        function renderIdeaVaultInbox(vault) {
            const list = document.getElementById('ideaVaultInbox');
            if (!list) return;

            const inbox = vault.fragments.filter(fragment => fragment.status !== 'promoted');
            const count = document.getElementById('ideaVaultInboxCount');
            if (count) count.textContent = inbox.length + ' 条';

            if (inbox.length === 0) {
                list.innerHTML = '<div class="idea-vault-empty">还没有碎片，先写一句原话。</div>';
                return;
            }

            list.innerHTML = inbox.map(fragment => `
                <div class="idea-vault-item">
                    <div class="idea-vault-item-title">${escapeHtml(fragment.idea)}</div>
                    <div class="idea-vault-meta">
                        ${fragment.motif ? `<span class="idea-vault-chip">${escapeHtml(fragment.motif)}</span>` : '<span class="idea-vault-chip">未归组</span>'}
                        <span>${formatIdeaVaultDate(fragment.created)}</span>
                    </div>
                    ${fragment.trigger ? `<div class="idea-vault-line"><strong>触发：</strong>${escapeHtml(fragment.trigger)}</div>` : ''}
                    ${fragment.uncertainty ? `<div class="idea-vault-line"><strong>不确定：</strong>${escapeHtml(fragment.uncertainty)}</div>` : ''}
                    ${fragment.nextStep ? `<div class="idea-vault-line"><strong>下一步：</strong>${escapeHtml(fragment.nextStep)}</div>` : ''}
                    <div class="idea-vault-actions">
                        <button class="idea-vault-small-btn" onclick="promoteIdeaVaultFragment(${inlineHandlerArg(fragment.id)})">推进</button>
                        <button class="idea-vault-small-btn danger" onclick="deleteIdeaVaultFragment(${inlineHandlerArg(fragment.id)})">删除</button>
                    </div>
                </div>
            `).join('');
        }

        function renderIdeaVaultMotifs(vault) {
            const list = document.getElementById('ideaVaultMotifs');
            if (!list) return;

            const motifNames = vault.motifs.map(motif => motif.name);
            const ungrouped = vault.fragments.filter(fragment => !fragment.motif).length;
            const motifRows = motifNames.map(name => {
                const fragments = vault.fragments.filter(fragment => fragment.motif === name);
                return {
                    name,
                    count: fragments.length,
                    latest: fragments[0]?.idea || ''
                };
            });
            if (ungrouped > 0) {
                motifRows.unshift({ name: '未归组', count: ungrouped, latest: '等待之后归到母题' });
            }

            const count = document.getElementById('ideaVaultMotifCount');
            if (count) count.textContent = motifRows.filter(row => row.count > 0 || row.name !== '未归组').length + ' 个';

            list.innerHTML = motifRows.map(row => `
                <div class="idea-vault-item">
                    <div class="idea-vault-item-title">${escapeHtml(row.name)}</div>
                    <div class="idea-vault-meta">
                        <span class="idea-vault-chip">${row.count} 条碎片</span>
                    </div>
                    ${row.latest ? `<div class="idea-vault-line">${escapeHtml(row.latest)}</div>` : ''}
                </div>
            `).join('');
        }

        function renderIdeaVaultActions(vault) {
            const list = document.getElementById('ideaVaultActions');
            if (!list) return;

            const count = document.getElementById('ideaVaultActionCount');
            if (count) count.textContent = vault.actions.length + ' 条';

            if (vault.actions.length === 0) {
                list.innerHTML = '<div class="idea-vault-empty">还没有可推进条目。</div>';
                return;
            }

            list.innerHTML = vault.actions.map(action => {
                const source = vault.fragments.find(fragment => fragment.id === action.sourceId);
                return `
                    <div class="idea-vault-item ${action.status === 'done' ? 'done' : ''}">
                        <div class="idea-vault-item-title">${escapeHtml(action.title)}</div>
                        <div class="idea-vault-meta">
                            <span class="idea-vault-chip">${escapeHtml(action.type)}</span>
                            <span>${action.status === 'done' ? '已完成' : '推进中'}</span>
                        </div>
                        ${action.nextAction ? `<div class="idea-vault-line"><strong>下一步：</strong>${escapeHtml(action.nextAction)}</div>` : ''}
                        ${source ? `<div class="idea-vault-line"><strong>来源：</strong>${escapeHtml(source.idea)}</div>` : ''}
                        <div class="idea-vault-actions">
                            <button class="idea-vault-small-btn" onclick="toggleIdeaVaultAction(${inlineHandlerArg(action.id)})">${action.status === 'done' ? '重开' : '完成'}</button>
                            <button class="idea-vault-small-btn danger" onclick="deleteIdeaVaultAction(${inlineHandlerArg(action.id)})">删除</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderIdeaVault() {
            const vaultContainer = document.getElementById('ideas-vault');
            if (!vaultContainer) return;

            const vault = readIdeaVault();
            renderIdeaVaultOptions(vault);
            renderIdeaVaultInbox(vault);
            renderIdeaVaultMotifs(vault);
            renderIdeaVaultActions(vault);
        }
