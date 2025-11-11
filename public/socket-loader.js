// socket-loader.js
// Robust loader for socket.io client script with CDN fallback and silent local attempt.
// Adjust LOCAL_PATH if your server serves the socket.io client at a different path.

(function (global) {
    'use strict';

    const LOCAL_PATH = '/socket.io/socket.io.js'; // keep if your backend serves it here
    const CDN_URLS = [
        'https://cdn.socket.io/4.6.1/socket.io.min.js',
        'https://cdn.socket.io/4.6.0/socket.io.min.js'
    ];
    const LOAD_TIMEOUT = 7000;

    function loadScript(src, timeout = LOAD_TIMEOUT) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            let timedOut = false;
            const timer = setTimeout(() => {
                timedOut = true;
                script.onerror = script.onload = null;
                reject(new Error('load timeout'));
            }, timeout);

            script.onload = () => {
                if (timedOut) return;
                clearTimeout(timer);
                resolve(src);
            };
            script.onerror = () => {
                if (timedOut) return;
                clearTimeout(timer);
                reject(new Error('failed to load ' + src));
            };
            document.head.appendChild(script);
        });
    }

    async function ensureSocketIo() {
        if (typeof global.io === 'function') return Promise.resolve('already-present');

        // Try local path only if it looks like a valid path on this host (non-github pages heuristic).
        // If you serve socket.io from your backend at /socket.io/socket.io.js, keep LOCAL_PATH attempt.
        try {
            await loadScript(LOCAL_PATH);
            if (typeof global.io === 'function') return 'local';
            console.warn('socket-loader: local script loaded but window.io is not a function');
        } catch (err) {
            console.info('socket-loader: local socket.io failed:', err.message || err);
        }

        // Try CDN fallbacks
        for (let url of CDN_URLS) {
            try {
                await loadScript(url);
                if (typeof global.io === 'function') return url;
                console.warn('socket-loader: CDN script loaded but window.io is not a function', url);
            } catch (err) {
                console.warn('socket-loader: CDN attempt failed for', url, err.message || err);
            }
        }

        // No socket.io available: install no-op stub to avoid runtime errors
        console.error('socket-loader: unable to load socket.io from local or CDN. Installing no-op stub.');
        global.io = function () {
            console.warn('io() stub called — socket.io not available.');
            return {
                on: () => {},
                emit: () => {},
                close: () => {},
                disconnect: () => {}
            };
        };
        return Promise.reject(new Error('socket.io not available'));
    }

    ensureSocketIo().then(source => {
        console.info('socket-loader: socket.io ready from', source);
    }).catch(err => {
        console.warn('socket-loader: continuing without real socket.io - realtime disabled', err.message || err);
    });

    // expose for callers that want to await readiness
    global.__ensureSocketIo = ensureSocketIo;

})(window);
