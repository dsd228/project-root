// init-complete.js
// Defensive initializer for EditorAppFinal / EditorAppComplete.
// Protects against missing Analytics and EnhancedTools and prevents uncaught exceptions during init/render.

(function(global){
    'use strict';

    // Ensure Analytics stub exists (if you already loaded init-fallbacks.js this is redundant but safe).
    if (typeof global.Analytics === 'undefined') {
        console.warn('Analytics not found — installing temporary no-op stub.');
        global.Analytics = {
            init: () => {},
            trackPerformanceMetric: () => {},
            trackEvent: () => {},
            identifyUser: () => {}
        };
    }

    // Small helper to safe-call methods
    function safeCall(obj, fnName, ...args) {
        try {
            if (!obj) return undefined;
            const fn = obj[fnName];
            if (typeof fn === 'function') {
                return fn.apply(obj, args);
            }
        } catch (err) {
            console.warn(`safeCall: ${fnName} threw`, err);
        }
        return undefined;
    }

    // Example EditorAppFinal class shell — adapt to your real implementation if different.
    // The important parts: guard analytics usage, guard EnhancedTools usage, and wrap render in try/catch.
    class EditorAppFinal {
        constructor(options = {}) {
            this.options = options;
            // Ensure canvas/context presence is handled elsewhere (app.js creates EditorApp).
            // Provide analytics fallback on the instance.
            this.analytics = global.Analytics || {
                trackPerformanceMetric: () => {},
                trackEvent: () => {},
                init: () => {}
            };

            // Try to create EnhancedTools if available, but don't crash if not.
            try {
                if (typeof global.EnhancedTools === 'function') {
                    // allow EnhancedTools to throw internally without breaking overall init
                    this.enhancedTools = (function(){
                        try {
                            return new global.EnhancedTools(this);
                        } catch (err) {
                            console.warn('Failed to instantiate EnhancedTools — using fallback instance.', err);
                            return new global.EnhancedTools(null);
                        }
                    }).call(this);
                    // Initialize if available
                    safeCall(this.enhancedTools, 'init', { app: this });
                } else {
                    // No EnhancedTools constructor available — create a simple fallback
                    this.enhancedTools = new global.EnhancedTools(this);
                }
            } catch (err) {
                console.warn('Unexpected error while setting up EnhancedTools', err);
                this.enhancedTools = new global.EnhancedTools(null);
            }

            // Bind methods
            this.render = this.render.bind(this);
            this.init = this.init.bind(this);
        }

        init() {
            // Example: initialize analytics safely
            try {
                safeCall(this.analytics, 'init', { appName: 'EditorAppFinal' });
            } catch (err) {
                console.warn('Analytics init failed', err);
            }

            // Continue normal setup (DOM, canvas, event listeners...) — keep robust guards.
            try {
                // if you have a parent EditorApp class, you might call super.init() in real code
                // Here we just attempt first render
                this.render();
            } catch (err) {
                console.error('EditorAppFinal failed during init.render()', err);
            }
        }

        // Render must not throw if analytics missing
        render() {
            try {
                // ... actual render logic goes here (drawing, layout, etc.)
                // Example: notify analytics about render duration (guarded)
                const start = performance ? performance.now() : Date.now();

                // --- PLACEHOLDER: actual drawing code should be here ---
                // For compatibility, check if there's a base renderer on global.editorApp and call it:
                if (global.editorApp && typeof global.editorApp.render === 'function') {
                    try { global.editorApp.render(); } catch (err) { console.warn('base editorApp.render error', err); }
                }
                // --- END PLACEHOLDER ---

                const end = performance ? performance.now() : Date.now();
                const elapsed = end - start;

                // Guarded analytics call
                safeCall(this.analytics, 'trackPerformanceMetric', 'render', { duration: elapsed });

            } catch (err) {
                // Don't let render errors bubble up and break page load.
                console.error('EditorAppFinal.render caught an error', err);
            }
        }

        // Other methods that might call analytics should use safeCall or check first
        someFeature() {
            safeCall(this.analytics, 'trackEvent', 'someFeature', { enabled: true });
        }
    }

    // Export to global so your HTML or other scripts can instantiate EditorAppFinal safely.
    global.EditorAppFinal = EditorAppFinal;

    // Auto-init pattern: if DOMContentLoaded already happened or will happen, instantiate.
    function tryAutoInit() {
        try {
            // Only auto-instantiate if not already present
            if (!global.editorAppFinal) {
                global.editorAppFinal = new EditorAppFinal();
                // Defer heavy init until DOM is ready
                if (document.readyState === 'complete' || document.readyState === 'interactive') {
                    try { global.editorAppFinal.init(); } catch (err) { console.warn('EditorAppFinal.init error', err); }
                } else {
                    document.addEventListener('DOMContentLoaded', () => {
                        try { global.editorAppFinal.init(); } catch (err) { console.warn('EditorAppFinal.init error', err); }
                    });
                }
            }
        } catch (err) {
            console.error('Failed to auto-init EditorAppFinal', err);
        }
    }

    // Attempt automatic init but don't block/throw
    tryAutoInit();

})(window);
