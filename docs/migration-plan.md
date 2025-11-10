# Plan de migración: extraer código premium a paquete / repo privado

Objetivo
- Evitar que la lógica/activos premium estén accesibles desde el repo público.

Pasos
1. Inventario
   - Ejecutar búsqueda por: "premium", "PRO", "premium-feature", "data-feature", referencias a public/*.js.
   - Listar archivos JS y assets que implementan funcionalidades premium.

2. Crear repositorio/paquete privado
   - Nuevo repo: project-root-premium (privado) o paquete privado en npm/verdaccio.
   - Estructura mínima: src/, build/, package.json, README, CI.

3. Extraer lógica
   - Mover archivos JS con lógica premium (AI, auto-layout, export engine avanzado) al repo privado.
   - Crear entrypoints por feature: ai-assistant.bundle.js, auto-layout.bundle.js, etc.
   - Mantener API pública estable que permita inicializar las features desde el loader (ej: export init(container, options)).

4. Build y entrega
   - CI para compilar bundles versionados y publicar a S3/Cloudfront con Signed URLs o a un private registry.
   - Los bundles deben ser módulos ES y soportar CORS/Access-Control-Allow-Origin si se cargan dinámicamente.

5. Cambios en repo público
   - Reemplazar los archivos movidos por stubs (como ai-assistant.stub.js).
   - Añadir load-premium.js que solicita /api/entitlement para autorizar y devolver URL del bundle.

6. Backend de entitlements
   - Implementar endpoints: /api/entitlement, /api/verify-token.
   - Integrar con sistema de pagos y webhooks (Stripe/Paddle) para actualizar estado de subscripción.

7. Tests y despliegue
   - E2E tests que cubran: usuario free -> intento de uso -> modal upgrade; usuario pro -> carga del bundle y uso.
   - Desplegar backend de entitlement y configurar CDN/ACLs.

Consideraciones
- Evitar confiar solo en ofuscación. Usar gating server-side.
- Monitoreo de intentos de acceso directo a bundles.
