// Helper cliente para lazy-load de bundles premium con verificación de servidor.
// Uso:
//   import { loadPremiumFeature } from './load-premium.js';
//   loadPremiumFeature('ai-assistant', '#ai-modal').then(module => { module.initAIAssistant(...); });
// Fallback: muestra modal de upgrade si no autorizado o error.

export async function loadPremiumFeature(feature, mountSelector) {
  const mount = document.querySelector(mountSelector) || document.body;
  // Show loader
  const loader = document.createElement('div');
  loader.className = 'premium-loader';
  loader.textContent = 'Verificando acceso...';
  mount.appendChild(loader);

  try {
    // Pedir entitlement al servidor; incluir credenciales (cookie) o encabezado de sesión.
    const resp = await fetch(`/api/entitlement?feature=${encodeURIComponent(feature)}`, {
      credentials: 'include',
    });
    const body = await resp.json();
    if (!body.authorized) {
      loader.remove();
      // Mostrar UI de upgrade
      showUpgradeModal(feature, body.upgradeUrl);
      return null;
    }

    const { bundleUrl, token } = body;

    // Si se devuelve token, lo adjuntamos a las peticiones posteriores
    // Guardar temporalmente en memoria/variable y pasar al bundle si necesita verificar.
    window.__PREMIUM_TOKEN = token;

    // Cargar dinámicamente el bundle. Dos enfoques:
    // 1) import() — requiere CORS/Access-Control-Allow-Origin en servidor y módulo export default.
    // 2) crear <script type="module" src="..."> y esperar a que registre algo en window.
    // Intentar import() primero:
    try {
      const module = await import(/* webpackIgnore: true */ bundleUrl);
      loader.remove();
      return module;
    } catch (err) {
      // Fallback: script tag loader (compatible si el bundle pone su API en window)
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = bundleUrl;
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
        document.head.appendChild(script);
      });
      loader.remove();
      // Supongamos que el bundle expone window.PremiumFeatures[feature]
      return window.PremiumFeatures && window.PremiumFeatures[feature];
    }
  } catch (err) {
    loader.remove();
    console.error('Error cargando feature premium:', err);
    showErrorToast('No se pudo cargar la función. Inténtalo más tarde.');
    return null;
  }
}

function showUpgradeModal(feature, url) {
  // UI simplificada: abrir modal o redirigir
  if (url) window.location.href = url;
  else alert('Esta función requiere una suscripción PRO. Visita la página de planes.');
}

function showErrorToast(msg) {
  alert(msg);
}
