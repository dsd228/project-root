// socket-loader.js
// Robust loader for socket.io client script.
// Tries local path first, then falls back to CDN if local not available.
// Configurable timeout and safe failure mode.

(function(global){
    'use strict';

    const LOCAL_PATH = '/socket.io/socket.io.js'; // adjust if your local location is different
    const CDN_URLS = [
        // Prioritize v4 stable CDN for socket.io; change version if your server uses a specific one
        'https://cdn.socket.io/4.6.1/socket.io.min.js',
        'https://cdn.socket.io/4.6.0/socket.io.min.js'
    ];
    const LOAD_TIMEOUT = 7000; // ms

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
            script.onerror = (ev) => {
                if (timedOut) return;
                clearTimeout(timer);
                reject(new Error('failed to load ' + src));
            };
            document.head.appendChild(script);
        });
    }

    async function ensureSocketIo() {
        // If socket.io already present, just resolve.
        if (typeof global.io === 'function') {
            return Promise.resolve('already-present');
        }

        // Try local path first
        try {
            await loadScript(LOCAL_PATH);
            if (typeof global.io === 'function') return 'local';
            // if file loaded but didn't expose io, treat as failure
            console.warn('socket-loader: local script loaded but global.io is not a function');
        } catch (err) {
            console.warn('socket-loader: local socket.io failed:', err.message || err);
        }

        // Try CDN fallbacks in order
        for (let i = 0; i < CDN_URLS.length; i++) {
            const url = CDN_URLS[i];
            try {
                await loadScript(url);
                if (typeof global.io === 'function') return url;
                console.warn('socket-loader: CDN script loaded but global.io is not a function', url);
            } catch (err) {
                console.warn('socket-loader: CDN attempt failed for', url, err.message || err);
            }
        }

        // If we reach here, socket.io couldn't be loaded. Install a safe stub so code referencing io doesn't crash.
        console.error('socket-loader: unable to load socket.io from local or CDN. Installing no-op stub.');
        global.io = function() {
            console.warn('io() stub called — socket.io not available.');
            // return an object with minimal API used by your code to avoid runtime errors
            return {
                on: () => {},
                emit: () => {},
                close: () => {},
                disconnect: () => {}
            };
        };
        return Promise.reject(new Error('socket.io not available'));
    }

    // Start loading right away (you can call ensureSocketIo() manually from other code instead)
    ensureSocketIo().then((source) => {
        console.info('socket-loader: socket.io ready from', source);
    }).catch((err) => {
        console.warn('socket-loader: continuing without socket.io - realtime features disabled', err.message || err);
    });

    // Expose function for callers that want to await readiness
    global.__ensureSocketIo = ensureSocketIo;

})(window);
