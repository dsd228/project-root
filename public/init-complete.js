// init-complete.js
// EditorAppFinal initializer that waits for base EditorApp (editorApp) to be ready before instantiating.
// Uses defensive calls to analytics and enhancedTools.

(function (global) {
    'use strict';

    function safeCall(obj, methodName, ...args) {
        try {
            if (!obj) return undefined;
            const fn = obj[methodName];
            if (typeof fn === 'function') return fn.apply(obj, args);
        } catch (err) {
            console.warn(`safeCall: ${methodName} threw an error`, err);
        }
        return undefined;
    }

    if (typeof global.Analytics === 'undefined') {
        global.Analytics = { init: () => {}, trackPerformanceMetric: () => {}, trackEvent: () => {}, identifyUser: () => {} };
        console.info('Analytics stub installed by init-complete.js');
    }

    class EditorAppFinal {
        constructor(options = {}) {
            this.options = options;
            this.baseApp = global.editorApp || null;

            if (!this.baseApp && typeof global.EditorApp === 'function') {
                try { this.baseApp = new global.EditorApp(); } catch (err) { console.warn('EditorApp constructor threw during EditorAppFinal setup', err); this.baseApp = null; }
            }

            this.analytics = global.Analytics || { trackPerformanceMetric: () => {}, trackEvent: () => {}, init: () => {} };

            this.enhancedTools = null;
            try {
                if (typeof global.EnhancedTools === 'function') {
                    try { this.enhancedTools = new global.EnhancedTools(this.baseApp || this); safeCall(this.enhancedTools, 'init', { app: this.baseApp || this }); } catch (err) { console.warn('EnhancedTools failed inside EditorAppFinal', err); try { this.enhancedTools = new global.EnhancedTools(null); } catch (inner) { this.enhancedTools = null; } }
                }
            } catch (err) { console.warn('Unexpected error while setting up EnhancedTools', err); this.enhancedTools = null; }

            this._initialized = false;
            this.render = this.render.bind(this);
        }

        init() {
            if (this._initialized) return;
            this._initialized = true;
            safeCall(this.analytics, 'init', { appName: 'EditorAppFinal' });
            if (this.baseApp) safeCall(this.baseApp, 'init');
            try { this.render(); } catch (err) { console.error('EditorAppFinal.init: render threw', err); }
        }

        render() {
            const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
            try {
                if (this.baseApp && typeof this.baseApp.render === 'function') safeCall(this.baseApp, 'render');
            } catch (err) {
                console.error('EditorAppFinal.render: base render failed', err);
            } finally {
                const end = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
                const elapsed = end - start;
                safeCall(this.analytics, 'trackPerformanceMetric', 'EditorAppFinal.render', { duration: elapsed });
            }
        }

        enableEnhancedFeature(name) {
            if (!this.enhancedTools) return false;
            return safeCall(this.enhancedTools, 'enable', name) || false;
        }
    }

    global.EditorAppFinal = EditorAppFinal;

    // New ensure function: wait for editorApp (base) to exist with timeout, then instantiate EditorAppFinal.
    function ensureEditorAppFinal() {
        if (global.editorAppFinal) return;
        const maxWait = 5000;
        const interval = 100;
        const start = Date.now();

        (function check() {
            if (global.editorApp && global.editorApp.canvas) {
                try { global.editorAppFinal = new EditorAppFinal(); global.editorAppFinal.init(); } catch (err) { console.error('Failed to create EditorAppFinal instance', err); }
                return;
            }

            if (typeof global.EditorApp === 'function' && document.readyState !== 'loading') {
                if (!global.editorApp) {
                    try { global.editorApp = new global.EditorApp(); } catch (err) { console.warn('EditorApp constructor threw', err); }
                }
                if (global.editorApp && global.editorApp.canvas) {
                    try { global.editorAppFinal = new EditorAppFinal(); global.editorAppFinal.init(); } catch (err) { console.error('Failed to create EditorAppFinal instance', err); }
                    return;
                }
            }

            if (Date.now() - start < maxWait) setTimeout(check, interval);
            else {
                try { console.warn('ensureEditorAppFinal: timeout waiting for editorApp — creating EditorAppFinal in degraded mode'); global.editorAppFinal = new EditorAppFinal(); global.editorAppFinal.init(); } catch (err) { console.error('Failed to create EditorAppFinal after timeout', err); }
            }
        })();
    }

    // Kick off ensure
    ensureEditorAppFinal();

})(window);
