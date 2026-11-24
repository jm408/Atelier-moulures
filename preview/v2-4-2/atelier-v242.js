(()=>{
const svg=document.querySelector('#result-svg'),stage=document.querySelector('.am-stage'),controls=document.querySelector('#atelier-preview-controls');if(!svg||!stage||!controls)return;
const colors=controls.querySelector('.preview-colors');const label=document.createElement('label');label.innerHTML='Couleur de la cimaise <input type="color" id="atelier-rail-color" value="#836f59">';colors.prepend(label);label.querySelector('input').addEventListener('input',e=>document.documentElement.style.setProperty('--atelier-rail',e.target.value));
const help=document.createElement('div');help.className='am-context-help';help.innerHTML='<div><strong>Déplacer les ouvertures et obstacles</strong><p>Cliquez et faites glisser une ouverture sur le plan, ou saisissez ses coordonnées.</p></div><div><strong>Personnaliser les cadres</strong><p>Déplacez un cadre ou tirez sa poignée supérieure droite pour le redimensionner.</p></div>';stage.querySelector('.am-canvas').before(help);
const originalHint=document.querySelector('#obstacle-drag-hint');if(originalHint)originalHint.remove();const tools=document.querySelector('#panel-tools');if(tools){tools.querySelector('h3')?.remove();tools.querySelector('p.hint')?.remove();}
const nav=document.querySelector('.wizard-nav');const sync=()=>{help.hidden=nav.querySelector('.active')?.dataset.step!=='2'};new MutationObserver(sync).observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});sync();
const notice=document.querySelector('#bar-confirm-notice');const update=()=>{if(notice)notice.dataset.confirmed=String(!!document.querySelector('#bar-confirm')?.checked&&Number(document.querySelector('[name=bar]')?.value)>=30)};if(notice)new MutationObserver(update).observe(notice,{childList:true});update();
// Add explicit highlight and shadow strokes, not CSS drop-shadow alone.
const ns='http://www.w3.org/2000/svg';
const template=[{id:'default-window',type:'window',x:145,y:85,width:110,height:120}];
document.querySelector('#reset').addEventListener('click',()=>{
 const form=document.querySelector('#settings');
 form.elements.namedItem('w').value=400;form.elements.namedItem('h').value=250;
 window.dispatchEvent(new CustomEvent('atelier:obstacles-import',{detail:{obstacles:template}}));
 form.dispatchEvent(new Event('input',{bubbles:true}));
});
const light=c=>{const v=c.replace('#','');return v.length===6&&[0,2,4].every(i=>parseInt(v.slice(i,i+2),16)>220)};
function whiteMode(){const wall=controls.querySelector('#atelier-wall-color').value,frame=controls.querySelector('#atelier-molding-color').value;svg.classList.toggle('am-white-relief',light(wall)&&light(frame));}
controls.addEventListener('input',whiteMode);controls.addEventListener('click',()=>queueMicrotask(whiteMode));whiteMode();
function relief(){
 svg.querySelectorAll('[data-relief]').forEach(n=>n.remove());
 if(!svg.classList.contains('decorative-preview'))return;
 for(const el of svg.querySelectorAll('rect[data-panel],line[data-rail-surface]')){
  const sw=Number(el.getAttribute('stroke-width'))||2;
  for(const [offset,color,opacity] of [[1.25,'#000000',.55],[-1.1,'#ffffff',.8]]){
   const n=document.createElementNS(ns,el.localName);
   for(const k of (el.localName==='rect'?['x','y','width','height']:['x1','x2','y1','y2']))n.setAttribute(k,el.getAttribute(k));
   n.setAttribute('data-relief','');n.setAttribute('fill','none');n.setAttribute('stroke',color);n.setAttribute('stroke-opacity',opacity);n.setAttribute('stroke-width',Math.max(.65,sw*.32));n.setAttribute('transform','translate('+offset+' '+offset+')');n.setAttribute('pointer-events','none');el.after(n);
  }
 }
}
let queued=false;const observer=new MutationObserver(records=>{if(!records.some(r=>r.type==='attributes'||[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&!n.hasAttribute('data-relief'))))return;if(!queued){queued=true;queueMicrotask(()=>{queued=false;relief()})}});observer.observe(svg,{childList:true,attributes:true,attributeFilter:['class']});relief();
const css=document.createElement('style');css.textContent=`
body{background:#FAFAF9!important}
#result-svg.decorative-preview.am-white-relief rect[data-panel]{filter:drop-shadow(1px 2px 1.8px rgba(65,55,45,.28)) drop-shadow(-.5px -.5px .5px rgba(255,255,255,.95))!important;stroke:#fff!important}
#result-svg.decorative-preview.am-white-relief [data-relief]{opacity:.22}
#result-svg.decorative-preview.am-white-relief [data-rail-surface]{filter:drop-shadow(0 2px 1.6px rgba(65,55,45,.25))}
#result-svg.decorative-preview rect[data-panel]{fill:transparent!important;filter:drop-shadow(1.4px 2px .65px rgba(0,0,0,.65)) drop-shadow(-1px -1px .45px rgba(255,255,255,.95))!important}
#result-svg.decorative-preview [data-rail-surface]{stroke:var(--atelier-rail,#836f59)!important;filter:drop-shadow(0 1px 1px rgba(0,0,0,.45))}
#obstacle-drag-hint{display:none!important}
#panel-tools>p.hint:first-of-type{display:none}
.am-context-help:not([hidden]){display:flex;gap:10px;flex-wrap:wrap}
.am-context-help>div{flex:1 1 200px;background:#e5eeeb;color:#244447;border-left:4px solid #244447;border-radius:6px;padding:12px 14px;font-size:13px}
.am-context-help strong{font-weight:650}.am-context-help p{margin-top:8px}
body #bar-confirm-notice{background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;border-radius:8px;font-weight:500}
body #bar-confirm-notice[data-confirmed=true]{background:#F0FDF4;color:#1B3B2E;border-color:#BBF7D0}
body .bar-confirm{background:#FAFAF9}
`;document.head.append(css);
})();