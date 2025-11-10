// Stub público para AI Assistant: muestra modal de upgrade en lugar de lógica real.
// Reemplazar en producción por un loader dinámico que pida /api/entitlement y cargue el bundle real.

export function initAIAssistant(container) {
  const el = document.createElement('div');
  el.className = 'ai-stub-locked';
  el.innerHTML = `
    <div style="padding:16px;border-radius:8px;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,0.08);">
      <h3>AI Assistant</h3>
      <p>Esta función es parte de la versión PRO. <button class="upgrade-btn">Ver planes</button></p>
    </div>`;
  container.appendChild(el);
  el.querySelector('.upgrade-btn').addEventListener('click', () => {
    // abrir modal de pricing o redirigir
    window.location.href = '/pricing?from=ai-assistant';
  });
}
