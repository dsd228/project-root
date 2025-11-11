// carga socket.io local si está disponible; si no, carga el cliente desde CDN
(function loadSocketIo() {
  function load(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = false; // mantener orden si importa
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
  }
  load('/socket.io/socket.io.js').catch(async () => {
    console.warn('socket.io local not found — loading CDN fallback');
    // Ajusta la versión al server si usas socket.io server (compatibilidad de versiones)
    await load('https://cdn.socket.io/4.6.1/socket.io.min.js');
    console.info('socket.io loaded from CDN');
  });
})();
