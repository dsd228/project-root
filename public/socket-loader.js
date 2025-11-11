// public/socket-loader.js
(function loadSocketIo(){
  function load(src){ 
    return new Promise((res,rej)=>{ 
      const s=document.createElement('script'); 
      s.src=src; 
      s.async=false; 
      s.onload=res; 
      s.onerror=rej; 
      document.head.appendChild(s); 
    }); 
  }

  // Intentar ruta local primero (útil si hay servidor socket.io)
  load('/socket.io/socket.io.js')
    .catch(() => {
      console.warn('socket.io local not found — loading CDN fallback');
      // Ajusta la versión al servidor de socket.io si corresponde
      return load('https://cdn.socket.io/4.6.1/socket.io.min.js');
    })
    .catch(() => {
      console.warn('socket.io not available; continuing without real-time features');
      // Definir stub mínimo para evitar errores si el código llama a io()
      if (typeof window.io === 'undefined') {
        window.io = function(){ 
          return { on: ()=>{}, emit: ()=>{}, disconnect: ()=>{} }; 
        };
      }
    });
})();
