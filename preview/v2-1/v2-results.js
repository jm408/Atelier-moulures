// V2.1-B prototype: wall constraints -> composition -> result (separate from legacy V1 output).
(() => {
 const form=document.querySelector('#settings'), main=document.querySelector('main'), obstaclePanel=document.querySelector('#ob-add').closest('.panel');
 const oldResult=document.querySelector('#drawing').closest('.panel');
 oldResult.style.display='none';
 main.style.display='flex';main.style.flexDirection='column';main.style.maxWidth='850px';
 form.closest('.panel').querySelector('h2').textContent='1. Définir le mur';
 const section=document.createElement('section');section.className='panel';section.innerHTML=`
 <h2>2. Composer les moulures</h2><label>Typologie <select id="typology"><option value="decorative">Cadres décoratifs</option><option value="base">Soubassement</option><option value="mixed">Composition mixte</option></select></label><label>Forme <select id="panel-shape"><option value="rectangle">Rectangles</option><option value="square">Carrés</option></select></label><label>Hauteur de soubassement depuis le sol (cm) <input id="dado-height" type="number" min="30" step="5" value="95"></label><label>Nombre de colonnes souhaité <input id="typology-cols" type="number" min="1" max="12" value="3"></label>
 <p class="hint">Choisissez une typologie. La composition sera proposée automatiquement à l’étape suivante.</p><div id="style-essentials"><label>Nombre de colonnes <select id="column-mode"><option value="auto">Automatique (recommandé)</option><option value="manual">Personnalisé</option></select></label><label id="column-count-label">Colonnes souhaitées <input id="column-count" type="number" min="1" max="8" value="3"></label></div>
 <details id="advanced"><summary style="cursor:pointer;font-weight:650;margin:16px 0">Ajuster la composition (facultatif)</summary><div id="composition-controls"></div><label>Répartition des cadres supérieurs (%) <input id="upper-percent" type="number" min="10" max="90" step="5" value="70"></label><label><input id="dado-rail" type="checkbox"> Ajouter une cimaise de séparation</label><label>Hauteur de la cimaise depuis le sol (cm) <input id="rail-height" type="number" min="30" step="5" value="95"></label><label><input id="rail-auto" type="checkbox" checked> Aligner la cimaise sur la séparation</label><label>Largeur du profil de cimaise (mm) <input id="rail-profile" type="number" min="5" step="1" value="20"></label><label>Disposition <select id="layout-mode" style="padding:8px;border-radius:7px"><option value="auto">Adaptée aux obstacles</option><option value="three">3 panneaux symétriques (mur libre)</option></select></label>
 <p class="hint">Aide d’alignement : les panneaux d’une même zone sont répartis à largeur égale et à intervalles réguliers.</p><label>Cadres par zone libre <input id="zone-cols" type="number" min="1" max="8" step="1" value="1"></label>
 <label>Largeur du panneau central (cm) <input id="center-width" type="number" value="125" min="30" step="5"></label>
 <label>Dégagement autour des obstacles (cm) <input id="clearance" type="number" value="8" min="0" step="1"></label>
 </details><h2 style="margin-top:24px">3. Proposition recommandée</h2><div id="proposal-choices" class="buttons"></div><p id="proposal-explanation" class="hint"></p><p id="result-notice" class="hint" role="status"></p>
 <svg id="result-svg" viewBox="0 0 600 380" role="img" aria-label="Résultat : mur, ouvertures et panneaux calculés"></svg>
 <h3>Dimensions et quantités du résultat</h3><div class="stats"><div class="stat">Panneaux<strong id="result-count">—</strong></div><div class="stat">Baguettes théoriques<strong id="result-meters">—</strong></div><div class="stat">Barres estimées<strong id="result-bars">—</strong></div><div class="stat">Conflits<strong id="result-conflicts">—</strong></div><div class="stat">Cimaise<strong id="result-rail-meters">—</strong></div></div>
 <p class="hint">Estimations des seuls cadres affichés. Les plinthes et corniches ne sont pas comprises dans ce métré. La découpe réelle et les dégagements doivent être vérifiés sur place.</p>
 <h3>Liste des coupes des cadres à 45°</h3><table><thead><tr><th>Pièce</th><th>Quantité</th><th>Longueur extérieure</th></tr></thead><tbody id="result-cuts"></tbody></table>`;
 obstaclePanel.after(section);
 section.querySelector('#composition-controls').append(document.querySelector('#composition-fields'));
 section.querySelector('#composition-controls').prepend(section.querySelector('#typology-cols').closest('label'));
 section.querySelector('#composition-controls').append(section.querySelector('#clearance').closest('label'));
 section.querySelector('#composition-controls').append(section.querySelector('#dado-height').closest('label'));
 section.querySelector('#style-essentials').append(section.querySelector('#upper-percent').closest('label'),section.querySelector('#dado-height').closest('label'),section.querySelector('#dado-rail').closest('label'),section.querySelector('#rail-auto').closest('label'),section.querySelector('#rail-height').closest('label'),section.querySelector('#rail-profile').closest('label'));
 section.querySelector('#column-count-label').style.display='none';section.querySelector('#column-mode').addEventListener('change',()=>{section.querySelector('#column-count-label').style.display=section.querySelector('#column-mode').value==='manual'?'flex':'none';calculate()});

 const comp=document.querySelector('#composition-fields');
 comp.querySelectorAll('input').forEach(input=>input.setAttribute('form','settings'));
 comp.querySelector('h3').textContent='Marges, espacements et baguettes';
 comp.querySelectorAll('label').forEach(label=>{const name=label.querySelector('input')?.name;if(['cols','rows','upper'].includes(name))label.style.display='none'});
 section.querySelector('#layout-mode').closest('label').style.display='none';
 section.querySelector('#zone-cols').closest('label').style.display='none';
 section.querySelector('#center-width').closest('label').style.display='none';
 const modeSelect=section.querySelector('#layout-mode');
 modeSelect.innerHTML='<option value="auto">Automatique — obstacles</option><option value="regular">Régulier — grille</option><option value="three">Personnalisé — 3 panneaux symétriques</option>';
 const controls=section.querySelector('#composition-controls');
 controls.insertAdjacentHTML('afterbegin','<div id="regular-controls"><label>Colonnes <input id="regular-cols" type="number" min="1" max="12" value="3"></label><label>Rangées <input id="regular-rows" type="number" min="1" max="5" value="1"></label></div>');
 const syncMode=()=>{const t=section.querySelector('#typology').value,rail=section.querySelector('#dado-rail').checked;section.querySelector('#regular-controls').style.display='none';section.querySelector('#dado-height').closest('label').style.display=t==='base'?'flex':'none';section.querySelector('#upper-percent').closest('label').style.display=t==='mixed'?'flex':'none';section.querySelector('#dado-rail').closest('label').style.display=t==='decorative'?'none':'flex';section.querySelector('#rail-height').closest('label').style.display=t!=='decorative'&&rail&&!section.querySelector('#rail-auto').checked?'flex':'none';section.querySelector('#rail-auto').closest('label').style.display=t!=='decorative'&&rail?'flex':'none';section.querySelector('#rail-profile').closest('label').style.display=t!=='decorative'&&rail?'flex':'none';section.querySelector('#panel-shape').closest('label').style.display=t==='decorative'?'flex':'none'};section.querySelector('#dado-rail').addEventListener('change',syncMode);section.querySelector('#rail-auto').addEventListener('change',syncMode);section.querySelector('#typology').addEventListener('change',syncMode);syncMode();
 const $=id=>document.getElementById(id), num=name=>Number(form.elements[name].value);
 let selectedProposal=null,lastSignature='';
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
   const manual=$('column-mode').value==='manual',desiredCols=Number($('column-count').value);
   const result=window.AtelierComposition.generate({
     bounds:limits,obstacles:obs,type:$('typology').value,shape:$('panel-shape').value,
     cols:manual?desiredCols:3,gapX:gap,gapY:num('gapY'),
     dado:Number($('dado-height').value),upperPercent:Number($('upper-percent').value),clearance,profile
   });
   const signature=JSON.stringify({manual,desiredCols,limits,obs,type:$('typology').value,shape:$('panel-shape').value,cols:$('typology-cols').value,gap,clearance,profile,dado:$('dado-height').value,upperPercent:$('upper-percent').value,gapY:num('gapY'),rail:$('dado-rail').checked,railHeight:$('rail-height').value});
   if(signature!==lastSignature){selectedProposal=null;lastSignature=signature}
   const proposals=manual?(result.candidates||[]).filter(p=>p.columns===desiredCols):(result.candidates||[]);
   if(!proposals.some(p=>p.id===selectedProposal))selectedProposal=proposals[0]?.id||null;
   const chosen=proposals.find(p=>p.id===selectedProposal);
   const panels=chosen?.panels||[],warning=result.warnings;
   const choices=$('proposal-choices');choices.replaceChildren();
   proposals.slice(0,6).forEach((p,i)=>{
     const button=document.createElement('button');button.type='button';
     button.textContent=(i===0?'Recommandée · ':'')+p.columns+' colonne'+(p.columns>1?'s':'')+' · '+p.panels.length+' cadres';
     button.className=p.id===selectedProposal?'':'secondary';
     button.onclick=()=>{selectedProposal=p.id;calculate()};
     choices.append(button);
   });
   $('proposal-explanation').textContent=chosen?(chosen.explanations.join(' ')+' · Évaluation indicative : '+chosen.score+'/100.'):'';

   const invalidObs=obs.filter(o=>![o.x,o.y,o.width,o.height].every(v=>Number.isFinite(Number(v)))||Number(o.x)<0||Number(o.y)<0||Number(o.x)+Number(o.width)>w||Number(o.y)+Number(o.height)>h||Number(o.width)<=0||Number(o.height)<=0);
   const collisions=panels.filter(p=>blocked.some(o=>overlap(p,o)));
   panels.forEach((p,i)=>add(svg,'rect',{x:ox+p.x*s,y:sy(p.y+p.h),width:p.w*s,height:p.h*s,fill:'none',stroke:collisions.includes(p)?'#c02929':'#9a7d5c','stroke-width':Math.max(1.5,profile*s)}));
   obs.forEach((o,i)=>{const x=Number(o.x),y=Number(o.y),ww=Number(o.width),hh=Number(o.height);if(![x,y,ww,hh].every(Number.isFinite))return;
     add(svg,'rect',{'data-obstacle':i,style:'touch-action:none;cursor:grab',x:ox+x*s,y:sy(y+hh),width:ww*s,height:hh*s,fill:o.type==='window'?'#a8cfdd':o.type==='door'?'#ddd1bf':'#c3b8aa','fill-opacity':'.9',stroke:'#52635d','stroke-width':1.5});
     add(svg,'text',{'pointer-events':'none',x:ox+(x+ww/2)*s,y:sy(y+hh/2),'text-anchor':'middle','dominant-baseline':'middle','font-size':11,fill:'#273c39'},(types[o.type]||'Obstacle')+' '+(i+1));
   });
   // Rail is a separate physical profile, interrupted by doors and radiators.
   const railEnabled=$('dado-rail').checked&&$('typology').value!=='decorative';
   const railY=$('rail-auto').checked?($('typology').value==='mixed'?limits.y+limits.h*(1-Number($('upper-percent').value)/100):Number($('dado-height').value)):Number($('rail-height').value),railProfile=Number($('rail-profile').value)/10;
   const railPieces=[];
   if(railEnabled&&Number.isFinite(railY)&&railY>base&&railY<h-cornice&&railProfile>0){
     let intervals=[[0,w]];
     for(const o of obs){
       const x=Number(o.x),y=Number(o.y),ow=Number(o.width),oh=Number(o.height);
       if(y<=railY+railProfile/2&&y+oh>=railY-railProfile/2){
         intervals=intervals.flatMap(([a,b])=>[[a,Math.min(b,x-clearance)],[Math.max(a,x+ow+clearance),b]].filter(([l,r])=>r-l>0.01));
       }
     }
     for(const [a,b] of intervals){railPieces.push((b-a)/100);add(svg,'line',{x1:ox+a*s,x2:ox+b*s,y1:sy(railY),y2:sy(railY),stroke:'#836f59','stroke-width':Math.max(2,railProfile*s)})}
   }
   const railTotal=railPieces.reduce((a,b)=>a+b,0);
   $('result-rail-meters').textContent=railEnabled?fmt(railTotal)+' m':'Non incluse';
   const total=panels.reduce((sum,p)=>sum+2*(p.w+p.h),0)/100,conflicts=collisions.length+invalidObs.length;
   $('result-count').textContent=String(panels.length);$('result-meters').textContent=fmt(total)+' m';$('result-bars').textContent=String(Math.ceil(total*(1+loss/100)*100/bar));$('result-conflicts').textContent=String(conflicts);
   const pieces=new Map();for(const p of panels)for(const len of [p.w,p.w,p.h,p.h]){const k=len.toFixed(1);pieces.set(k,(pieces.get(k)||0)+1)}
   $('result-cuts').innerHTML=([...pieces].sort((a,b)=>Number(b[0])-Number(a[0])).map(([length,count])=>'<tr><td>Cadre</td><td>'+count+'</td><td>'+fmt(Number(length))+' cm</td></tr>').join('')+railPieces.map(len=>'<tr><td>Cimaise (coupe droite)</td><td>1</td><td>'+fmt(len*100)+' cm</td></tr>').join(''))||'<tr><td colspan="3">Aucun cadre réalisable</td></tr>';
   $('result-notice').textContent=[...warning,...(manual&&!proposals.length?['Aucune composition à '+desiredCols+' colonnes : essayez le mode automatique.']:[]),...(conflicts?[conflicts+' conflit(s) à corriger.']:[]),...(!panels.length?['Aucun panneau possible avec ces dimensions.']:[]),'Proposition décorative indicative : vérifier les dimensions et ajuster avant achat.'].join(' ');
   $('result-notice').className=conflicts||!panels.length?'warn':'hint';
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
