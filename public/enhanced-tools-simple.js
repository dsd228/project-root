// enhanced-tools-simple.js
// Safe wrapper for EnhancedTools: if real library is present, use it.
// If not, provide a no-op replacement that won't break new EnhancedTools(...) usage.
// Also ensure any initialization is try/catch protected.

(function(global){
    'use strict';

    // If a real EnhancedTools already exists and looks like a constructor, keep it.
    if (typeof global.EnhancedTools === 'function') {
        // Optionally wrap to protect from constructor errors
        const NativeET = global.EnhancedTools;
        global.EnhancedTools = function(...args) {
            try {
                return new NativeET(...args);
            } catch (err) {
                console.warn('EnhancedTools constructor threw an error; switching to no-op fallback.', err);
                // fallback instance
                return new (class {
                    constructor(app) { this.app = app; }
                    init() {}
                    enable() {}
                    disable() {}
                })(...args);
            }
        };
        // Preserve prototype (helpful for instanceof checks)
        global.EnhancedTools.prototype = NativeET.prototype;
        return;
    }

    // If not present, expose a friendly no-op class so "new EnhancedTools()" won't crash.
    console.warn('EnhancedTools not found — installing no-op fallback.');
    class EnhancedToolsFallback {
        constructor(app) {
            // store reference to app if provided
            this.app = app || null;
            // mark fallback so code can detect it if needed
            this.__isEnhancedToolsFallback = true;
            console.info('EnhancedTools fallback instantiated. Enhanced features disabled.');
        }

        init(options) {
            // no-op initialization
            this.options = options || {};
        }

        enable(featureName) {
            // no-op
            return false;
        }

        disable(featureName) {
            // no-op
            return false;
        }

        // provide a safe stub for any commonly-used methods (add more if needed)
        on() {}
        off() {}
        getFeatureState() { return {}; }
    }

    global.EnhancedTools = EnhancedToolsFallback;

})(window);
