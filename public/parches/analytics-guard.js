// Ejemplo de uso defensivo
if (window.Analytics && typeof window.Analytics.trackPerformanceMetric === 'function') {
  window.Analytics.trackPerformanceMetric('render_start', { /* data */ });
} else {
  // opcion: fallback no-op
  console.warn('Analytics no disponible — saltando trackPerformanceMetric');
}
