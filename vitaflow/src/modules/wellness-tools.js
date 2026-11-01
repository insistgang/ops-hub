        function startPomodoro() {
            if (pomodoroInterval) {
                alert('🍅 专注中，请先完成当前番茄钟！');
                return;
            }
            pomodoroTimeLeft = 25 * 60;
            document.getElementById('pomodoroTimer').style.display = 'block';
            document.getElementById('startPomodoroBtn').style.display = 'none';
            document.getElementById('stopPomodoroBtn').style.display = 'inline-block';
            updateTimerDisplay();
            pomodoroInterval = setInterval(() => {
                pomodoroTimeLeft--;
                updateTimerDisplay();
                if (pomodoroTimeLeft <= 0) {
                    clearInterval(pomodoroInterval);
                    pomodoroInterval = null;
                    completePomodoro();
                }
            }, 1000);
        }

        function updateTimerDisplay() {
            const minutes = Math.floor(pomodoroTimeLeft / 60);
            const seconds = pomodoroTimeLeft % 60;
            document.getElementById('timerDisplay').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        function stopPomodoro() {
            if (pomodoroInterval) {
                clearInterval(pomodoroInterval);
                pomodoroInterval = null;
                const elapsed = 25 * 60 - pomodoroTimeLeft;
                if (elapsed >= 60) {
                    const records = JSON.parse(localStorage.getItem('vitaflow_pomodoro') || '[]');
                    records.unshift({ date: new Date().toISOString(), duration: Math.floor(elapsed / 60) });
                    localStorage.setItem('vitaflow_pomodoro', JSON.stringify(records));
                    alert('⏹ 已记录 ' + Math.floor(elapsed / 60) + ' 分钟专注');
                    renderPomodoroGrid();
                }
            }
            document.getElementById('pomodoroTimer').style.display = 'none';
            document.getElementById('startPomodoroBtn').style.display = 'inline-block';
            document.getElementById('stopPomodoroBtn').style.display = 'none';
        }

        function completePomodoro() {
            const records = JSON.parse(localStorage.getItem('vitaflow_pomodoro') || '[]');
            records.unshift({ date: new Date().toISOString(), duration: 25 });
            localStorage.setItem('vitaflow_pomodoro', JSON.stringify(records));
            alert('🎉 专注完成！休息5分钟吧');
            document.getElementById('pomodoroTimer').style.display = 'none';
            document.getElementById('startPomodoroBtn').style.display = 'inline-block';
            document.getElementById('stopPomodoroBtn').style.display = 'none';
            renderPomodoroGrid();
        }

        let breathInterval = null;
        let breathCount = 0;

        function startBreathing() {
            if (breathInterval) {
                clearInterval(breathInterval);
                breathInterval = null;
                document.getElementById('breathInstruction').textContent = '准备开始...';
                document.getElementById('breathCount').textContent = '0';
                document.getElementById('breathCircle').style.transform = 'scale(1)';
                return;
            }

            breathCount = 0;
            let phase = 'inhale';
            let phaseTime = 0;

            breathInterval = setInterval(() => {
                const circle = document.getElementById('breathCircle');

                if (phase === 'inhale') {
                    const progress = phaseTime / 3000;
                    circle.style.transform = `scale(${0.6 + progress * 0.8})`;
                    document.getElementById('breathInstruction').textContent = '吸气...';
                    phaseTime += 100;
                    if (phaseTime >= 3000) {
                        phase = 'hold';
                        phaseTime = 0;
                    }
                } else if (phase === 'hold') {
                    phaseTime += 100;
                    document.getElementById('breathInstruction').textContent = '屏息...';
                    if (phaseTime >= 1000) {
                        phase = 'exhale';
                        phaseTime = 0;
                    }
                } else if (phase === 'exhale') {
                    const progress = phaseTime / 6000;
                    circle.style.transform = `scale(${1.4 - progress * 0.8})`;
                    document.getElementById('breathInstruction').textContent = '呼气...';
                    phaseTime += 100;
                    if (phaseTime >= 6000) {
                        breathCount++;
                        document.getElementById('breathCount').textContent = breathCount;
                        phase = 'inhale';
                        phaseTime = 0;

                        if (breathCount >= 10) {
                            clearInterval(breathInterval);
                            breathInterval = null;
                            alert('🎯 呼吸训练完成！');
                        }
                    }
                }
            }, 100);
        }

        let intervalInterval = null;
        let intervalTimeLeft = 25 * 60;

        function startIntervalTraining() {
            if (intervalInterval) {
                alert('⏳ 训练中，请先完成当前训练！');
                return;
            }
            intervalTimeLeft = 25 * 60;
            document.getElementById('intervalStatus').textContent = '训练中...';
            updateIntervalDisplay();

            intervalInterval = setInterval(() => {
                intervalTimeLeft--;
                updateIntervalDisplay();

                if (intervalTimeLeft <= 0) {
                    clearInterval(intervalInterval);
                    intervalInterval = null;
                    document.getElementById('intervalStatus').textContent = '训练完成！';
                    alert('🎉 间歇训练完成！休息5分钟吧');
                }
            }, 1000);
        }

        function updateIntervalDisplay() {
            const minutes = Math.floor(intervalTimeLeft / 60);
            const seconds = intervalTimeLeft % 60;
            document.getElementById('intervalTimer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        function stopIntervalTraining() {
            if (intervalInterval) {
                clearInterval(intervalInterval);
                intervalInterval = null;
                document.getElementById('intervalStatus').textContent = '已停止';
            }
        }

        function saveWaterIntake() {
            const intake = parseInt(document.getElementById('waterIntake').value);
            const dateInput = document.getElementById('foodDate').value;
            const selectedDate = dateInput || formatLocalDate();

            if (!isNaN(intake) && intake > 0) {
                const records = JSON.parse(localStorage.getItem('vitaflow_water') || '[]');
                const existingRecord = records.find(r => r.date === selectedDate);
                if (existingRecord) {
                    existingRecord.amount += intake;
                } else {
                    records.unshift({ date: selectedDate, amount: intake });
                }
                localStorage.setItem('vitaflow_water', JSON.stringify(records));
                updateWaterProgress();
                document.getElementById('waterIntake').value = '';
                renderFoodHistory();
                alert('✅ 已记录');
            }
        }

        function updateWaterProgress() {
            const dateInput = document.getElementById('foodDate').value;
            const selectedDate = dateInput || formatLocalDate();
            const records = JSON.parse(localStorage.getItem('vitaflow_water') || '[]');
            const record = records.find(r => r.date === selectedDate);
            const total = record ? record.amount : 0;
            document.getElementById('waterProgress').textContent = total;
        }

        let foodChart = null;

        function addFood(type) {
            const dateInput = document.getElementById('foodDate').value;
            const selectedDate = dateInput || formatLocalDate();
            const records = JSON.parse(localStorage.getItem('vitaflow_food') || '[]');
            let record = records.find(r => r.date === selectedDate);
            if (!record) {
                record = { date: selectedDate, healthy: 0, moderate: 0, unhealthy: 0 };
                records.unshift(record);
            }
            record[type]++;
            localStorage.setItem('vitaflow_food', JSON.stringify(records));
            renderFoodChart();
            renderFoodHistory();
        }

        function renderFoodHistory() {
            const records = JSON.parse(localStorage.getItem('vitaflow_food') || '[]');
            const waterRecords = JSON.parse(localStorage.getItem('vitaflow_water') || '[]');
            const list = document.getElementById('foodHistoryList');

            if (records.length === 0 && waterRecords.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #8b7a7a;">暂无记录</div>';
                return;
            }

            const allDates = [...new Set([...records.map(r => r.date), ...waterRecords.map(r => r.date)])];
            allDates.sort((a, b) => new Date(b) - new Date(a));

            let html = '';
            allDates.slice(0, 10).forEach(date => {
                const foodRecord = records.find(r => r.date === date);
                const waterRecord = waterRecords.find(r => r.date === date);
                const foodIcons = [];
                if (foodRecord) {
                    if (foodRecord.healthy > 0) foodIcons.push(`🥗${foodRecord.healthy}`);
                    if (foodRecord.moderate > 0) foodIcons.push(`🍕${foodRecord.moderate}`);
                    if (foodRecord.unhealthy > 0) foodIcons.push(`🍟${foodRecord.unhealthy}`);
                }
                html += `
                    <div onclick="showFoodDetail(${inlineHandlerArg(date)})" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.5); border-radius: 8px; margin-bottom: 6px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(139,92,246,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.5)'">
                        <span style="color: #6a4a7a; font-weight: 500;">${escapeHtml(date)}</span>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            ${foodIcons.length > 0 ? `<span>${foodIcons.join(' ')}</span>` : ''}
                            ${waterRecord ? `<span style="color: #3b82f6; font-weight: 600;">💧${escapeHtml(waterRecord.amount)}ml</span>` : ''}
                            <span style="color: #8b7a7a;">▶</span>
                        </div>
                    </div>
                `;
            });
            list.innerHTML = html;
            renderPhysicalBoards();
        }

        function renderPhysicalBoards() {
            const waterRecords = JSON.parse(localStorage.getItem('vitaflow_water') || '[]');
            const foodRecords = JSON.parse(localStorage.getItem('vitaflow_food') || '[]');

            waterRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
            foodRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

            let waterHtml = '';
            if (waterRecords.length === 0) {
                waterHtml = '<div style="text-align: center; color: #8b7a7a; padding: 20px;">暂无饮水记录</div>';
            } else {
                waterRecords.forEach(record => {
                    const amount = Math.max(0, Number(record.amount) || 0);
                    const percent = Math.max(0, Math.round(amount / 1800 * 100));
                    waterHtml += `
                        <div style="padding: 14px; background: rgba(255,255,255,0.7); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(59,130,246,0.2);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(59,130,246,0.1); padding-bottom: 8px;">
                                <span style="font-weight: 600; color: #6a4a7a;">📅 ${escapeHtml(record.date)}</span>
                                <button onclick="editWaterRecord(${inlineHandlerArg(record.date)})" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">✏️ 修改</button>
                            </div>
                            <div style="text-align: center; margin-bottom: 10px;">
                                <div style="font-size: 2rem; font-weight: 700; color: #3b82f6;">💧 ${amount}<span style="font-size: 1rem;">ml</span></div>
                                <div style="font-size: 0.85rem; color: #8b7a7a;">目标: 1800ml</div>
                            </div>
                            <div style="background: #e5e7eb; border-radius: 6px; height: 8px; margin-bottom: 6px;">
                                <div style="background: linear-gradient(90deg, #3b82f6, #8b5cf6); height: 8px; border-radius: 6px; width: ${Math.min(100, percent)}%;"></div>
                            </div>
                            <div style="text-align: center; font-size: 0.85rem; color: ${percent >= 100 ? '#22c55e' : '#8b7a7a'};">完成度: ${percent}%${percent >= 100 ? ' ✅' : ''}</div>
                        </div>
                    `;
                });
            }
            document.getElementById('physicalWaterBoard').innerHTML = waterHtml;

            let foodHtml = '';
            if (foodRecords.length === 0) {
                foodHtml = '<div style="text-align: center; color: #8b7a7a; padding: 20px;">暂无饮食记录</div>';
            } else {
                foodRecords.forEach(record => {
                    foodHtml += `
                        <div style="padding: 14px; background: rgba(255,255,255,0.7); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(74,222,128,0.2);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(74,222,128,0.1); padding-bottom: 8px;">
                                <span style="font-weight: 600; color: #6a4a7a;">📅 ${escapeHtml(record.date)}</span>
                                <button onclick="editFoodRecord(${inlineHandlerArg(record.date)})" style="background: linear-gradient(135deg, #4ade80, #22c55e); color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">✏️ 修改</button>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                                <div style="text-align: center; padding: 12px; background: rgba(74,222,128,0.1); border-radius: 8px;">
                                    <div style="font-size: 1.5rem;">🥗</div>
                                    <div style="font-size: 1.2rem; font-weight: 700; color: #22c55e;">${escapeHtml(record.healthy)}</div>
                                    <div style="font-size: 0.75rem; color: #8b7a7a;">健康</div>
                                </div>
                                <div style="text-align: center; padding: 12px; background: rgba(251,191,36,0.1); border-radius: 8px;">
                                    <div style="font-size: 1.5rem;">🍕</div>
                                    <div style="font-size: 1.2rem; font-weight: 700; color: #fbbf24;">${escapeHtml(record.moderate)}</div>
                                    <div style="font-size: 0.75rem; color: #8b7a7a;">中等</div>
                                </div>
                                <div style="text-align: center; padding: 12px; background: rgba(248,113,113,0.1); border-radius: 8px;">
                                    <div style="font-size: 1.5rem;">🍟</div>
                                    <div style="font-size: 1.2rem; font-weight: 700; color: #ef4444;">${escapeHtml(record.unhealthy)}</div>
                                    <div style="font-size: 0.75rem; color: #8b7a7a;">不健康</div>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
            document.getElementById('physicalFoodBoard').innerHTML = foodHtml;
        }

        function editWaterRecord(date) {
            const waterRecords = JSON.parse(localStorage.getItem('vitaflow_water') || '[]');
            const record = waterRecords.find(r => r.date === date);
            if (record) {
                const newAmount = prompt('💧 饮水量 (ml):', record.amount.toString());
                if (newAmount !== null) {
                    record.amount = parseInt(newAmount) || 0;
                    localStorage.setItem('vitaflow_water', JSON.stringify(waterRecords));
                    alert('✅ 已更新');
                    renderPhysicalBoards();
                }
            }
        }

        function editFoodRecord(date) {
            const records = JSON.parse(localStorage.getItem('vitaflow_food') || '[]');
            const record = records.find(r => r.date === date);
            if (record) {
                const newHealthy = prompt('🥗 健康次数:', record.healthy.toString());
                if (newHealthy !== null) {
                    const newModerate = prompt('🍕 中等次数:', record.moderate.toString());
                    if (newModerate !== null) {
                        const newUnhealthy = prompt('🍟 不健康次数:', record.unhealthy.toString());
                        if (newUnhealthy !== null) {
                            record.healthy = parseInt(newHealthy) || 0;
                            record.moderate = parseInt(newModerate) || 0;
                            record.unhealthy = parseInt(newUnhealthy) || 0;
                            localStorage.setItem('vitaflow_food', JSON.stringify(records));
                            alert('✅ 已更新');
                            renderPhysicalBoards();
                        }
                    }
                }
            }
        }

        function showFoodDetail(date) {
            const records = JSON.parse(localStorage.getItem('vitaflow_food') || '[]');
            const waterRecords = JSON.parse(localStorage.getItem('vitaflow_water') || '[]');
            const foodRecord = records.find(r => r.date === date);
            const waterRecord = waterRecords.find(r => r.date === date);

            const newWater = prompt('💧 饮水量 (ml):', waterRecord ? waterRecord.amount.toString() : '0');
            if (newWater !== null) {
                const newHealthy = prompt('🥗 健康次数:', foodRecord ? foodRecord.healthy.toString() : '0');
                if (newHealthy !== null) {
                    const newModerate = prompt('🍕 中等次数:', foodRecord ? foodRecord.moderate.toString() : '0');
                    if (newModerate !== null) {
                        const newUnhealthy = prompt('🍟 不健康次数:', foodRecord ? foodRecord.unhealthy.toString() : '0');
                        if (newUnhealthy !== null) {
                            const waterIdx = waterRecords.findIndex(r => r.date === date);
                            if (waterIdx >= 0) {
                                waterRecords[waterIdx].amount = parseInt(newWater) || 0;
                            } else if (parseInt(newWater) > 0) {
                                waterRecords.push({ date, amount: parseInt(newWater) || 0 });
                            }
                            localStorage.setItem('vitaflow_water', JSON.stringify(waterRecords));

                            const foodIdx = records.findIndex(r => r.date === date);
                            if (foodIdx >= 0) {
                                records[foodIdx] = { date, healthy: parseInt(newHealthy) || 0, moderate: parseInt(newModerate) || 0, unhealthy: parseInt(newUnhealthy) || 0 };
                            } else {
                                records.push({ date, healthy: parseInt(newHealthy) || 0, moderate: parseInt(newModerate) || 0, unhealthy: parseInt(newUnhealthy) || 0 });
                            }
                            localStorage.setItem('vitaflow_food', JSON.stringify(records));

                            alert('✅ 已更新');
                            renderFoodHistory();
                            renderFoodChart();
                        }
                    }
                }
            }
        }

        function renderEmotionalBoards() {
            renderEmotionalSandwichBoard();
            renderEmotionalSupportBoard();
            renderEmotionalActivityBoard();
        }

        function renderEmotionalSandwichBoard() {
            const records = JSON.parse(localStorage.getItem('vitaflow_sandwich') || '[]');
            let html = '';
            if (records.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 20px;">暂无记录</div>';
            } else {
                records.forEach(record => {
                    const date = new Date(record.date);
                    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                    html += `
                        <div style="padding: 14px; background: rgba(255,255,255,0.7); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(196,103,156,0.2);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(196,103,156,0.1); padding-bottom: 8px;">
                                <span style="font-weight: 600; color: #6a4a7a;">📅 ${dateStr}</span>
                                <button onclick="editSandwichRecord(${inlineHandlerArg(record.id)})" style="background: linear-gradient(135deg, #c4679c, #9c5a8e); color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">✏️ 修改</button>
                            </div>
                            <div style="margin-bottom: 10px;">
                                <div style="font-size: 0.9rem; font-weight: 600; color: #22c55e; margin-bottom: 6px;">✅ 真诚肯定</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(34,197,94,0.05); padding: 10px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(record.positive) || '<span style="color:#999">未填写</span>'}</div>
                            </div>
                            <div style="margin-bottom: 10px;">
                                <div style="font-size: 0.9rem; font-weight: 600; color: #8b5cf6; margin-bottom: 6px;">💡 建设性建议</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(139,92,246,0.05); padding: 10px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(record.suggestion) || '<span style="color:#999">未填写</span>'}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.9rem; font-weight: 600; color: #ec4899; margin-bottom: 6px;">🌟 鼓励支持</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(236,72,153,0.05); padding: 10px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(record.encourage) || '<span style="color:#999">未填写</span>'}</div>
                            </div>
                        </div>
                    `;
                });
            }
            document.getElementById('emotionalSandwichBoard').innerHTML = html;
        }

        function editSandwichRecord(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_sandwich') || '[]');
            const record = records.find(r => r.id === id);
            if (record) {
                const newPositive = prompt('✅ 真诚肯定:', record.positive);
                if (newPositive !== null) {
                    const newSuggestion = prompt('💡 建设性建议:', record.suggestion);
                    if (newSuggestion !== null) {
                        const newEncourage = prompt('🌟 鼓励支持:', record.encourage);
                        if (newEncourage !== null) {
                            record.positive = newPositive;
                            record.suggestion = newSuggestion;
                            record.encourage = newEncourage;
                            localStorage.setItem('vitaflow_sandwich', JSON.stringify(records));
                            alert('✅ 已更新');
                            renderEmotionalSandwichBoard();
                        }
                    }
                }
            }
        }

        function renderEmotionalSupportBoard() {
            const records = JSON.parse(localStorage.getItem('vitaflow_support') || '[]');
            const typeIcons = { family: '👨‍👩‍👧', friend: '👫', love: '💕', work: '💼' };
            const typeNames = { family: '亲情', friend: '友情', love: '爱情', work: '工作' };
            let html = '';
            if (records.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 20px;">暂无联系人</div>';
            } else {
                records.forEach(record => {
                    const intimacy = Math.max(0, Math.min(10, Number.parseInt(record.intimacy, 10) || 0));
                    const intimacyStars = '★'.repeat(intimacy) + '☆'.repeat(10 - intimacy);
                    html += `
                        <div style="padding: 14px; background: rgba(255,255,255,0.7); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(167,139,250,0.2);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(167,139,250,0.1); padding-bottom: 8px;">
                                <span style="font-weight: 600; color: #6a4a7a; font-size: 1rem;">${typeIcons[record.type] || '👤'} ${escapeHtml(record.name)}</span>
                                <button onclick="editSupportRecord(${inlineHandlerArg(record.id)})" style="background: linear-gradient(135deg, #a78bfa, #8b5cf6); color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">✏️ 修改</button>
                            </div>
                            <div style="margin-bottom: 10px;">
                                <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 6px;">📋 关系类型: <span style="color: #6a4a7a; font-weight: 500;">${typeNames[record.type] || '未知'}</span></div>
                                <div style="font-size: 0.85rem; color: #8b7a7a; margin-bottom: 6px;">⭐ 亲密度: <span style="color: #a78bfa; font-weight: 600;">${intimacyStars}</span> (${intimacy}/10)</div>
                            </div>
                            <div>
                                <div style="font-size: 0.9rem; font-weight: 600; color: #8b5cf6; margin-bottom: 6px;">📝 备注</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(139,92,246,0.05); padding: 10px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(record.note) || '<span style="color:#999">暂无备注</span>'}</div>
                            </div>
                        </div>
                    `;
                });
            }
            document.getElementById('emotionalSupportBoard').innerHTML = html;
        }

        function editSupportRecord(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_support') || '[]');
            const record = records.find(r => r.id === id);
            if (record) {
                const newName = prompt('👤 联系人姓名:', record.name);
                if (newName !== null) {
                    const newType = prompt('📋 类型 (family/friend/love/work):', record.type);
                    if (newType !== null) {
                        const newIntimacy = prompt('⭐ 亲密度 (1-10):', record.intimacy.toString());
                        if (newIntimacy !== null) {
                            const newNote = prompt('📝 备注:', record.note || '');
                            if (newNote !== null) {
                                record.name = newName;
                                record.type = newType;
                                record.intimacy = parseInt(newIntimacy) || 5;
                                record.note = newNote;
                                localStorage.setItem('vitaflow_support', JSON.stringify(records));
                                alert('✅ 已更新');
                                renderEmotionalSupportBoard();
                            }
                        }
                    }
                }
            }
        }

        function renderEmotionalActivityBoard() {
            const records = JSON.parse(localStorage.getItem('vitaflow_emotion_activities') || '[]');
            const activityNames = { sing: '唱歌', dance: '跳舞', garden: '园艺', read: '读书', park: '逛公园', museum: '博物馆', music: '听音乐', meditate: '冥想' };
            let html = '';
            if (records.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 20px;">暂无活动记录</div>';
            } else {
                records.forEach(record => {
                    const date = new Date(record.date);
                    const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                    html += `
                        <div onclick="showActivityFullDetail(${inlineHandlerArg(record.id)})" style="padding: 14px; background: rgba(255,255,255,0.7); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(236,72,153,0.2); cursor: pointer;" onmouseover="this.style.background='rgba(236,72,153,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.7)'">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <span style="font-weight: 600; color: #6a4a7a;">📅 ${dateStr}</span>
                                <span style="font-size: 2rem;">${escapeHtml(record.icon)}</span>
                            </div>
                            <div style="font-size: 1rem; font-weight: 600; color: #ec4899;">${activityNames[record.type] || escapeHtml(record.type)}</div>
                        </div>
                    `;
                });
            }
            document.getElementById('emotionalActivityBoard').innerHTML = html;
        }

        function showActivityFullDetail(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_emotion_activities') || '[]');
            const record = records.find(r => r.id === id);
            if (!record) return;
            const date = new Date(record.date);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
            const activityNames = { sing: '唱歌', dance: '跳舞', garden: '园艺', read: '读书', park: '逛公园', museum: '博物馆', music: '听音乐', meditate: '冥想' };

            const popup = document.createElement('div');
            popup.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); z-index: 1000; max-width: 400px; width: 90%;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="font-weight: 700; font-size: 1.2rem; color: #6a4a7a;">📅 ${dateStr}</div>
                        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8b7a7a;">×</button>
                    </div>
                    <div style="text-align: center; padding: 24px; background: rgba(236,72,153,0.1); border-radius: 16px; margin-bottom: 20px;">
                        <div style="font-size: 4rem; margin-bottom: 12px;">${escapeHtml(record.icon)}</div>
                        <div style="font-size: 1.3rem; font-weight: 600; color: #ec4899;">${activityNames[record.type] || escapeHtml(record.type)}</div>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="add-btn" style="flex: 1; background: rgba(200,160,200,0.2);" onclick="this.parentElement.parentElement.remove()">关闭</button>
                    </div>
                </div>
            `;
            document.body.appendChild(popup);
        }

        function renderFoodChart() {
            const records = JSON.parse(localStorage.getItem('vitaflow_food') || '[]');
            const dateInput = document.getElementById('foodDate')?.value;
            const selectedDate = dateInput || formatLocalDate();
            const record = records.find(r => r.date === selectedDate) || { healthy: 1, moderate: 1, unhealthy: 0 };

            const ctx = document.getElementById('foodChart').getContext('2d');
            if (foodChart) foodChart.destroy();

            foodChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['健康', '中等', '不健康'],
                    datasets: [{
                        data: [record.healthy, record.moderate, record.unhealthy],
                        backgroundColor: ['#4ade80', '#fbbf24', '#f87171']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%'
                }
            });
        }

        function saveSandwich() {
            const positive = document.getElementById('sandwichPositive').value;
            const suggestion = document.getElementById('sandwichSuggestion').value;
            const encourage = document.getElementById('sandwichEncourage').value;

            if (positive && suggestion && encourage) {
                const records = JSON.parse(localStorage.getItem('vitaflow_sandwich') || '[]');
                records.unshift({
                    id: Date.now(),
                    positive,
                    suggestion,
                    encourage,
                    date: new Date().toISOString()
                });
                localStorage.setItem('vitaflow_sandwich', JSON.stringify(records));
                alert('✅ 三明治批评模板已保存');
                document.getElementById('sandwichPositive').value = '';
                document.getElementById('sandwichSuggestion').value = '';
                document.getElementById('sandwichEncourage').value = '';
                renderSandwichHistory();
            } else {
                alert('请填写完整的三个部分');
            }
        }

        function renderSandwichHistory() {
            const records = JSON.parse(localStorage.getItem('vitaflow_sandwich') || '[]');
            const list = document.getElementById('sandwichHistoryList');

            if (records.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #8b7a7a; font-size: 0.85rem;">暂无记录</div>';
                return;
            }

            let html = '';
            records.slice(0, 8).forEach(record => {
                const date = new Date(record.date);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                html += `
                    <div onclick="showSandwichDetail(${inlineHandlerArg(record.id)})" style="padding: 8px; background: rgba(255,255,255,0.5); border-radius: 6px; margin-bottom: 4px; cursor: pointer;" onmouseover="this.style.background='rgba(196,103,156,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.5)'">
                        <div style="font-size: 0.8rem; color: #8b7a7a;">${dateStr}</div>
                        <div style="font-size: 0.85rem; color: #6a4a7a; margin-top: 4px;">"${escapeHtml(record.positive.slice(0, 15))}..."</div>
                    </div>
                `;
            });
            list.innerHTML = html;
        }

        function showSandwichDetail(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_sandwich') || '[]');
            const record = records.find(r => r.id === id);
            if (record) {
                const newPositive = prompt('✅ 真诚肯定:', record.positive);
                if (newPositive !== null) {
                    const newSuggestion = prompt('💡 建设性建议:', record.suggestion);
                    if (newSuggestion !== null) {
                        const newEncourage = prompt('🌟 鼓励支持:', record.encourage);
                        if (newEncourage !== null) {
                            record.positive = newPositive;
                            record.suggestion = newSuggestion;
                            record.encourage = newEncourage;
                            localStorage.setItem('vitaflow_sandwich', JSON.stringify(records));
                            alert('✅ 已更新');
                            renderSandwichHistory();
                        }
                    }
                }
            }
        }

        function saveSupport() {
            const name = document.getElementById('supportName').value;
            const type = document.getElementById('supportType').value;
            const intimacy = document.getElementById('supportIntimacy').value;
            const note = document.getElementById('supportNote').value;

            if (name) {
                const records = JSON.parse(localStorage.getItem('vitaflow_support') || '[]');
                records.push({
                    id: Date.now(),
                    name,
                    type,
                    intimacy: parseInt(intimacy),
                    note,
                    lastContact: new Date().toISOString()
                });
                localStorage.setItem('vitaflow_support', JSON.stringify(records));
                alert('✅ 联系人已添加');
                document.getElementById('supportName').value = '';
                document.getElementById('supportNote').value = '';
                document.getElementById('supportIntimacy').value = 5;
                document.getElementById('intimacyValue').textContent = 5;
                renderSupportHistory();
            } else {
                alert('请输入联系人姓名');
            }
        }

        function renderSupportHistory() {
            const records = JSON.parse(localStorage.getItem('vitaflow_support') || '[]');
            const list = document.getElementById('supportHistoryList');
            const typeIcons = { family: '👨‍👩‍👧', friend: '👫', love: '💕', work: '💼' };

            if (records.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #8b7a7a; font-size: 0.85rem;">暂无联系人</div>';
                return;
            }

            let html = '';
            records.forEach(record => {
                const intimacy = Math.max(0, Math.min(10, Number.parseInt(record.intimacy, 10) || 0));
                const intimacyStars = '★'.repeat(intimacy) + '☆'.repeat(10 - intimacy);
                html += `
                    <div onclick="showSupportDetail(${inlineHandlerArg(record.id)})" style="padding: 8px; background: rgba(255,255,255,0.5); border-radius: 6px; margin-bottom: 4px; cursor: pointer;" onmouseover="this.style.background='rgba(167,139,250,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.5)'">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.9rem; color: #6a4a7a;">${typeIcons[record.type] || '👤'} ${escapeHtml(record.name)}</span>
                            <span style="font-size: 0.75rem; color: #a78bfa;">${intimacyStars.slice(0, 5)}</span>
                        </div>
                        ${record.note ? `<div style="font-size: 0.75rem; color: #8b7a7a; margin-top: 2px;">📝 ${escapeHtml(record.note.slice(0, 20))}...</div>` : ''}
                    </div>
                `;
            });
            list.innerHTML = html;
        }

        function showSupportDetail(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_support') || '[]');
            const record = records.find(r => r.id === id);
            const typeNames = { family: '👨‍👩‍👧 亲情', friend: '👫 友情', love: '💕 爱情', work: '💼 工作' };
            if (record) {
                const newName = prompt('👤 联系人姓名:', record.name);
                if (newName !== null) {
                    const newType = prompt('📋 类型 (family/friend/love/work):', record.type);
                    if (newType !== null) {
                        const newIntimacy = prompt('⭐ 亲密度 (1-10):', record.intimacy.toString());
                        if (newIntimacy !== null) {
                            const newNote = prompt('📝 备注:', record.note || '');
                            if (newNote !== null) {
                                record.name = newName;
                                record.type = newType;
                                record.intimacy = parseInt(newIntimacy) || 5;
                                record.note = newNote;
                                localStorage.setItem('vitaflow_support', JSON.stringify(records));
                                alert('✅ 已更新');
                                renderSupportHistory();
                            }
                        }
                    }
                }
            }
        }

        const activityIcons = {
            sing: '🎤', dance: '💃', garden: '🌱', read: '📚',
            park: '🌳', museum: '🏛️', music: '🎵', meditate: '🧘'
        };

        function recordActivity(type) {
            const records = JSON.parse(localStorage.getItem('vitaflow_emotion_activities') || '[]');
            records.unshift({
                id: Date.now(),
                type,
                icon: activityIcons[type],
                date: new Date().toISOString()
            });
            localStorage.setItem('vitaflow_emotion_activities', JSON.stringify(records));
            renderActivityHistory();
            alert(`✅ ${activityIcons[type]} 活动已记录`);
        }

        function renderActivityHistory() {
            const records = JSON.parse(localStorage.getItem('vitaflow_emotion_activities') || '[]');
            const list = document.getElementById('activityHistoryList');

            if (records.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #8b7a7a;">暂无活动记录</div>';
                return;
            }

            let html = '';
            records.slice(0, 10).forEach(record => {
                const date = new Date(record.date);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                html += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; background: rgba(255,255,255,0.5); border-radius: 6px; margin-bottom: 3px;">
                        <span>${escapeHtml(record.icon)} ${escapeHtml(record.type)}</span>
                        <span style="font-size: 0.8rem; color: #8b7a7a;">${dateStr}</span>
                    </div>
                `;
            });
            list.innerHTML = html;
        }

        let switchInterval = null;
        let switchTimeLeft = 90 * 60;

        function startSwitchTimer() {
            if (switchInterval) {
                alert('⏳ 计时中，请先停止当前计时！');
                return;
            }
            switchTimeLeft = 90 * 60;
            document.getElementById('switchStatus').textContent = '工作中...';
            updateSwitchDisplay();

            switchInterval = setInterval(() => {
                switchTimeLeft--;
                updateSwitchDisplay();

                if (switchTimeLeft <= 0) {
                    clearInterval(switchInterval);
                    switchInterval = null;
                    document.getElementById('switchStatus').textContent = '该休息了！';
                    alert('⏰ 建议切换活动！试试做些不同的事情');
                }
            }, 1000);
        }

        function updateSwitchDisplay() {
            const minutes = Math.floor(switchTimeLeft / 60);
            const seconds = switchTimeLeft % 60;
            document.getElementById('switchTimer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        function stopSwitchTimer() {
            if (switchInterval) {
                clearInterval(switchInterval);
                switchInterval = null;
                document.getElementById('switchStatus').textContent = '已停止';
            }
        }

        function toggleFocusLock() {
            const icon = document.getElementById('focusLockIcon');
            const status = document.getElementById('focusLockStatus');

            if (icon.textContent === '🔓') {
                icon.textContent = '🔐';
                status.textContent = '已锁定';
                alert('🔐 专注锁定已开启！请专注当前任务，远离手机');
            } else {
                icon.textContent = '🔓';
                status.textContent = '未锁定';
                alert('🔓 专注锁定已解除');
            }
        }

        function saveReflection() {
            const challenge = document.getElementById('reflectionChallenge').value;
            const gain = document.getElementById('reflectionGain').value;
            const weak = document.getElementById('reflectionWeak').value;
            const tomorrow = document.getElementById('reflectionTomorrow').value;

            if (challenge || gain || weak || tomorrow) {
                const records = JSON.parse(localStorage.getItem('vitaflow_reflection') || '[]');
                records.unshift({
                    id: Date.now(),
                    challenge,
                    gain,
                    weak,
                    tomorrow,
                    date: new Date().toISOString()
                });
                localStorage.setItem('vitaflow_reflection', JSON.stringify(records));
                alert('✅ 反思已保存');
                document.getElementById('reflectionChallenge').value = '';
                document.getElementById('reflectionGain').value = '';
                document.getElementById('reflectionWeak').value = '';
                document.getElementById('reflectionTomorrow').value = '';
                renderReflectionHistory();
            } else {
                alert('请至少填写一项内容');
            }
        }

        function renderReflectionHistory() {
            const records = JSON.parse(localStorage.getItem('vitaflow_reflection') || '[]');
            const list = document.getElementById('reflectionHistoryList');

            if (records.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #8b7a7a;">暂无反思记录</div>';
                return;
            }

            let html = '';
            records.slice(0, 5).forEach(record => {
                const date = new Date(record.date);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                html += `
                    <div onclick="showReflectionDetail(${inlineHandlerArg(record.id)})" style="padding: 10px; background: rgba(255,255,255,0.5); border-radius: 8px; margin-bottom: 6px; cursor: pointer;" onmouseover="this.style.background='rgba(139,92,246,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.5)'">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="font-size: 0.85rem; color: #6a4a7a; font-weight: 500;">${dateStr}</span>
                            <span style="color: #8b7a7a;">▶</span>
                        </div>
                        ${record.challenge ? `<div style="font-size: 0.85rem;">🎯 ${escapeHtml(record.challenge.slice(0, 25))}...</div>` : ''}
                        ${record.gain ? `<div style="font-size: 0.8rem; color: #8b7a7a;">💡 ${escapeHtml(record.gain.slice(0, 20))}...</div>` : ''}
                    </div>
                `;
            });
            list.innerHTML = html;
        }

        function showReflectionDetail(id) {
            const records = JSON.parse(localStorage.getItem('vitaflow_reflection') || '[]');
            const record = records.find(r => r.id === id);
            if (record) {
                const newChallenge = prompt('🎯 今日挑战:', record.challenge || '');
                if (newChallenge !== null) {
                    const newGain = prompt('💡 今日收获:', record.gain || '');
                    if (newGain !== null) {
                        const newWeak = prompt('❌ 今日不足:', record.weak || '');
                        if (newWeak !== null) {
                            const newTomorrow = prompt('📝 明日计划:', record.tomorrow || '');
                            if (newTomorrow !== null) {
                                record.challenge = newChallenge;
                                record.gain = newGain;
                                record.weak = newWeak;
                                record.tomorrow = newTomorrow;
                                localStorage.setItem('vitaflow_reflection', JSON.stringify(records));
                                alert('✅ 已更新');
                                renderReflectionHistory();
                                renderFocusReflectionBoard();
                            }
                        }
                    }
                }
            }
        }

        function renderFocusReflectionBoard() {
            const records = JSON.parse(localStorage.getItem('vitaflow_reflection') || '[]');
            let html = '';
            if (records.length === 0) {
                html = '<div style="text-align: center; color: #8b7a7a; padding: 20px;">暂无反思记录</div>';
            } else {
                records.forEach(record => {
                    const date = new Date(record.date);
                    const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                    html += `
                        <div style="padding: 14px; background: rgba(255,255,255,0.7); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(139,94,158,0.2);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(139,94,158,0.1); padding-bottom: 8px;">
                                <span style="font-weight: 600; color: #6a4a7a;">📅 ${dateStr}</span>
                                <button onclick="showReflectionDetail(${inlineHandlerArg(record.id)})" style="background: linear-gradient(135deg, #8b5e9e, #6a4a7a); color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;">✏️ 修改</button>
                            </div>
                            <div style="margin-bottom: 8px;">
                                <div style="font-size: 0.9rem; font-weight: 600; color: #8b5e9e; margin-bottom: 4px;">🎯 今日挑战</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(139,94,158,0.05); padding: 8px; border-radius: 6px;">${escapeHtml(record.challenge) || '<span style="color:#999">未填写</span>'}</div>
                            </div>
                            <div style="margin-bottom: 8px;">
                                <div style="font-size: 0.9rem; font-weight: 600; color: #22c55e; margin-bottom: 4px;">💡 今日收获</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(34,197,94,0.05); padding: 8px; border-radius: 6px;">${escapeHtml(record.gain) || '<span style="color:#999">未填写</span>'}</div>
                            </div>
                            <div style="margin-bottom: 8px;">
                                <div style="font-size: 0.9rem; font-weight: 600; color: #ef4444; margin-bottom: 4px;">❌ 今日不足</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(239,68,68,0.05); padding: 8px; border-radius: 6px;">${escapeHtml(record.weak) || '<span style="color:#999">未填写</span>'}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.9rem; font-weight: 600; color: #3b82f6; margin-bottom: 4px;">📝 明日计划</div>
                                <div style="font-size: 0.85rem; color: #4a3a5a; background: rgba(59,130,246,0.05); padding: 8px; border-radius: 6px;">${escapeHtml(record.tomorrow) || '<span style="color:#999">未填写</span>'}</div>
                            </div>
                        </div>
                    `;
                });
            }
            document.getElementById('focusReflectionBoard').innerHTML = html;
        }
