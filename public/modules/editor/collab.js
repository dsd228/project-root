// simple Collab client wrapper (exposes window.CollabClient)
(function(global){
  function CollabClient(url, room='default'){
    let socket = null;
    const listeners = {};
    function connect(){
      if(typeof io === 'undefined') throw new Error('socket.io client not loaded');
      socket = io(url);
      socket.on('connect', ()=> console.log('collab connected', socket.id));
      socket.on('op', (op)=> (listeners.op||[]).forEach(fn=>fn(op)));
      socket.on('cursor', (c)=> (listeners.cursor||[]).forEach(fn=>fn(c)));
      socket.on('presence', (p)=> (listeners.presence||[]).forEach(fn=>fn(p)));
      socket.emit('join', room);
    }
    function on(ev, fn){ listeners[ev] = listeners[ev] || []; listeners[ev].push(fn); }
    function sendOp(op){ if(socket) socket.emit('op', op); }
    function sendCursor(c){ if(socket) socket.emit('cursor', c); }
    function presence(p){ if(socket) socket.emit('presence', p); }
    function disconnect(){ if(socket) socket.disconnect(); socket=null; }
    return { connect, on, sendOp, sendCursor, presence, disconnect, socketRef: ()=> socket };
  }
  global.CollabClient = CollabClient;
})(window);
