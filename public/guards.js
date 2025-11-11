// public/guards.js
// Evitar redeclaraciones y proporcionar no-op fallbacks
if (typeof window.DesignAnalytics === 'undefined') {
  window.DesignAnalytics = {
    trackPerformanceMetric: () => {},
    trackEvent: () => {}
  };
} else {
  console.warn('DesignAnalytics already exists - skipping redeclare');
}

if (typeof window.TemplateManager === 'undefined') {
  window.TemplateManager = class TemplateManager { constructor(){ /* stub */ } };
} else {
  console.warn('TemplateManager already exists - skipping redeclare');
}

if (typeof window.EnhancedTools === 'undefined') {
  window.EnhancedTools = {
    init: () => { console.info('EnhancedTools stub'); },
    // otros métodos no-op si son invocados
  };
}
