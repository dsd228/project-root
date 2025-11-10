// DevMode: small exports generator
window.DevMode = (function(){
  function cssFromObject(obj){
    const w = Math.round((obj.width||0)*(obj.scaleX||1));
    const h = Math.round((obj.height||0)*(obj.scaleY||1));
    return `.component { width:${w}px; height:${h}px; background:${obj.fill||'#000'}; }`;
  }
  function reactFromObject(obj){
    const style = { width: `${Math.round((obj.width||0)*(obj.scaleX||1))}px`, height: `${Math.round((obj.height||0)*(obj.scaleY||1))}px`, background: obj.fill || '#000' };
    return `export default function Component(){ return <div style={${JSON.stringify(style)}}></div> }`;
  }
  return { cssFromObject, reactFromObject };
})();
