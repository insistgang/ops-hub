        // 用户输入插入 innerHTML 前必须经过转义，防止 < > " ' 破坏页面结构
        function escapeHtml(value) {
            return (value === null || value === undefined ? '' : String(value))
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function inlineHandlerArg(value) {
            const serialized = JSON.stringify(value);
            return escapeHtml(serialized === undefined ? 'null' : serialized);
        }

        // VITAFLOW_MODULE: date-utils
        // VITAFLOW_MODULE: dashboard-stats

        const happyEmojis = { 1: '😣', 3: '😕', 5: '😐', 7: '😊', 9: '😄', 10: '🤩' };
        const accountNames = { physical: '🏃 体能', emotional: '❤️ 情感', focus: '🧠 思维', meaning: '🔥 意志' };
        const accountColors = { physical: '#e88a4c', emotional: '#c4679c', focus: '#8b5e9e', meaning: '#a78bfa' };

        const initialCalendarDate = new Date();
        let selectedAddAccount = 'physical';
        let selectedDate = formatLocalDate(initialCalendarDate);
        let currentYear = initialCalendarDate.getFullYear();
        let currentMonth = initialCalendarDate.getMonth();
        let mainChart, accountCharts = {}, streakChart, tasksChart, avgChart, compareChart;
        let accountsData = {};

        // VITAFLOW_MODULE: initial-data

        // VITAFLOW_MODULE: calendar-todos
        function openDetail(type) {
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById(type + 'Page').classList.add('active');
            
            if (['physical', 'emotional', 'focus', 'meaning'].includes(type)) {
                document.getElementById(type + 'ScoreInput').value = accountsData[type].score;
                document.getElementById(type + 'Preview').textContent = accountsData[type].score;
                renderAccountChart(type);
                renderHistory(type);
            } else if (type === 'streak') {
                renderStreakChart();
                renderStreakHistory();
                renderStreakAnalysis();
            } else if (type === 'tasks') {
                renderAllTasks();
                renderTasksChart();
            } else if (type === 'avg') {
                renderAvgChart();
                renderCompareChart();
            }
        }

        function goBack() {
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById('mainPage').style.display = 'block';
            updateMainScores();
            initMainChart();
        }

        function switchTab(account, tab) {
            const page = document.getElementById(account + 'Page');
            page.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            page.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            event.target.classList.add('active');
            document.getElementById(account + '-' + tab).classList.add('active');
            
            if (tab === 'trend') {
                if (['physical', 'emotional', 'focus', 'meaning'].includes(account)) {
                    renderAccountChart(account);
                } else if (account === 'streak') {
                    renderStreakChart();
                } else if (account === 'tasks') {
                    renderTasksChart();
                } else if (account === 'avg') {
                    renderAvgChart();
                }
            } else if (tab === 'analysis' && account === 'streak') {
                renderStreakAnalysis();
            } else if (tab === 'compare') {
                renderCompareChart();
            } else if (tab === 'history' && account === 'meaning') {
                renderMeaningBoards();
                renderMeaningQuizHistoryChart();
            } else if (tab === 'guide' && account === 'meaning') {
                renderMeaningQuizChart();
            } else if (tab === 'history' && account === 'emotional') {
                renderEmotionalBoards();
            } else if (tab === 'history' && account === 'focus') {
                renderFocusReflectionBoard();
            } else if (tab === 'history' && account === 'physical') {
                renderPhysicalBoards();
            }
        }

        function updateScorePreview(account, value) {
            document.getElementById(account + 'Preview').textContent = value;
        }

        function saveRecord(account) {
            const score = parseInt(document.getElementById(account + 'ScoreInput').value);
            const date = document.getElementById(account + 'DateInput').value;
            
            accountsData[account].score = score;
            const history = accountsData[account].history;
            const existingIndex = history.findIndex(h => h.date === date);
            if (existingIndex >= 0) {
                history[existingIndex].score = score;
            } else {
                history.push({ date, score });
            }
            history.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            localStorage.setItem('vitaflow_accounts', JSON.stringify(accountsData));
            document.getElementById(account + 'Progress').textContent = score;
            updateProgressRing(account, score);
            renderHistory(account);
            updateMainScores();
            alert('✅ ' + accountNames[account] + '记录已保存！');
        }

        function updateProgressRing(account, score) {
            const circumference = 264;
            const offset = circumference - (score / 100) * circumference;
            const fg = document.querySelector('#' + account + 'Page .progress-ring .fg');
            if (fg) fg.style.strokeDashoffset = offset;
        }

        function renderHistory(account) {
            const history = accountsData[account].history.slice(-7).reverse();
            const listEl = document.getElementById(account + 'HistoryList');
            
            listEl.innerHTML = history.map((item, i) => {
                const prev = history[i + 1];
                const trend = prev ? (item.score > prev.score ? 'up' : item.score < prev.score ? 'down' : '') : '';
                const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '';
                return `
                    <div class="history-item">
                        <div>
                            <span class="history-date">${escapeHtml(item.date)}</span>
                            ${trend ? '<span class="history-trend ' + trend + '">' + trendIcon + ' ' + Math.abs(item.score - prev.score) + '</span>' : ''}
                        </div>
                        <div class="history-score" style="color: ${accountColors[account]}">${escapeHtml(item.score)}</div>
                    </div>
                `;
            }).join('');
        }

        function updateMainScores() {
            const setText = (id, value) => {
                const element = document.getElementById(id);
                if (element) element.textContent = value;
            };
            ['physical', 'emotional', 'focus', 'meaning'].forEach(account => {
                const score = accountsData[account].score;
                setText(account + 'Score', score);
                setText(account + 'Progress', score);
                updateProgressRing(account, score);
            });
            const streak = localStorage.getItem('vitaflow_streak') || '0';
            const completed = localStorage.getItem('vitaflow_completed') || '0';
            setText('streakDays', streak);
            setText('streakProgress', streak);
            setText('completedTasks', completed);
            setText('tasksProgress', completed);

            const avg = Math.round((accountsData.physical.score + accountsData.emotional.score + accountsData.focus.score + accountsData.meaning.score) / 4);
            setText('avgScore', avg);
            setText('avgProgress', avg);
        }

        function renderAllTrendCharts() {
            const startDate = document.getElementById('trendStartDate').value;
            const endDate = document.getElementById('trendEndDate').value;

            const end = endDate ? parseLocalDate(endDate) : new Date();
            if (!end) {
                alert('请选择有效日期');
                return;
            }
            const start = startDate ? parseLocalDate(startDate) : new Date(end.getTime());

            if (!start) {
                alert('请选择有效日期');
                return;
            }
            if (!startDate) start.setDate(start.getDate() - 6);
            
            if (start > end) {
                alert('开始日期不能晚于结束日期');
                return;
            }
            
            const labels = [];
            const current = new Date(start);
            while (current <= end) {
                labels.push((current.getMonth() + 1) + '/' + current.getDate());
                current.setDate(current.getDate() + 1);
            }
            
            const physicalData = getAccountDataForRange('physical', start, end);
            const emotionalData = getAccountDataForRange('emotional', start, end);
            const focusData = getAccountDataForRange('focus', start, end);
            const meaningData = getAccountDataForRange('meaning', start, end);
            
            renderTrendChart('physicalTrendChart', '体能', physicalData, labels, '#e88a4c');
            renderTrendChart('emotionalTrendChart', '情感', emotionalData, labels, '#c4679c');
            renderTrendChart('focusTrendChart', '思维', focusData, labels, '#8b5e9e');
            renderTrendChart('meaningTrendChart', '意志', meaningData, labels, '#a78bfa');
        }

        function getAccountDataForRange(accountType, start, end) {
            const history = accountsData[accountType].history;
            const data = [];
            const current = new Date(start);
            
            while (current <= end) {
                const dateStr = formatLocalDate(current);
                const record = history.find(h => h.date === dateStr);
                data.push(record?.score || getDefaultScore(accountType));
                current.setDate(current.getDate() + 1);
            }
            return data;
        }

        function getDefaultScore(accountType) {
            const defaults = { physical: 85, emotional: 78, focus: 92, meaning: 88 };
            return defaults[accountType] || 80;
        }

        function renderTrendChart(canvasId, label, data, labels, color) {
            const ctx = document.getElementById(canvasId).getContext('2d');
            const chartKey = canvasId.replace('Chart', '');
            if (window[chartKey]) window[chartKey].destroy();
            
            window[chartKey] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: label,
                        data: data,
                        borderColor: color,
                        borderWidth: 3,
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        fill: false,
                        pointBackgroundColor: color,
                        pointRadius: 6,
                        pointBorderWidth: 2,
                        pointBorderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#8b7a7a', font: { size: 10 } }, grid: { color: 'rgba(200, 160, 200, 0.2)' } },
                        y: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' }, suggestedMin: 60, suggestedMax: 100 }
                    }
                }
            });
        }

        function initMainChart() {
            renderAllTrendCharts();
        }

        function renderAccountChart(account) {
            const ctx = document.getElementById(account + 'Chart').getContext('2d');
            if (accountCharts[account]) accountCharts[account].destroy();

            const history = accountsData[account].history.slice(-7);
            const labels = history.map(h => {
                const d = new Date(h.date);
                return (d.getMonth() + 1) + '/' + d.getDate();
            });

            accountCharts[account] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: accountNames[account] + '得分',
                        data: history.map(h => h.score),
                        borderColor: accountColors[account],
                        backgroundColor: accountColors[account] + '25',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: accountColors[account]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' } },
                        y: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' }, suggestedMin: 60, suggestedMax: 100 }
                    }
                }
            });
        }

        function renderStreakChart() {
            const ctx = document.getElementById('streakChart').getContext('2d');
            if (streakChart) streakChart.destroy();
            const trend = getStreakTrend(getStoredStreakRecords());

            streakChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: trend.labels,
                    datasets: [{
                        label: '打卡状态',
                        data: trend.values,
                        backgroundColor: 'rgba(255, 179, 71, 0.4)',
                        borderColor: '#ffb347',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' } },
                        y: { ticks: { color: '#8b7a7a', stepSize: 1 }, grid: { color: 'rgba(200, 160, 200, 0.2)' }, suggestedMin: 0, suggestedMax: 1 }
                    }
                }
            });
        }

        function renderStreakHistory() {
            const listEl = document.getElementById('streakHistoryList');
            const history = getStoredStreakRecords()
                .slice()
                .sort((a, b) => b.date.localeCompare(a.date));

            if (history.length === 0) {
                listEl.innerHTML = '<div style="text-align: center; color: #aa9a9a; padding: 30px;">暂无打卡记录</div>';
                return;
            }

            listEl.innerHTML = history.map(item => `
                <div class="history-item">
                    <div>
                        <span class="history-date">${escapeHtml(item.date)}</span>
                        <span style="background: rgba(100, 200, 150, 0.3); border-radius: 12px; padding: 4px 10px; margin-left: 10px;">
                            ✅ 已打卡
                        </span>
                    </div>
                    <div style="font-size: 1.5rem;">🔥</div>
                </div>
            `).join('');
        }

        function renderAllTasks() {
            const todos = JSON.parse(localStorage.getItem('vitaflow_todos') || '[]');
            const listEl = document.getElementById('allTasksList');
            
            listEl.innerHTML = todos.slice().reverse().map(todo => `
                <div class="history-item">
                    <div>
                        <span class="history-date">${escapeHtml(todo.date)}</span>
                        <span class="todo-account" style="margin-left: 10px;">${escapeHtml(accountNames[todo.account])}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="todo-happy">${escapeHtml(happyEmojis[todo.happy])}</span>
                        <span style="${todo.completed ? 'text-decoration: line-through; color: #aa9a9a;' : ''}">${escapeHtml(todo.text)}</span>
                    </div>
                </div>
            `).join('');
        }

        function renderTasksChart() {
            const ctx = document.getElementById('tasksChart').getContext('2d');
            if (tasksChart) tasksChart.destroy();
            const todos = JSON.parse(localStorage.getItem('vitaflow_todos') || '[]');
            const trend = getCompletedTaskTrend(todos);

            tasksChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: trend.labels,
                    datasets: [{
                        label: '完成任务数',
                        data: trend.values,
                        borderColor: '#74ebd5',
                        backgroundColor: 'rgba(116, 235, 213, 0.2)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#74ebd5'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' } },
                        y: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' }, suggestedMin: 0, suggestedMax: 10 }
                    }
                }
            });
        }

        function renderAvgChart() {
            const ctx = document.getElementById('avgChart').getContext('2d');
            if (avgChart) avgChart.destroy();
            const trend = getAverageAccountTrend(accountsData);

            avgChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: trend.labels,
                    datasets: [{
                        label: '平均得分',
                        data: trend.values,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#667eea'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' } },
                        y: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' }, suggestedMin: 60, suggestedMax: 100 }
                    }
                }
            });
        }

        function renderCompareChart() {
            const ctx = document.getElementById('compareChart').getContext('2d');
            if (compareChart) compareChart.destroy();

            compareChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['体能', '情绪', '思维', '意志'],
                    datasets: [{
                        data: [accountsData.physical.score, accountsData.emotional.score, accountsData.focus.score, accountsData.meaning.score],
                        backgroundColor: ['#e88a4c', '#c4679c', '#8b5e9e', '#a78bfa'],
                        borderColor: '#ffffff',
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#6a4a5a' }
                        }
                    }
                }
            });
        }

        function recordStreak() {
            const date = document.getElementById('streakDateInput').value || formatLocalDate();
            const selectedStreakDate = parseLocalDate(date);
            if (!selectedStreakDate) {
                alert('请选择有效日期');
                return;
            }
            const records = getStoredStreakRecords();
            if (records.some(record => record.date === date)) {
                alert('这一天已经打卡了');
                return;
            }
            const legacyCurrent = Math.max(0, Number.parseInt(localStorage.getItem('vitaflow_streak') || '0', 10) || 0);
            const legacyDays = Math.min(legacyCurrent, 3650);
            if (records.length === 0 && legacyDays > 0) {
                for (let offset = legacyDays; offset >= 1; offset--) {
                    const migratedDate = new Date(selectedStreakDate.getTime());
                    migratedDate.setDate(migratedDate.getDate() - offset);
                    records.push({ date: formatLocalDate(migratedDate), migrated: true });
                }
            }
            records.push({ date, created: new Date().toISOString() });
            records.sort((a, b) => a.date.localeCompare(b.date));
            localStorage.setItem('vitaflow_streak_records', JSON.stringify(records));
            const summary = getStreakSummary(records);
            localStorage.setItem('vitaflow_streak', String(summary.current));
            renderStreakHistory();
            renderStreakChart();
            renderStreakAnalysis();
            updateMainScores();
            alert('🔥 打卡成功！已连续打卡' + summary.current + '天！');
        }

        function getStoredStreakRecords() {
            try {
                const records = JSON.parse(localStorage.getItem('vitaflow_streak_records') || '[]');
                return Array.isArray(records) ? records : [];
            } catch (e) {
                console.warn('打卡记录读取失败:', e);
                return [];
            }
        }

        function renderStreakAnalysis() {
            const records = getStoredStreakRecords();
            const summary = getStreakSummary(records);
            const legacyCurrent = Number.parseInt(localStorage.getItem('vitaflow_streak') || '0', 10) || 0;
            const current = records.length > 0 ? summary.current : legacyCurrent;
            document.getElementById('streakProgress').textContent = current;
            document.getElementById('streakLongest').textContent = Math.max(summary.longest, current) + '天';
            document.getElementById('streakMonthRate').textContent = summary.monthRate + '%';
            document.getElementById('streakCommonTime').textContent = summary.commonTime;
        }

        function generateGoalSuggestions() {
            const goal = document.getElementById('goalInput').value.trim();
            if (!goal) { alert('请输入目标'); return; }
            localStorage.setItem('vitaflow_goal', goal);

            const suggestions = `
                <div class="suggestion-item">
                    <div class="suggestion-title"><i class="fas fa-running"></i> 体能维度</div>
                    <div class="suggestion-text">保障精力输出：保持每周4次运动、每天7-8小时睡眠、用番茄工作法保护专注时段。你的结构化审美会帮你设计出可持续的精力管理方案。</div>
                </div>
                <div class="suggestion-item">
                    <div class="suggestion-title"><i class="fas fa-heart"></i> 情绪维度</div>
                    <div class="suggestion-text">通过叙事复盘转化焦虑：把你的学习过程和思考记录下来，这不仅是整理思路，更是用你的叙事表达能力把经历变成资产。</div>
                </div>
                <div class="suggestion-item">
                    <div class="suggestion-title"><i class="fas fa-bullseye"></i> 思维维度</div>
                    <div class="suggestion-text">保护深度创作时间：每天设置2小时"深度工作舱"，在这段时间里关闭社交软件，用你最强的元认知能力进入心流状态。</div>
                </div>
                <div class="suggestion-item">
                    <div class="suggestion-title"><i class="fas fa-star"></i> 意志维度</div>
                    <div class="suggestion-text">将大目标拆解为季度里程碑：你的"出题人"身份转换已经证明了——你完全有能力把宏大愿景分解成可执行的小步骤。</div>
                </div>
                <div class="suggestion-item">
                    <div class="suggestion-title"><i class="fas fa-rocket"></i> 第一周行动</div>
                    <div class="suggestion-text">1. 列出成为目标所需的核心技能 2. 找到2-3个榜样案例分析 3. 设计你的最小可行产品（MVP）</div>
                </div>
            `;

            const container = document.getElementById('goalSuggestions');
            container.innerHTML = suggestions;
            container.style.display = 'block';
        }

        function openMediaDetail(type) {
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById(type + 'Page').classList.add('active');
            switchMediaTab(type, 'list');
            
            if (type === 'writing') renderWritingDocs();
            else if (type === 'lazyy') renderLazyyDocs();
            else if (type === 'ads') renderAdsDocs();
            else if (type === 'ideas') renderIdeasDocs();
            else if (type === 'pomodoro') renderPomodoroStats();
        }

        function switchMediaTab(media, tab) {
            const page = document.getElementById(media + 'Page');
            if (page) {
                page.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                page.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                const tabButtons = Array.from(page.querySelectorAll('.tab-btn'));
                const targetButton = tabButtons.find(btn => (btn.getAttribute('onclick') || '').includes("'" + tab + "'"));
                const currentEvent = typeof event === 'undefined' ? null : event;
                if (currentEvent?.target && page.contains(currentEvent.target)) currentEvent.target.classList.add('active');
                else if (targetButton) targetButton.classList.add('active');
                const targetContent = document.getElementById(media + '-' + tab);
                if (targetContent) targetContent.classList.add('active');

                if (media === 'ideas') {
                    if (tab === 'analysis') renderAnalysisList();
                    else if (tab === 'ip') renderIPList();
                    else if (tab === 'skills') renderSkillsList();
                    else if (tab === 'vault') renderIdeaVault();
                }
            }
        }

        function initMediaStorage() {
            if (!localStorage.getItem('vitaflow_writing')) localStorage.setItem('vitaflow_writing', JSON.stringify([]));
            if (!localStorage.getItem('vitaflow_lazyy')) localStorage.setItem('vitaflow_lazyy', JSON.stringify([]));
            if (!localStorage.getItem('vitaflow_ads')) localStorage.setItem('vitaflow_ads', JSON.stringify([]));
            if (!localStorage.getItem('vitaflow_ideas')) localStorage.setItem('vitaflow_ideas', JSON.stringify([]));
            if (!localStorage.getItem('vitaflow_pomodoro')) localStorage.setItem('vitaflow_pomodoro', JSON.stringify([]));
            if (!localStorage.getItem('vitaflow_reviews')) localStorage.setItem('vitaflow_reviews', JSON.stringify([]));
            if (!localStorage.getItem('vitaflow_analysis')) localStorage.setItem('vitaflow_analysis', JSON.stringify([]));
            if (!localStorage.getItem('vitaflow_ip')) localStorage.setItem('vitaflow_ip', JSON.stringify([]));
            if (!localStorage.getItem('vitaflow_skills')) localStorage.setItem('vitaflow_skills', JSON.stringify([]));
            if (typeof ensureIdeaVaultStorage === 'function') ensureIdeaVaultStorage();
            updateMediaCounts();
        }

        function updateMediaCounts() {
            const writing = JSON.parse(localStorage.getItem('vitaflow_writing') || '[]');
            const lazyy = JSON.parse(localStorage.getItem('vitaflow_lazyy') || '[]');
            const ads = JSON.parse(localStorage.getItem('vitaflow_ads') || '[]');
            const ideas = JSON.parse(localStorage.getItem('vitaflow_ideas') || '[]');
            const ideaVault = JSON.parse(localStorage.getItem('vitaflow_idea_vault') || '{"fragments":[]}');
            const ideaVaultCount = Array.isArray(ideaVault.fragments) ? ideaVault.fragments.length : 0;
            const analysis = JSON.parse(localStorage.getItem('vitaflow_analysis') || '[]');
            const ip = JSON.parse(localStorage.getItem('vitaflow_ip') || '[]');
            const skills = JSON.parse(localStorage.getItem('vitaflow_skills') || '[]');
            document.getElementById('writingCount').textContent = writing.length + ' 个文档';
            document.getElementById('lazyyCount').textContent = lazyy.length + ' 个想法';
            document.getElementById('adsCount').textContent = ads.length + ' 个记录';
            document.getElementById('ideasCount').textContent = (ideas.length + ideaVaultCount) + ' 个灵感';
            const benchmarkCountEl = document.getElementById('benchmarkCount');
            const businessCountEl = document.getElementById('businessCount');
            const skillsCountEl = document.getElementById('skillsCount');
            if (benchmarkCountEl) benchmarkCountEl.textContent = analysis.length + ' 个笔记';
            if (businessCountEl) businessCountEl.textContent = ip.length + ' 个笔记';
            if (skillsCountEl) skillsCountEl.textContent = skills.length + ' 个笔记';
        }

        // VITAFLOW_MODULE: media-docs
        // VITAFLOW_MODULE: idea-vault
        // VITAFLOW_MODULE: media-planning
        // VITAFLOW_MODULE: wellness-tools
        function updateMeaningScore() {
            const q1 = parseInt(document.getElementById('meaningQ1').value);
            const q2 = parseInt(document.getElementById('meaningQ2').value);
            const q3 = parseInt(document.getElementById('meaningQ3').value);
            
            document.getElementById('meaningQ1Value').textContent = q1;
            document.getElementById('meaningQ2Value').textContent = q2;
            document.getElementById('meaningQ3Value').textContent = q3;
            
            const total = q1 + q2 + q3;
            document.getElementById('meaningTotalScore').textContent = total;
            
            let interpretation = '';
            if (total >= 27) interpretation = '🎯 强目标感';
            else if (total >= 21) interpretation = '✨ 目标感良好';
            else if (total >= 15) interpretation = '⚡ 目标感一般';
            else interpretation = '💫 需要探索意义';
            
            document.getElementById('meaningInterpretation').textContent = interpretation;
        }

        function saveMeaningQuiz() {
            const q1 = parseInt(document.getElementById('meaningQ1').value);
            const q2 = parseInt(document.getElementById('meaningQ2').value);
            const q3 = parseInt(document.getElementById('meaningQ3').value);
            const total = q1 + q2 + q3;
            
            const records = JSON.parse(localStorage.getItem('vitaflow_meaning_quiz') || '[]');
            records.unshift({
                id: Date.now(),
                q1, q2, q3, total,
                date: new Date().toISOString()
            });
            localStorage.setItem('vitaflow_meaning_quiz', JSON.stringify(records));
            alert('✅ 人生意义评估已保存');
            renderMeaningQuizHistory();
            renderMeaningQuizChart();
        }

        function renderMeaningQuizHistory() {
            const records = JSON.parse(localStorage.getItem('vitaflow_meaning_quiz') || '[]');
            const list = document.getElementById('meaningQuizHistoryList');
            
            if (records.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #8b7a7a; font-size: 0.85rem;">暂无评估记录</div>';
                return;
            }
            
            let html = '';
            records.slice(0, 5).forEach(record => {
                const date = new Date(record.date);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                html += `
                    <div onclick="showMeaningQuizDetail(${inlineHandlerArg(record.id)})" style="padding: 6px; background: rgba(255,255,255,0.5); border-radius: 6px; margin-bottom: 4px; cursor: pointer;" onmouseover="this.style.background='rgba(167,139,250,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.5)'">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.8rem; color: #6a4a7a;">${dateStr}</span>
                            <span style="font-size: 0.9rem; font-weight: 600; color: #a78bfa;">${escapeHtml(record.total)}分</span>
                        </div>
                    </div>
                `;
            });
            list.innerHTML = html;
        }

        let meaningQuizChart = null;
        let meaningQuizHistoryChart = null;

        function renderMeaningQuizChart() {
            const records = JSON.parse(localStorage.getItem('vitaflow_meaning_quiz') || '[]');
            const ctx = document.getElementById('meaningQuizChart');
            if (!ctx) return;
            
            const sortedRecords = [...records].slice(0, 10).reverse();
            if (sortedRecords.length === 0) return;
            
            const labels = sortedRecords.map(r => {
                const date = new Date(r.date);
                return `${date.getMonth() + 1}/${date.getDate()}`;
            });
            const data = sortedRecords.map(r => r.total);
            
            if (meaningQuizChart) meaningQuizChart.destroy();
            
            meaningQuizChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: '目标感',
                        data,
                        borderColor: '#a78bfa',
                        backgroundColor: 'rgba(167, 139, 250, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#a78bfa'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { min: 0, max: 30, ticks: { stepSize: 10 } },
                        x: { ticks: { font: { size: 10 } } }
                    }
                }
            });
        }

        function renderMeaningQuizHistoryChart() {
            const records = JSON.parse(localStorage.getItem('vitaflow_meaning_quiz') || '[]');
            const ctx = document.getElementById('meaningQuizHistoryChart');
            if (!ctx) return;
            
            const sortedRecords = [...records].slice(0, 15).reverse();
            if (sortedRecords.length === 0) return;
            
            const labels = sortedRecords.map(r => {
                const date = new Date(r.date);
                return `${date.getMonth() + 1}/${date.getDate()}`;
            });
            const data = sortedRecords.map(r => r.total);
            
            if (meaningQuizHistoryChart) meaningQuizHistoryChart.destroy();
            
            meaningQuizHistoryChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: '目标感',
                        data,
                        borderColor: '#a78bfa',
                        backgroundColor: 'rgba(167, 139, 250, 0.1)',
                        fill: false,
                        tension: 0.4,
                        pointRadius: 6,
                        pointBackgroundColor: '#a78bfa',
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { min: 0, max: 30, ticks: { stepSize: 5, color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' } },
                        x: { ticks: { font: { size: 10 }, color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' } }
                    }
                }
            });
        }

        function showMeaningQuizDetail(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_meaning_quiz') || '[]');
            const record = records.find(r => r.id === id);
            if (record) {
                const newQ1 = prompt('🌅 起床兴奋度 (1-10):', record.q1.toString());
                if (newQ1 !== null) {
                    const newQ2 = prompt('💫 享受过程 (1-10):', record.q2.toString());
                    if (newQ2 !== null) {
                        const newQ3 = prompt('🎯 价值责任感 (1-10):', record.q3.toString());
                        if (newQ3 !== null) {
                            record.q1 = parseInt(newQ1) || 1;
                            record.q2 = parseInt(newQ2) || 1;
                            record.q3 = parseInt(newQ3) || 1;
                            record.total = record.q1 + record.q2 + record.q3;
                            localStorage.setItem('vitaflow_meaning_quiz', JSON.stringify(records));
                            alert('✅ 已更新');
                            renderMeaningQuizHistory();
                            renderMeaningQuizChart();
                        }
                    }
                }
            }
        }

        function saveValues() {
            const deathbed = document.getElementById('valueDeathbed').value;
            const admire = document.getElementById('valueAdmire').value;
            
            if (deathbed || admire) {
                const records = JSON.parse(localStorage.getItem('vitaflow_values') || '[]');
                records.unshift({
                    id: Date.now(),
                    deathbed,
                    admire,
                    date: new Date().toISOString()
                });
                localStorage.setItem('vitaflow_values', JSON.stringify(records));
                alert('✅ 价值观已保存');
                document.getElementById('valueDeathbed').value = '';
                document.getElementById('valueAdmire').value = '';
                renderValuesHistory();
            } else {
                alert('请至少填写一项内容');
            }
        }

        function renderValuesHistory() {
            const records = JSON.parse(localStorage.getItem('vitaflow_values') || '[]');
            const list = document.getElementById('valuesHistoryList');
            
            if (records.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #8b7a7a; font-size: 0.85rem;">暂无价值观记录</div>';
                return;
            }
            
            let html = '';
            records.slice(0, 5).forEach(record => {
                const date = new Date(record.date);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                html += `
                    <div onclick="showValueDetail(${inlineHandlerArg(record.id)})" style="padding: 8px; background: rgba(255,255,255,0.5); border-radius: 6px; margin-bottom: 4px; cursor: pointer;" onmouseover="this.style.background='rgba(232,138,76,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.5)'">
                        <div style="font-size: 0.8rem; color: #8b7a7a;">${dateStr}</div>
                        <div style="font-size: 0.8rem; color: #6a4a7a; margin-top: 2px;">💭 ${escapeHtml((record.deathbed || '').slice(0, 20))}...</div>
                    </div>
                `;
            });
            list.innerHTML = html;
        }

        function showValueDetail(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_values') || '[]');
            const record = records.find(r => r.id === id);
            if (record) {
                const newDeathbed = prompt('💭 临终前三件事:', record.deathbed || '');
                if (newDeathbed !== null) {
                    const newAdmire = prompt('🏆 敬重之人的品质:', record.admire || '');
                    if (newAdmire !== null) {
                        record.deathbed = newDeathbed;
                        record.admire = newAdmire;
                        localStorage.setItem('vitaflow_values', JSON.stringify(records));
                        alert('✅ 已更新');
                        renderValuesHistory();
                        renderMeaningBoards();
                    }
                }
            }
        }

        function renderMeaningBoards() {
            renderMeaningQuizBoard();
            renderMeaningValuesBoard();
            renderMeaningRitualBoard();
        }

        function renderMeaningQuizBoard() {
            const records = JSON.parse(localStorage.getItem('vitaflow_meaning_quiz') || '[]');
            let html = '';
            if (records.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 20px;">暂无评估记录</div>';
            } else {
                records.forEach(record => {
                    const date = new Date(record.date);
                    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                    let interpretation = record.total >= 27 ? '🎯 强目标感' : record.total >= 21 ? '✨ 目标感良好' : record.total >= 15 ? '⚡ 目标感一般' : '💫 需要探索意义';
                    html += `
                        <div onclick="showMeaningQuizFullDetail(${inlineHandlerArg(record.id)})" style="padding: 14px; background: rgba(255,255,255,0.7); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(167,139,250,0.2); cursor: pointer;" onmouseover="this.style.background='rgba(167,139,250,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(167,139,250,0.1); padding-bottom: 8px;">
                                <span style="font-weight: 600; color: #6a4a7a;">📅 ${dateStr}</span>
                                <button onclick="event.stopPropagation(); editMeaningQuizRecord(${inlineHandlerArg(record.id)})" style="background: linear-gradient(135deg, #a78bfa, #8b5cf6); color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">✏️ 修改</button>
                            </div>
                            <div style="text-align: center; margin-bottom: 12px;">
                                <div style="font-size: 2.5rem; font-weight: 700; color: #a78bfa;">${escapeHtml(record.total)}<span style="font-size: 1rem;">/30</span></div>
                                <div style="font-size: 0.9rem; color: #8b7a7a;">${interpretation}</div>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                                <div style="text-align: center; padding: 10px; background: rgba(251,191,36,0.1); border-radius: 8px;">
                                    <div style="font-size: 0.8rem; color: #8b7a7a;">🌅 起床兴奋度</div>
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #fbbf24;">${escapeHtml(record.q1)}</div>
                                </div>
                                <div style="text-align: center; padding: 10px; background: rgba(167,139,250,0.1); border-radius: 8px;">
                                    <div style="font-size: 0.8rem; color: #8b7a7a;">💫 享受过程</div>
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #a78bfa;">${escapeHtml(record.q2)}</div>
                                </div>
                                <div style="text-align: center; padding: 10px; background: rgba(236,72,153,0.1); border-radius: 8px;">
                                    <div style="font-size: 0.8rem; color: #8b7a7a;">🎯 价值责任</div>
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #ec4899;">${escapeHtml(record.q3)}</div>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
            document.getElementById('meaningQuizBoard').innerHTML = html;
        }

        function editMeaningQuizRecord(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_meaning_quiz') || '[]');
            const record = records.find(r => r.id === id);
            if (record) {
                const newQ1 = prompt('🌅 起床兴奋度 (1-10):', record.q1.toString());
                if (newQ1 !== null) {
                    const newQ2 = prompt('💫 享受过程 (1-10):', record.q2.toString());
                    if (newQ2 !== null) {
                        const newQ3 = prompt('🎯 价值责任感 (1-10):', record.q3.toString());
                        if (newQ3 !== null) {
                            record.q1 = parseInt(newQ1) || 1;
                            record.q2 = parseInt(newQ2) || 1;
                            record.q3 = parseInt(newQ3) || 1;
                            record.total = record.q1 + record.q2 + record.q3;
                            localStorage.setItem('vitaflow_meaning_quiz', JSON.stringify(records));
                            alert('✅ 已更新');
                            renderMeaningQuizBoard();
                            renderMeaningQuizChart();
                        }
                    }
                }
            }
        }

        function showMeaningQuizFullDetail(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_meaning_quiz') || '[]');
            const record = records.find(r => r.id === id);
            if (!record) return;
            const date = new Date(record.date);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
            let interpretation = record.total >= 27 ? '🎯 强目标感' : record.total >= 21 ? '✨ 目标感良好' : record.total >= 15 ? '⚡ 目标感一般' : '💫 需要探索意义';
            
            const popup = document.createElement('div');
            popup.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 1000; max-width: 500px; width: 90%;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="font-weight: 700; font-size: 1.2rem; color: #6a4a7a;">📅 ${dateStr}</div>
                        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    <div style="text-align: center; margin-bottom: 16px; padding: 16px; background: rgba(167,139,250,0.1); border-radius: 16px;">
                        <div style="font-size: 3rem; font-weight: 700; color: #a78bfa;">${escapeHtml(record.total)}<span style="font-size: 1.2rem;">/30</span></div>
                        <div style="font-size: 1rem; color: #8b7a7a;">${interpretation}</div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                        <div style="text-align: center; padding: 16px; background: rgba(251,191,36,0.1); border-radius: 12px;">
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 8px;">🌅 起床兴奋度</div>
                            <div style="font-size: 2rem; font-weight: 700; color: #fbbf24;">${escapeHtml(record.q1)}</div>
                        </div>
                        <div style="text-align: center; padding: 16px; background: rgba(167,139,250,0.1); border-radius: 12px;">
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 8px;">💫 享受过程</div>
                            <div style="font-size: 2rem; font-weight: 700; color: #a78bfa;">${escapeHtml(record.q2)}</div>
                        </div>
                        <div style="text-align: center; padding: 16px; background: rgba(236,72,153,0.1); border-radius: 12px;">
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 8px;">🎯 价值责任</div>
                            <div style="font-size: 2rem; font-weight: 700; color: #ec4899;">${escapeHtml(record.q3)}</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #a78bfa, #8b5cf6);" onclick="this.parentElement.parentElement.remove(); editMeaningQuizRecord(${inlineHandlerArg(id)})">✏️ 修改</button>
                        <button class="add-btn" style="flex: 1; background: rgba(200,160,200,0.2);" onclick="this.parentElement.parentElement.remove()">关闭</button>
                    </div>
                </div>
            `;
            document.body.appendChild(popup);
        }

        function renderMeaningValuesBoard() {
            const records = JSON.parse(localStorage.getItem('vitaflow_values') || '[]');
            let html = '';
            if (records.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 20px;">暂无价值观记录</div>';
            } else {
                records.forEach(record => {
                    const date = new Date(record.date);
                    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                    html += `
                        <div onclick="showValueFullDetail(${inlineHandlerArg(record.id)})" style="padding: 14px; background: rgba(255,255,255,0.7); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(232,138,76,0.2); cursor: pointer;" onmouseover="this.style.background='rgba(232,138,76,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(232,138,76,0.1); padding-bottom: 8px;">
                                <span style="font-weight: 600; color: #6a4a7a;">📅 ${dateStr}</span>
                                <button onclick="event.stopPropagation(); editValueRecord(${inlineHandlerArg(record.id)})" style="background: linear-gradient(135deg, #e88a4c, #d470a0); color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">✏️ 修改</button>
                            </div>
                            <div style="margin-bottom: 10px;">
                                <div style="font-size: 0.9rem; font-weight: 600; color: #e88a4c; margin-bottom: 6px;">💭 临终前最想做的三件事</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(232,138,76,0.05); padding: 10px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(record.deathbed) || '<span style="color:#999">未填写</span>'}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.9rem; font-weight: 600; color: #d470a0; margin-bottom: 6px;">🏆 最敬重的人的三个品质</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(212,112,160,0.05); padding: 10px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(record.admire) || '<span style="color:#999">未填写</span>'}</div>
                            </div>
                        </div>
                    `;
                });
            }
            document.getElementById('meaningValuesBoard').innerHTML = html;
        }

        function editValueRecord(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_values') || '[]');
            const record = records.find(r => r.id === id);
            if (record) {
                const newDeathbed = prompt('💭 临终前最想做的三件事:', record.deathbed || '');
                if (newDeathbed !== null) {
                    const newAdmire = prompt('🏆 最敬重的人的三个品质:', record.admire || '');
                    if (newAdmire !== null) {
                        record.deathbed = newDeathbed;
                        record.admire = newAdmire;
                        localStorage.setItem('vitaflow_values', JSON.stringify(records));
                        alert('✅ 已更新');
                        renderMeaningValuesBoard();
                    }
                }
            }
        }

        function showValueFullDetail(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_values') || '[]');
            const record = records.find(r => r.id === id);
            if (!record) return;
            const date = new Date(record.date);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
            
            const popup = document.createElement('div');
            popup.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 1000; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="font-weight: 700; font-size: 1.2rem; color: #6a4a7a;">📅 ${dateStr}</div>
                        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    <div style="margin-bottom: 16px; padding: 16px; background: rgba(232,138,76,0.1); border-radius: 16px;">
                        <div style="font-size: 1rem; font-weight: 600; color: #e88a4c; margin-bottom: 12px;">💭 临终前最想做的三件事</div>
                        <div style="font-size: 0.95rem; color: #4a3a5a; white-space: pre-wrap;">${escapeHtml(record.deathbed) || '<span style="color:#999">未填写</span>'}</div>
                    </div>
                    <div style="margin-bottom: 20px; padding: 16px; background: rgba(212,112,160,0.1); border-radius: 16px;">
                        <div style="font-size: 1rem; font-weight: 600; color: #d470a0; margin-bottom: 12px;">🏆 最敬重的人的三个品质</div>
                        <div style="font-size: 0.95rem; color: #4a3a5a; white-space: pre-wrap;">${escapeHtml(record.admire) || '<span style="color:#999">未填写</span>'}</div>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #e88a4c, #d470a0);" onclick="this.parentElement.parentElement.remove(); editValueRecord(${inlineHandlerArg(id)})">✏️ 修改</button>
                        <button class="add-btn" style="flex: 1; background: rgba(200,160,200,0.2);" onclick="this.parentElement.parentElement.remove()">关闭</button>
                    </div>
                </div>
            `;
            document.body.appendChild(popup);
        }

        function renderMeaningRitualBoard() {
            const records = JSON.parse(localStorage.getItem('vitaflow_rituals') || '[]');
            let html = '';
            if (records.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 20px;">暂无仪式记录</div>';
            } else {
                records.forEach(record => {
                    html += `
                        <div onclick="showRitualFullDetail(${inlineHandlerArg(record.id)})" style="padding: 14px; background: rgba(255,255,255,0.7); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(74,222,128,0.2); cursor: pointer;" onmouseover="this.style.background='rgba(74,222,128,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(74,222,128,0.1); padding-bottom: 8px;">
                                <span style="font-weight: 600; color: #6a4a7a;">📅 ${new Date(record.date).getMonth()+1}/${new Date(record.date).getDate()}</span>
                                <button onclick="event.stopPropagation(); editRitualRecord(${inlineHandlerArg(record.id)})" style="background: linear-gradient(135deg, #4ade80, #22c55e); color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">✏️ 修改</button>
                            </div>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
                                <span style="background: rgba(74,222,128,0.2); padding: 4px 10px; border-radius: 8px; font-size: 0.8rem;">🕐 ${escapeHtml(record.time)}</span>
                                <span style="background: rgba(52,211,153,0.2); padding: 4px 10px; border-radius: 8px; font-size: 0.8rem;">📍 ${escapeHtml(record.place)}</span>
                            </div>
                            <div style="font-size: 0.9rem; font-weight: 600; color: #22c55e; margin-bottom: 6px;">✨ ${escapeHtml(record.action)}</div>
                            ${record.desc ? `<div style="font-size: 0.85rem; color: #8b7a7a;">${escapeHtml(record.desc)}</div>` : ''}
                        </div>
                    `;
                });
            }
            document.getElementById('meaningRitualBoard').innerHTML = html;
        }

        function editRitualRecord(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_rituals') || '[]');
            const record = records.find(r => r.id === id);
            if (record) {
                const newTime = prompt('🕐 时间:', record.time);
                if (newTime !== null) {
                    const newPlace = prompt('📍 地点:', record.place);
                    if (newPlace !== null) {
                        const newAction = prompt('✨ 动作:', record.action);
                        if (newAction !== null) {
                            const newDesc = prompt('📝 仪式描述:', record.desc || '');
                            if (newDesc !== null) {
                                record.time = newTime;
                                record.place = newPlace;
                                record.action = newAction;
                                record.desc = newDesc;
                                localStorage.setItem('vitaflow_rituals', JSON.stringify(records));
                                alert('✅ 已更新');
                                renderMeaningRitualBoard();
                            }
                        }
                    }
                }
            }
        }

        function showRitualFullDetail(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_rituals') || '[]');
            const record = records.find(r => r.id === id);
            if (!record) return;
            const date = new Date(record.date);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
            
            const popup = document.createElement('div');
            popup.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 1000; max-width: 500px; width: 90%;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="font-weight: 700; font-size: 1.2rem; color: #6a4a7a;">📅 ${dateStr}</div>
                        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                        <div style="padding: 16px; background: rgba(74,222,128,0.1); border-radius: 12px; text-align: center;">
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 8px;">🕐 时间</div>
                            <div style="font-size: 1.1rem; font-weight: 600; color: #22c55e;">${escapeHtml(record.time)}</div>
                        </div>
                        <div style="padding: 16px; background: rgba(52,211,153,0.1); border-radius: 12px; text-align: center;">
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 8px;">📍 地点</div>
                            <div style="font-size: 1.1rem; font-weight: 600; color: #14b8a6;">${escapeHtml(record.place)}</div>
                        </div>
                    </div>
                    <div style="margin-bottom: 16px; padding: 16px; background: rgba(74,222,128,0.1); border-radius: 16px;">
                        <div style="font-size: 1rem; font-weight: 600; color: #22c55e; margin-bottom: 12px;">✨ 动作</div>
                        <div style="font-size: 0.95rem; color: #4a3a5a;">${escapeHtml(record.action)}</div>
                    </div>
                    ${record.desc ? `
                    <div style="margin-bottom: 20px; padding: 16px; background: rgba(52,211,153,0.1); border-radius: 16px;">
                        <div style="font-size: 1rem; font-weight: 600; color: #14b8a6; margin-bottom: 12px;">📝 仪式描述</div>
                        <div style="font-size: 0.95rem; color: #4a3a5a; white-space: pre-wrap;">${escapeHtml(record.desc)}</div>
                    </div>
                    ` : ''}
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #4ade80, #22c55e);" onclick="this.parentElement.parentElement.remove(); editRitualRecord(${inlineHandlerArg(id)})">✏️ 修改</button>
                        <button class="add-btn" style="flex: 1; background: rgba(200,160,200,0.2);" onclick="this.parentElement.parentElement.remove()">关闭</button>
                    </div>
                </div>
            `;
            document.body.appendChild(popup);
        }

        function saveRitual() {
            const time = document.getElementById('ritualTime').value;
            const place = document.getElementById('ritualPlace').value;
            const action = document.getElementById('ritualAction').value;
            const desc = document.getElementById('ritualDesc').value;
            
            if (time && place && action) {
                const records = JSON.parse(localStorage.getItem('vitaflow_rituals') || '[]');
                records.push({
                    id: Date.now(),
                    time, place, action, desc,
                    date: new Date().toISOString()
                });
                localStorage.setItem('vitaflow_rituals', JSON.stringify(records));
                alert('✅ 仪式已创建');
                document.getElementById('ritualTime').value = '';
                document.getElementById('ritualPlace').value = '';
                document.getElementById('ritualAction').value = '';
                document.getElementById('ritualDesc').value = '';
                renderRitualList();
            } else {
                alert('请填写时间、地点和动作');
            }
        }

        function renderRitualList() {
            const records = JSON.parse(localStorage.getItem('vitaflow_rituals') || '[]');
            const list = document.getElementById('ritualList');
            
            if (records.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #8b7a7a;">暂无仪式记录</div>';
                return;
            }
            
            let html = '';
            records.forEach(record => {
                html += `
                    <div style="padding: 8px; background: rgba(255,255,255,0.5); border-radius: 8px; margin-bottom: 4px;">
                        <div style="font-size: 0.9rem; font-weight: 600; color: #4ade80;">🕐 ${escapeHtml(record.time)} | 📍 ${escapeHtml(record.place)} | ✨ ${escapeHtml(record.action)}</div>
                        ${record.desc ? `<div style="font-size: 0.85rem; color: #6a4a7a; margin-top: 4px;">${escapeHtml(record.desc)}</div>` : ''}
                    </div>
                `;
            });
            list.innerHTML = html;
        }

        function renderPomodoroGrid() {
            const grid = document.getElementById('pomodoroGrid');
            const records = JSON.parse(localStorage.getItem('vitaflow_pomodoro') || '[]');
            const today = new Date();
            let html = '';
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const dateStr = formatLocalDate(d);
                const dayRecords = records.filter(r => formatLocalDate(new Date(r.date)) === dateStr);
                const count = dayRecords.length;
                const totalTime = dayRecords.reduce((sum, r) => sum + r.duration, 0);
                const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
                html += `
                    <div class="pomodoro-item">
                        <div class="pomodoro-day">${dayNames[d.getDay()]}</div>
                        <div class="pomodoro-count">${count}</div>
                        <div class="pomodoro-time">${totalTime}分钟</div>
                    </div>
                `;
            }
            grid.innerHTML = html;
        }

        function renderPomodoroStats() {
            const records = JSON.parse(localStorage.getItem('vitaflow_pomodoro') || '[]');
            const totalCount = records.length;
            const totalTime = records.reduce((sum, r) => sum + r.duration, 0);
            const avgCount = totalCount > 0 ? (totalCount / 7).toFixed(1) : 0;
            document.getElementById('pomodoroTotalCount').textContent = totalCount;
            document.getElementById('pomodoroTotalTime').textContent = totalTime;
            document.getElementById('pomodoroAvgCount').textContent = avgCount;
            document.getElementById('pomodoroBestStreak').textContent = Math.max(0, Math.floor(totalCount / 7));
            renderPomodoroHistory();
            renderPomodoroChart();
        }

        function renderPomodoroChart() {
            const ctx = document.getElementById('pomodoroChart');
            if (!ctx) return;
            const records = JSON.parse(localStorage.getItem('vitaflow_pomodoro') || '[]');
            const labels = [];
            const data = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = formatLocalDate(d);
                labels.push((d.getMonth() + 1) + '/' + d.getDate());
                const dayRecords = records.filter(r => formatLocalDate(new Date(r.date)) === dateStr);
                data.push(dayRecords.length);
            }
            if (window.pomodoroChartInstance) window.pomodoroChartInstance.destroy();
            window.pomodoroChartInstance = new Chart(ctx, {
                type: 'bar',
                data: { labels, datasets: [{ label: '专注次数', data, backgroundColor: 'rgba(139, 94, 158, 0.4)', borderColor: '#8b5e9e', borderWidth: 2 }] },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' } }, y: { ticks: { color: '#8b7a7a' }, grid: { color: 'rgba(200, 160, 200, 0.2)' }, suggestedMin: 0 } } }
            });
        }

        function renderPomodoroHistory() {
            const records = JSON.parse(localStorage.getItem('vitaflow_pomodoro') || '[]');
            const listEl = document.getElementById('pomodoroHistoryList');
            if (records.length === 0) {
                listEl.innerHTML = '<div style="text-align: center; color: #aa9a9a; padding: 30px;">暂无专注记录</div>';
                return;
            }
            listEl.innerHTML = records.slice(0, 20).map(r => `
                <div class="history-item">
                    <div><span class="history-date">${new Date(r.date).toLocaleString()}</span></div>
                    <div style="color: #8b5e9e; font-weight: 600;">🍅 ${escapeHtml(r.duration)}分钟</div>
                </div>
            `).join('');
        }

        function addWeeklyReview() {
            const startDate = document.getElementById('reviewStartDate').value;
            const endDate = document.getElementById('reviewEndDate').value;
            if (!startDate || !endDate) { alert('请选择开始和结束日期'); return; }
            const reviews = JSON.parse(localStorage.getItem('vitaflow_reviews') || '[]');
            const newReview = { 
                id: Date.now(), 
                startDate, 
                endDate, 
                emotion: '', 
                achievements: '', 
                questions: '', 
                nextDirection: '',
                created: new Date().toISOString() 
            };
            reviews.unshift(newReview);
            localStorage.setItem('vitaflow_reviews', JSON.stringify(reviews));
            document.getElementById('reviewStartDate').value = '';
            document.getElementById('reviewEndDate').value = '';
            renderReviewList();
        }

        function renderReviewList() {
            const reviews = JSON.parse(localStorage.getItem('vitaflow_reviews') || '[]');
            const listEl = document.getElementById('reviewList');
            if (reviews.length === 0) {
                listEl.innerHTML = '<div style="text-align: center; color: #aa9a9a; padding: 30px;">暂无复盘记录，点击上方添加</div>';
                return;
            }
            listEl.innerHTML = reviews.map(r => `
                <div class="review-card" onclick="openReviewDetail(${inlineHandlerArg(r.id)})">
                    <div class="review-header">
                        <div class="review-title">第${reviews.indexOf(r) + 1}周复盘</div>
                        <div class="review-dates">${escapeHtml(r.startDate)} 至 ${escapeHtml(r.endDate)}</div>
                    </div>
                    <div style="font-size: 0.85rem; color: #8b7a7a;">
                        ${r.emotion ? '😌 已记录情感' : '❌ 未记录'} | 
                        ${r.achievements ? '🏆 已记录成就' : '❌ 未记录'}
                    </div>
                </div>
            `).join('');
        }

        function openReviewDetail(id) {
            const reviews = JSON.parse(localStorage.getItem('vitaflow_reviews') || '[]');
            const review = reviews.find(r => r.id === id);
            if (!review) return;
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById('reviewDetailPage').classList.add('active');
            document.getElementById('reviewDetailContent').innerHTML = `
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-title">第${reviews.indexOf(review) + 1}周复盘</div>
                        <div class="review-dates">${escapeHtml(review.startDate)} 至 ${escapeHtml(review.endDate)}</div>
                    </div>
                    <div class="review-section">
                        <div class="review-section-title">😊 情感记录（可标注表情）</div>
                        <textarea class="review-textarea" id="reviewEmotion" placeholder="记录这周的情感变化、心情起伏...你可以标注：😌😊😣😔等">${escapeHtml(review.emotion)}</textarea>
                    </div>
                    <div class="review-section">
                        <div class="review-section-title">🏆 阶段性成就和探索</div>
                        <textarea class="review-textarea" id="reviewAchievements" placeholder="这周完成了什么？有哪些新的探索和突破？">${escapeHtml(review.achievements)}</textarea>
                    </div>
                    <div class="review-section">
                        <div class="review-section-title">❓ 本周的问题和困惑</div>
                        <textarea class="review-textarea" id="reviewQuestions" placeholder="遇到了什么困难？有什么让你困惑的地方？">${escapeHtml(review.questions)}</textarea>
                    </div>
                    <div class="review-section">
                        <div class="review-section-title">🎯 下周的方向</div>
                        <textarea class="review-textarea" id="reviewNext" placeholder="下周的计划是什么？有哪些需要调整的地方？">${escapeHtml(review.nextDirection)}</textarea>
                    </div>
                    <div style="margin-top: 20px; display: flex; gap: 12px;">
                        <button class="add-btn" style="background: linear-gradient(135deg, #667eea, #764ba2);" onclick="saveReview(${inlineHandlerArg(review.id)})">💾 保存复盘</button>
                        <button class="add-btn" style="background: rgba(200, 100, 100, 0.3);" onclick="deleteReview(${inlineHandlerArg(review.id)})">🗑️ 删除</button>
                    </div>
                </div>
            `;
        }

        function saveReview(id) {
            const reviews = JSON.parse(localStorage.getItem('vitaflow_reviews') || '[]');
            const index = reviews.findIndex(r => r.id === id);
            if (index >= 0) {
                reviews[index].emotion = document.getElementById('reviewEmotion').value;
                reviews[index].achievements = document.getElementById('reviewAchievements').value;
                reviews[index].questions = document.getElementById('reviewQuestions').value;
                reviews[index].nextDirection = document.getElementById('reviewNext').value;
                localStorage.setItem('vitaflow_reviews', JSON.stringify(reviews));
                alert('✅ 复盘已保存');
                goBack();
                renderReviewList();
            }
        }

        function deleteReview(id) {
            if (!confirm('确定要删除这个复盘吗？')) return;
            let reviews = JSON.parse(localStorage.getItem('vitaflow_reviews') || '[]');
            reviews = reviews.filter(r => r.id !== id);
            localStorage.setItem('vitaflow_reviews', JSON.stringify(reviews));
            goBack();
            renderReviewList();
        }

        function renderEmotionBoard() {
            const board = document.getElementById('emotionBoard');
            board.innerHTML = '';
            const happiness = JSON.parse(localStorage.getItem('vitaflow_happiness') || '{}');
            const selectedYear = Number.parseInt(document.getElementById('emotionYear').value, 10);
            const selectedMonth = Number.parseInt(document.getElementById('emotionMonth').value, 10);
            const year = Number.isInteger(selectedYear) ? selectedYear : new Date().getFullYear();
            const month = Number.isInteger(selectedMonth) ? selectedMonth : new Date().getMonth();
            
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const today = new Date();
            const todayStr = formatLocalDate(today);
            
            let dayIndex = 0;
            for (let i = 0; i < 42; i++) {
                const weekDay = i % 7;
                if (i < firstDay || dayIndex >= daysInMonth) {
                    board.innerHTML += '<div style="visibility: hidden; border-radius: 16px; padding: 12px 8px;"></div>';
                } else {
                    const dayNum = dayIndex + 1;
                    const dateStr = formatLocalDate(new Date(year, month, dayNum));
                    const score = happiness[dateStr] || 5;
                    const emoji = happyEmojis[score] || '😐';
                    const isToday = dateStr === todayStr;
                    const bgColor = score >= 7 ? 'rgba(100, 200, 150, 0.2)' : score >= 5 ? 'rgba(255, 200, 100, 0.2)' : 'rgba(200, 100, 100, 0.2)';
                    
                    board.innerHTML += `
                        <div style="background: ${bgColor}; border-radius: 16px; padding: 10px 6px; text-align: center; border: 2px solid ${isToday ? '#c4679c' : 'rgba(200, 160, 200, 0.2)'};" 
                             onclick="showEmojiSelector(${inlineHandlerArg(dateStr)}, ${dayNum}, this)">
                            <div style="font-size: 0.7rem; color: #8b7a7a; margin-bottom: 2px;">${dayNum}</div>
                            <div style="font-size: 1.4rem;">${emoji}</div>
                        </div>
                    `;
                    dayIndex++;
                }
            }
            renderDefaultEmotionChart();
        }

        function showEmojiSelector(dateStr, day, element) {
            const emojis = [
                { score: 1, emoji: '😣', label: '难受' },
                { score: 3, emoji: '😕', label: '一般' },
                { score: 5, emoji: '😐', label: '平静' },
                { score: 7, emoji: '😊', label: '开心' },
                { score: 9, emoji: '😄', label: '很开心' },
                { score: 10, emoji: '🤩', label: '超开心' }
            ];
            
            const selector = document.createElement('div');
            selector.innerHTML = `<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 1000;">
                <div style="font-weight: 700; color: #5a3a4a; margin-bottom: 16px; text-align: center;">选择情感状态</div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                    ${emojis.map(e => `<button onclick="setHappiness(${inlineHandlerArg(dateStr)}, ${e.score}, ${inlineHandlerArg(e.emoji)}, this)"
                        style="padding: 12px; font-size: 1.5rem; border: none; border-radius: 12px; background: rgba(248, 240, 255, 0.8); cursor: pointer;" 
                        title="${e.label}">${e.emoji}</button>`).join('')}
                </div>
                <button onclick="this.parentElement.remove()" 
                    style="width: 100%; margin-top: 16px; padding: 10px; border: 1px solid #ffe2f0; border-radius: 16px; background: rgba(200, 160, 200, 0.1); cursor: pointer;">取消</button>
            </div>`;
            document.body.appendChild(selector);
        }

        function setHappiness(dateStr, score, emoji, btn) {
            const happiness = JSON.parse(localStorage.getItem('vitaflow_happiness') || '{}');
            happiness[dateStr] = score;
            localStorage.setItem('vitaflow_happiness', JSON.stringify(happiness));
            btn.parentElement.parentElement.remove();
            renderEmotionBoard();
            renderDefaultEmotionChart();
        }

        function renderDefaultEmotionChart() {
            const happiness = JSON.parse(localStorage.getItem('vitaflow_happiness') || '{}');
            const labels = [];
            const data = [];
            
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = formatLocalDate(d);
                labels.push((d.getMonth() + 1) + '/' + d.getDate());
                data.push(happiness[dateStr] || 5);
            }
            renderEmotionChart(labels, data);
        }

        function renderEmotionChartWithRange() {
            const startDate = document.getElementById('emotionStartDate').value;
            const endDate = document.getElementById('emotionEndDate').value;
            
            if (!startDate || !endDate) {
                alert('请选择开始和结束日期');
                return;
            }
            
            const start = parseLocalDate(startDate);
            const end = parseLocalDate(endDate);
            
            if (start > end) {
                alert('开始日期不能晚于结束日期');
                return;
            }
            
            const happiness = JSON.parse(localStorage.getItem('vitaflow_happiness') || '{}');
            const labels = [];
            const data = [];
            
            const current = new Date(start);
            while (current <= end) {
                const dateStr = formatLocalDate(current);
                labels.push((current.getMonth() + 1) + '/' + current.getDate());
                data.push(happiness[dateStr] || 5);
                current.setDate(current.getDate() + 1);
            }
            
            renderEmotionChart(labels, data);
        }

        function renderEmotionChart(labels, data) {
            const canvas = document.getElementById('emotionChart');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (window.emotionChart) window.emotionChart.destroy();
            
            window.emotionChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '情感得分',
                        data: data,
                        borderColor: '#c4679c',
                        borderWidth: 3,
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        fill: false,
                        pointBackgroundColor: '#c4679c',
                        pointRadius: 6,
                        pointBorderWidth: 2,
                        pointBorderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#8b7a7a', font: { size: 10 } }, grid: { color: 'rgba(200, 160, 200, 0.2)' } },
                        y: { ticks: { color: '#8b7a7a', stepSize: 2 }, grid: { color: 'rgba(200, 160, 200, 0.2)' }, min: 0, max: 10 }
                    }
                }
            });
        }

        function saveEmotionNotes() {
            const notes = document.getElementById('emotionNotes').value.trim();
            if (!notes) {
                alert('请输入情绪波动记录');
                return;
            }
            const startDate = document.getElementById('emotionStartDate').value;
            const endDate = document.getElementById('emotionEndDate').value;
            const timeRange = startDate && endDate ? `${startDate} 至 ${endDate}` : '当前选择的时间范围';
            
            const emotionNotesList = JSON.parse(localStorage.getItem('vitaflow_emotion_notes') || '[]');
            emotionNotesList.unshift({
                id: Date.now(),
                notes: notes,
                timeRange: timeRange,
                created: new Date().toISOString()
            });
            localStorage.setItem('vitaflow_emotion_notes', JSON.stringify(emotionNotesList));
            document.getElementById('emotionNotes').value = '';
            alert('✅ 记录已保存');
            renderEmotionNotesList();
        }

        function renderEmotionNotesList() {
            const notesList = JSON.parse(localStorage.getItem('vitaflow_emotion_notes') || '[]');
            const el = document.getElementById('emotionNotesList');
            if (notesList.length === 0) {
                el.innerHTML = '<div style="text-align: center; color: #aa9a9a; font-size: 0.9rem;">暂无记录</div>';
                return;
            }
            el.innerHTML = notesList.slice(0, 5).map(item => `
                <div style="background: rgba(200, 160, 200, 0.1); border-radius: 12px; padding: 12px; margin-bottom: 10px;">
                    <div style="font-size: 0.75rem; color: #c4679c; margin-bottom: 6px;">📅 ${escapeHtml(item.timeRange)}</div>
                    <div style="font-size: 0.9rem; color: #5a3a4a; line-height: 1.5;">${escapeHtml(item.notes)}</div>
                    <div style="font-size: 0.7rem; color: #aa9a9a; margin-top: 6px;">${new Date(item.created).toLocaleString()}</div>
                </div>
            `).join('');
        }

        // DeepSeek聊什么模块
        let deepseekCurrentCategory = null;
        let deepseekCurrentPopup = null;

        function closeDeepseekPopup() {
            if (deepseekCurrentPopup) {
                deepseekCurrentPopup.remove();
                deepseekCurrentPopup = null;
            }
        }

        function openIdeasTab(tab) {
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById('ideasPage').classList.add('active');
            
            const ideasPage = document.getElementById('ideasPage');
            ideasPage.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            ideasPage.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            const tabButtons = ideasPage.querySelectorAll('.tab-btn');
            let targetButton = null;
            tabButtons.forEach(btn => {
                const onclickStr = btn.getAttribute('onclick');
                if (onclickStr && onclickStr.includes(tab)) {
                    targetButton = btn;
                }
            });
            if (targetButton) targetButton.classList.add('active');
            
            document.getElementById('ideas-' + tab).classList.add('active');
            
            if (tab === 'analysis') renderAnalysisList();
            else if (tab === 'ip') renderIPList();
            else if (tab === 'skills') renderSkillsList();
            else if (tab === 'vault') renderIdeaVault();

            updateMediaCounts();
        }

        function openDeepSeekDetail() {
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById('deepseekPage').classList.add('active');
            renderDeepSeekCategories();
            renderDeepSeekDocs();
            updateDeepseekCount();
        }

        function renderDeepSeekCategories() {
            const categories = JSON.parse(localStorage.getItem('vitaflow_deepseek_categories') || '[]');
            const docs = JSON.parse(localStorage.getItem('vitaflow_deepseek_docs') || '[]');
            
            let html = `
                <div onclick="selectDeepseekCategory(null)" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${deepseekCurrentCategory === null ? 'background: linear-gradient(135deg, #667eea, #764ba2); color: white;' : 'background: rgba(102, 126, 234, 0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(102,126,234,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(102,126,234,0.1)'">
                    📂 全部文档 <span style="float: right; font-size: 0.8rem;">${docs.length}</span>
                </div>
            `;
            
            categories.forEach(cat => {
                const count = docs.filter(d => d.category === cat.id).length;
                html += `
                    <div onclick="selectDeepseekCategory(${inlineHandlerArg(cat.id)})" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${deepseekCurrentCategory === cat.id ? 'background: linear-gradient(135deg, #667eea, #764ba2); color: white;' : 'background: rgba(102,126,234,0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(102,126,234,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(102,126,234,0.1)'">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</span>
                            <div style="display: flex; gap: 4px;">
                                <span style="font-size: 0.8rem;">${count}</span>
                                <button onclick="event.stopPropagation(); deleteDeepseekCategory(${inlineHandlerArg(cat.id)})" style="background: none; border: none; cursor: pointer; opacity: 0.6;" title="删除">×</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            document.getElementById('deepseekCategories').innerHTML = html;
        }

        function selectDeepseekCategory(catId) {
            deepseekCurrentCategory = catId;
            const categories = JSON.parse(localStorage.getItem('vitaflow_deepseek_categories') || '[]');
            if (catId === null) {
                document.getElementById('deepseekCurrentTitle').textContent = '📝 全部文档';
            } else {
                const cat = categories.find(c => c.id === catId);
                document.getElementById('deepseekCurrentTitle').textContent = `📝 ${cat ? cat.name : ''}`;
            }
            renderDeepSeekCategories();
            renderDeepSeekDocs();
        }

        function addDeepSeekCategory() {
            const name = prompt('请输入合集名称：');
            if (!name) return;
            const emoji = prompt('请输入一个表情（可选，默认📁）：') || '📁';
            
            const categories = JSON.parse(localStorage.getItem('vitaflow_deepseek_categories') || '[]');
            categories.push({
                id: Date.now().toString(),
                name: name,
                emoji: emoji
            });
            localStorage.setItem('vitaflow_deepseek_categories', JSON.stringify(categories));
            renderDeepSeekCategories();
        }

        function deleteDeepseekCategory(catId) {
            if (!confirm('确定要删除这个合集吗？文档不会被删除，只是会移出这个合集。')) return;
            
            const categories = JSON.parse(localStorage.getItem('vitaflow_deepseek_categories') || '[]');
            const docs = JSON.parse(localStorage.getItem('vitaflow_deepseek_docs') || '[]');
            
            docs.forEach(doc => {
                if (doc.category === catId) {
                    doc.category = null;
                }
            });
            
            const newCategories = categories.filter(c => c.id !== catId);
            localStorage.setItem('vitaflow_deepseek_categories', JSON.stringify(newCategories));
            localStorage.setItem('vitaflow_deepseek_docs', JSON.stringify(docs));
            
            if (deepseekCurrentCategory === catId) {
                deepseekCurrentCategory = null;
                document.getElementById('deepseekCurrentTitle').textContent = '📝 全部文档';
            }
            
            renderDeepSeekCategories();
            renderDeepSeekDocs();
        }

        function renderDeepSeekDocs(searchTerm = '') {
            let docs = JSON.parse(localStorage.getItem('vitaflow_deepseek_docs') || '[]');
            
            if (deepseekCurrentCategory !== null) {
                docs = docs.filter(d => d.category === deepseekCurrentCategory);
            }
            
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                docs = docs.filter(d => 
                    d.title.toLowerCase().includes(term) || 
                    d.content.toLowerCase().includes(term)
                );
            }
            
            docs.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            const categories = JSON.parse(localStorage.getItem('vitaflow_deepseek_categories') || '[]');
            
            let html = '';
            if (docs.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 40px; grid-column: 1 / -1;">还没有文档哦，快写点什么吧！</div>';
            } else {
                docs.forEach(doc => {
                    const cat = categories.find(c => c.id === doc.category);
                    const date = new Date(doc.date);
                    const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
                    const preview = doc.content.slice(0, 80) + (doc.content.length > 80 ? '...' : '');
                    
                    html += `
                        <div onclick="openDeepseekDocDetail(${inlineHandlerArg(doc.id)})" style="background: rgba(255,255,255,0.7); border-radius: 16px; padding: 16px; cursor: pointer; border: 1px solid rgba(102, 126, 234, 0.2);" onmouseover="this.style.background='rgba(102,126,234,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                            <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 8px; font-size: 1rem;">${escapeHtml(doc.title)}</div>
                            <div style="font-size: 0.85rem; color: #5a4a5a; line-height: 1.5; margin-bottom: 10px; white-space: pre-wrap;">${escapeHtml(preview)}</div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="font-size: 0.75rem; color: #8b7a7a;">${dateStr}</div>
                                ${cat ? `<div style="font-size: 0.75rem; background: rgba(102,126,234,0.2); padding: 2px 8px; border-radius: 8px;">${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</div>` : ''}
                            </div>
                        </div>
                    `;
                });
            }
            
            document.getElementById('deepseekDocs').innerHTML = html;
        }

        function openDeepSeekEditor(docId = null) {
            const docs = JSON.parse(localStorage.getItem('vitaflow_deepseek_docs') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_deepseek_categories') || '[]');
            
            let doc = null;
            if (docId) {
                doc = docs.find(d => d.id === docId);
            }
            
            deepseekCurrentPopup = document.createElement('div');
            deepseekCurrentPopup.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000;"></div>
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 2001; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="font-weight: 700; font-size: 1.3rem; color: #6a4a7a;">${doc ? '✏️ 编辑文档' : '📝 新建文档'}</div>
                        <button onclick="closeDeepseekPopup()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 6px;">标题</label>
                        <input type="text" id="deepseekDocTitle" placeholder="输入文档标题..." style="width: 100%; padding: 12px; border: 2px solid rgba(102,126,234,0.3); border-radius: 12px; font-size: 1rem;" value="${doc ? escapeHtml(doc.title) : ''}">
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 6px;">归类（可选）</label>
                        <select id="deepseekDocCategory" style="width: 100%; padding: 12px; border: 2px solid rgba(102,126,234,0.3); border-radius: 12px; font-size: 1rem;">
                            <option value="">不归类</option>
                            ${categories.map(cat => `<option value="${escapeHtml(cat.id)}" ${doc && doc.category === cat.id ? 'selected' : ''}>${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 6px;">内容</label>
                        <textarea id="deepseekDocContent" placeholder="在这里写下你和DeepSeek聊的内容..." style="width: 100%; height: 300px; padding: 12px; border: 2px solid rgba(102,126,234,0.3); border-radius: 12px; font-size: 1rem; resize: vertical;">${doc ? escapeHtml(doc.content) : ''}</textarea>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: rgba(200, 160, 200, 0.3);" onclick="closeDeepseekPopup()">取消</button>
                        <button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #667eea, #764ba2);" onclick="saveDeepseekDoc(${inlineHandlerArg(docId)})">保存</button>
                    </div>
                </div>
            `;
            document.body.appendChild(deepseekCurrentPopup);
        }

        function saveDeepseekDoc(docId) {
            const title = document.getElementById('deepseekDocTitle').value.trim();
            const content = document.getElementById('deepseekDocContent').value.trim();
            const category = document.getElementById('deepseekDocCategory').value;
            
            if (!title || !content) {
                alert('请填写标题和内容！');
                return;
            }
            
            let docs = JSON.parse(localStorage.getItem('vitaflow_deepseek_docs') || '[]');
            
            if (docId && docId !== 'null') {
                const index = docs.findIndex(d => d.id === docId);
                if (index >= 0) {
                    docs[index] = {
                        ...docs[index],
                        title: title,
                        content: content,
                        category: category || null,
                        date: new Date().toISOString()
                    };
                }
            } else {
                docs.push({
                    id: Date.now().toString(),
                    title: title,
                    content: content,
                    category: category || null,
                    date: new Date().toISOString()
                });
            }
            
            localStorage.setItem('vitaflow_deepseek_docs', JSON.stringify(docs));
            
            closeDeepseekPopup();
            
            renderDeepSeekDocs();
            renderDeepSeekCategories();
            updateDeepseekCount();
        }

        function openDeepseekDocDetail(docId) {
            const docs = JSON.parse(localStorage.getItem('vitaflow_deepseek_docs') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_deepseek_categories') || '[]');
            const doc = docs.find(d => d.id === docId);
            if (!doc) return;
            
            const cat = categories.find(c => c.id === doc.category);
            const date = new Date(doc.date);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
            
            deepseekCurrentPopup = document.createElement('div');
            deepseekCurrentPopup.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000;"></div>
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 2001; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div style="font-weight: 700; font-size: 1.3rem; color: #6a4a7a;">${escapeHtml(doc.title)}</div>
                        <button onclick="closeDeepseekPopup()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px; font-size: 0.85rem; color: #8b7a7a;">
                        <span>📅 ${dateStr}</span>
                        ${cat ? `<span style="background: rgba(102,126,234,0.2); padding: 4px 10px; border-radius: 10px;">${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</span>` : ''}
                    </div>
                    <div style="background: rgba(102,126,234,0.05); padding: 16px; border-radius: 12px; line-height: 1.8; white-space: pre-wrap; color: #4a3a4a; margin-bottom: 16px;">${escapeHtml(doc.content)}</div>
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: rgba(200, 160, 200, 0.3);" onclick="closeDeepseekPopup()">关闭</button>
                        <button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #8b5e9e, #6a4a7a);" onclick="deleteDeepseekDoc(${inlineHandlerArg(doc.id)})">删除</button>
                        <button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #667eea, #764ba2);" onclick="closeDeepseekPopup(); openDeepSeekEditor(${inlineHandlerArg(doc.id)});">编辑</button>
                    </div>
                </div>
            `;
            document.body.appendChild(deepseekCurrentPopup);
        }

        function deleteDeepseekDoc(docId) {
            if (!confirm('确定要删除这个文档吗？')) return;
            
            let docs = JSON.parse(localStorage.getItem('vitaflow_deepseek_docs') || '[]');
            docs = docs.filter(d => d.id !== docId);
            localStorage.setItem('vitaflow_deepseek_docs', JSON.stringify(docs));
            
            closeDeepseekPopup();
            
            renderDeepSeekDocs();
            renderDeepSeekCategories();
            updateDeepseekCount();
        }

        function searchDeepSeekDocs() {
            const term = document.getElementById('deepseekSearch').value.trim();
            renderDeepSeekDocs(term);
        }

        function updateDeepseekCount() {
            const docs = JSON.parse(localStorage.getItem('vitaflow_deepseek_docs') || '[]');
            const el = document.getElementById('deepseekCount');
            if (el) {
                el.textContent = docs.length + ' 个文档';
            }
        }

        // 文学创作类中心
        let literatureCurrentCategory = null;
        let literatureCurrentPopup = null;

        function closeLiteraturePopup() {
            if (literatureCurrentPopup) {
                literatureCurrentPopup.remove();
                literatureCurrentPopup = null;
            }
        }

        function openLiteratureDetail() {
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById('literaturePage').classList.add('active');
            renderLiteratureCategories();
            renderLiteratureDocs();
            updateLiteratureCount();
        }

        function renderLiteratureCategories() {
            const categories = JSON.parse(localStorage.getItem('vitaflow_literature_categories') || '[]');
            const docs = JSON.parse(localStorage.getItem('vitaflow_literature_docs') || '[]');
            
            let html = `
                <div onclick="selectLiteratureCategory(null)" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${literatureCurrentCategory === null ? 'background: linear-gradient(135deg, #e88a4c, #d470a0); color: white;' : 'background: rgba(232,138,76,0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(232,138,76,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(232,138,76,0.1)'">
                    📂 全部文档 <span style="float: right; font-size: 0.8rem;">${docs.length}</span>
                </div>
            `;
            
            categories.forEach(cat => {
                const count = docs.filter(d => d.category === cat.id).length;
                html += `
                    <div onclick="selectLiteratureCategory(${inlineHandlerArg(cat.id)})" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${literatureCurrentCategory === cat.id ? 'background: linear-gradient(135deg, #e88a4c, #d470a0); color: white;' : 'background: rgba(232,138,76,0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(232,138,76,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(232,138,76,0.1)'">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</span>
                            <div style="display: flex; gap: 4px;">
                                <span style="font-size: 0.8rem;">${count}</span>
                                <button onclick="event.stopPropagation(); deleteLiteratureCategory(${inlineHandlerArg(cat.id)})" style="background: none; border: none; cursor: pointer; opacity: 0.6;" title="删除">×</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            document.getElementById('literatureCategories').innerHTML = html;
        }

        function selectLiteratureCategory(catId) {
            literatureCurrentCategory = catId;
            const categories = JSON.parse(localStorage.getItem('vitaflow_literature_categories') || '[]');
            if (catId === null) {
                document.getElementById('literatureCurrentTitle').textContent = '📝 全部文档';
            } else {
                const cat = categories.find(c => c.id === catId);
                document.getElementById('literatureCurrentTitle').textContent = `📝 ${cat ? cat.name : ''}`;
            }
            renderLiteratureCategories();
            renderLiteratureDocs();
        }

        function addLiteratureCategory() {
            const name = prompt('请输入合集名称：');
            if (!name) return;
            const emoji = prompt('请输入一个表情（可选，默认📁）：') || '📁';
            
            const categories = JSON.parse(localStorage.getItem('vitaflow_literature_categories') || '[]');
            categories.push({
                id: Date.now().toString(),
                name: name,
                emoji: emoji
            });
            localStorage.setItem('vitaflow_literature_categories', JSON.stringify(categories));
            renderLiteratureCategories();
        }

        function deleteLiteratureCategory(catId) {
            if (!confirm('确定要删除这个合集吗？文档不会被删除。')) return;
            
            const categories = JSON.parse(localStorage.getItem('vitaflow_literature_categories') || '[]');
            const docs = JSON.parse(localStorage.getItem('vitaflow_literature_docs') || '[]');
            
            docs.forEach(doc => {
                if (doc.category === catId) {
                    doc.category = null;
                }
            });
            
            const newCategories = categories.filter(c => c.id !== catId);
            localStorage.setItem('vitaflow_literature_categories', JSON.stringify(newCategories));
            localStorage.setItem('vitaflow_literature_docs', JSON.stringify(docs));
            
            if (literatureCurrentCategory === catId) {
                literatureCurrentCategory = null;
                document.getElementById('literatureCurrentTitle').textContent = '📝 全部文档';
            }
            
            renderLiteratureCategories();
            renderLiteratureDocs();
        }

        function renderLiteratureDocs(searchTerm = '') {
            let docs = JSON.parse(localStorage.getItem('vitaflow_literature_docs') || '[]');
            
            if (literatureCurrentCategory !== null) {
                docs = docs.filter(d => d.category === literatureCurrentCategory);
            }
            
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                docs = docs.filter(d => 
                    d.title.toLowerCase().includes(term) || 
                    d.content.toLowerCase().includes(term)
                );
            }
            
            docs.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            const categories = JSON.parse(localStorage.getItem('vitaflow_literature_categories') || '[]');
            
            let html = '';
            if (docs.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 40px; grid-column: 1 / -1;">还没有文档哦，快写点什么吧！</div>';
            } else {
                docs.forEach(doc => {
                    const cat = categories.find(c => c.id === doc.category);
                    const date = new Date(doc.date);
                    const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
                    const preview = doc.content.slice(0, 80) + (doc.content.length > 80 ? '...' : '');
                    
                    html += `
                        <div onclick="openLiteratureDocDetail(${inlineHandlerArg(doc.id)})" style="background: rgba(255,255,255,0.7); border-radius: 16px; padding: 16px; cursor: pointer; border: 1px solid rgba(232,138,76,0.2);" onmouseover="this.style.background='rgba(232,138,76,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                            <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 8px; font-size: 1rem;">${escapeHtml(doc.title)}</div>
                            <div style="font-size: 0.85rem; color: #5a4a5a; line-height: 1.5; margin-bottom: 10px; white-space: pre-wrap;">${escapeHtml(preview)}</div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="font-size: 0.75rem; color: #8b7a7a;">${dateStr}</div>
                                ${cat ? `<div style="font-size: 0.75rem; background: rgba(232,138,76,0.2); padding: 2px 8px; border-radius: 8px;">${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</div>` : ''}
                            </div>
                        </div>
                    `;
                });
            }
            
            document.getElementById('literatureDocs').innerHTML = html;
        }

        function openLiteratureEditor(docId = null) {
            const docs = JSON.parse(localStorage.getItem('vitaflow_literature_docs') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_literature_categories') || '[]');
            
            let doc = null;
            if (docId) {
                doc = docs.find(d => d.id === docId);
            }
            
            literatureCurrentPopup = document.createElement('div');
            literatureCurrentPopup.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000;"></div>
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 2001; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="font-weight: 700; font-size: 1.3rem; color: #6a4a7a;">${doc ? '✏️ 编辑文档' : '📝 新建文档'}</div>
                        <button onclick="closeLiteraturePopup()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 6px;">标题</label>
                        <input type="text" id="literatureDocTitle" placeholder="输入文档标题..." style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem;" value="${doc ? escapeHtml(doc.title) : ''}">
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 6px;">归类（可选）</label>
                        <select id="literatureDocCategory" style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem;">
                            <option value="">不归类</option>
                            ${categories.map(cat => `<option value="${escapeHtml(cat.id)}" ${doc && doc.category === cat.id ? 'selected' : ''}>${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 6px;">内容</label>
                        <textarea id="literatureDocContent" placeholder="在这里记录你的创作灵感..." style="width: 100%; height: 300px; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem; resize: vertical;">${doc ? escapeHtml(doc.content) : ''}</textarea>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: rgba(200, 160, 200, 0.3);" onclick="closeLiteraturePopup()">取消</button>
                        <button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #e88a4c, #d470a0);" onclick="saveLiteratureDoc(${inlineHandlerArg(docId)})">保存</button>
                    </div>
                </div>
            `;
            document.body.appendChild(literatureCurrentPopup);
        }

        function saveLiteratureDoc(docId) {
            const title = document.getElementById('literatureDocTitle').value.trim();
            const content = document.getElementById('literatureDocContent').value.trim();
            const category = document.getElementById('literatureDocCategory').value;
            
            if (!title || !content) {
                alert('请填写标题和内容！');
                return;
            }
            
            let docs = JSON.parse(localStorage.getItem('vitaflow_literature_docs') || '[]');
            
            if (docId && docId !== 'null') {
                const index = docs.findIndex(d => d.id === docId);
                if (index >= 0) {
                    docs[index] = {
                        ...docs[index],
                        title: title,
                        content: content,
                        category: category || null,
                        date: new Date().toISOString()
                    };
                }
            } else {
                docs.push({
                    id: Date.now().toString(),
                    title: title,
                    content: content,
                    category: category || null,
                    date: new Date().toISOString()
                });
            }
            
            localStorage.setItem('vitaflow_literature_docs', JSON.stringify(docs));
            
            closeLiteraturePopup();
            
            renderLiteratureDocs();
            renderLiteratureCategories();
            updateLiteratureCount();
        }

        function openLiteratureDocDetail(docId) {
            const docs = JSON.parse(localStorage.getItem('vitaflow_literature_docs') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_literature_categories') || '[]');
            const doc = docs.find(d => d.id === docId);
            if (!doc) return;
            
            const cat = categories.find(c => c.id === doc.category);
            const date = new Date(doc.date);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
            
            literatureCurrentPopup = document.createElement('div');
            literatureCurrentPopup.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000;"></div>
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 2001; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div style="font-weight: 700; font-size: 1.3rem; color: #6a4a7a;">${escapeHtml(doc.title)}</div>
                        <button onclick="closeLiteraturePopup()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px; font-size: 0.85rem; color: #8b7a7a;">
                        <span>📅 ${dateStr}</span>
                        ${cat ? `<span style="background: rgba(232,138,76,0.2); padding: 4px 10px; border-radius: 10px;">${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</span>` : ''}
                    </div>
                    <div style="background: rgba(232,138,76,0.05); padding: 16px; border-radius: 12px; line-height: 1.8; white-space: pre-wrap; color: #4a3a4a; margin-bottom: 16px;">${escapeHtml(doc.content)}</div>
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: rgba(200, 160, 200, 0.3);" onclick="closeLiteraturePopup()">关闭</button>
                        <button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #8b5e9e, #6a4a7a);" onclick="deleteLiteratureDoc(${inlineHandlerArg(doc.id)})">删除</button>
                        <button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #e88a4c, #d470a0);" onclick="closeLiteraturePopup(); openLiteratureEditor(${inlineHandlerArg(doc.id)});">编辑</button>
                    </div>
                </div>
            `;
            document.body.appendChild(literatureCurrentPopup);
        }

        function deleteLiteratureDoc(docId) {
            if (!confirm('确定要删除这个文档吗？')) return;
            
            let docs = JSON.parse(localStorage.getItem('vitaflow_literature_docs') || '[]');
            docs = docs.filter(d => d.id !== docId);
            localStorage.setItem('vitaflow_literature_docs', JSON.stringify(docs));
            
            closeLiteraturePopup();
            
            renderLiteratureDocs();
            renderLiteratureCategories();
            updateLiteratureCount();
        }

        function searchLiteratureDocs() {
            const term = document.getElementById('literatureSearch').value.trim();
            renderLiteratureDocs(term);
        }

        function updateLiteratureCount() {
            const docs = JSON.parse(localStorage.getItem('vitaflow_literature_docs') || '[]');
            const el = document.getElementById('literatureCount');
            if (el) {
                el.textContent = docs.length + ' 个文档';
            }
        }

        // 小说大纲构建器
        let novelCurrentPopup = null;

        function closeNovelPopup() {
            if (novelCurrentPopup) {
                novelCurrentPopup.remove();
                novelCurrentPopup = null;
            }
        }

        function openNovelOutlineDetail() {
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById('novelOutlinePage').classList.add('active');
            renderNovelOutlines();
            updateNovelOutlineCount();
        }

        function renderNovelOutlines(searchTerm = '') {
            let novels = JSON.parse(localStorage.getItem('vitaflow_novel_outlines') || '[]');
            
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                novels = novels.filter(n => 
                    n.title.toLowerCase().includes(term) || 
                    n.genre.toLowerCase().includes(term)
                );
            }
            
            novels.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            let html = '';
            if (novels.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 40px; grid-column: 1 / -1;">还没有小说大纲哦，开始创作吧！</div>';
            } else {
                novels.forEach(novel => {
                    const date = new Date(novel.date);
                    const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
                    
                    html += `
                        <div onclick="openNovelOutlineEditor(${inlineHandlerArg(novel.id)})" style="background: rgba(255,255,255,0.7); border-radius: 16px; padding: 16px; cursor: pointer; border: 1px solid rgba(232,138,76,0.2);" onmouseover="this.style.background='rgba(232,138,76,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                            <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 8px; font-size: 1.1rem;">${escapeHtml(novel.title)}</div>
                            <div style="font-size: 0.85rem; color: #5a4a5a; margin-bottom: 8px;">📖 ${escapeHtml(novel.genre) || '未分类'}</div>
                            <div style="font-size: 0.75rem; color: #8b7a7a;">📅 ${dateStr}</div>
                            <div style="margin-top: 10px; font-size: 0.8rem; color: #6a4a5a;">
                                ${novel.concept ? '💡 有核心创意' : '⚠️ 待完善核心创意'}
                                ${novel.structure ? ' | 📐 有结构设计' : ''}
                            </div>
                        </div>
                    `;
                });
            }
            
            document.getElementById('novelOutlineList').innerHTML = html;
        }

        function openNovelOutlineEditor(novelId = null) {
            const novels = JSON.parse(localStorage.getItem('vitaflow_novel_outlines') || '[]');
            
            let novel = null;
            if (novelId) {
                novel = novels.find(n => n.id === novelId);
            }
            
            novelCurrentPopup = document.createElement('div');
            novelCurrentPopup.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; overflow-y: auto;"></div>
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 2001; max-width: 900px; width: 95%; max-height: 95vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div style="font-weight: 700; font-size: 1.5rem; color: #6a4a7a;">${novel ? '✏️ 编辑小说大纲' : '🗺️ 创建新小说大纲'}</div>
                        <button onclick="closeNovelPopup()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 8px;">📖 小说标题</label>
                        <input type="text" id="novelTitle" placeholder="给你的小说起个名字..." style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1.1rem;" value="${novel ? escapeHtml(novel.title) : ''}">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                        <div>
                            <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 8px;">🏷️ 类型/题材</label>
                            <select id="novelGenre" style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem;">
                                <option value="">选择类型</option>
                                <option value="都市情感" ${novel && novel.genre === '都市情感' ? 'selected' : ''}>都市情感</option>
                                <option value="职场商战" ${novel && novel.genre === '职场商战' ? 'selected' : ''}>职场商战</option>
                                <option value="悬疑推理" ${novel && novel.genre === '悬疑推理' ? 'selected' : ''}>悬疑推理</option>
                                <option value="科幻未来" ${novel && novel.genre === '科幻未来' ? 'selected' : ''}>科幻未来</option>
                                <option value="历史穿越" ${novel && novel.genre === '历史穿越' ? 'selected' : ''}>历史穿越</option>
                                <option value="校园青春" ${novel && novel.genre === '校园青春' ? 'selected' : ''}>校园青春</option>
                                <option value="玄幻奇幻" ${novel && novel.genre === '玄幻奇幻' ? 'selected' : ''}>玄幻奇幻</option>
                                <option value="武侠江湖" ${novel && novel.genre === '武侠江湖' ? 'selected' : ''}>武侠江湖</option>
                                <option value="现实主义" ${novel && novel.genre === '现实主义' ? 'selected' : ''}>现实主义</option>
                                <option value="其他" ${novel && novel.genre === '其他' ? 'selected' : ''}>其他</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 8px;">📏 预计篇幅</label>
                            <select id="novelLength" style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem;">
                                <option value="">选择篇幅</option>
                                <option value="短篇 (1-3万字)" ${novel && novel.length === '短篇 (1-3万字)' ? 'selected' : ''}>短篇 (1-3万字)</option>
                                <option value="中篇 (3-10万字)" ${novel && novel.length === '中篇 (3-10万字)' ? 'selected' : ''}>中篇 (3-10万字)</option>
                                <option value="长篇 (10-30万字)" ${novel && novel.length === '长篇 (10-30万字)' ? 'selected' : ''}>长篇 (10-30万字)</option>
                                <option value="超长篇 (30万字以上)" ${novel && novel.length === '超长篇 (30万字以上)' ? 'selected' : ''}>超长篇 (30万字以上)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(232,138,76,0.1), rgba(212,112,160,0.1)); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">💡 核心创意概念</div>
                        <textarea id="novelConcept" placeholder="用一个简洁的句子描述你的故事核心：&#10;例如：'一个被困在时间循环里的社畜，必须在每天结束时拯救一个人才能逃脱'&#10;&#10;思考：&#10;• 什么东西让这个故事独特？&#10;• 读者为什么会想看这个故事？&#10;• 有什么新意或反转？" style="width: 100%; height: 120px; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${novel ? escapeHtml(novel.concept) : ''}</textarea>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.8); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">👤 人物设定</div>
                        <div style="margin-bottom: 16px;">
                            <div style="font-size: 0.9rem; color: #8b7a7a; margin-bottom: 8px;">🎭 主角</div>
                            <textarea id="novelProtagonist" placeholder="主角是谁？&#10;• 性格特点&#10;• 外貌特征&#10;• 核心欲望/恐惧&#10;• 与故事的关联" style="width: 100%; height: 100px; padding: 12px; border: 2px solid rgba(232,138,76,0.2); border-radius: 12px; font-size: 0.9rem; resize: vertical;">${novel ? escapeHtml(novel.protagonist) : ''}</textarea>
                        </div>
                        <div style="margin-bottom: 16px;">
                            <div style="font-size: 0.9rem; color: #8b7a7a; margin-bottom: 8px;">⚡ 核心冲突人物（反派/对手）</div>
                            <textarea id="novelAntagonist" placeholder="主角面临的主要对手或障碍是什么？&#10;• 他们想要什么？&#10;• 与主角的核心矛盾是什么？&#10;• 为什么会形成冲突？" style="width: 100%; height: 100px; padding: 12px; border: 2px solid rgba(232,138,76,0.2); border-radius: 12px; font-size: 0.9rem; resize: vertical;">${novel ? escapeHtml(novel.antagonist) : ''}</textarea>
                        </div>
                        <div>
                            <div style="font-size: 0.9rem; color: #8b7a7a; margin-bottom: 8px;">👥 关键配角</div>
                            <textarea id="novelSupporting" placeholder="其他重要角色（导师、朋友、情人等）：&#10;• 他们的作用是什么？&#10;• 如何推动主线或制造转折？" style="width: 100%; height: 80px; padding: 12px; border: 2px solid rgba(232,138,76,0.2); border-radius: 12px; font-size: 0.9rem; resize: vertical;">${novel ? escapeHtml(novel.supporting) : ''}</textarea>
                        </div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.8); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">📐 结构设计</div>
                        <div style="margin-bottom: 16px;">
                            <div style="font-size: 0.9rem; color: #8b7a7a; margin-bottom: 8px;">🎬 三幕结构概览</div>
                            <textarea id="novelStructure" placeholder="第一幕 (建置)：&#10;• 世界观/背景设定&#10;• 主角的日常状态&#10;• 催化事件是什么？&#10;&#10;第二幕 (对抗)：&#10;• 主要冲突展开&#10;• 主角遭遇的障碍&#10;• 中点转折是什么？&#10;• 最低谷/最大危机？&#10;&#10;第三幕 (解决)：&#10;• 如何高潮对决？&#10;• 如何收尾？" style="width: 100%; height: 180px; padding: 12px; border: 2px solid rgba(232,138,76,0.2); border-radius: 12px; font-size: 0.9rem; resize: vertical;">${novel ? escapeHtml(novel.structure) : ''}</textarea>
                        </div>
                        <div>
                            <div style="font-size: 0.9rem; color: #8b7a7a; margin-bottom: 8px;">🔑 关键情节点</div>
                            <textarea id="novelPlotPoints" placeholder="列出3-5个核心情节点：&#10;1. 开端钩子：&#10;2. 第一个转折：&#10;3. 中点高潮：&#10;4. 第二个转折：&#10;5. 最终高潮：" style="width: 100%; height: 120px; padding: 12px; border: 2px solid rgba(232,138,76,0.2); border-radius: 12px; font-size: 0.9rem; resize: vertical;">${novel ? escapeHtml(novel.plotPoints) : ''}</textarea>
                        </div>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(232,138,76,0.1), rgba(212,112,160,0.1)); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">🎯 主题与意义</div>
                        <textarea id="novelTheme" placeholder="这个故事想要表达什么？&#10;• 核心主题是什么？（如：救赎、成长、复仇）&#10;• 希望读者看完后有什么感受？&#10;• 有什么现实意义或思考？" style="width: 100%; height: 100px; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${novel ? escapeHtml(novel.theme) : ''}</textarea>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.8); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">💭 灵感笔记</div>
                        <textarea id="novelNotes" placeholder="记录任何灵感碎片：&#10;• 场景描写&#10;• 对话片段&#10;• 想要埋下的伏笔&#10;• 参考素材" style="width: 100%; height: 100px; padding: 12px; border: 2px solid rgba(232,138,76,0.2); border-radius: 12px; font-size: 0.9rem; resize: vertical;">${novel ? escapeHtml(novel.notes) : ''}</textarea>
                    </div>
                    
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: rgba(200, 160, 200, 0.3);" onclick="closeNovelPopup()">取消</button>
                        ${novel ? `<button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #c4679c, #8b5e9e);" onclick="deleteNovelOutline(${inlineHandlerArg(novel.id)})">删除</button>` : ''}
                        <button class="add-btn" style="flex: 2; background: linear-gradient(135deg, #e88a4c, #d470a0);" onclick="saveNovelOutline(${inlineHandlerArg(novelId)})">保存大纲</button>
                    </div>
                </div>
            `;
            document.body.appendChild(novelCurrentPopup);
        }

        function saveNovelOutline(novelId) {
            const title = document.getElementById('novelTitle').value.trim();
            const genre = document.getElementById('novelGenre').value;
            const length = document.getElementById('novelLength').value;
            const concept = document.getElementById('novelConcept').value.trim();
            const protagonist = document.getElementById('novelProtagonist').value.trim();
            const antagonist = document.getElementById('novelAntagonist').value.trim();
            const supporting = document.getElementById('novelSupporting').value.trim();
            const structure = document.getElementById('novelStructure').value.trim();
            const plotPoints = document.getElementById('novelPlotPoints').value.trim();
            const theme = document.getElementById('novelTheme').value.trim();
            const notes = document.getElementById('novelNotes').value.trim();
            
            if (!title) {
                alert('请填写小说标题！');
                return;
            }
            
            let novels = JSON.parse(localStorage.getItem('vitaflow_novel_outlines') || '[]');
            
            if (novelId && novelId !== 'null') {
                const index = novels.findIndex(n => n.id === novelId);
                if (index >= 0) {
                    novels[index] = {
                        ...novels[index],
                        title,
                        genre,
                        length,
                        concept,
                        protagonist,
                        antagonist,
                        supporting,
                        structure,
                        plotPoints,
                        theme,
                        notes,
                        date: new Date().toISOString()
                    };
                }
            } else {
                novels.push({
                    id: Date.now().toString(),
                    title,
                    genre,
                    length,
                    concept,
                    protagonist,
                    antagonist,
                    supporting,
                    structure,
                    plotPoints,
                    theme,
                    notes,
                    date: new Date().toISOString()
                });
            }
            
            localStorage.setItem('vitaflow_novel_outlines', JSON.stringify(novels));
            
            closeNovelPopup();
            
            renderNovelOutlines();
            updateNovelOutlineCount();
        }

        function deleteNovelOutline(novelId) {
            if (!confirm('确定要删除这个小说大纲吗？')) return;
            
            let novels = JSON.parse(localStorage.getItem('vitaflow_novel_outlines') || '[]');
            novels = novels.filter(n => n.id !== novelId);
            localStorage.setItem('vitaflow_novel_outlines', JSON.stringify(novels));
            
            closeNovelPopup();
            
            renderNovelOutlines();
            updateNovelOutlineCount();
        }

        function searchNovelOutlines() {
            const term = document.getElementById('novelSearch').value.trim();
            renderNovelOutlines(term);
        }

        function updateNovelOutlineCount() {
            const novels = JSON.parse(localStorage.getItem('vitaflow_novel_outlines') || '[]');
            const el = document.getElementById('novelOutlineCount');
            if (el) {
                el.textContent = novels.length + ' 个大纲';
            }
        }

        // 学习模块（对标分析/IP商业分析/新技能学习）
        let learningCurrentCategory = null;
        let learningCurrentType = null;
        let learningCurrentPopup = null;

        function closeLearningPopup() {
            if (learningCurrentPopup) {
                learningCurrentPopup.remove();
                learningCurrentPopup = null;
            }
        }

        function openLearningDetail(type) {
            learningCurrentType = type;
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById('learningPage').classList.add('active');
            
            const titles = { benchmark: '🎯 对标分析', business: '💼 IP商业分析', skills: '🎨 新技能学习' };
            const icons = { benchmark: '🎯', business: '💼', skills: '🎨' };
            document.getElementById('learningPageTitle').textContent = titles[type] || '学习笔记';
            document.getElementById('learningIcon').textContent = icons[type] || '📚';
            
            learningCurrentCategory = null;
            document.getElementById('learningCurrentTitle').textContent = '📝 全部笔记';
            renderLearningCategories();
            renderLearningNotes();
            updateLearningCount();
        }

        function renderLearningCategories() {
            const categories = JSON.parse(localStorage.getItem('vitaflow_learning_categories') || '[]');
            const notes = JSON.parse(localStorage.getItem('vitaflow_learning_notes') || '[]');
            const typeCategories = categories.filter(c => c.type === learningCurrentType);
            
            let html = `
                <div onclick="selectLearningCategory(null)" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${learningCurrentCategory === null ? 'background: linear-gradient(135deg, #667eea, #764ba2); color: white;' : 'background: rgba(102, 126, 234, 0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(102,126,234,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(102,126,234,0.1)'">
                    📂 全部笔记 <span style="float: right; font-size: 0.8rem;">${notes.filter(n => n.type === learningCurrentType).length}</span>
                </div>
            `;
            
            typeCategories.forEach(cat => {
                const count = notes.filter(n => n.category === cat.id && n.type === learningCurrentType).length;
                html += `
                    <div onclick="selectLearningCategory(${inlineHandlerArg(cat.id)})" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${learningCurrentCategory === cat.id ? 'background: linear-gradient(135deg, #667eea, #764ba2); color: white;' : 'background: rgba(102,126,234,0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(102,126,234,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(102,126,234,0.1)'">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</span>
                            <div style="display: flex; gap: 4px;">
                                <span style="font-size: 0.8rem;">${count}</span>
                                <button onclick="event.stopPropagation(); deleteLearningCategory(${inlineHandlerArg(cat.id)})" style="background: none; border: none; cursor: pointer; opacity: 0.6;" title="删除">×</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            document.getElementById('learningCategories').innerHTML = html;
        }

        function selectLearningCategory(catId) {
            learningCurrentCategory = catId;
            const categories = JSON.parse(localStorage.getItem('vitaflow_learning_categories') || '[]');
            if (catId === null) {
                document.getElementById('learningCurrentTitle').textContent = '📝 全部笔记';
            } else {
                const cat = categories.find(c => c.id === catId);
                document.getElementById('learningCurrentTitle').textContent = `📝 ${cat ? cat.emoji + ' ' + cat.name : ''}`;
            }
            renderLearningCategories();
            renderLearningNotes();
        }

        function addLearningCategory() {
            const name = prompt('请输入分类名称：');
            if (!name) return;
            const emoji = prompt('请输入表情符号：') || '📌';
            
            const categories = JSON.parse(localStorage.getItem('vitaflow_learning_categories') || '[]');
            categories.push({ id: Date.now().toString(), name, emoji, type: learningCurrentType });
            localStorage.setItem('vitaflow_learning_categories', JSON.stringify(categories));
            
            renderLearningCategories();
        }

	        function deleteLearningCategory(catId) {
	            const categories = JSON.parse(localStorage.getItem('vitaflow_learning_categories') || '[]');
	            const categoryIndex = categories.findIndex(c => c.id === catId);
	            if (categoryIndex < 0) return;
	            if (!confirm('确定要删除这个分类吗？笔记不会被删除。')) return;
            
            const notes = JSON.parse(localStorage.getItem('vitaflow_learning_notes') || '[]');
            notes.forEach(note => {
                if (note.category === catId) note.category = null;
            });
            localStorage.setItem('vitaflow_learning_notes', JSON.stringify(notes));
            
	            categories.splice(categoryIndex, 1);
            localStorage.setItem('vitaflow_learning_categories', JSON.stringify(categories));
            
            renderLearningCategories();
            renderLearningNotes();
        }

        function renderLearningNotes(searchTerm = '') {
            const notes = JSON.parse(localStorage.getItem('vitaflow_learning_notes') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_learning_categories') || '[]');
            
            let filtered = notes.filter(n => n.type === learningCurrentType);
            if (learningCurrentCategory) {
                filtered = filtered.filter(n => n.category === learningCurrentCategory);
            }
            if (searchTerm) {
                filtered = filtered.filter(n => n.title.includes(searchTerm) || n.content.includes(searchTerm));
            }
            
            if (filtered.length === 0) {
                document.getElementById('learningNotes').innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #8b7a7a;">
                        <div style="font-size: 3rem; margin-bottom: 12px;">📝</div>
                        <div>暂无笔记</div>
                    </div>
                `;
                return;
            }
            
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            let html = '';
            filtered.forEach(note => {
                const cat = categories.find(c => c.id === note.category);
                const dateStr = new Date(note.date).toLocaleDateString('zh-CN');
                const preview = note.content.slice(0, 80) + (note.content.length > 80 ? '...' : '');
                
                html += `
                    <div onclick="openLearningEditor(${inlineHandlerArg(note.id)})" style="background: rgba(255,255,255,0.7); border-radius: 16px; padding: 16px; cursor: pointer; border: 1px solid rgba(102, 126, 234, 0.2);" onmouseover="this.style.background='rgba(102,126,234,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 8px; font-size: 1rem;">${escapeHtml(note.title)}</div>
                        <div style="font-size: 0.85rem; color: #5a4a5a; line-height: 1.5; margin-bottom: 10px; white-space: pre-wrap;">${escapeHtml(preview)}</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-size: 0.75rem; color: #8b7a7a;">${dateStr}</div>
                            ${cat ? `<div style="font-size: 0.75rem; background: rgba(102,126,234,0.2); padding: 2px 8px; border-radius: 8px;">${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</div>` : ''}
                        </div>
                    </div>
                `;
            });
            
            document.getElementById('learningNotes').innerHTML = html;
        }

        function openLearningEditor(noteId = null) {
            closeLearningPopup();
            
            const notes = JSON.parse(localStorage.getItem('vitaflow_learning_notes') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_learning_categories') || '[]');
            const note = noteId ? notes.find(n => n.id === noteId) : null;
            
            const typeLabels = { benchmark: '对标分析', business: 'IP商业分析', skills: '新技能学习' };
            
            learningCurrentPopup = document.createElement('div');
            learningCurrentPopup.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center;';
            learningCurrentPopup.onclick = function(e) { if (e.target === this) closeLearningPopup(); };
            
            const saveFunc = 'saveLearningNote(' + inlineHandlerArg(note ? note.id : null) + ')';
            
            learningCurrentPopup.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 2001; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="font-weight: 700; font-size: 1.3rem; color: #6a4a7a;">${note ? '✏️ 编辑笔记' : '📝 新建笔记'} - ${typeLabels[learningCurrentType]}</div>
                        <button onclick="closeLearningPopup()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 6px;">标题</label>
                        <input type="text" id="learningNoteTitle" placeholder="输入笔记标题..." style="width: 100%; padding: 12px; border: 2px solid rgba(102,126,234,0.3); border-radius: 12px; font-size: 1rem;" value="${note ? escapeHtml(note.title) : ''}">
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 6px;">归类（可选）</label>
                        <select id="learningCategory" style="width: 100%; padding: 12px; border: 2px solid rgba(102,126,234,0.3); border-radius: 12px; font-size: 1rem;">
                            <option value="">不归类</option>
                            ${categories.filter(c => c.type === learningCurrentType).map(c => `<option value="${escapeHtml(c.id)}" ${note && note.category === c.id ? 'selected' : ''}>${escapeHtml(c.emoji)} ${escapeHtml(c.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 6px;">笔记内容</label>
                        <textarea id="learningContent" placeholder="输入笔记内容..." style="width: 100%; height: 200px; padding: 12px; border: 2px solid rgba(102,126,234,0.3); border-radius: 12px; font-size: 1rem; resize: vertical;">${note ? escapeHtml(note.content) : ''}</textarea>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: rgba(200, 160, 200, 0.3);" onclick="closeLearningPopup()">取消</button>
                        ${note ? `<button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #c4679c, #8b5e9e);" onclick="deleteLearningNote(${inlineHandlerArg(note.id)})">删除</button>` : ''}
                        <button class="add-btn" style="flex: 2; background: linear-gradient(135deg, #667eea, #764ba2);" onclick="${saveFunc}">保存笔记</button>
                    </div>
                </div>
            `;
            document.body.appendChild(learningCurrentPopup);
        }

        function saveLearningNote(noteId) {
            const title = document.getElementById('learningNoteTitle').value.trim();
            const content = document.getElementById('learningContent').value.trim();
            const category = document.getElementById('learningCategory').value;
            
            if (!title) { alert('请输入笔记标题！'); return; }
            
            let notes = JSON.parse(localStorage.getItem('vitaflow_learning_notes') || '[]');
            
            if (noteId !== null && noteId !== undefined && noteId !== 'null') {
                const index = notes.findIndex(n => n.id === noteId);
                if (index >= 0) {
                    notes[index] = { ...notes[index], title, content, category: category || null, date: new Date().toISOString() };
                }
            } else {
                notes.push({ id: Date.now().toString(), title, content, category: category || null, type: learningCurrentType, date: new Date().toISOString() });
            }
            
            localStorage.setItem('vitaflow_learning_notes', JSON.stringify(notes));
            closeLearningPopup();
            renderLearningNotes();
            renderLearningCategories();
            updateLearningCount();
        }

        function deleteLearningNote(noteId) {
            if (!confirm('确定要删除这条笔记吗？')) return;
            let notes = JSON.parse(localStorage.getItem('vitaflow_learning_notes') || '[]');
            notes = notes.filter(n => n.id !== noteId);
            localStorage.setItem('vitaflow_learning_notes', JSON.stringify(notes));
            closeLearningPopup();
            renderLearningNotes();
            renderLearningCategories();
            updateLearningCount();
        }

        function searchLearningNotes() {
            const term = document.getElementById('learningSearch').value.trim();
            renderLearningNotes(term);
        }

        function updateLearningCount() {
            const notes = JSON.parse(localStorage.getItem('vitaflow_learning_notes') || '[]');
            const counts = { benchmark: 0, business: 0, skills: 0 };
            notes.forEach(n => { if (counts[n.type] !== undefined) counts[n.type]++; });
            const ids = { benchmark: 'benchmarkCount', business: 'businessCount', skills: 'skillsCount' };
            Object.keys(counts).forEach(type => {
                const el = document.getElementById(ids[type]);
                if (el) el.textContent = counts[type] + ' 个笔记';
            });
        }

        // 读书笔记模块
        let readingCurrentCategory = null;
        let readingCurrentPopup = null;

        function closeReadingPopup() {
            if (readingCurrentPopup) {
                readingCurrentPopup.remove();
                readingCurrentPopup = null;
            }
        }

        function openReadingNoteDetail() {
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById('readingNotePage').classList.add('active');
            readingCurrentCategory = null;
            document.getElementById('readingCurrentTitle').textContent = '📝 全部书籍';
            renderReadingCategories();
            renderReadingNotes();
            updateReadingNoteCount();
        }

        function renderReadingCategories() {
            const categories = JSON.parse(localStorage.getItem('vitaflow_reading_categories') || '[]');
            const notes = JSON.parse(localStorage.getItem('vitaflow_reading_notes') || '[]');
            
            let html = `
                <div onclick="selectReadingCategory(null)" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${readingCurrentCategory === null ? 'background: linear-gradient(135deg, #74ebd5, #9face6); color: white;' : 'background: rgba(116, 235, 213, 0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(116,235,213,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(116,235,213,0.1)'">
                    📚 全部书籍 <span style="float: right; font-size: 0.8rem;">${notes.length}</span>
                </div>
            `;
            
            categories.forEach(cat => {
                const count = notes.filter(n => n.category === cat.id).length;
                html += `
                    <div onclick="selectReadingCategory(${inlineHandlerArg(cat.id)})" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${readingCurrentCategory === cat.id ? 'background: linear-gradient(135deg, #74ebd5, #9face6); color: white;' : 'background: rgba(116,235,213,0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(116,235,213,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(116,235,213,0.1)'">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</span>
                            <div style="display: flex; gap: 4px;">
                                <span style="font-size: 0.8rem;">${count}</span>
                                <button onclick="event.stopPropagation(); deleteReadingCategory(${inlineHandlerArg(cat.id)})" style="background: none; border: none; cursor: pointer; opacity: 0.6;" title="删除">×</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            document.getElementById('readingCategories').innerHTML = html;
        }

        function selectReadingCategory(catId) {
            readingCurrentCategory = catId;
            const categories = JSON.parse(localStorage.getItem('vitaflow_reading_categories') || '[]');
            if (catId === null) {
                document.getElementById('readingCurrentTitle').textContent = '📚 全部书籍';
            } else {
                const cat = categories.find(c => c.id === catId);
                document.getElementById('readingCurrentTitle').textContent = `📚 ${cat ? cat.emoji + ' ' + cat.name : ''}`;
            }
            renderReadingCategories();
            renderReadingNotes();
        }

        function addReadingCategory() {
            const name = prompt('请输入书籍分类名称（如：小说、心理学、技术类）：');
            if (!name) return;
            const emoji = prompt('请输入表情符号：') || '📖';
            
            const categories = JSON.parse(localStorage.getItem('vitaflow_reading_categories') || '[]');
            categories.push({ id: Date.now().toString(), name, emoji });
            localStorage.setItem('vitaflow_reading_categories', JSON.stringify(categories));
            
            renderReadingCategories();
        }

	        function deleteReadingCategory(catId) {
	            const categories = JSON.parse(localStorage.getItem('vitaflow_reading_categories') || '[]');
	            const categoryIndex = categories.findIndex(c => c.id === catId);
	            if (categoryIndex < 0) return;
	            if (!confirm('确定要删除这个分类吗？笔记不会被删除。')) return;
            
            const notes = JSON.parse(localStorage.getItem('vitaflow_reading_notes') || '[]');
            notes.forEach(note => { if (note.category === catId) note.category = null; });
            localStorage.setItem('vitaflow_reading_notes', JSON.stringify(notes));
            
	            categories.splice(categoryIndex, 1);
            localStorage.setItem('vitaflow_reading_categories', JSON.stringify(categories));
            
            renderReadingCategories();
            renderReadingNotes();
        }

        function renderReadingNotes(searchTerm = '') {
            const notes = JSON.parse(localStorage.getItem('vitaflow_reading_notes') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_reading_categories') || '[]');
            
            let filtered = [...notes];
            if (readingCurrentCategory) {
                filtered = filtered.filter(n => n.category === readingCurrentCategory);
            }
            if (searchTerm) {
                filtered = filtered.filter(n => n.bookTitle.includes(searchTerm) || n.thoughts.includes(searchTerm) || n.summary.includes(searchTerm));
            }
            
            if (filtered.length === 0) {
                document.getElementById('readingNotes').innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #8b7a7a;">
                        <div style="font-size: 3rem; margin-bottom: 12px;">📖</div>
                        <div>暂无读书笔记</div>
                    </div>
                `;
                return;
            }
            
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            let html = '';
            filtered.forEach(note => {
                const cat = categories.find(c => c.id === note.category);
                const dateStr = new Date(note.date).toLocaleDateString('zh-CN');
                const progress = Math.max(0, Math.min(100, Number(note.progress) || 0));
                
                html += `
                    <div onclick="openReadingEditor(${inlineHandlerArg(note.id)})" style="background: rgba(255,255,255,0.7); border-radius: 16px; padding: 16px; cursor: pointer; border: 1px solid rgba(116, 235, 213, 0.3);" onmouseover="this.style.background='rgba(116,235,213,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 8px; font-size: 1rem;">📖 ${escapeHtml(note.bookTitle)}</div>
                        <div style="font-size: 0.85rem; color: #5a4a5a; margin-bottom: 8px;">章节：${escapeHtml(note.chapter) || '未设置'}</div>
                        <div style="background: rgba(116,235,213,0.2); border-radius: 8px; height: 6px; margin-bottom: 8px;">
                            <div style="background: linear-gradient(135deg, #74ebd5, #9face6); height: 100%; border-radius: 8px; width: ${progress}%;"></div>
                        </div>
                        <div style="font-size: 0.75rem; color: #8b7a7a; margin-bottom: 8px;">阅读进度：${progress}%</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-size: 0.75rem; color: #8b7a7a;">${dateStr}</div>
                            ${cat ? `<div style="font-size: 0.75rem; background: rgba(116,235,213,0.3); padding: 2px 8px; border-radius: 8px;">${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</div>` : ''}
                        </div>
                    </div>
                `;
            });
            
            document.getElementById('readingNotes').innerHTML = html;
        }

        function openReadingEditor(noteId = null) {
            closeReadingPopup();
            
            const notes = JSON.parse(localStorage.getItem('vitaflow_reading_notes') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_reading_categories') || '[]');
            const note = noteId ? notes.find(n => n.id === noteId) : null;
            const progress = note ? Math.max(0, Math.min(100, Number(note.progress) || 0)) : 0;
            
            readingCurrentPopup = document.createElement('div');
            readingCurrentPopup.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center;';
            readingCurrentPopup.onclick = function(e) { if (e.target === this) closeReadingPopup(); };
            
            readingCurrentPopup.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 2001; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="font-weight: 700; font-size: 1.3rem; color: #6a4a7a;">${note ? '✏️ 编辑读书笔记' : '📖 新建读书笔记'}</div>
                        <button onclick="closeReadingPopup()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(116,235,213,0.1), rgba(159,206,230,0.1)); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">📚 书籍信息</div>
                        <div style="margin-bottom: 12px;">
                            <input type="text" id="readingBookTitle" placeholder="书名：《...》" style="width: 100%; padding: 12px; border: 2px solid rgba(116,235,213,0.3); border-radius: 12px; font-size: 1rem;" value="${note ? escapeHtml(note.bookTitle) : ''}">
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <div style="flex: 1;">
                                <input type="text" id="readingChapter" placeholder="当前章节" style="width: 100%; padding: 12px; border: 2px solid rgba(116,235,213,0.3); border-radius: 12px; font-size: 1rem;" value="${note ? escapeHtml(note.chapter) : ''}">
                            </div>
                            <div style="flex: 1;">
                                <select id="readingCategorySelect" style="width: 100%; padding: 12px; border: 2px solid rgba(116,235,213,0.3); border-radius: 12px; font-size: 1rem;">
                                    <option value="">选择分类</option>
                                    ${categories.map(c => `<option value="${escapeHtml(c.id)}" ${note && note.category === c.id ? 'selected' : ''}>${escapeHtml(c.emoji)} ${escapeHtml(c.name)}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div style="margin-top: 12px;">
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 8px;">阅读进度：<span id="readingProgressValue">${progress}</span>%</div>
                            <input type="range" id="readingProgress" min="0" max="100" value="${progress}" oninput="document.getElementById('readingProgressValue').textContent = this.value" style="width: 100%;">
                        </div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.8); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">📝 章节小结</div>
                        <textarea id="readingSummary" placeholder="用自己的话总结这一章节/部分的核心内容..." style="width: 100%; height: 100px; padding: 12px; border: 2px solid rgba(116,235,213,0.2); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${note ? escapeHtml(note.summary) : ''}</textarea>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(116,235,213,0.1), rgba(159,206,230,0.1)); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">💡 思考与感悟</div>
                        <textarea id="readingThoughts" placeholder="这一章节引发了哪些思考？&#10;• 与已有知识有什么联系？&#10;• 有什么疑问或困惑？&#10;• 对实际生活有什么启发？" style="width: 100%; height: 120px; padding: 12px; border: 2px solid rgba(116,235,213,0.3); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${note ? escapeHtml(note.thoughts) : ''}</textarea>
                    </div>

                    <div style="background: rgba(255,255,255,0.8); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">📒 摘录与笔记</div>
                        <textarea id="readingQuotes" placeholder="记录喜欢的段落、金句或重要知识点..." style="width: 100%; height: 100px; padding: 12px; border: 2px solid rgba(116,235,213,0.2); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${note ? escapeHtml(note.quotes) : ''}</textarea>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(116,235,213,0.1), rgba(159,206,230,0.1)); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">🎯 下一步行动</div>
                        <textarea id="readingAction" placeholder="基于阅读内容，接下来要做什么？&#10;• 继续阅读下一章节&#10;• 查找相关资料&#10;• 实践书中的方法" style="width: 100%; height: 80px; padding: 12px; border: 2px solid rgba(116,235,213,0.3); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${note ? escapeHtml(note.action) : ''}</textarea>
                    </div>
                    
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: rgba(200, 160, 200, 0.3);" onclick="closeReadingPopup()">取消</button>
                        ${note ? `<button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #c4679c, #8b5e9e);" onclick="deleteReadingNote(${inlineHandlerArg(note.id)})">删除</button>` : ''}
                        <button class="add-btn" style="flex: 2; background: linear-gradient(135deg, #74ebd5, #9face6);" onclick="saveReadingNote(${inlineHandlerArg(note ? note.id : null)})">保存笔记</button>
                    </div>
                </div>
            `;
            document.body.appendChild(readingCurrentPopup);
        }

        function saveReadingNote(noteId) {
            const bookTitle = document.getElementById('readingBookTitle').value.trim();
            const chapter = document.getElementById('readingChapter').value.trim();
            const category = document.getElementById('readingCategorySelect').value;
            const progress = parseInt(document.getElementById('readingProgress').value);
            const summary = document.getElementById('readingSummary').value.trim();
            const thoughts = document.getElementById('readingThoughts').value.trim();
            const quotes = document.getElementById('readingQuotes').value.trim();
            const action = document.getElementById('readingAction').value.trim();
            
            if (!bookTitle) { alert('请输入书名！'); return; }
            
            let notes = JSON.parse(localStorage.getItem('vitaflow_reading_notes') || '[]');
            
            if (noteId && noteId !== 'null') {
                const index = notes.findIndex(n => n.id === noteId);
                if (index >= 0) {
                    notes[index] = { ...notes[index], bookTitle, chapter, category: category || null, progress, summary, thoughts, quotes, action, date: new Date().toISOString() };
                }
            } else {
                notes.push({ id: Date.now().toString(), bookTitle, chapter, category: category || null, progress, summary, thoughts, quotes, action, date: new Date().toISOString() });
            }
            
            localStorage.setItem('vitaflow_reading_notes', JSON.stringify(notes));
            closeReadingPopup();
            renderReadingNotes();
            renderReadingCategories();
            updateReadingNoteCount();
        }

        function deleteReadingNote(noteId) {
            if (!confirm('确定要删除这条读书笔记吗？')) return;
            let notes = JSON.parse(localStorage.getItem('vitaflow_reading_notes') || '[]');
            notes = notes.filter(n => n.id !== noteId);
            localStorage.setItem('vitaflow_reading_notes', JSON.stringify(notes));
            closeReadingPopup();
            renderReadingNotes();
            renderReadingCategories();
            updateReadingNoteCount();
        }

        function searchReadingNotes() {
            const term = document.getElementById('readingSearch').value.trim();
            renderReadingNotes(term);
        }

        function updateReadingNoteCount() {
            const notes = JSON.parse(localStorage.getItem('vitaflow_reading_notes') || '[]');
            const el = document.getElementById('readingNoteCount');
            if (el) el.textContent = notes.length + ' 个笔记';
        }

        // 电影鉴赏模块
        let filmCurrentCategory = null;
        let filmCurrentPopup = null;
        let filmImageData = [];

        function closeFilmPopup() {
            if (filmCurrentPopup) {
                filmCurrentPopup.remove();
                filmCurrentPopup = null;
                filmImageData = [];
            }
        }

        function openFilmDetail() {
            document.getElementById('mainPage').style.display = 'none';
            document.querySelectorAll('.detail-page').forEach(p => p.classList.remove('active'));
            document.getElementById('filmPage').classList.add('active');
            filmCurrentCategory = null;
            document.getElementById('filmCurrentTitle').textContent = '🎬 全部电影';
            renderFilmCategories();
            renderFilmNotes();
            updateFilmCount();
        }

        function renderFilmCategories() {
            const categories = JSON.parse(localStorage.getItem('vitaflow_film_categories') || '[]');
            const notes = JSON.parse(localStorage.getItem('vitaflow_film_notes') || '[]');
            
            let html = `
                <div onclick="selectFilmCategory(null)" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${filmCurrentCategory === null ? 'background: linear-gradient(135deg, #e88a4c, #d470a0); color: white;' : 'background: rgba(232,138,76,0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(232,138,76,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(232,138,76,0.1)'">
                    🎬 全部电影 <span style="float: right; font-size: 0.8rem;">${notes.length}</span>
                </div>
            `;
            
            categories.forEach(cat => {
                const count = notes.filter(n => n.category === cat.id).length;
                html += `
                    <div onclick="selectFilmCategory(${inlineHandlerArg(cat.id)})" style="padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; ${filmCurrentCategory === cat.id ? 'background: linear-gradient(135deg, #e88a4c, #d470a0); color: white;' : 'background: rgba(232,138,76,0.1);'}" onmouseover="if(!this.style.color) this.style.background='rgba(232,138,76,0.2)'" onmouseout="if(!this.style.color) this.style.background='rgba(232,138,76,0.1)'">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</span>
                            <div style="display: flex; gap: 4px;">
                                <span style="font-size: 0.8rem;">${count}</span>
                                <button onclick="event.stopPropagation(); deleteFilmCategory(${inlineHandlerArg(cat.id)})" style="background: none; border: none; cursor: pointer; opacity: 0.6;" title="删除">×</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            document.getElementById('filmCategories').innerHTML = html;
        }

        function selectFilmCategory(catId) {
            filmCurrentCategory = catId;
            const categories = JSON.parse(localStorage.getItem('vitaflow_film_categories') || '[]');
            if (catId === null) {
                document.getElementById('filmCurrentTitle').textContent = '🎬 全部电影';
            } else {
                const cat = categories.find(c => c.id === catId);
                document.getElementById('filmCurrentTitle').textContent = `🎬 ${cat ? cat.emoji + ' ' + cat.name : ''}`;
            }
            renderFilmCategories();
            renderFilmNotes();
        }

        function addFilmCategory() {
            const name = prompt('请输入电影分类名称（如：剧情片、纪录片、科幻片）：');
            if (!name) return;
            const emoji = prompt('请输入表情符号：') || '🎬';
            
            const categories = JSON.parse(localStorage.getItem('vitaflow_film_categories') || '[]');
            categories.push({ id: Date.now().toString(), name, emoji });
            localStorage.setItem('vitaflow_film_categories', JSON.stringify(categories));
            
            renderFilmCategories();
        }

	        function deleteFilmCategory(catId) {
	            const categories = JSON.parse(localStorage.getItem('vitaflow_film_categories') || '[]');
	            const categoryIndex = categories.findIndex(c => c.id === catId);
	            if (categoryIndex < 0) return;
	            if (!confirm('确定要删除这个分类吗？笔记不会被删除。')) return;
            
            const notes = JSON.parse(localStorage.getItem('vitaflow_film_notes') || '[]');
            notes.forEach(note => { if (note.category === catId) note.category = null; });
            localStorage.setItem('vitaflow_film_notes', JSON.stringify(notes));
            
	            categories.splice(categoryIndex, 1);
            localStorage.setItem('vitaflow_film_categories', JSON.stringify(categories));
            
            renderFilmCategories();
            renderFilmNotes();
        }

        function renderFilmNotes(searchTerm = '') {
            const notes = JSON.parse(localStorage.getItem('vitaflow_film_notes') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_film_categories') || '[]');
            
            let filtered = [...notes];
            if (filmCurrentCategory) {
                filtered = filtered.filter(n => n.category === filmCurrentCategory);
            }
            if (searchTerm) {
                filtered = filtered.filter(n => n.filmTitle.includes(searchTerm) || n.director.includes(searchTerm) || n.reflection.includes(searchTerm));
            }
            
            if (filtered.length === 0) {
                document.getElementById('filmNotes').innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #8b7a7a;">
                        <div style="font-size: 3rem; margin-bottom: 12px;">🎬</div>
                        <div>暂无电影笔记</div>
                    </div>
                `;
                return;
            }
            
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            let html = '';
            filtered.forEach(note => {
                const cat = categories.find(c => c.id === note.category);
                const dateStr = new Date(note.date).toLocaleDateString('zh-CN');
                const preview = note.reflection ? note.reflection.slice(0, 60) + (note.reflection.length > 60 ? '...' : '') : '';
                const rating = Math.max(0, Math.min(10, Number.parseInt(note.rating, 10) || 0));

                html += `
                    <div onclick="openFilmEditor(${inlineHandlerArg(note.id)})" style="background: rgba(255,255,255,0.7); border-radius: 16px; padding: 16px; cursor: pointer; border: 1px solid rgba(232,138,76,0.3);" onmouseover="this.style.background='rgba(232,138,76,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                        ${note.images && note.images.length > 0 ? `<div style="width: 100%; height: 100px; border-radius: 12px; overflow: hidden; margin-bottom: 12px; background: rgba(232,138,76,0.1);"><img src="${escapeHtml(note.images[0])}" style="width: 100%; height: 100%; object-fit: cover;"></div>` : ''}
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 8px; font-size: 1rem;">🎬 ${escapeHtml(note.filmTitle)}</div>
                        <div style="font-size: 0.85rem; color: #5a4a5a; margin-bottom: 8px;">导演：${escapeHtml(note.director) || '未知'}</div>
                        <div style="font-size: 0.85rem; color: #5a4a5a; margin-bottom: 8px;">评分：${'⭐'.repeat(rating)}</div>
                        ${preview ? `<div style="font-size: 0.85rem; color: #5a4a5a; line-height: 1.4;">${escapeHtml(preview)}</div>` : ''}
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                            <div style="font-size: 0.75rem; color: #8b7a7a;">${dateStr}</div>
                            ${cat ? `<div style="font-size: 0.75rem; background: rgba(232,138,76,0.2); padding: 2px 8px; border-radius: 8px;">${escapeHtml(cat.emoji)} ${escapeHtml(cat.name)}</div>` : ''}
                        </div>
                    </div>
                `;
            });
            
            document.getElementById('filmNotes').innerHTML = html;
        }

        function openFilmEditor(noteId = null) {
            closeFilmPopup();
            
            const notes = JSON.parse(localStorage.getItem('vitaflow_film_notes') || '[]');
            const categories = JSON.parse(localStorage.getItem('vitaflow_film_categories') || '[]');
            const note = noteId ? notes.find(n => n.id === noteId) : null;
            const rating = note ? Math.max(1, Math.min(10, Number.parseInt(note.rating, 10) || 5)) : 5;
            
            filmImageData = note && note.images ? [...note.images] : [];
            
            filmCurrentPopup = document.createElement('div');
            filmCurrentPopup.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center;';
            filmCurrentPopup.onclick = function(e) { if (e.target === this) closeFilmPopup(); };
            
            filmCurrentPopup.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 2001; max-width: 900px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="font-weight: 700; font-size: 1.3rem; color: #6a4a7a;">${note ? '✏️ 编辑电影笔记' : '🎬 新建电影笔记'}</div>
                        <button onclick="closeFilmPopup()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(232,138,76,0.1), rgba(212,112,160,0.1)); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">🎬 电影基本信息</div>
                        <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                            <div style="flex: 2;">
                                <input type="text" id="filmTitle" placeholder="电影名称" style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem;" value="${note ? escapeHtml(note.filmTitle) : ''}">
                            </div>
                            <div style="flex: 1;">
                                <input type="text" id="filmYear" placeholder="年份" style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem;" value="${note ? escapeHtml(note.year) : ''}">
                            </div>
                        </div>
                        <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                            <div style="flex: 1;">
                                <input type="text" id="filmDirector" placeholder="导演" style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem;" value="${note ? escapeHtml(note.director) : ''}">
                            </div>
                            <div style="flex: 1;">
                                <select id="filmCategory" style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem;">
                                    <option value="">选择分类</option>
                                    ${categories.map(c => `<option value="${escapeHtml(c.id)}" ${note && note.category === c.id ? 'selected' : ''}>${escapeHtml(c.emoji)} ${escapeHtml(c.name)}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <select id="filmGenre" style="width: 100%; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 1rem;">
                                <option value="">选择类型</option>
                                <option value="剧情" ${note && note.genre === '剧情' ? 'selected' : ''}>剧情</option>
                                <option value="喜剧" ${note && note.genre === '喜剧' ? 'selected' : ''}>喜剧</option>
                                <option value="动作" ${note && note.genre === '动作' ? 'selected' : ''}>动作</option>
                                <option value="科幻" ${note && note.genre === '科幻' ? 'selected' : ''}>科幻</option>
                                <option value="悬疑" ${note && note.genre === '悬疑' ? 'selected' : ''}>悬疑</option>
                                <option value="恐怖" ${note && note.genre === '恐怖' ? 'selected' : ''}>恐怖</option>
                                <option value="爱情" ${note && note.genre === '爱情' ? 'selected' : ''}>爱情</option>
                                <option value="纪录片" ${note && note.genre === '纪录片' ? 'selected' : ''}>纪录片</option>
                                <option value="动画" ${note && note.genre === '动画' ? 'selected' : ''}>动画</option>
                            </select>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 8px;">个人评分：<span id="filmRatingValue">${rating}</span>/10</div>
                            <input type="range" id="filmRating" min="1" max="10" value="${rating}" oninput="document.getElementById('filmRatingValue').textContent = this.value" style="width: 100%;">
                        </div>
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; font-weight: 600; color: #6a4a7a; margin-bottom: 8px;">🖼️ 海报/截图上传</label>
                            <input type="file" id="filmImage" accept="image/*" style="display: none;" onchange="previewFilmImage(event)">
                            <button class="add-btn" style="background: rgba(232,138,76,0.2); color: #6a4a7a; border: 1px dashed rgba(232,138,76,0.4);" onclick="document.getElementById('filmImage').click()">上传图片</button>
                            <div id="filmImagePreview" style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 12px;"></div>
                        </div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.8); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">🎬 导演视角分析</div>
                        <div style="margin-bottom: 12px;">
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 6px;">导演想要表达什么？叙事风格有何特点？</div>
                            <textarea id="filmDirectorView" placeholder="从编导角度分析：&#10;• 导演的创作意图&#10;• 叙事结构与节奏把控&#10;• 镜头语言的运用" style="width: 100%; height: 80px; padding: 12px; border: 2px solid rgba(232,138,76,0.2); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${note ? escapeHtml(note.directorView) : ''}</textarea>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 6px;">技术层面的评价（摄影、剪辑、配乐等）</div>
                            <textarea id="filmTechnical" placeholder="技术分析：&#10;• 摄影风格与画面构图&#10;• 剪辑节奏与转场效果&#10;• 配乐与声音设计" style="width: 100%; height: 80px; padding: 12px; border: 2px solid rgba(232,138,76,0.2); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${note ? escapeHtml(note.technical) : ''}</textarea>
                        </div>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(232,138,76,0.1), rgba(212,112,160,0.1)); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">🎭 影视鉴赏视角</div>
                        <div style="margin-bottom: 12px;">
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 6px;">主题与内涵解读</div>
                            <textarea id="filmTheme" placeholder="主题分析：&#10;• 核心主题是什么？&#10;• 表达了什么深层含义？&#10;• 与社会/文化有什么联系？" style="width: 100%; height: 80px; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${note ? escapeHtml(note.theme) : ''}</textarea>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 6px;">符号、隐喻与象征手法</div>
                            <textarea id="filmSymbolism" placeholder="符号分析：&#10;• 片中有哪些重要符号？&#10;• 有什么隐喻或象征？&#10;• 色彩/场景有何寓意？" style="width: 100%; height: 80px; padding: 12px; border: 2px solid rgba(232,138,76,0.3); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${note ? escapeHtml(note.symbolism) : ''}</textarea>
                        </div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.8); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #6a4a7a; margin-bottom: 12px; font-size: 1.1rem;">💭 个人感受与反思</div>
                        <textarea id="filmReflection" placeholder="写下你的观影感受：&#10;• 这部电影带给你什么触动？&#10;• 与你之前看过的同类型电影相比如何？&#10;• 会推荐给什么人看？" style="width: 100%; height: 120px; padding: 12px; border: 2px solid rgba(232,138,76,0.2); border-radius: 12px; font-size: 0.95rem; resize: vertical;">${note ? escapeHtml(note.reflection) : ''}</textarea>
                    </div>
                    
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: rgba(200, 160, 200, 0.3);" onclick="closeFilmPopup()">取消</button>
                        ${note ? `<button class="add-btn" style="flex: 1; background: linear-gradient(135deg, #c4679c, #8b5e9e);" onclick="deleteFilmNote(${inlineHandlerArg(note.id)})">删除</button>` : ''}
                        <button class="add-btn" style="flex: 2; background: linear-gradient(135deg, #e88a4c, #d470a0);" onclick="saveFilmNote(${inlineHandlerArg(note ? note.id : null)})">保存笔记</button>
                    </div>
                </div>
            `;
            document.body.appendChild(filmCurrentPopup);
            
            if (filmImageData.length > 0) {
                renderFilmImagePreviews();
            }
        }

        function previewFilmImage(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                filmImageData.push(e.target.result);
                renderFilmImagePreviews();
            };
            reader.readAsDataURL(file);
        }

        function renderFilmImagePreviews() {
            const container = document.getElementById('filmImagePreview');
            if (!container) return;
            
            container.innerHTML = filmImageData.map((img, idx) => `
                <div style="position: relative; width: 100px; height: 100px;">
                    <img src="${escapeHtml(img)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                    <button onclick="removeFilmImage(${idx})" style="position: absolute; top: -8px; right: -8px; width: 24px; height: 24px; border-radius: 50%; background: #c4679c; color: white; border: none; cursor: pointer; font-size: 14px; line-height: 24px;">×</button>
                </div>
            `).join('');
        }

        function removeFilmImage(idx) {
            filmImageData.splice(idx, 1);
            renderFilmImagePreviews();
        }

        function saveFilmNote(noteId) {
            const filmTitle = document.getElementById('filmTitle').value.trim();
            const year = document.getElementById('filmYear').value.trim();
            const director = document.getElementById('filmDirector').value.trim();
            const genre = document.getElementById('filmGenre').value;
            const rating = parseInt(document.getElementById('filmRating').value);
            const category = document.getElementById('filmCategory').value;
            const directorView = document.getElementById('filmDirectorView').value.trim();
            const technical = document.getElementById('filmTechnical').value.trim();
            const theme = document.getElementById('filmTheme').value.trim();
            const symbolism = document.getElementById('filmSymbolism').value.trim();
            const reflection = document.getElementById('filmReflection').value.trim();
            
            if (!filmTitle) { alert('请输入电影名称！'); return; }
            
            let notes = JSON.parse(localStorage.getItem('vitaflow_film_notes') || '[]');
            
            if (noteId && noteId !== 'null') {
                const index = notes.findIndex(n => n.id === noteId);
                if (index >= 0) {
                    notes[index] = { ...notes[index], filmTitle, year, director, genre, rating, category: category || null, directorView, technical, theme, symbolism, reflection, images: filmImageData, date: new Date().toISOString() };
                }
            } else {
                notes.push({ id: Date.now().toString(), filmTitle, year, director, genre, rating, category: category || null, directorView, technical, theme, symbolism, reflection, images: filmImageData, date: new Date().toISOString() });
            }
            
            localStorage.setItem('vitaflow_film_notes', JSON.stringify(notes));
            closeFilmPopup();
            renderFilmNotes();
            renderFilmCategories();
            updateFilmCount();
        }

        function deleteFilmNote(noteId) {
            if (!confirm('确定要删除这条电影笔记吗？')) return;
            let notes = JSON.parse(localStorage.getItem('vitaflow_film_notes') || '[]');
            notes = notes.filter(n => n.id !== noteId);
            localStorage.setItem('vitaflow_film_notes', JSON.stringify(notes));
            closeFilmPopup();
            renderFilmNotes();
            renderFilmCategories();
            updateFilmCount();
        }

        function searchFilmNotes() {
            const term = document.getElementById('filmSearch').value.trim();
            renderFilmNotes(term);
        }

        function updateFilmCount() {
            const notes = JSON.parse(localStorage.getItem('vitaflow_film_notes') || '[]');
            const el = document.getElementById('filmCount');
            if (el) el.textContent = notes.length + ' 个笔记';
        }

        // 自媒体运营日历模块
        let mediaCalendarStatsChart = null;

        function initMediaCalendarStorage() {
            if (!localStorage.getItem('vitaflow_media_calendar')) {
                localStorage.setItem('vitaflow_media_calendar', JSON.stringify({}));
            }
            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(startDate.getDate() - 6);
            document.getElementById('mediaCalendarStartDate').value = formatLocalDate(startDate);
            document.getElementById('mediaCalendarEndDate').value = formatLocalDate(today);
        }

        function renderMediaCalendar() {
            const startDate = document.getElementById('mediaCalendarStartDate').value;
            const endDate = document.getElementById('mediaCalendarEndDate').value;
            
            if (!startDate || !endDate) {
                alert('请选择开始和结束日期');
                return;
            }
            
            const start = parseLocalDate(startDate);
            const end = parseLocalDate(endDate);
            
            if (start > end) {
                alert('开始日期不能晚于结束日期');
                return;
            }
            
            const data = JSON.parse(localStorage.getItem('vitaflow_media_calendar') || '{}');
            const tableEl = document.getElementById('mediaCalendarTable');
            
            const dates = [];
            const current = new Date(start);
            while (current <= end) {
                dates.push(formatLocalDate(current));
                current.setDate(current.getDate() + 1);
            }
            
            let html = `
                <table style="width: 100%; border-collapse: separate; border-spacing: 0 12px;">
                    <thead>
                        <tr style="background: linear-gradient(135deg, rgba(196, 103, 156, 0.1), rgba(139, 94, 158, 0.1));">
                            <th style="padding: 12px 16px; border-radius: 12px 0 0 12px; font-weight: 600; color: #6a4a5a; text-align: left; width: 120px;">日期</th>
                            <th style="padding: 12px 8px; font-weight: 600; color: #ffb347; text-align: center; width: 60px;">抖音</th>
                            <th style="padding: 12px 8px; font-weight: 600; color: #c4679c; text-align: center; width: 60px;">网易</th>
                            <th style="padding: 12px 8px; font-weight: 600; color: #8b5e9e; text-align: center; width: 60px;">大号</th>
                            <th style="padding: 12px 8px; font-weight: 600; color: #a78bfa; text-align: center; width: 60px;">小号</th>
                            <th style="padding: 12px 8px; font-weight: 600; color: #e88a4c; text-align: center; width: 70px;">小小号</th>
                            <th style="padding: 12px 16px; border-radius: 0 12px 12px 0; font-weight: 600; color: #6a4a5a; text-align: left;">运营想法</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            dates.forEach(dateStr => {
                const dateObj = parseLocalDate(dateStr);
                const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                const dayName = dayNames[dateObj.getDay()];
                const dateDisplay = `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${dayName}`;
                const isToday = dateStr === formatLocalDate();
                
                const record = data[dateStr] || { douyin: false, wangyi: false, dahao: false, xiaohao: false, xiaoxiaohao: false, notes: '' };
                
                html += `
                    <tr style="background: ${isToday ? 'rgba(196, 103, 156, 0.15)' : 'rgba(255, 250, 252, 0.7)'}; border-radius: 16px;">
                        <td style="padding: 14px 16px; border-radius: 16px 0 0 16px; font-weight: ${isToday ? '700' : '500'}; color: ${isToday ? '#c4679c' : '#6a4a5a'};">
                            ${dateDisplay}
                            ${isToday ? '<span style="font-size: 0.7rem; background: rgba(196,103,156,0.3); padding: 2px 6px; border-radius: 6px; margin-left: 4px;">今天</span>' : ''}
                        </td>
                        <td style="padding: 14px 8px; text-align: center;">
                            <input type="checkbox" ${record.douyin ? 'checked' : ''} onchange="saveMediaCalendarItem('${dateStr}', 'douyin', this.checked)" style="width: 20px; height: 20px; accent-color: #ffb347; cursor: pointer;">
                        </td>
                        <td style="padding: 14px 8px; text-align: center;">
                            <input type="checkbox" ${record.wangyi ? 'checked' : ''} onchange="saveMediaCalendarItem('${dateStr}', 'wangyi', this.checked)" style="width: 20px; height: 20px; accent-color: #c4679c; cursor: pointer;">
                        </td>
                        <td style="padding: 14px 8px; text-align: center;">
                            <input type="checkbox" ${record.dahao ? 'checked' : ''} onchange="saveMediaCalendarItem('${dateStr}', 'dahao', this.checked)" style="width: 20px; height: 20px; accent-color: #8b5e9e; cursor: pointer;">
                        </td>
                        <td style="padding: 14px 8px; text-align: center;">
                            <input type="checkbox" ${record.xiaohao ? 'checked' : ''} onchange="saveMediaCalendarItem('${dateStr}', 'xiaohao', this.checked)" style="width: 20px; height: 20px; accent-color: #a78bfa; cursor: pointer;">
                        </td>
                        <td style="padding: 14px 8px; text-align: center;">
                            <input type="checkbox" ${record.xiaoxiaohao ? 'checked' : ''} onchange="saveMediaCalendarItem('${dateStr}', 'xiaoxiaohao', this.checked)" style="width: 20px; height: 20px; accent-color: #e88a4c; cursor: pointer;">
                        </td>
                        <td style="padding: 14px 16px; border-radius: 0 16px 16px 0;">
                            <input type="text" value="${record.notes ? escapeHtml(record.notes) : ''}" placeholder="记录运营想法..." onchange="saveMediaCalendarNotes('${dateStr}', this.value)" style="width: 100%; background: rgba(255, 245, 252, 0.9); border: 1px solid rgba(200, 160, 200, 0.3); border-radius: 12px; padding: 8px 12px; color: #4a3a4a; font-size: 0.9rem; outline: none;">
                        </td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
            tableEl.innerHTML = html;
            renderMediaCalendarStats();
        }

        function saveMediaCalendarItem(dateStr, field, value) {
            const data = JSON.parse(localStorage.getItem('vitaflow_media_calendar') || '{}');
            if (!data[dateStr]) {
                data[dateStr] = { douyin: false, wangyi: false, dahao: false, xiaohao: false, xiaoxiaohao: false, notes: '' };
            }
            data[dateStr][field] = value;
            localStorage.setItem('vitaflow_media_calendar', JSON.stringify(data));
            renderMediaCalendarStats();
        }

        function saveMediaCalendarNotes(dateStr, notes) {
            const data = JSON.parse(localStorage.getItem('vitaflow_media_calendar') || '{}');
            if (!data[dateStr]) {
                data[dateStr] = { douyin: false, wangyi: false, dahao: false, xiaohao: false, xiaoxiaohao: false, notes: '' };
            }
            data[dateStr].notes = notes;
            localStorage.setItem('vitaflow_media_calendar', JSON.stringify(data));
        }

        function renderMediaCalendarStats() {
            const startDate = document.getElementById('mediaCalendarStartDate').value;
            const endDate = document.getElementById('mediaCalendarEndDate').value;
            
            if (!startDate || !endDate) return;
            
            const start = parseLocalDate(startDate);
            const end = parseLocalDate(endDate);
            
            const data = JSON.parse(localStorage.getItem('vitaflow_media_calendar') || '{}');
            
            let stats = { douyin: 0, wangyi: 0, dahao: 0, xiaohao: 0, xiaoxiaohao: 0 };
            const current = new Date(start);
            while (current <= end) {
                const dateStr = formatLocalDate(current);
                const record = data[dateStr] || { douyin: false, wangyi: false, dahao: false, xiaohao: false, xiaoxiaohao: false };
                
                if (record.douyin) stats.douyin++;
                if (record.wangyi) stats.wangyi++;
                if (record.dahao) stats.dahao++;
                if (record.xiaohao) stats.xiaohao++;
                if (record.xiaoxiaohao) stats.xiaoxiaohao++;
                
                current.setDate(current.getDate() + 1);
            }
            
            document.getElementById('mediaStatsDouyin').textContent = stats.douyin;
            document.getElementById('mediaStatsWangyi').textContent = stats.wangyi;
            document.getElementById('mediaStatsDahao').textContent = stats.dahao;
            document.getElementById('mediaStatsXiaohao').textContent = stats.xiaohao;
            document.getElementById('mediaStatsXiaoxiaohao').textContent = stats.xiaoxiaohao;
            
            document.getElementById('mediaCalendarStatsContainer').style.display = 'block';
            
            const ctx = document.getElementById('mediaCalendarStatsChart').getContext('2d');
            if (mediaCalendarStatsChart) mediaCalendarStatsChart.destroy();
            
            mediaCalendarStatsChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['抖音', '网易', '大号', '小号', '小小号'],
                    datasets: [{
                        label: '更新次数',
                        data: [stats.douyin, stats.wangyi, stats.dahao, stats.xiaohao, stats.xiaoxiaohao],
                        backgroundColor: [
                            'rgba(255, 179, 71, 0.6)',
                            'rgba(196, 103, 156, 0.6)',
                            'rgba(139, 94, 158, 0.6)',
                            'rgba(167, 139, 250, 0.6)',
                            'rgba(232, 138, 76, 0.6)'
                        ],
                        borderColor: [
                            '#ffb347',
                            '#c4679c',
                            '#8b5e9e',
                            '#a78bfa',
                            '#e88a4c'
                        ],
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: '时间区间内各平台更新统计',
                            color: '#6a4a5a',
                            font: { size: 14, weight: '600' }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#8b7a7a', font: { size: 12 } },
                            grid: { color: 'rgba(200, 160, 200, 0.2)' }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { color: '#8b7a7a', stepSize: 1 },
                            grid: { color: 'rgba(200, 160, 200, 0.2)' }
                        }
                    }
                }
            });
        }

        // ============================================
        // VITAFLOW_MODULE: sync-and-backup
        function refreshVisibleData() {
            try {
                updateMainScores();
                renderCalendar();
                renderTodoList();
                renderTodoKanban();
                renderEmotionBoard();
                renderPomodoroGrid();
                renderReviewList();
                renderEmotionNotesList();
                updateMediaCounts();
                updateDeepseekCount();
                updateLiteratureCount();
                updateNovelOutlineCount();
                updateReadingNoteCount();
                updateFilmCount();
                renderMediaCalendar();

                const activePage = document.querySelector('.detail-page.active');
                if (!activePage) return;
                if (activePage.id === 'deepseekPage') { renderDeepSeekCategories(); renderDeepSeekDocs(); }
                if (activePage.id === 'literaturePage') { renderLiteratureCategories(); renderLiteratureDocs(); }
                if (activePage.id === 'novelOutlinePage') renderNovelOutlines();
                if (activePage.id === 'readingNotePage') { renderReadingCategories(); renderReadingNotes(); }
                if (activePage.id === 'filmPage') { renderFilmCategories(); renderFilmNotes(); }
                if (activePage.id === 'ideasPage') { updateMediaCounts(); renderIdeaVault(); }
                if (activePage.id === 'streakPage') { renderStreakHistory(); renderStreakChart(); renderStreakAnalysis(); }
            } catch (e) {
                console.warn('刷新可见数据失败:', e);
            }
        }

        // 读取当前 HTML 的源码字符串
        async function getCurrentHtmlSource() {
            const response = await fetch(window.location.href);
            if (!response.ok) throw new Error('无法读取自身源码 (HTTP ' + response.status + ')');
            return await response.text();
        }

        // 把数据注入到 HTML 源码中（替换占位符）
        function injectDataIntoHtml(html, data) {
            const safe = JSON.stringify(data)
                .replace(/</g, '\\u003c')
                .replace(/\u2028/g, '\\u2028')
                .replace(/\u2029/g, '\\u2029');
            // 构造新的注入块
            const block = '<script>window.EMBEDDED_DATA = ' + safe + ';<\/script>';
            // 先移除老的占位符
            const placeholder = /<script>\s*\/\*\s*__EMBEDDED_DATA_PLACEHOLDER__\s*\*\/\s*<\/script>/;
            if (placeholder.test(html)) {
                html = html.replace(placeholder, block);
            } else {
                // 移除老的 EMBEDDED_DATA 赋值块
                html = html.replace(/<script>window\.EMBEDDED_DATA\s*=\s*\{[\s\S]*?\};?<\/script>/, '');
                // 找到 EMBEDDED_DATA_PLACEHOLDER 注释位置插入
                const marker = /<!--\s*EMBEDDED_DATA_PLACEHOLDER[\s\S]*?-->/;
                if (marker.test(html)) {
                    html = html.replace(marker, '<!-- EMBEDDED_DATA_PLACEHOLDER: 自动注入 -->\n    ' + block);
                } else {
                    // 兜底：在 </head> 前插入
                    html = html.replace('</head>', '    ' + block + '\n</head>');
                }
            }
            return html;
        }

        // 从另一个 HTML 文件中导入数据
        function importFromHtmlFile() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.html,text/html';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    const text = await file.text();
                    const match = text.match(/window\.EMBEDDED_DATA\s*=\s*(\{[\s\S]*?\});\s*<\/script>/);
                    if (!match) {
                        alert('❌ 这个 HTML 文件里没有找到嵌入的数据。\n\n请确认你打开的是从本系统导出的"带数据"版本。');
                        return;
                    }
                    const data = JSON.parse(match[1]);
                    const keys = Object.keys(normalizeBackupData(data));
                    if (keys.length === 0) {
                        alert('⚠️ 这个文件里的数据是空的。');
                        return;
                    }
                    if (!confirm('将导入 ' + keys.length + ' 项数据并覆盖当前数据，确定继续吗？')) return;
                    const count = restoreBackupData(data);
                    alert('✅ 已导入 ' + count + ' 项数据！\n\n即将刷新页面...');
                    setTimeout(() => location.reload(), 800);
                } catch (err) {
                    alert('导入失败：' + err.message);
                }
            };
            input.click();
        }

        // 从 JSON 备份导入数据
        function importFromJsonFile() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,application/json';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    const data = JSON.parse(await file.text());
                    const keys = Object.keys(normalizeBackupData(data));
                    if (keys.length === 0) {
                        alert('⚠️ 这个 JSON 文件里没有找到可导入的数据。');
                        return;
                    }
                    if (!confirm('将导入 ' + keys.length + ' 项 JSON 数据并覆盖当前数据，确定继续吗？')) return;
                    const count = restoreBackupData(data);
                    alert('✅ 已导入 ' + count + ' 项 JSON 数据！\n\n即将刷新页面...');
                    setTimeout(() => location.reload(), 800);
                } catch (err) {
                    alert('导入 JSON 失败：' + err.message);
                }
            };
            input.click();
        }

        // 导出 JSON 文件，适合手机/平板/电脑之间手动同步
        function exportJsonFile() {
            const btn = document.getElementById('exportJsonBtn');
            if (btn) { btn.disabled = true; btn.textContent = '⏳ 正在导出...'; }
            try {
                const data = getAllData();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const ts = formatLocalDate();
                a.download = 'my-schedule_' + ts + '.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                updateSaveStatus('✅ 已导出 JSON ' + ts);
            } catch (e) {
                alert('❌ 导出 JSON 失败：' + e.message);
                updateSaveStatus('❌ JSON 导出失败');
            } finally {
                if (btn) { btn.disabled = false; btn.textContent = '📤 导出 JSON'; }
            }
        }

        // 方法 A：导出新的 HTML 文件（含数据）
        async function exportHtmlWithData() {
            const btn = document.getElementById('exportHtmlBtn');
            if (btn) { btn.disabled = true; btn.textContent = '⏳ 正在打包...'; }
            try {
                const data = getAllData();
                const html = await getCurrentHtmlSource();
                const newHtml = injectDataIntoHtml(html, data);
                const blob = new Blob([newHtml], {type: 'text/html;charset=utf-8'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const ts = formatLocalDate();
                a.download = 'schedule-system_' + ts + '_with-data.html';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                updateSaveStatus('✅ 已导出带数据的 HTML ' + ts);
                alert('✅ 导出成功！\n\n文件名：schedule-system_' + ts + '_with-data.html\n\n使用方法：\n1. 打开下载的文件\n2. 你的所有数据会自动恢复\n3. 可以把这个文件拷到任何设备/给任何人用');
            } catch (e) {
                alert('❌ 导出失败：' + e.message + '\n\n可能原因：通过 file:// 打开的页面有时无法读取自身源码。\n请尝试用"💾 直接保存到原文件"按钮。');
                updateSaveStatus('❌ 导出失败');
            } finally {
                if (btn) { btn.disabled = false; btn.textContent = '📤 导出当前 HTML（含数据）'; }
            }
        }

        // 方法 B：直接保存到原 HTML 文件（File System Access API）
        async function saveToOriginalFile(silent) {
            if (!window.showSaveFilePicker) {
                if (!silent) alert('⚠️ 你的浏览器不支持"直接保存到原文件"功能。\n\n请改用"📤 导出当前 HTML"功能。\n（推荐使用 Edge 或 Chrome 浏览器）');
                return false;
            }
            if (isSaving) return false;
            isSaving = true;
            const btn = document.getElementById('saveFileBtn');
            if (btn && !silent) { btn.disabled = true; btn.textContent = '⏳ 保存中...'; }
            try {
                // 第一次需要用户选文件并授权
                if (!fileHandle) {
                    fileHandle = await window.showSaveFilePicker({
                        suggestedName: 'schedule-system-2.0.html',
                        types: [{ description: 'HTML 文件', accept: { 'text/html': ['.html'] } }]
                    });
                    // 保存句柄到 IndexedDB 以便下次自动恢复
                    try { await saveHandleToIDB(fileHandle); } catch (e) {}
                }
                // 检查权限
                if (fileHandle.queryPermission) {
                    const perm = await fileHandle.queryPermission({ mode: 'readwrite' });
                    if (perm !== 'granted') {
                        const req = await fileHandle.requestPermission({ mode: 'readwrite' });
                        if (req !== 'granted') throw new Error('用户未授权');
                    }
                }
                const data = getAllData();
                const html = await getCurrentHtmlSource();
                const newHtml = injectDataIntoHtml(html, data);
                const writable = await fileHandle.createWritable();
                await writable.write(newHtml);
                await writable.close();
                lastSavedDataSnapshot = JSON.stringify(data);
                updateSaveStatus('✅ 已保存到原文件 ' + new Date().toLocaleTimeString('zh-CN'));
                return true;
            } catch (e) {
                if (e.name === 'AbortError') {
                    updateSaveStatus('保存已取消');
                } else if (!silent) {
                    alert('❌ 保存失败：' + e.message);
                    updateSaveStatus('❌ 保存失败');
                }
                fileHandle = null;
                return false;
            } finally {
                isSaving = false;
                if (btn && !silent) { btn.disabled = false; btn.textContent = '💾 直接保存到原文件'; }
            }
        }

        // 方法 C：直接保存到 JSON 文件（File System Access API）
        async function saveToJsonFile(silent) {
            if (!window.showSaveFilePicker) {
                if (!silent) alert('⚠️ 你的浏览器不支持"直接保存到 JSON"功能。\n\n请改用"📤 导出 JSON"，再把下载的 JSON 发到其他设备。\n（桌面 Edge/Chrome 支持直接覆盖保存）');
                return false;
            }
            if (isSavingJson) return false;
            isSavingJson = true;
            const btn = document.getElementById('saveJsonBtn');
            if (btn && !silent) { btn.disabled = true; btn.textContent = '⏳ 保存中...'; }
            try {
                if (!jsonFileHandle) {
                    jsonFileHandle = await window.showSaveFilePicker({
                        suggestedName: 'my-schedule.json',
                        types: [{ description: 'JSON 文件', accept: { 'application/json': ['.json'] } }]
                    });
                    try { await saveHandleToIDB(jsonFileHandle, 'jsonHandle'); } catch (e) {}
                }
                if (jsonFileHandle.queryPermission) {
                    const perm = await jsonFileHandle.queryPermission({ mode: 'readwrite' });
                    if (perm !== 'granted') {
                        const req = await jsonFileHandle.requestPermission({ mode: 'readwrite' });
                        if (req !== 'granted') throw new Error('用户未授权');
                    }
                }
                const data = getAllData();
                const writable = await jsonFileHandle.createWritable();
                await writable.write(JSON.stringify(data, null, 2));
                await writable.close();
                lastSavedJsonDataSnapshot = JSON.stringify(data);
                updateSaveStatus('✅ 已保存到 JSON ' + new Date().toLocaleTimeString('zh-CN'));
                return true;
            } catch (e) {
                if (e.name === 'AbortError') {
                    updateSaveStatus('JSON 保存已取消');
                } else if (!silent) {
                    alert('❌ 保存 JSON 失败：' + e.message);
                    updateSaveStatus('❌ JSON 保存失败');
                }
                jsonFileHandle = null;
                return false;
            } finally {
                isSavingJson = false;
                if (btn && !silent) { btn.disabled = false; btn.textContent = '💾 保存到 JSON'; }
            }
        }

        // IndexedDB 持久化 file handle
        function openHandleDB() {
            return new Promise((resolve, reject) => {
                const req = indexedDB.open('vitaflow-handles', 1);
                req.onupgradeneeded = () => { try { req.result.createObjectStore('handles'); } catch (e) {} };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });
        }
        async function saveHandleToIDB(handle, key = 'htmlHandle') {
            try {
                const db = await openHandleDB();
                const tx = db.transaction('handles', 'readwrite');
                tx.objectStore('handles').put(handle, key);
            } catch (e) {}
        }
        async function getHandleFromIDB(key = 'htmlHandle') {
            try {
                const db = await openHandleDB();
                return await new Promise((resolve) => {
                    try {
                        const tx = db.transaction('handles', 'readonly');
                        const req = tx.objectStore('handles').get(key);
                        req.onsuccess = () => resolve(req.result || null);
                        req.onerror = () => resolve(null);
                    } catch (e) { resolve(null); }
                });
            } catch (e) { return null; }
        }

        // 自动保存
        function startAutoSave() {
            setInterval(async () => {
                if (!autoSaveEnabled) return;
                if (!fileHandle && !jsonFileHandle) return;
                const current = JSON.stringify(getAllData());
                if (fileHandle && current !== lastSavedDataSnapshot) {
                    updateSaveStatus('🔄 检测到变化，自动保存中...');
                    await saveToOriginalFile(true);
                }
                if (jsonFileHandle && current !== lastSavedJsonDataSnapshot) {
                    updateSaveStatus('🔄 检测到变化，自动保存 JSON 中...');
                    await saveToJsonFile(true);
                }
            }, 60000);
        }
        function toggleAutoSave() {
            autoSaveEnabled = !autoSaveEnabled;
            const btn = document.getElementById('autoSaveToggle');
            if (btn) btn.textContent = autoSaveEnabled ? '⏰ 自动保存: 开' : '⏰ 自动保存: 关';
            updateSaveStatus(autoSaveEnabled ? '自动保存已开启（需先绑定 HTML 或 JSON 文件）' : '自动保存已关闭');
        }
        function updateSaveStatus(msg) {
            const el = document.getElementById('saveStatus');
            if (el) {
                el.textContent = msg;
                el.style.opacity = '1';
                clearTimeout(el._t);
                el._t = setTimeout(() => { el.style.opacity = '0.4'; }, 4000);
            }
        }

        // 初始化保存系统：尝试恢复 file handle
        async function initSaveSystem() {
            try {
                const h = await getHandleFromIDB();
                if (h) {
                    fileHandle = h;
                    if (h.queryPermission) {
                        const p = await h.queryPermission({ mode: 'readwrite' });
                        if (p === 'granted') {
                            updateSaveStatus('📁 已绑定原文件，可随时保存');
                        } else {
                            updateSaveStatus('📁 检测到原文件，请点击"💾 直接保存"重新授权');
                        }
                    }
                }
                const j = await getHandleFromIDB('jsonHandle');
                if (j) {
                    jsonFileHandle = j;
                    lastSavedJsonDataSnapshot = JSON.stringify(getAllData());
                    if (j.queryPermission) {
                        const p = await j.queryPermission({ mode: 'readwrite' });
                        if (p === 'granted') {
                            updateSaveStatus('📁 已绑定 JSON，可自动保存');
                        } else {
                            updateSaveStatus('📁 检测到 JSON 文件，请点击"💾 保存到 JSON"重新授权');
                        }
                    }
                }
            } catch (e) {}
        }

        // VITAFLOW_MODULE: boot
