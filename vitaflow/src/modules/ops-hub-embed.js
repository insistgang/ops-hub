        (() => {
            if (new URLSearchParams(window.location.search).get('embed') !== 'ops-hub' || window.parent === window) return;
            document.body.classList.add('ops-hub-embed');
            const views = new Set(['energyOverview', 'dailyPlan', 'energyTrends', 'creativeSpace']);
            window.addEventListener('vitaflow:ready', () => {
                window.parent.postMessage({ type: 'ops:vitaflow:ready', storage: localSyncAvailable ? 'server' : 'browser' }, '*');
            });
            window.addEventListener('message', event => {
                if (event.source !== window.parent || !event.data || typeof event.data !== 'object') return;
                if (event.data.type === 'ops:vitaflow:theme' && ['dark', 'light'].includes(event.data.theme)) {
                    document.body.setAttribute('data-ops-theme', event.data.theme);
                }
                if (event.data.type === 'ops:vitaflow:navigate' && views.has(event.data.view)) {
                    goBack();
                    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
                    document.getElementById(event.data.view)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
                }
            });
        })();
