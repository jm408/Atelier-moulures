// V2.1-B prototype: wall constraints -> composition -> result (separate from legacy V1 output).
(() => {
 const form=document.querySelector('#settings'), main=document.querySelector('main'), obstaclePanel=document.querySelector('#ob-add').closest('.panel');
 const oldResult=document.querySelector('#drawing').closest('.panel');
 oldResult.style.display='none';
 main.style.display='flex';main.style.flexDirection='column';main.style.maxWidth='850px';
 form.closest('.panel').querySelector('h2').textContent='1. Définir le mur';
 const section=document.createElement('section');section.className='panel';section.innerHTML=`
 <h2>2. Composer les moulures</h2>
 <p class="hint">Les cadres sont proposés dans les surfaces disponibles, sans traverser les portes, fenêtres ou radiateurs. Ajustez les marges et espacements dans « Disposition des cadres » ci-dessus.</p>
 <div id="composition-controls"></div><label>Disposition <select id="layout-mode" style="padding:8px;border-radius:7px"><option value="auto">Adaptée aux obstacles</option><option value="three">3 panneaux symétriques (mur libre)</option></select></label>
 <p class="hint">Aide d’alignement : les panneaux d’une même zone sont répartis à largeur égale et à intervalles réguliers.</p><label>Cadres par zone libre <input id="zone-cols" type="number" min="1" max="8" step="1" value="1"></label>
 <label>Largeur du panneau central (cm) <input id="center-width" type="number" value="125" min="30" step="5"></label>
 <label>Dégagement autour des obstacles (cm) <input id="clearance" type="number" value="8" min="0" step="1"></label>
 <h2 style="margin-top:24px">3. Résultat du calepinage</h2><p id="result-notice" class="hint" role="status"></p>
 <svg id="result-svg" viewBox="0 0 600 380" role="img" aria-label="Résultat : mur, ouvertures et panneaux calculés"></svg>
 <h3>Dimensions et quantités du résultat</h3><div class="stats"><div class="stat">Panneaux<strong id="result-count">—</strong></div><div class="stat">Baguettes théoriques<strong id="result-meters">—</strong></div><div class="stat">Barres estimées<strong id="result-bars">—</strong></div><div class="stat">Conflits<strong id="result-conflicts">—</strong></div></div>
 <p class="hint">Estimations des seuls cadres affichés. Les plinthes et corniches ne sont pas comprises dans ce métré. La découpe réelle et les dégagements doivent être vérifiés sur place.</p>
 <h3>Liste des coupes des cadres à 45°</h3><table><thead><tr><th>Pièce</th><th>Quantité</th><th>Longueur extérieure</th></tr></thead><tbody id="result-cuts"></tbody></table>`;
 obstaclePanel.after(section);
 section.querySelector('#composition-controls').append(document.querySelector('#composition-fields'));
 const comp=document.querySelector('#composition-fields');
 comp.querySelectorAll('input').forEach(input=>input.setAttribute('form','settings'));
 comp.querySelector('h3').textContent='Marges, espacements et baguettes';
 comp.querySelectorAll('label').forEach(label=>{const name=label.querySelector('input')?.name;if(['cols','rows','upper'].includes(name))label.style.display='none'});
 const modeSelect=section.querySelector('#layout-mode');
 modeSelect.innerHTML='<option value="auto">Automatique — obstacles</option><option value="regular">Régulier — grille</option><option value="three">Personnalisé — 3 panneaux symétriques</option>';
 const controls=section.querySelector('#composition-controls');
 controls.insertAdjacentHTML('afterbegin','<div id="regular-controls"><label>Colonnes <input id="regular-cols" type="number" min="1" max="12" value="3"></label><label>Rangées <input id="regular-rows" type="number" min="1" max="5" value="1"></label></div>');
 const syncMode=()=>{const mode=modeSelect.value;section.querySelector('#regular-controls').style.display=mode==='regular'?'block':'none';section.querySelector('#zone-cols').closest('label').style.display=mode==='auto'?'flex':'none';section.querySelector('#center-width').closest('label').style.display=mode==='three'?'flex':'none'};modeSelect.addEventListener('change',syncMode);syncMode();
 const $=id=>document.getElementById(id), num=name=>Number(form.elements[name].value);
 const types={door:'Porte',window:'Fenêtre',radiator:'Radiateur'};
 const svgNS='http://www.w3.org/2000/svg';
 const add=(parent,tag,attrs,txt)=>{const e=document.createElementNS(svgNS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(txt!==undefined)e.textContent=txt;parent.append(e);return e};
 const fmt=n=>Number(n.toFixed(1)).toLocaleString('fr-FR');
 const overlap=(a,b)=>a.x<b.x+b.w-0.001&&a.x+a.w>b.x+0.001&&a.y<b.y+b.h-0.001&&a.y+a.h>b.y+0.001;
 const readObs=()=>{try{const d=JSON.parse(localStorage.getItem('atelier-moulures-obstacles-v2')||'{}');return Array.isArray(d.obstacles)?d.obstacles:[]}catch{return []}};
 function calculate(){
   const w=num('w'),h=num('h'),base=num('base'),cornice=num('cornice'),side=num('side'),bottom=num('bottom'),top=num('top'),gap=num('gapX'),profile=num('profile')/10,bar=num('bar'),loss=num('loss');
   const clearance=Math.max(0,Number($('clearance').value)||0),obs=readObs();
   const limits={x:side,y:base+bottom,w:w-2*side,h:h-base-bottom-cornice-top};
   const valid=[w,h,base,cornice,side,bottom,top,gap,profile,bar,loss].every(Number.isFinite)&&w>0&&h>0&&limits.w>0&&limits.h>0&&bar>0&&profile>0;
   const svg=$('result-svg');svg.replaceChildren();
   if(!valid){$('result-notice').textContent='Dimensions incompatibles : vérifiez les marges et le mur.';['result-count','result-meters','result-bars','result-conflicts'].forEach(id=>$(id).textContent='—');$('result-cuts').replaceChildren();return}
   const s=Math.min(540/w,330/h),ox=(600-w*s)/2,oy=24,sy=y=>oy+(h-y)*s;
   svg.setAttribute('viewBox','0 0 600 '+Math.max(380,oy+h*s+24));
   add(svg,'rect',{x:ox,y:oy,width:w*s,height:h*s,fill:'#eee9df',stroke:'#918c82'});
   add(svg,'rect',{x:ox,y:sy(base),width:w*s,height:base*s,fill:'#b4a48d'});
   add(svg,'rect',{x:ox,y:oy,width:w*s,height:cornice*s,fill:'#d8cbbb'});
   const blocked=obs.map(o=>({x:Number(o.x)-clearance,y:Number(o.y)-clearance,w:Number(o.width)+2*clearance,h:Number(o.height)+2*clearance}));
   let panels=[],warning=[];
   if($('layout-mode').value==='three'){
     const center=Number($('center-width').value),sideWidth=(limits.w-center-2*gap)/2;
     if(sideWidth>2*profile&&center>2*profile)panels=[{x:limits.x,y:limits.y,w:sideWidth,h:limits.h},{x:limits.x+sideWidth+gap,y:limits.y,w:center,h:limits.h},{x:limits.x+sideWidth+gap+center+gap,y:limits.y,w:sideWidth,h:limits.h}];
     else warning.push('Largeurs incompatibles avec trois panneaux.');
   }else if($('layout-mode').value==='regular'){
     const cols=Math.max(1,Math.floor(Number($('regular-cols').value)||1)),rows=Math.max(1,Math.floor(Number($('regular-rows').value)||1)),gapY=num('gapY');
     const pw=(limits.w-(cols-1)*gap)/cols,ph=(limits.h-(rows-1)*gapY)/rows;
     if(pw>2*profile&&ph>2*profile)for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)panels.push({x:limits.x+c*(pw+gap),y:limits.y+r*(ph+gapY),w:pw,h:ph});
     else warning.push('Grille trop dense pour les dimensions du mur.');
   }else{
     // Partition into horizontal bands at obstacle edges; find free horizontal intervals per band.
     const ys=[limits.y,limits.y+limits.h,...blocked.flatMap(o=>[Math.max(limits.y,o.y),Math.min(limits.y+limits.h,o.y+o.h)])].filter(y=>y>=limits.y&&y<=limits.y+limits.h).sort((a,b)=>a-b).filter((y,i,a)=>i===0||y-a[i-1]>.01);
     const bands=[];
     for(let i=0;i<ys.length-1;i++){
       const low=ys[i],high=ys[i+1];if(high-low<2*profile+8)continue;
       const relevant=blocked.filter(o=>o.y<high-.01&&o.y+o.h>low+.01).map(o=>({l:Math.max(limits.x,o.x),r:Math.min(limits.x+limits.w,o.x+o.w)})).filter(o=>o.r>o.l).sort((a,b)=>a.l-b.l);
       let cursor=limits.x;
       for(const o of relevant){if(o.l>cursor+2*profile+8)bands.push({x:cursor,y:low,w:o.l-cursor,h:high-low});cursor=Math.max(cursor,o.r)}
       if(limits.x+limits.w>cursor+2*profile+8)bands.push({x:cursor,y:low,w:limits.x+limits.w-cursor,h:high-low});
     }
     // Merge vertically contiguous free rectangles with the same horizontal extent.
     bands.sort((a,b)=>a.x-b.x||a.w-b.w||a.y-b.y);
     for(const b of bands){const prev=panels.find(p=>Math.abs(p.x-b.x)<.01&&Math.abs(p.w-b.w)<.01&&Math.abs(p.y+p.h-b.y)<.01);if(prev)prev.h+=b.h;else panels.push({...b})}
     // Inner inset avoids touching obstacles and preserves room for the profile.
     panels=panels.map(p=>({x:p.x+2,y:p.y+2,w:p.w-4,h:p.h-4})).filter(p=>p.w>2*profile+8&&p.h>2*profile+8);
     // Harmonize the upper edges of tall lateral panels when the extension is free.
     // Never move an opening, cross its clearance, or overlap another panel.
     const upperEdge=limits.y+limits.h-2;
     const lowerEdge=limits.y+2;
     panels.forEach((p,i)=>{
       if(Math.abs(p.y-lowerEdge)>0.1||p.h<limits.h*0.28||p.y+p.h>=upperEdge-0.1)return;
       const candidate={...p,h:upperEdge-p.y};
       const freeOfObstacles=!blocked.some(o=>overlap(candidate,o));
       const freeOfPanels=!panels.some((other,j)=>j!==i&&overlap(candidate,other));
       if(freeOfObstacles&&freeOfPanels)p.h=candidate.h;
     });
     const cols=Math.max(1,Math.min(8,Math.floor(Number($('zone-cols').value)||1)));
     panels=panels.flatMap(p=>{
       const width=(p.w-(cols-1)*gap)/cols;
       if(width<=2*profile+8)return [p];
       return Array.from({length:cols},(_,i)=>({x:p.x+i*(width+gap),y:p.y,w:width,h:p.h}));
     });
   }
   const invalidObs=obs.filter(o=>![o.x,o.y,o.width,o.height].every(v=>Number.isFinite(Number(v)))||Number(o.x)<0||Number(o.y)<0||Number(o.x)+Number(o.width)>w||Number(o.y)+Number(o.height)>h||Number(o.width)<=0||Number(o.height)<=0);
   const collisions=panels.filter(p=>blocked.some(o=>overlap(p,o)));
   panels.forEach((p,i)=>add(svg,'rect',{x:ox+p.x*s,y:sy(p.y+p.h),width:p.w*s,height:p.h*s,fill:'none',stroke:collisions.includes(p)?'#c02929':'#9a7d5c','stroke-width':Math.max(1.5,profile*s)}));
   obs.forEach((o,i)=>{const x=Number(o.x),y=Number(o.y),ww=Number(o.width),hh=Number(o.height);if(![x,y,ww,hh].every(Number.isFinite))return;
     add(svg,'rect',{'data-obstacle':i,style:'touch-action:none;cursor:grab',x:ox+x*s,y:sy(y+hh),width:ww*s,height:hh*s,fill:o.type==='window'?'#a8cfdd':o.type==='door'?'#ddd1bf':'#c3b8aa','fill-opacity':'.9',stroke:'#52635d','stroke-width':1.5});
     add(svg,'text',{'pointer-events':'none',x:ox+(x+ww/2)*s,y:sy(y+hh/2),'text-anchor':'middle','dominant-baseline':'middle','font-size':11,fill:'#273c39'},(types[o.type]||'Obstacle')+' '+(i+1));
   });
   const total=panels.reduce((sum,p)=>sum+2*(p.w+p.h),0)/100,conflicts=collisions.length+invalidObs.length;
   $('result-count').textContent=String(panels.length);$('result-meters').textContent=fmt(total)+' m';$('result-bars').textContent=String(Math.ceil(total*(1+loss/100)*100/bar));$('result-conflicts').textContent=String(conflicts);
   const pieces=new Map();for(const p of panels)for(const len of [p.w,p.w,p.h,p.h]){const k=len.toFixed(1);pieces.set(k,(pieces.get(k)||0)+1)}
   $('result-cuts').innerHTML=[...pieces].sort((a,b)=>Number(b[0])-Number(a[0])).map(([length,count])=>'<tr><td>Cadre</td><td>'+count+'</td><td>'+fmt(Number(length))+' cm</td></tr>').join('')||'<tr><td colspan="3">Aucun cadre réalisable</td></tr>';
   $('result-notice').textContent=[...warning,...(conflicts?[conflicts+' conflit(s) à corriger.']:[]),...(!panels.length?['Aucun panneau possible avec ces dimensions.']:[]),'Proposition automatique indicative : ajuster les cadres avant achat.'].join(' ');
   $('result-notice').className=conflicts||warning.length?'warn':'hint';
 }
 // The V2.1-A editor persists obstacles on input. Observe its editor for edits, additions and removal.
 // Pointer drag: move an obstacle visually, then refine exact X/Y in the form.
 let drag=null;
 const resultSvg=$('result-svg');
 resultSvg.addEventListener('pointerdown',e=>{
   const target=e.target.closest('[data-obstacle]');if(!target)return;
   const index=Number(target.getAttribute('data-obstacle')),obs=readObs(),o=obs[index];if(!o)return;
   const box=resultSvg.getBoundingClientRect(),vb=resultSvg.viewBox.baseVal,wallW=num('w'),wallH=num('h');
   const scale=Math.min(540/wallW,330/wallH),pxPerCm=scale*box.width/vb.width;
   drag={index,startX:e.clientX,startY:e.clientY,x:Number(o.x),y:Number(o.y),pxPerCm,door:o.type==='door'};
   resultSvg.setPointerCapture(e.pointerId);e.preventDefault();
 });
 resultSvg.addEventListener('pointermove',e=>{
   if(!drag)return;
   const obs=readObs(),o=obs[drag.index];if(!o)return;
   const x=drag.x+(e.clientX-drag.startX)/drag.pxPerCm,y=drag.door?0:drag.y-(e.clientY-drag.startY)/drag.pxPerCm;
   o.x=Math.round(Math.max(0,Math.min(num('w')-Number(o.width),x))*10)/10;
   o.y=Math.round(Math.max(0,Math.min(num('h')-Number(o.height),y))*10)/10;
   localStorage.setItem('atelier-moulures-obstacles-v2',JSON.stringify({schemaVersion:2,obstacles:obs}));
   calculate();
   const editor=document.querySelector('#ob-list');
   for(const field of ['x','y']){const input=editor.querySelector('[data-index="'+drag.index+'"][data-field="'+field+'"]');if(input)input.value=o[field]}
 });
 const stopDrag=()=>{drag=null};resultSvg.addEventListener('pointerup',stopDrag);resultSvg.addEventListener('pointercancel',stopDrag);
 const watch=new MutationObserver(()=>calculate());
 watch.observe(document.querySelector('#ob-list'),{childList:true,subtree:true,attributes:true,attributeFilter:['value']});
 document.querySelector('#ob-list').addEventListener('input',()=>queueMicrotask(calculate));
 form.addEventListener('input',calculate);
 section.addEventListener('input',calculate);
 document.querySelector('#ob-add').addEventListener('click',()=>queueMicrotask(calculate));
 document.querySelector('#ob-list').addEventListener('click',()=>queueMicrotask(calculate));
 document.querySelector('#reset').addEventListener('click',()=>queueMicrotask(calculate));
 calculate();
})();
