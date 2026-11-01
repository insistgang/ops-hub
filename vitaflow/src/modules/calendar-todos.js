        function renderCalendar() {
            const calendarEl = document.getElementById('calendar');
            calendarEl.innerHTML = '';

            const firstDay = new Date(currentYear, currentMonth, 1).getDay();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const happiness = JSON.parse(localStorage.getItem('vitaflow_happiness') || '{}');

            document.getElementById('currentMonth').textContent = currentYear + '年' + (currentMonth + 1) + '月';

            for (let i = 0; i < firstDay; i++) {
                const empty = document.createElement('div');
                empty.className = 'cal-day';
                empty.style.visibility = 'hidden';
                calendarEl.appendChild(empty);
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = formatLocalDate(new Date(currentYear, currentMonth, day));
                const dayEl = document.createElement('div');
                dayEl.className = 'cal-day' + (dateStr === selectedDate ? ' selected' : '');
                dayEl.innerHTML = day;
                if (happiness[dateStr]) {
                    dayEl.innerHTML += '<div class="happy-marker">' + (happyEmojis[happiness[dateStr]] || '😐') + '</div>';
                }
                dayEl.onclick = () => selectDate(dateStr, day);
                calendarEl.appendChild(dayEl);
            }
        }

        function changeMonth(delta) {
            currentMonth += delta;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            } else if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            // 限制在2026-2030年
            if (currentYear > 2030) { currentYear = 2030; currentMonth = 11; }
            if (currentYear < 2026) { currentYear = 2026; currentMonth = 0; }
            renderCalendar();
        }

        function selectDate(dateStr, day) {
            selectedDate = dateStr;
            renderCalendar();
            renderTodoList();
        }

        function renderTodoList() {
            const todos = JSON.parse(localStorage.getItem('vitaflow_todos') || '[]');
            const filtered = todos.filter(t => t.date === selectedDate);
            const todoListEl = document.getElementById('todoList');

            if (filtered.length === 0) {
                todoListEl.innerHTML = '<div style="text-align: center; color: #aa9a9a; padding: 30px;">今日暂无待办，点击添加</div>';
                return;
            }

            todoListEl.innerHTML = filtered.map(todo => `
                <div class="todo-item">
                    <div class="todo-left">
                        <input type="checkbox" class="todo-check" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${inlineHandlerArg(todo.id)})">
                        <span class="todo-text ${todo.completed ? 'completed' : ''}">${escapeHtml(todo.text)}</span>
                    </div>
                    <div>
                        <span class="todo-account">${escapeHtml(accountNames[todo.account])}</span>
                        <span class="todo-happy">${escapeHtml(happyEmojis[todo.happy])}</span>
                        <button class="delete-btn" onclick="deleteTodo(${inlineHandlerArg(todo.id)})"><i class="fas fa-times"></i></button>
                    </div>
                </div>
            `).join('');
        }

        function selectAddAccount(account) {
            selectedAddAccount = account;
            document.querySelectorAll('.account-add-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.account === account);
            });
        }

        function addTodo() {
            const input = document.getElementById('todoInput');
            const text = input.value.trim();
            const happy = parseInt(document.getElementById('happySelect').value);
            if (!text) return;

            const todos = JSON.parse(localStorage.getItem('vitaflow_todos') || '[]');
            todos.push({ id: Date.now(), text, account: selectedAddAccount, happy, date: selectedDate, completed: false });
            localStorage.setItem('vitaflow_todos', JSON.stringify(todos));
            input.value = '';
            renderTodoList();
            renderTodoKanban();
            syncLocalDataNow('vitaflow_todos');
        }

        function toggleTodo(id) {
            const todos = JSON.parse(localStorage.getItem('vitaflow_todos') || '[]');
            const todo = todos.find(t => t.id === id);
            if (todo) {
                todo.completed = !todo.completed;
                if (todo.completed) {
                    const completed = parseInt(localStorage.getItem('vitaflow_completed') || '0') + 1;
                    localStorage.setItem('vitaflow_completed', completed);
                    document.getElementById('completedTasks').textContent = completed;
                } else {
                    const completed = Math.max(0, parseInt(localStorage.getItem('vitaflow_completed') || '0') - 1);
                    localStorage.setItem('vitaflow_completed', completed);
                    document.getElementById('completedTasks').textContent = completed;
                }
                localStorage.setItem('vitaflow_todos', JSON.stringify(todos));
                renderTodoList();
                renderTodoKanban();
                syncLocalDataNow('vitaflow_todos');
            }
        }

        function deleteTodo(id) {
            let todos = JSON.parse(localStorage.getItem('vitaflow_todos') || '[]');
            todos = todos.filter(t => t.id !== id);
            localStorage.setItem('vitaflow_todos', JSON.stringify(todos));
            renderTodoList();
            renderTodoKanban();
            syncLocalDataNow('vitaflow_todos');
        }

        function renderTodoKanban() {
            const todos = JSON.parse(localStorage.getItem('vitaflow_todos') || '[]');
            const pending = todos.filter(t => !t.completed);
            const completed = todos.filter(t => t.completed);

            const pendingEl = document.getElementById('todoKanbanPending');
            const completedEl = document.getElementById('todoKanbanCompleted');

            document.getElementById('todoPendingCount').textContent = pending.length;
            document.getElementById('todoCompletedCount').textContent = completed.length;

            if (pending.length === 0) {
                pendingEl.innerHTML = '<div style="text-align: center; color: #aa9a9a; padding: 30px;">暂无未完成任务</div>';
            } else {
                pendingEl.innerHTML = pending.map(todo => `
                    <div style="background: #fffbfe; border-radius: 16px; padding: 14px; margin-bottom: 10px; border: 1px solid #fbe0f0; display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                                <input type="checkbox" onchange="toggleTodo(${inlineHandlerArg(todo.id)})" style="width: 18px; height: 18px; accent-color: #c4679c;">
                                <span style="color: #4a3a4a; font-size: 0.95rem;">${escapeHtml(todo.text)}</span>
                            </div>
                            <div style="display: flex; gap: 8px; font-size: 0.8rem;">
                                <span style="background: linear-gradient(135deg, #ffe0f0, #f0e0ff); border-radius: 16px; padding: 3px 10px; color: #8b5e9e;">${escapeHtml(accountNames[todo.account])}</span>
                                <span>${escapeHtml(happyEmojis[todo.happy])}</span>
                                <span style="color: #aa9a9a;">${escapeHtml(todo.date)}</span>
                            </div>
                        </div>
                        <button onclick="deleteTodo(${inlineHandlerArg(todo.id)})" style="background: none; border: none; color: #c4679c; cursor: pointer; padding: 6px; margin-left: 10px;" title="删除">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `).join('');
            }

            if (completed.length === 0) {
                completedEl.innerHTML = '<div style="text-align: center; color: #aa9a9a; padding: 30px;">暂无已完成任务</div>';
            } else {
                completedEl.innerHTML = completed.map(todo => `
                    <div style="background: #f0fff4; border-radius: 16px; padding: 14px; margin-bottom: 10px; border: 1px solid #d4f5e8; display: flex; justify-content: space-between; align-items: center; opacity: 0.8;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                                <input type="checkbox" checked onchange="toggleTodo(${inlineHandlerArg(todo.id)})" style="width: 18px; height: 18px; accent-color: #22c55e;">
                                <span style="color: #6a8a7a; font-size: 0.95rem; text-decoration: line-through;">${escapeHtml(todo.text)}</span>
                            </div>
                            <div style="display: flex; gap: 8px; font-size: 0.8rem;">
                                <span style="background: rgba(74, 222, 128, 0.2); border-radius: 16px; padding: 3px 10px; color: #22c55e;">${escapeHtml(accountNames[todo.account])}</span>
                                <span>${escapeHtml(happyEmojis[todo.happy])}</span>
                                <span style="color: #aa9a9a;">${escapeHtml(todo.date)}</span>
                            </div>
                        </div>
                        <button onclick="deleteTodo(${inlineHandlerArg(todo.id)})" style="background: none; border: none; color: #6a8a7a; cursor: pointer; padding: 6px; margin-left: 10px;" title="删除">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `).join('');
            }
        }
