// enhanced-tools-simple.js
// Versión adaptada y defensiva para tu proyecto.
// - Si ya existe una implementación "real" de EnhancedTools la usamos pero la envolvemos para atrapar errores.
// - Si no existe, exponemos un fallback seguro (no-op) para que `new EnhancedTools()` no rompa la inicialización.
//
// Objetivo: evitar el error "EnhancedTools is not a constructor" y que la ausencia/errores de la librería no detengan la app.

(function (global) {
    'use strict';

    // Helper: detect if value looks like a constructor/class
    function looksLikeConstructor(v) {
        return typeof v === 'function' && (v.prototype && Object.getOwnPropertyNames(v.prototype).length > 1);
    }

    // If a native EnhancedTools exists, wrap it to catch constructor errors.
    if (looksLikeConstructor(global.EnhancedTools)) {
        const NativeEnhancedTools = global.EnhancedTools;
        // Replace with a wrapper factory that attempts to construct native and falls back to noop object on error.
        global.EnhancedTools = function (...args) {
            try {
                // Attempt to use as constructor
                return new NativeEnhancedTools(...args);
            } catch (err) {
                console.warn('EnhancedTools native constructor threw an error — using fallback instance. Error:', err);
                // Return a safe fallback instance
                return new (class {
                    constructor(app) { this.app = app || null; this.__isFallback = true; }
                    init() {}
                    enable() {}
                    disable() {}
                    on() {}
                    off() {}
                    getFeatureState() { return {}; }
                })(...args);
            }
        };
        // Keep prototype to preserve instanceof checks as much as possible
        global.EnhancedTools.prototype = NativeEnhancedTools.prototype;
        return;
    }

    // If no EnhancedTools found, install a full-featured fallback class.
    console.info('EnhancedTools not found — installing safe fallback implementation.');

    class EnhancedToolsFallback {
        constructor(app) {
            // store reference to the editor app if provided
            this.app = app || null;
            // marker so other code can detect it's a fallback if needed
            this.__isEnhancedToolsFallback = true;
            // internal state for features
            this._features = {};
            // delay init log for clarity
            console.info('EnhancedToolsFallback instantiated. Enhanced features are disabled in fallback mode.');
        }

        // Public API (no-ops / safe behaviour)
        init(options) {
            this.options = options || {};
            // If the app exposes a notification system, mention it there too
            if (this.app && typeof this.app.showNotification === 'function') {
                try {
                    this.app.showNotification('EnhancedTools not available — running in fallback mode.');
                } catch (err) {
                    // ignore notification errors
                    console.warn('EnhancedToolsFallback: failed to notify app', err);
                }
            }
        }

        enable(featureName) {
            this._features[featureName] = true;
            return false; // indicate not really enabled
        }

        disable(featureName) {
            delete this._features[featureName];
            return false;
        }

        isEnabled(featureName) {
            return !!this._features[featureName];
        }

        on() { /* no-op */ }
        off() { /* no-op */ }
        getFeatureState() { return {}; }
    }

    // Expose fallback in the global scope.
    global.EnhancedTools = EnhancedToolsFallback;

})(window);
