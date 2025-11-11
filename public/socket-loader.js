// public/socket-loader.js
(function loadSocketIo(){
  function load(src){ return new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.async=false; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
  // intentar local primero (útil si tienes un server socket.io real)
  load('/socket.io/socket.io.js').catch(() => {
    console.warn('socket.io local not found, loading CDN fallback');
    return load('https://cdn.socket.io/4.6.1/socket.io.min.js');
  }).catch(() => {
    console.warn('socket.io not available; continuing without real-time features');
    // opción: definir stub mínimo si tu app lo necesita
    if (typeof window.io === 'undefined') {
      window.io = function(){ return { on: ()=>{}, emit: ()=>{}, disconnect: ()=>{} }; };
    }
  });
})();
