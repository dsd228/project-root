// En el entry donde se inicializa EnhancedTools:
try {
  if (typeof EnhancedTools === 'undefined') {
    console.warn('EnhancedTools no disponible — cargando stub o deshabilitando características avanzadas.');
    // crear stub mínimo para que el resto no rompa
    window.EnhancedTools = {
      init: () => {/* noop */},
      doSomething: () => {/* noop */}
    };
  }
  // Ahora inicializar con seguridad
  EnhancedTools.init(/*...*/);
} catch (err) {
  console.error('Error inicializando EnhancedTools safe-guard:', err);
}
