// Safe fallbacks for optional libraries — include this before the editor initialization scripts.

if (typeof window.EnhancedTools === 'undefined') {
    console.warn('EnhancedTools not found — installing no-op fallback.');
    window.EnhancedTools = class EnhancedTools {
        constructor(app) {
            this.app = app;
            console.warn('Using EnhancedTools no-op fallback. Enhanced features disabled.');
        }
        init() { /* no-op */ }
        // Add no-op methods that your real EnhancedTools uses, e.g.:
        enable() { /* no-op */ }
        disable() { /* no-op */ }
    };
}

if (typeof window.Analytics === 'undefined') {
    console.warn('Analytics not found — installing no-op stub.');
    window.Analytics = {
        init: () => { /* no-op */ },
        trackPerformanceMetric: () => { /* no-op */ },
        trackEvent: () => { /* no-op */ },
        identifyUser: () => { /* no-op */ },
    };
}
