        function getRecentDateEntries(dayCount = 7, endDate = new Date()) {
            const count = Math.max(1, Number.parseInt(dayCount, 10) || 7);
            const end = endDate instanceof Date && !Number.isNaN(endDate.getTime())
                ? new Date(endDate.getTime())
                : new Date();
            const entries = [];
            for (let offset = count - 1; offset >= 0; offset--) {
                const date = new Date(end.getTime());
                date.setDate(date.getDate() - offset);
                entries.push({
                    date: formatLocalDate(date),
                    label: `${date.getMonth() + 1}/${date.getDate()}`,
                });
            }
            return entries;
        }

        function getCompletedTaskTrend(todos, dayCount = 7, endDate = new Date()) {
            const entries = getRecentDateEntries(dayCount, endDate);
            const records = Array.isArray(todos) ? todos : [];
            return {
                labels: entries.map(entry => entry.label),
                dates: entries.map(entry => entry.date),
                values: entries.map(entry => records.filter(todo => todo && todo.completed === true && todo.date === entry.date).length),
            };
        }

        function getAverageAccountTrend(accountData, dayCount = 7, endDate = new Date()) {
            const entries = getRecentDateEntries(dayCount, endDate);
            const accountKeys = ['physical', 'emotional', 'focus', 'meaning'];
            return {
                labels: entries.map(entry => entry.label),
                dates: entries.map(entry => entry.date),
                values: entries.map(entry => {
                    const scores = accountKeys
                        .map(key => {
                            const history = Array.isArray(accountData?.[key]?.history) ? accountData[key].history : [];
                            const record = history.find(item => item && item.date === entry.date);
                            return Number(record?.score);
                        })
                        .filter(Number.isFinite);
                    if (scores.length === 0) return null;
                    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
                }),
            };
        }

        function getValidStreakRecords(records) {
            return (Array.isArray(records) ? records : []).filter(record => {
                return record && parseLocalDate(record.date) !== null;
            });
        }

        function getStreakTrend(records, dayCount = 7, endDate = new Date()) {
            const entries = getRecentDateEntries(dayCount, endDate);
            const recordedDates = new Set(getValidStreakRecords(records).map(record => record.date));
            return {
                labels: entries.map(entry => entry.label),
                dates: entries.map(entry => entry.date),
                values: entries.map(entry => recordedDates.has(entry.date) ? 1 : 0),
            };
        }

        function getStreakSummary(records, referenceDate = new Date()) {
            const validRecords = getValidStreakRecords(records);
            const uniqueDates = [...new Set(validRecords.map(record => record.date))].sort();
            const recordedDates = new Set(uniqueDates);
            const reference = referenceDate instanceof Date && !Number.isNaN(referenceDate.getTime())
                ? new Date(referenceDate.getTime())
                : new Date();

            let current = 0;
            const cursor = new Date(reference.getTime());
            while (recordedDates.has(formatLocalDate(cursor))) {
                current++;
                cursor.setDate(cursor.getDate() - 1);
            }

            let longest = 0;
            let run = 0;
            let previousDate = null;
            uniqueDates.forEach(dateString => {
                const date = parseLocalDate(dateString);
                if (previousDate) {
                    const expected = new Date(previousDate.getTime());
                    expected.setDate(expected.getDate() + 1);
                    run = formatLocalDate(expected) === dateString ? run + 1 : 1;
                } else {
                    run = 1;
                }
                longest = Math.max(longest, run);
                previousDate = date;
            });

            const monthPrefix = `${reference.getFullYear()}-${String(reference.getMonth() + 1).padStart(2, '0')}-`;
            const monthCount = uniqueDates.filter(date => date.startsWith(monthPrefix) && date <= formatLocalDate(reference)).length;
            const elapsedDays = Math.max(1, reference.getDate());
            const monthRate = Math.round((monthCount / elapsedDays) * 100);

            const hourCounts = new Map();
            validRecords.forEach(record => {
                if (!record.created) return;
                const created = new Date(record.created);
                if (Number.isNaN(created.getTime())) return;
                const hour = created.getHours();
                hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
            });
            let commonHour = null;
            let commonHourCount = 0;
            hourCounts.forEach((count, hour) => {
                if (count > commonHourCount || (count === commonHourCount && (commonHour === null || hour < commonHour))) {
                    commonHour = hour;
                    commonHourCount = count;
                }
            });
            const commonTime = commonHour === null
                ? '暂无数据'
                : `${String(commonHour).padStart(2, '0')}:00-${String((commonHour + 1) % 24).padStart(2, '0')}:00`;

            return { current, longest, monthRate, commonTime };
        }
