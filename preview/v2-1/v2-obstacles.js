// V2.1-A — couche indépendante d'obstacles. Coordonnées en cm, origine en bas à gauche.
(() => {
  const key='atelier-moulures-obstacles-v2';
  const types={door:'Porte',window:'Fenêtre',radiator:'Radiateur'};
  const defaults={door:[0,83,204],window:[85,110,120],radiator:[15,90,65]};
  const safe=(v)=>Number.isFinite(Number(v))?Number(v):0;
  const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let objects=[];
  try { const data=JSON.parse(localStorage.getItem(key)||'{}'); if(data.schemaVersion===2&&Array.isArray(data.obstacles))objects=data.obstacles.filter(o=>types[o.type]).map(o=>({...o})); } catch {}
  const panel=document.createElement('section');panel.className='panel';
  panel.innerHTML='<h2>Ouvertures et obstacles <small style="font-size:12px;color:#68736e">V2.1</small></h2><p class="hint">Origine en bas à gauche. X depuis le bord gauche, Y depuis le sol. Dimensions en cm.</p><div class="buttons"><select id="ob-type" aria-label="Type d’obstacle"><option value="door">Porte</option><option value="window">Fenêtre</option><option value="radiator">Radiateur</option></select><button type="button" id="ob-add">Ajouter</button></div><div id="ob-list"></div><p class="hint" id="ob-notes" role="status"></p>';
  panel.querySelector('select').style.cssText='padding:9px;min-width:130px;border:1px solid #c7c9c3;border-radius:7px';
  document.querySelector('main').append(panel);
  const list=panel.querySelector('#ob-list'),notes=panel.querySelector('#ob-notes');
  const dims=()=>({w:safe(document.querySelector('[name=w]').value),h:safe(document.querySelector('[name=h]').value)});
  const validate=o=>{const {w,h}=dims();return o.width>0&&o.height>0&&o.x>=0&&o.y>=0&&o.x+o.width<=w+1e-6&&o.y+o.height<=h+1e-6};
  const persist=()=>localStorage.setItem(key,JSON.stringify({schemaVersion:2,obstacles:objects}));
  function draw(){
    const svg=document.querySelector('#drawing');svg.querySelector('#ob-layer')?.remove();
    const wall=svg.querySelector('rect');if(!wall)return;
    const {w,h}=dims(), ox=Number(wall.getAttribute('x')),oy=Number(wall.getAttribute('y')),sx=Number(wall.getAttribute('width'))/w,sy=Number(wall.getAttribute('height'))/h;
    const ns='http://www.w3.org/2000/svg',g=document.createElementNS(ns,'g');g.id='ob-layer';
    objects.forEach((o,i)=>{
      const rect=document.createElementNS(ns,'rect');
      rect.setAttribute('x',ox+o.x*sx);rect.setAttribute('y',oy+(h-o.y-o.height)*sy);rect.setAttribute('width',o.width*sx);rect.setAttribute('height',o.height*sy);
      rect.setAttribute('fill',o.type==='door'?'#ddd1bf':o.type==='window'?'#a8cfdd':'#c3b8aa');
      rect.setAttribute('fill-opacity','.85');rect.setAttribute('stroke',validate(o)?'#52635d':'#c02929');rect.setAttribute('stroke-width',validate(o)?'1.5':'3');g.append(rect);
      const label=document.createElementNS(ns,'text');label.textContent=types[o.type]+' '+(i+1);label.setAttribute('x',ox+(o.x+o.width/2)*sx);label.setAttribute('y',oy+(h-o.y-o.height/2)*sy);label.setAttribute('text-anchor','middle');label.setAttribute('dominant-baseline','middle');label.setAttribute('font-size','11');label.setAttribute('fill','#273c39');g.append(label);
    });svg.append(g);
    const invalid=objects.filter(o=>!validate(o)).length;
    notes.textContent=invalid?invalid+' obstacle(s) hors des limites du mur : corriger les coordonnées.':'Les obstacles sont affichés à l’échelle. La détection des collisions avec les cadres arrive dans V2.1-B.';
    notes.className=invalid?'warn':'hint';
  }
  function refresh(){
    list.innerHTML=objects.map((o,i)=>'<div style="padding:10px 0;border-top:1px solid #e4e5e1"><strong>'+types[o.type]+' '+(i+1)+'</strong> <button type="button" class="secondary" data-remove="'+i+'" style="float:right;padding:5px 8px">Supprimer</button><div style="display:grid;grid-template-columns:1fr 1fr;gap:5px 12px;clear:both;padding-top:8px">'+[['x','X'],['y','Y'],['width','Largeur'],['height','Hauteur']].map(([field,label])=>'<label style="margin:3px 0">'+label+' <input style="width:76px" type="number" step=".1" min="0" data-index="'+i+'" data-field="'+field+'" value="'+escapeHtml(o[field])+'"></label>').join('')+'</div></div>').join('');
    draw();
  }
  panel.querySelector('#ob-add').addEventListener('click',()=>{
    const type=panel.querySelector('#ob-type').value,[y,width,height]=defaults[type];objects.push({id:'ob-'+Date.now()+'-'+objects.length,type,x:0,y,width,height});persist();refresh();
  });
  list.addEventListener('input',e=>{const t=e.target;if(!t.matches('[data-field]'))return;objects[Number(t.dataset.index)][t.dataset.field]=safe(t.value);persist();draw()});
  list.addEventListener('click',e=>{const t=e.target.closest('[data-remove]');if(!t)return;objects.splice(Number(t.dataset.remove),1);persist();refresh()});
  document.querySelector('#settings').addEventListener('input',()=>queueMicrotask(draw));
  document.querySelector('#reset').addEventListener('click',()=>queueMicrotask(draw));
  // V1 réécrit le SVG à chaque rendu : réappliquer la couche après chaque changement.
  const observer=new MutationObserver(()=>{if(!document.querySelector('#ob-layer'))draw()});
  observer.observe(document.querySelector('#drawing'),{childList:true});
  refresh();
})();
