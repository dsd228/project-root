// public/guards.js
// Evita redeclaraciones y proporciona no-op fallbacks para globals críticos.

if (typeof window.DesignAnalytics === 'undefined') {
  window.DesignAnalytics = {
    trackPerformanceMetric: function(){ /* noop */ },
    trackEvent: function(){ /* noop */ }
  };
} else {
  console.warn('DesignAnalytics already exists - skipping redeclare');
}

if (typeof window.TemplateManager === 'undefined') {
  window.TemplateManager = class TemplateManager {
    constructor(){ /* stub */ }
  };
} else {
  console.warn('TemplateManager already exists - skipping redeclare');
}

// EnhancedTools fallback: si no existe, exponer un stub con init() no-op.
// Esto evita ReferenceError en caso de que el bundle real no se haya cargado.
if (typeof window.EnhancedTools === 'undefined') {
  window.EnhancedTools = {
    init: function(){ console.info('EnhancedTools stub initialized'); },
    // añade otros métodos no-op que el código pueda invocar
    doSomething: function(){ /* noop */ }
  };
}
