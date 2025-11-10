// basic components registry in localStorage
window.EditorComponents = (function(){
  const KEY = 'editor:components:v2';
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY) || '[]'); }catch(e){ return []; } }
  function save(list){ localStorage.setItem(KEY, JSON.stringify(list)); }
  let comps = load();
  function list(){ comps = load(); return comps; }
  function create(name,json){
    const id = 'comp_'+Math.random().toString(36).slice(2,9);
    comps.unshift({ id, name: name||('Component '+(comps.length+1)), json });
    save(comps); return id;
  }
  function get(id){ return comps.find(c=>c.id===id) || null; }
  function remove(id){ comps = comps.filter(c=>c.id!==id); save(comps); }
  return { list, create, get, remove };
})();
