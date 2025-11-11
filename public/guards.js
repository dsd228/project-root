// Guard para evitar redeclaraciones: sólo crea el global si no existe
if (typeof window.DesignAnalytics === 'undefined') {
  window.DesignAnalytics = (function () {
    // implementación minimal o wrapper real
    return {
      trackPerformanceMetric: function () { /* noop o push a buffer */ },
      trackEvent: function () { /* noop */ }
    };
  })();
} else {
  console.warn('DesignAnalytics already exists - skipping redeclare');
}

if (typeof window.TemplateManager === 'undefined') {
  // ejemplo simple; en tu código real reexporta la clase
  window.TemplateManager = class TemplateManager {
    constructor() { /* ... */ }
  };
} else console.warn('TemplateManager already exists - skip');

if (typeof window.EnhancedTools === 'undefined') {
  window.EnhancedTools = { init: () => { console.warn('EnhancedTools stub'); } };
}
