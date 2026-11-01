        let vitaflowBooted = false;

        function runInitStep(name, fn) {
            try {
                return fn();
            } catch (e) {
                console.warn(name + ' 初始化失败:', e);
                return undefined;
            }
        }

        function initChartsAfterAssetsReady() {
            if (typeof Chart === 'undefined') return;
            const accountKeys = ['physical', 'emotional', 'focus', 'meaning'];
            if (!accountKeys.every(key => Array.isArray(accountsData?.[key]?.history))) return;
            runInitStep('initMainChart', initMainChart);
        }

        async function bootVitaFlow() {
            if (vitaflowBooted) return;
	            vitaflowBooted = true;
	            installLocalSyncHook();
	            await initLocalSync();
	            runInitStep('initData', initData);
            runInitStep('initSaveSystem', initSaveSystem);
            runInitStep('startAutoSave', startAutoSave);
            runInitStep('initMediaStorage', initMediaStorage);
            runInitStep('initMediaCalendarStorage', initMediaCalendarStorage);
            runInitStep('renderCalendar', renderCalendar);
            runInitStep('renderTodoList', renderTodoList);
            runInitStep('renderTodoKanban', renderTodoKanban);
            initChartsAfterAssetsReady();
            runInitStep('renderEmotionBoard', renderEmotionBoard);
            runInitStep('renderPomodoroGrid', renderPomodoroGrid);
            runInitStep('renderReviewList', renderReviewList);
            runInitStep('renderEmotionNotesList', renderEmotionNotesList);
            runInitStep('updateDeepseekCount', updateDeepseekCount);
            runInitStep('updateLiteratureCount', updateLiteratureCount);
            runInitStep('updateNovelOutlineCount', updateNovelOutlineCount);
            runInitStep('updateReadingNoteCount', updateReadingNoteCount);
            runInitStep('updateFilmCount', updateFilmCount);
            runInitStep('renderMediaCalendar', renderMediaCalendar);
            enableLocalSyncAfterInitialRender();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bootVitaFlow, { once: true });
        } else {
            bootVitaFlow();
        }
        window.addEventListener('load', initChartsAfterAssetsReady, { once: true });
