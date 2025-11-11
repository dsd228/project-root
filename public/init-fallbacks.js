// init-fallbacks.js
// Small defensive fallbacks loaded before other scripts to avoid uncaught errors for optional globals.

(function (global) {
    'use strict';

    if (typeof global.Analytics === 'undefined') {
        console.warn('Analytics not found — installing no-op stub (init-fallbacks).');
        global.Analytics = {
            init: () => {},
            trackPerformanceMetric: () => {},
            trackEvent: () => {},
            identifyUser: () => {}
        };
    }

    // If EnhancedTools is not present, a more complete fallback will be installed by enhanced-tools-simple.js.
    if (typeof global.EnhancedTools === 'undefined') {
        // Temporary placeholder to avoid immediate constructor errors if something tries to call new EnhancedTools() early.
        global.EnhancedTools = function () {
            console.warn('Temporary EnhancedTools placeholder used. Real implementation or fallback will overwrite this.');
            return {};
        };
    }

})(window);
