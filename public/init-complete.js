// init-complete.js
// Versión adaptada de EditorAppFinal/EditorAppComplete integrada con tu public/app.js (EditorApp).
// Objetivos:
// - Evitar el error "Cannot read properties of undefined (reading 'trackPerformanceMetric')"
// - Intentar usar EnhancedTools si existe, pero no fallar si falta o lanza errores
// - Inicialización segura en DOMContentLoaded y no duplicar instancias
//
// Nota: este archivo asume que public/app.js (con la clase EditorApp) se carga antes o simultáneamente.
// Si EditorApp no existe, este script intentará ligar con global.editorApp si ya está instanciado.

(function (global) {
    'use strict';

    // Safe helper to call a method if present
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

    // Ensure a minimal Analytics stub exists so code can call analytics methods without crashing.
    if (typeof global.Analytics === 'undefined') {
        global.Analytics = {
            init: function () { /* no-op */ },
            trackPerformanceMetric: function () { /* no-op */ },
            trackEvent: function () { /* no-op */ },
            identifyUser: function () { /* no-op */ }
        };
        console.info('Analytics stub installed by init-complete.js');
    }

    // EditorAppFinal extends existing EditorApp if present.
    class EditorAppFinal {
        constructor(options = {}) {
            this.options = options || {};

            // If a concrete EditorApp class exists, instantiate it as base editor.
            // Prefer using already-instantiated global.editorApp to avoid double inits.
            this.baseApp = null;
            if (global.editorApp && typeof global.editorApp === 'object') {
                // Use existing instance
                this.baseApp = global.editorApp;
            } else if (typeof global.EditorApp === 'function') {
                try {
                    // Create an instance but avoid re-calling heavy init if its constructor does init immediately.
                    // The existing app.js runs new EditorApp() on DOMContentLoaded, so we usually won't reach here.
                    this.baseApp = new global.EditorApp();
                } catch (err) {
                    console.warn('EditorApp constructor threw during EditorAppFinal setup; baseApp not available.', err);
                    this.baseApp = null;
                }
            } else {
                console.warn('EditorApp class/instance not found; EditorAppFinal will operate in degraded mode.');
            }

            // Provide analytics on the instance — prefer global.Analytics but keep defensive stub
            this.analytics = global.Analytics || {
                trackPerformanceMetric: () => {},
                trackEvent: () => {},
                init: () => {}
            };

            // Try initializing EnhancedTools, but guard any errors.
            this.enhancedTools = null;
            try {
                if (typeof global.EnhancedTools === 'function') {
                    try {
                        this.enhancedTools = new global.EnhancedTools(this.baseApp || this);
                        // call init if available
                        safeCall(this.enhancedTools, 'init', { app: this.baseApp || this });
                    } catch (err) {
                        console.warn('EnhancedTools construction failed inside EditorAppFinal; creating fallback instance if possible.', err);
                        try {
                            this.enhancedTools = new global.EnhancedTools(null);
                        } catch (innerErr) {
                            console.warn('Even fallback EnhancedTools failed to construct.', innerErr);
                            this.enhancedTools = null;
                        }
                    }
                } else {
                    console.info('EnhancedTools not defined — EditorAppFinal continues without enhanced features.');
                }
            } catch (err) {
                console.warn('Unexpected error while setting up EnhancedTools in EditorAppFinal', err);
                this.enhancedTools = null;
            }

            // Bind render to this context
            this.render = this.render.bind(this);

            // Minimal initialization step that won't fail if baseApp is missing
            this._initialized = false;
        }

        init() {
            if (this._initialized) return;
            this._initialized = true;

            // Initialize analytics if available
            safeCall(this.analytics, 'init', { appName: 'EditorAppFinal' });

            // If baseApp exists and has an init method, attempt to call it safely
            if (this.baseApp) {
                safeCall(this.baseApp, 'init');
            }

            // Try first render in a protected way
            try {
                this.render();
            } catch (err) {
                console.error('EditorAppFinal.init: render threw an error', err);
            }
        }

        // The render method delegates to baseApp.render (if present) and reports a performance metric safely.
        render() {
            const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
            try {
                if (this.baseApp && typeof this.baseApp.render === 'function') {
                    safeCall(this.baseApp, 'render');
                } else {
                    // No base app: provide a minimal no-op render to keep page functional
                    // (you could render a placeholder or message in DOM here if desired)
                }
            } catch (err) {
                console.error('EditorAppFinal.render: base render failed', err);
            } finally {
                const end = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
                const elapsed = end - start;
                // Guarded analytics call (prevents "cannot read properties of undefined")
                safeCall(this.analytics, 'trackPerformanceMetric', 'EditorAppFinal.render', { duration: elapsed });
            }
        }

        // Example wrapper for features that may use enhancedTools
        enableEnhancedFeature(featureName) {
            if (!this.enhancedTools) {
                console.warn('enableEnhancedFeature: enhancedTools not available');
                return false;
            }
            try {
                return safeCall(this.enhancedTools, 'enable', featureName);
            } catch (err) {
                console.warn('enableEnhancedFeature failed', err);
                return false;
            }
        }
    }

    // Expose class to global scope so other scripts can instantiate it if needed.
    global.EditorAppFinal = EditorAppFinal;

    // Auto-init pattern:
    // - If a global.editorAppFinal does not exist, create one on DOMContentLoaded.
    // - If editorApp (base) already exists and is ready, we still create EditorAppFinal but we avoid double-initializing baseApp.
    function ensureEditorAppFinal() {
        if (global.editorAppFinal) return;
        try {
            global.editorAppFinal = new EditorAppFinal();
            // Defer heavy init until DOM ready to match app.js behavior.
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                try { global.editorAppFinal.init(); } catch (err) { console.warn('EditorAppFinal.init error', err); }
            } else {
                document.addEventListener('DOMContentLoaded', function () {
                    try { global.editorAppFinal.init(); } catch (err) { console.warn('EditorAppFinal.init error', err); }
                });
            }
        } catch (err) {
            console.error('Failed to create EditorAppFinal instance', err);
        }
    }

    // Kick off non-blocking auto-init
    try {
        ensureEditorAppFinal();
    } catch (err) {
        console.error('init-complete.js auto-init failed', err);
    }

})(window);
