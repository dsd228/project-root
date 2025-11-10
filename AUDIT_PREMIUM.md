# Auditoría rápida - Etiquetas "premium"

Resumen
- Objetivo: identificar archivos/recursos que contienen referencias o código "premium" y evaluar si exponen lógica sensible.
- Riesgo principal: lógica/activos premium servidos desde la carpeta pública permiten eludir pagos al inspeccionar la app y cargar directamente esos bundles.

Archivos a revisar (prioridad alta)
- index.html
  - Identifica clases/data-attributes y IDs que exponen rutas: `id="public/ai-assistant.js"`, `data-feature="public/auto-layout.js"`.
  - Lista de scripts incluidos en HTML: `/socket.io/socket.io.js`, `public/init-core.js`, `public/enhanced-tools-simple.js`, `public/init-complete.js`, `public/analytics.js`, `public/export-engine.js`, `public/plugins.js`, `public/prototype-mode.js`, `public/interactive-elements.js`.
- public/*.js
  - Buscar módulos que implementen AI-assistant, auto-layout, export-engine, premium templates, image/icon libraries.
  - Archivos sospechosos: `public/ai-assistant.js`, `public/auto-layout.js`, `public/export-engine.js`, `public/plugins.js`.
- public/assets/, public/templates/, public/images/
  - Revisar si hay plantillas / imágenes premium expuestas directamente.
- CSS
  - Clases `.premium`, `.premium-feature`, `.premium-tag` están bien para UI, pero no deben contener referencias a rutas de archivo ni a bundles ejecutables.

Evaluación rápida de riesgo
- Código JS con lógica de negocio premium en public/ -> alto riesgo.
- Assets (plantillas, imágenes) en /public servidos sin control -> riesgo medio.
- Identificadores en DOM con rutas de archivo -> menor riesgo por sí solos, pero indican que la app utiliza paths predecibles.

Acciones inmediatas recomendadas
1. Reemplazar los bundles premium públicos por stubs que muestren "Feature Locked" en cliente.
2. Mover código premium a repositorio/paquete privado.
3. Implementar endpoint /api/entitlement que devuelva permiso (JWT / signed URL) tras verificar suscripción.
4. Implementar lazy-loading dinámico que solicite /api/entitlement antes de cargar el bundle premium.
5. Mover plantillas y assets premium a almacenamiento privado (S3) y servir con signed URLs.
6. Añadir logs/telemetría para detección de intentos de acceso directo a bundles.

Checklist de verificación tras cambios
- No hay archivos JS/HTML públicos que permitan usar la funcionalidad premium sin token.
- Los stubs públicos no contienen la lógica premium ni endpoints que la activen.
- Endpoints de entrega de bundle validan entitlements y emiten tokens temporales.
