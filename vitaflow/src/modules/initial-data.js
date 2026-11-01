        function initData() {
            const today = formatLocalDate();

            // 首次打开某个“带数据 HTML 包”时，用嵌入数据覆盖恢复一次。
            // 之后同一个包不再重复覆盖，避免用户后续新增/修改被每次打开重置。
            try {
	                if (typeof EMBEDDED_DATA !== 'undefined' && EMBEDDED_DATA && typeof EMBEDDED_DATA === 'object' && Object.keys(EMBEDDED_DATA).length > 0) {
	                    const signature = getEmbeddedDataSignature(EMBEDDED_DATA);
	                    if (localStorage.getItem(embeddedRestoreSignatureKey) !== signature) {
	                        if ((typeof localSyncHasRemoteData !== 'undefined' && localSyncHasRemoteData) ||
	                            (typeof hasLocalSyncPending === 'function' && hasLocalSyncPending())) {
	                            console.warn('检测到服务器数据或待同步的本机修改，已跳过 HTML 内嵌快照的自动恢复');
	                            if (typeof showLocalSyncDiagnostic === 'function') {
	                                showLocalSyncDiagnostic('已保留当前数据，未自动恢复此 HTML 的旧快照');
	                            }
	                        } else {
	                            restoreBackupData(EMBEDDED_DATA);
	                            console.log('✅ 已从 HTML 嵌入数据覆盖恢复 ' + Object.keys(EMBEDDED_DATA).length + ' 项');
	                        }
	                    }
	                }
            } catch (e) {
                console.warn('嵌入数据迁移失败:', e);
            }

            if (!localStorage.getItem('vitaflow_accounts')) {
                accountsData = {
                    physical: { score: 85, history: generateHistory(85) },
                    emotional: { score: 78, history: generateHistory(78) },
                    focus: { score: 92, history: generateHistory(92) },
                    meaning: { score: 88, history: generateHistory(88) }
                };
                localStorage.setItem('vitaflow_accounts', JSON.stringify(accountsData));
            } else {
                accountsData = JSON.parse(localStorage.getItem('vitaflow_accounts'));
            }

            if (!localStorage.getItem('vitaflow_todos')) {
                localStorage.setItem('vitaflow_todos', JSON.stringify([
                    { id: 1, text: '晨间冥想15分钟', account: 'physical', happy: 7, date: today, completed: false },
                    { id: 2, text: '阅读专业书籍', account: 'focus', happy: 8, date: today, completed: false },
                    { id: 3, text: '给家人打电话', account: 'emotional', happy: 9, date: today, completed: false }
                ]));
            }

            if (!localStorage.getItem('vitaflow_happiness')) {
                const happiness = {};
                for (let i = -5; i <= 0; i++) {
                    const d = new Date();
                    d.setDate(d.getDate() + i);
                    happiness[formatLocalDate(d)] = Math.floor(Math.random() * 5) + 5;
                }
                localStorage.setItem('vitaflow_happiness', JSON.stringify(happiness));
            }

            if (!localStorage.getItem('vitaflow_streak')) localStorage.setItem('vitaflow_streak', '0');
            if (!localStorage.getItem('vitaflow_streak_records')) localStorage.setItem('vitaflow_streak_records', JSON.stringify([]));
            if (!localStorage.getItem('vitaflow_completed')) localStorage.setItem('vitaflow_completed', '0');
            if (!localStorage.getItem('vitaflow_goal')) localStorage.setItem('vitaflow_goal', '');

            document.getElementById('physicalDateInput').value = today;
            document.getElementById('emotionalDateInput').value = today;
            document.getElementById('focusDateInput').value = today;
            document.getElementById('meaningDateInput').value = today;
            document.getElementById('streakDateInput').value = today;
            document.getElementById('emotionYear').value = String(new Date().getFullYear());
            document.getElementById('emotionMonth').value = String(new Date().getMonth());
            document.getElementById('goalInput').value = localStorage.getItem('vitaflow_goal') || '';

            updateMainScores();
        }

        function generateHistory(baseScore) {
            const history = [];
            const today = new Date();
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                history.push({ date: formatLocalDate(d), score: Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 20) - 10)) });
            }
            return history;
        }
