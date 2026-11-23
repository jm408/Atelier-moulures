// V2.2 visual polish: presentation-only layer; preserves SVG geometry and drag behavior.
(()=>{
 const css=document.createElement('style');
 css.textContent=`
 :root{--atelier-wall:#e7e1d7;--atelier-molding:#f8f5ef;--atelier-ink:#263d39;--atelier-gold:#b59766}
 body{background:#f3f0ea;color:#2d3935;font-family:Inter,ui-sans-serif,system-ui,sans-serif}
 header{background:linear-gradient(110deg,#1d3d3e,#31514b);padding-top:25px;padding-bottom:25px}
 header h1{font-family:Georgia,'Times New Roman',serif;font-size:30px;letter-spacing:.2px}
 header p{font-size:13px;opacity:.85}
 .panel{border-color:#e5e0d7;box-shadow:0 8px 26px rgba(38,61,57,.035)}
 h2{font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#263d39}
 .wizard-nav button{border-radius:9px!important;font-weight:600}
 button{transition:background-color .15s,box-shadow .15s,transform .15s}
 button:hover:not(:disabled){box-shadow:0 3px 10px rgba(22,48,43,.14)}
 button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #c9ac76;outline-offset:2px}
 #atelier-preview-controls{background:#f8f6f1;border:1px solid #e7e1d5;border-radius:12px;padding:13px 16px;margin:0 0 15px}
 #atelier-preview-controls .preview-heading{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
 #atelier-preview-controls .preview-heading strong{font-family:Georgia,serif;font-size:17px}
 #atelier-preview-controls .preview-toggle{display:flex;gap:5px;background:#e8e9e4;border-radius:8px;padding:4px}
 #atelier-preview-controls .preview-toggle button{padding:8px 11px;background:transparent;color:#244447;font-size:13px}
 #atelier-preview-controls .preview-toggle button[aria-pressed=true]{background:#244447;color:white}
 #atelier-preview-controls .preview-colors{display:none;gap:14px;flex-wrap:wrap;margin-top:12px;align-items:center}
 #atelier-preview-controls .preview-colors label{display:flex;gap:8px;align-items:center;margin:0;font-size:13px}
 #atelier-preview-controls input[type=color]{width:38px;height:32px;padding:2px;cursor:pointer}
 #atelier-preview-controls .preview-colors button{font-size:12px}
 #atelier-preview-controls[data-mode=decor] .preview-colors{display:flex}
 #result-svg.decorative-preview{background:#ede9e2}
 #result-svg.decorative-preview rect[data-panel]{fill:var(--atelier-molding)!important;fill-opacity:.12!important;stroke:var(--atelier-molding)!important;filter:drop-shadow(1px 2px 1px rgba(0,0,0,.36)) drop-shadow(-1px -1px 1px rgba(255,255,255,.85))}
 #result-svg.decorative-preview rect[data-panel]:focus{stroke:#c39c59!important}
 #result-svg.decorative-preview rect[data-panel][data-selected=true]{stroke:#a58146!important;stroke-width:5px!important}
 #result-svg.decorative-preview rect[data-wall-surface]{fill:var(--atelier-wall)!important}
 #result-svg.decorative-preview rect[data-base-surface]{fill:var(--atelier-molding)!important;filter:drop-shadow(0 -2px 3px rgba(0,0,0,.15))}
 #result-svg.decorative-preview rect[data-cornice-surface]{fill:var(--atelier-molding)!important;filter:drop-shadow(0 3px 3px rgba(0,0,0,.15))}
 @media(max-width:600px){#atelier-preview-controls .preview-heading{align-items:stretch}#atelier-preview-controls .preview-toggle{width:100%}#atelier-preview-controls .preview-toggle button{flex:1}}
 `;
 document.head.append(css);
 const result=document.getElementById('wizard-result'),svg=document.getElementById('result-svg');
 if(!result||!svg)return;
 const controls=document.createElement('div');controls.id='atelier-preview-controls';controls.dataset.mode='technical';
 controls.innerHTML='<div class="preview-heading"><strong>Visualisation du mur</strong><div class="preview-toggle" role="group" aria-label="Mode de visualisation"><button type="button" data-preview="technical" aria-pressed="true">Plan technique</button><button type="button" data-preview="decor" aria-pressed="false">Aperçu décoratif</button></div></div><div class="preview-colors"><label>Couleur du mur <input id="atelier-wall-color" type="color" value="#e7e1d7"></label><label>Couleur des moulures <input id="atelier-molding-color" type="color" value="#f8f5ef"></label><button type="button" class="secondary" id="atelier-tone">Ton sur ton</button><span class="hint">Aperçu indicatif, dimensions inchangées.</span></div>';
 svg.before(controls);
 let mode='technical';
 function decorate(){
  svg.classList.toggle('decorative-preview',mode==='decor');
  const rects=svg.querySelectorAll(':scope > rect');
  rects.forEach((r,i)=>{r.removeAttribute('data-wall-surface');r.removeAttribute('data-base-surface');r.removeAttribute('data-cornice-surface');if(i===0)r.setAttribute('data-wall-surface','');if(i===1)r.setAttribute('data-base-surface','');if(i===2)r.setAttribute('data-cornice-surface','')});
  svg.querySelectorAll('rect[data-panel]').forEach(r=>r.setAttribute('data-selected',r.getAttribute('fill')==='#c9d9cd'?'true':'false'));
 }
 controls.querySelectorAll('[data-preview]').forEach(btn=>btn.addEventListener('click',()=>{
  mode=btn.dataset.preview;controls.dataset.mode=mode;controls.querySelectorAll('[data-preview]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));decorate();
 }));
 const root=document.documentElement;
 for(const [id,prop] of [['atelier-wall-color','--atelier-wall'],['atelier-molding-color','--atelier-molding']])controls.querySelector('#'+id).addEventListener('input',e=>root.style.setProperty(prop,e.target.value));
 controls.querySelector('#atelier-tone').addEventListener('click',()=>{const c=controls.querySelector('#atelier-wall-color').value;controls.querySelector('#atelier-molding-color').value=c;root.style.setProperty('--atelier-molding',c)});
 // The existing renderer replaces SVG children on every edit; reapply presentation tags only.
 let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;decorate()})}).observe(svg,{childList:true});
 decorate();
})();
