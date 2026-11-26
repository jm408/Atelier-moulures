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
 <p id="obstacle-drag-hint" role="note" style="display:block!important;background:#e5eeeb;color:#244447;padding:14px 16px;border-left:4px solid #244447;border-radius:6px;line-height:1.5;margin:14px 0"><strong>Déplacer les ouvertures et obstacles :</strong> cliquez ou touchez une porte, une fenêtre ou un radiateur sur le dessin, puis faites glisser l’élément pour ajuster sa position. Les coordonnées peuvent aussi être saisies précisément ci-dessus.</p>
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
 let selectedProposal=null,lastSignature='',editedPanels=null,selectedPanelIndex=null,lastRenderedPanels=[];
 const panelDrafts=new Map();let personalized=false;let railDraft=null,lastRails=[],railSelection=null,railContext='';
 const effectiveDado=()=>{const d=Number($('dado-height').value);if($('typology').value!=='base'||!$('dado-rail').checked)return d;const rail=$('rail-auto').checked?d:Number($('rail-height').value);return Math.min(d,rail-Math.max(2,num('gapY'))-Number($('rail-profile').value)/20-num('profile')/20);};
 // Export/import bridge: preserve the exact edited panel geometry, not a regeneration.
 window.AtelierProjectPanels={
   export(){return {personalized,selectedProposal,panels:lastRenderedPanels.map(p=>({...p})),rails:railDraft?railDraft.map(p=>({...p})):null};},
   restore(snapshot){
     personalized=false;panelDrafts.clear();railDraft=null;railSelection=null;editedPanels=null;selectedProposal=null;selectedPanelIndex=null;
     calculate();
     if(snapshot?.selectedProposal){selectedProposal=snapshot.selectedProposal;calculate();}
     if(snapshot?.personalized!==false&&Array.isArray(snapshot?.panels)){
       const clean=snapshot.panels.map(p=>({x:Number(p.x),y:Number(p.y),w:Number(p.w),h:Number(p.h),kind:String(p.kind||'personnalisé')}));
       if(clean.length>200||clean.some(p=>![p.x,p.y,p.w,p.h].every(Number.isFinite)||p.w<=0||p.h<=0))throw Error('Cadres personnalisés invalides');
       panelDrafts.set(lastSignature+'|'+selectedProposal,clean);
     }
     personalized=snapshot?.personalized??!!snapshot?.panels;if(Array.isArray(snapshot?.rails))railDraft=snapshot.rails.map(p=>({x:Number(p.x),y:Number(p.y),w:Number(p.w),h:Number(p.h)}));selectedPanelIndex=null;calculate();
   }
 };

 const types={door:'Porte',window:'Fenêtre',radiator:'Radiateur'};
 const svgNS='http://www.w3.org/2000/svg';
 const add=(parent,tag,attrs,txt)=>{const e=document.createElementNS(svgNS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(txt!==undefined)e.textContent=txt;parent.append(e);return e};
 const fmt=n=>Number(n.toFixed(1)).toLocaleString('fr-FR');
 const overlap=(a,b)=>a.x<b.x+b.w-0.001&&a.x+a.w>b.x+0.001&&a.y<b.y+b.h-0.001&&a.y+a.h>b.y+0.001;
 const readObs=()=>{try{const d=JSON.parse(localStorage.getItem('atelier-moulures-obstacles-v2')||'{}');return Array.isArray(d.obstacles)?d.obstacles:[]}catch{return []}};
 window.AtelierInputValid=()=>{const fields=[...new Set([...form.elements,...document.querySelector('#typology').closest('.panel').querySelectorAll('input[type=number]')])].filter(e=>e.type==='number'&&!e.disabled&&!e.closest('#panel-tools,#ob-list,#proposal-refine'));return fields.every(e=>(e.name==='bar'&&e.value===''&&!e.validity.badInput)||(e.value!==''&&Number.isFinite(e.valueAsNumber)&&!e.validity.rangeUnderflow&&!e.validity.rangeOverflow&&!e.validity.badInput))&&num('w')>2*num('side')&&num('h')>num('base')+num('cornice')+num('bottom')+num('top');};
 function calculate(){
   const w=num('w'),h=num('h'),base=num('base'),cornice=num('cornice'),side=num('side'),bottom=num('bottom'),top=num('top'),gap=num('gapX'),profile=num('profile')/10,bar=Number(form.elements.bar.value)||240,loss=num('loss');
   const clearance=Math.max(0,Number($('clearance').value)||0),obs=readObs();
   const limits={x:side,y:base+bottom,w:w-2*side,h:h-base-bottom-cornice-top};
   const valid=[w,h,base,cornice,side,bottom,top,gap,profile,bar,loss].every(Number.isFinite)&&w>0&&h>0&&limits.w>0&&limits.h>0&&bar>0&&profile>0;
   const svg=$('result-svg');
   if(!valid||!window.AtelierInputValid()){svg.dataset.invalid='true';$('result-notice').textContent='Saisie incompatible : dernier plan valide conservé.';return;}
   delete svg.dataset.invalid;svg.replaceChildren();
   if(!valid){$('result-notice').textContent='Dimensions incompatibles : vérifiez les marges et le mur.';['result-count','result-meters','result-bars','result-conflicts'].forEach(id=>$(id).textContent='—');$('result-cuts').replaceChildren();return}
   const s=Math.min(540/w,330/h),ox=(600-w*s)/2,oy=24,sy=y=>oy+(h-y)*s;
   svg.setAttribute('viewBox','0 0 600 '+Math.max(380,oy+h*s+24));
   add(svg,'rect',{x:ox,y:oy,width:w*s,height:h*s,fill:'#eee9df',stroke:'#918c82'});
   add(svg,'rect',{x:ox,y:sy(base),width:w*s,height:base*s,fill:'#b4a48d'});
   add(svg,'rect',{x:ox,y:oy,width:w*s,height:cornice*s,fill:'#d8cbbb'});
   const blocked=obs.map(o=>({x:Number(o.x)-clearance,y:Number(o.y)-clearance,w:Number(o.width)+2*clearance,h:Number(o.height)+2*clearance}));
   const manual=$('column-mode').value==='manual',desiredCols=Number($('column-count').value);
   const compositionInput={
     bounds:limits,obstacles:obs,type:$('typology').value,shape:$('panel-shape').value,
     cols:manual?desiredCols:3,gapX:gap,gapY:num('gapY'),
     dado:effectiveDado(),upperPercent:Number($('upper-percent').value),clearance,profile
   };
   const result=window.AtelierComposition.generate(compositionInput);
   const signature=JSON.stringify({manual,desiredCols,limits,obs,type:$('typology').value,shape:$('panel-shape').value,cols:$('typology-cols').value,gap,clearance,profile,dado:$('dado-height').value,upperPercent:$('upper-percent').value,gapY:num('gapY'),rail:$('dado-rail').checked,railHeight:$('rail-height').value,railAuto:$('rail-auto').checked,railProfile:$('rail-profile').value});
   if(signature!==lastSignature){personalized=false;selectedProposal=null;lastSignature=signature;panelDrafts.clear();editedPanels=null;selectedPanelIndex=null}
   const available=result.candidates||[], exact=available.filter(p=>p.columns===desiredCols);
   const fallback=manual&&!exact.length&&available.length>0;
   const proposals=manual?(exact.length?exact:[...available].sort((a,b)=>Math.abs(a.columns-desiredCols)-Math.abs(b.columns-desiredCols)||b.score-a.score)):(available.filter(p=>p.columns>=2).length?available.filter(p=>p.columns>=2):available);
   let manualNotice=document.getElementById('am-manual-notice');
   if(!manualNotice){manualNotice=document.createElement('p');manualNotice.id='am-manual-notice';manualNotice.setAttribute('role','status');manualNotice.style.cssText='color:#92400e;font-size:13px';$('column-count-label').after(manualNotice);}
   manualNotice.hidden=!fallback;
   manualNotice.textContent=fallback?'Nombre demandé non réalisable dans les propositions disponibles : alternative proposée.':'';
   if(!proposals.some(p=>p.id===selectedProposal))selectedProposal=proposals[0]?.id||null;
   const chosen=proposals.find(p=>p.id===selectedProposal);
   const draftKey=signature+'|'+selectedProposal;
   editedPanels=panelDrafts.has(draftKey)?panelDrafts.get(draftKey):null;
   const panels=editedPanels||chosen?.panels||[],warning=result.warnings;lastRenderedPanels=panels.map(p=>({...p}));
   const choices=$('proposal-choices');choices.replaceChildren();
   proposals.slice(0,6).forEach((p,i)=>{
     const button=document.createElement('button');button.type='button';
     // Count panels sharing a horizontal row (max number crossed by a level).
     const levels=[...new Set(p.panels.flatMap(panel=>[Number(panel.y),Number(panel.y)+Number(panel.h)]))].sort((a,b)=>a-b);
     const actualColumns=Math.max(0,...levels.slice(1).map((v,j)=>{
       const mid=(levels[j]+v)/2;
       return p.panels.filter(panel=>Number(panel.y)<mid&&Number(panel.y)+Number(panel.h)>mid).length;
     }));
     button.textContent=(i===0?'Recommandée · ':'')+actualColumns+' colonne'+(actualColumns>1?'s':'')+' · '+p.panels.length+' cadres';
     button.className=p.id===selectedProposal?'':'secondary';
     button.disabled=personalized;button.onclick=()=>{if(personalized)return;selectedProposal=p.id;selectedPanelIndex=null;calculate()};
     choices.append(button);
   });
   $('proposal-explanation').textContent=chosen?((fallback?'Alternative : '+desiredCols+' colonnes demandées, '+chosen.columns+' proposées. ':'')+chosen.explanations.join(' ')+' · Évaluation indicative : '+chosen.score+'/100.'):(manual?'Aucune proposition valide à '+desiredCols+' colonnes. Essayez une autre valeur ou ajustez les contraintes.':'Aucune composition recommandable.');

   let advisory=$('am-typology-advice');
   if(!advisory){advisory=document.createElement('div');advisory.id='am-typology-advice';advisory.setAttribute('role','status');$('proposal-explanation').after(advisory);}
   advisory.replaceChildren();
   const alternative=!personalized&&!manual&&!editedPanels?window.AtelierFallback({...compositionInput,dado:Number($('dado-height').value)},window.AtelierComposition):null;
   advisory.hidden=!alternative;
   if(alternative){
     const name=alternative.type==='base'?'un soubassement':'des cadres décoratifs';
     const p=document.createElement('p');p.className='hint';p.textContent='La disposition des obstacles rend la composition mixte difficile. Nous vous recommandons '+name+'. Vous pouvez aussi conserver et personnaliser la composition mixte.';
     const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent='Adopter '+name;
     button.onclick=()=>{const t=$('typology');t.value=alternative.type;t.dispatchEvent(new Event('change',{bubbles:true}));t.dispatchEvent(new Event('input',{bubbles:true}));calculate();};
     advisory.append(p,button);
   }
   const invalidObs=obs.filter(o=>![o.x,o.y,o.width,o.height].every(v=>Number.isFinite(Number(v)))||Number(o.x)<0||Number(o.y)<0||Number(o.x)+Number(o.width)>w||Number(o.y)+Number(o.height)>h||Number(o.width)<=0||Number(o.height)<=0);
   const collisions=panels.filter(p=>blocked.some(o=>overlap(p,o)));
   panels.forEach((p,i)=>add(svg,'rect',{'data-panel':i,tabindex:0,role:'button','aria-label':'Modifier le cadre '+(i+1),style:'cursor:grab;touch-action:none;transition:stroke-width .12s,fill .12s',x:ox+p.x*s,y:sy(p.y+p.h),width:p.w*s,height:p.h*s,fill:selectedPanelIndex===i?'#c9d9cd':'transparent','fill-opacity':selectedPanelIndex===i?'.45':'1',stroke:collisions.includes(p)?'#c02929':selectedPanelIndex===i?'#244447':'#9a7d5c','stroke-width':Math.max(1.5,profile*s)*(selectedPanelIndex===i?1.7:1)}));
   if(selectedPanelIndex!==null&&panels[selectedPanelIndex]){
     const p=panels[selectedPanelIndex];
     add(svg,'circle',{'data-frame-handle':selectedPanelIndex,role:'button','aria-label':'Redimensionner le cadre '+(selectedPanelIndex+1),cx:ox+(p.x+p.w)*s,cy:sy(p.y+p.h),r:7,fill:'#244447',stroke:'#fff','stroke-width':2,style:'cursor:nwse-resize;touch-action:none'});
   }
   renderPanelEditor(panels,limits,blocked,draftKey);
   const obstacleCounters={},obstacleRefs=obs.map(o=>{const key=({window:'F',door:'P',radiator:'R'})[o.type]||'O';obstacleCounters[key]=(obstacleCounters[key]||0)+1;return key+obstacleCounters[key];});
   obs.forEach((o,i)=>{const x=Number(o.x),y=Number(o.y),ww=Number(o.width),hh=Number(o.height);if(![x,y,ww,hh].every(Number.isFinite))return;
     add(svg,'rect',{'data-obstacle':i,style:'touch-action:none;cursor:grab',x:ox+x*s,y:sy(y+hh),width:ww*s,height:hh*s,fill:o.type==='window'?'#a8cfdd':o.type==='door'?'#ddd1bf':'#c3b8aa','fill-opacity':'.9',stroke:'#52635d','stroke-width':1.5});
     add(svg,'text',{'data-am-dimensions':'','pointer-events':'none',x:ox+(x+ww/2)*s,y:sy(y+hh/2),'text-anchor':'middle','dominant-baseline':'middle','font-size':11,fill:'#273c39'},obstacleRefs[i]);
   });
   // Rail is a separate physical profile, interrupted by doors and radiators.
   const railEnabled=$('dado-rail').checked&&$('typology').value!=='decorative';
   const railY=$('rail-auto').checked?($('typology').value==='mixed'?limits.y+(limits.h-num('gapY'))*(1-Math.max(10,Math.min(90,Number($('upper-percent').value)))/100)+num('gapY')/2:Number($('dado-height').value)):Number($('rail-height').value),railProfile=Number($('rail-profile').value)/10;
   const railPieces=[],railSegments=[];
   const context=JSON.stringify([w,h,base,cornice,obs,clearance,railEnabled,railY,railProfile]);
   if(context!==railContext){railContext=context;railDraft=null;railSelection=null;}
   const autoRails=[];
   if(railEnabled&&Number.isFinite(railY)&&railY>base&&railY<h-cornice&&railProfile>0){
     let intervals=[[0,w]];
     for(const o of obs){
       const x=Number(o.x),y=Number(o.y),ow=Number(o.width),oh=Number(o.height);
       if(y<=railY+railProfile/2&&y+oh>=railY-railProfile/2)intervals=intervals.flatMap(([a,b])=>[[a,Math.min(b,x-clearance)],[Math.max(a,x+ow+clearance),b]].filter(([l,r])=>r-l>0.01));
     }
     for(const [a,b] of intervals)autoRails.push({x:a,y:railY,w:b-a,h:railProfile});
   }
   const rect=p=>({x:p.x,y:p.y-p.h/2,w:p.w,h:p.h});
   const railValid=(list)=>list.every((p,i)=>[p.x,p.y,p.w,p.h].every(Number.isFinite)&&p.w>=1&&p.h>=.5&&p.x>=0&&p.x+p.w<=w+.001&&p.y-p.h/2>=base&&p.y+p.h/2<=h-cornice&&!obs.some(o=>overlap(rect(p),{x:+o.x-clearance,y:+o.y-clearance,w:+o.width+2*clearance,h:+o.height+2*clearance}))&&!panels.some(q=>overlap(rect(p),q))&&!list.slice(i+1).some(q=>overlap(rect(p),rect(q))));
   lastRails=railEnabled?(railDraft||autoRails).map(p=>({...p})):[];
   const railConflict=railDraft&&!railValid(lastRails)?1:0;
   window.AtelierCompositionState={isCustom:()=>personalized,reset:()=>{personalized=false;panelDrafts.clear();railDraft=null;railSelection=null;selectedPanelIndex=null;selectedProposal=null;calculate();}};window.AtelierRailEdit={valid:railValid,get:()=>lastRails.map(p=>({...p})),set:(list)=>{if(!railValid(list))return false;personalized=true;railDraft=list.map(p=>({...p}));calculate();return true;},reset:()=>{railDraft=null;railSelection=null;calculate();},select:i=>{railSelection=i;selectedPanelIndex=null;calculate();}};
   for(const [i,p] of lastRails.entries()){railPieces.push(p.w/100);railSegments.push([p.x,p.x+p.w,p.y,p.h]);add(svg,'line',{x1:ox+p.x*s,x2:ox+(p.x+p.w)*s,y1:sy(p.y),y2:sy(p.y),'data-rail-surface':'','data-rail-index':i,stroke:railConflict?'#c02929':'#836f59','stroke-width':Math.max(2,p.h*s)});if(railSelection===i&&Number(document.querySelector('.wizard-nav .active')?.dataset.step)===2)for(const edge of ['left','right'])add(svg,'circle',{'data-rail-handle':edge,'data-rail-index':i,cx:ox+(p.x+(edge==='right'?p.w:0))*s,cy:sy(p.y),r:5,fill:'#244447',stroke:'#fff'});}
   const dims=add(svg,'g',{'data-am-dimensions':'','pointer-events':'none','text-anchor':'middle',fill:'#292524'});
   const cm=n=>Number(n.toFixed(1)).toLocaleString('fr-FR');
   const label=(parent,x,y,t,size=10)=>add(parent,'text',{x,y,'font-size':size,'dominant-baseline':'middle',stroke:'#faf9f6','stroke-width':3,'stroke-linejoin':'round','paint-order':'stroke'},t);
   const dimension=(x1,y1,x2,y2)=>{add(dims,'line',{x1,y1,x2,y2,stroke:'#57534e','stroke-width':.7});for(const [x,y] of [[x1,y1],[x2,y2]])add(dims,'line',{x1:x-3,y1:y+3,x2:x+3,y2:y-3,stroke:'#57534e','stroke-width':.8});};
   dimension(ox,oy-6,ox+w*s,oy-6);label(dims,ox+w*s/2,oy-15,cm(w)+' cm');
   const vertical=(x,y1,y2,t)=>{dimension(x,y1,x,y2);const y=(y1+y2)/2;const e=label(dims,x-7,y,t,9);e.setAttribute('transform','rotate(-90 '+(x-7)+' '+y+')');};
   vertical(ox-9,oy,sy(0),cm(h)+' cm');
   const details=add(dims,'g',{'data-am-details':''});
   const groups=[{title:'Cadres',rows:[]},{title:'Fenêtres',rows:[]},{title:'Portes',rows:[]},{title:'Radiateurs',rows:[]},{title:'Autres obstacles',rows:[]},{title:'Cimaise',rows:[]}];
   const grouped=new Map();
   panels.forEach((p,i)=>{
     const ref='C'+(i+1),t=cm(p.w)+' × '+cm(p.h);
     label(details,ox+(p.x+p.w/2)*s,sy(p.y+p.h/2),ref,10);
     if(!grouped.has(t))grouped.set(t,[]);grouped.get(t).push(i+1);
   });
   const ranges=ids=>{const out=[];for(let i=0;i<ids.length;i++){const a=ids[i];let b=a;while(i+1<ids.length&&ids[i+1]===b+1)b=ids[++i];out.push(a===b?'C'+a:'C'+a+'–C'+b);}return out.join(', ');};
   for(const [t,ids] of grouped){const refs=ranges(ids);if(refs.length>26){ids.forEach(i=>groups[0].rows.push('C'+i+' : '+t));}else groups[0].rows.push(refs+' : '+t);}
   obs.forEach((o,i)=>{if([o.x,o.y,o.width,o.height].every(n=>Number.isFinite(Number(n))))groups[({window:1,door:2,radiator:3})[o.type]||4].rows.push(obstacleRefs[i]+' : '+cm(Number(o.width))+' × '+cm(Number(o.height)));});
   if(railEnabled&&railPieces.length){
     if(lastRails.every(p=>p.y===lastRails[0].y))vertical(ox+w*s+10,sy(lastRails[0].y),sy(0),cm(lastRails[0].y)+' cm');
     railSegments.forEach(([a,b,ry,rh],i)=>{const ref='CI'+(i+1);label(details,ox+(a+b)*s/2,sy(ry)-6,ref,8);groups[5].rows.push(ref+' : '+cm(b-a)+' cm · H '+cm(ry)+' cm');});
     groups[5].rows.push('Total : '+cm(railPieces.reduce((a,b)=>a+b,0)*100));
   }
   let y=sy(0)+17;
   const legendText=(x,y,t,bold=false)=>add(details,'text',{x,y,'text-anchor':'start','font-size':bold?10:9,'font-weight':bold?'bold':'normal',fill:'#292524'},t);
   legendText(30,y,'Dimensions en cm — largeur × hauteur',true);y+=14;
   for(const g of groups.filter(g=>g.rows.length)){
     legendText(30,y,g.title,true);y+=13;
     g.rows.forEach((t,i)=>legendText(30+(i%2)*270,y+Math.floor(i/2)*13,t));
     y+=Math.ceil(g.rows.length/2)*13+6;
   }
   svg.setAttribute('viewBox','0 0 600 '+Math.max(380,y+8));
   const legend=document.getElementById('am-dimension-legend');if(legend){legend.replaceChildren();legend.hidden=true;}
   const railTotal=railPieces.reduce((a,b)=>a+b,0);
   $('result-rail-meters').textContent=railEnabled?fmt(railTotal)+' m':'Non incluse';
   const total=panels.reduce((sum,p)=>sum+2*(p.w+p.h),0)/100,conflicts=collisions.length+invalidObs.length+railConflict;
   $('result-count').textContent=String(panels.length);$('result-meters').textContent=fmt(total)+' m';$('result-bars').textContent=String(Math.ceil(total*(1+loss/100)*100/bar));$('result-conflicts').textContent=String(conflicts);
   const pieces=new Map();for(const p of panels)for(const len of [p.w,p.w,p.h,p.h]){const k=len.toFixed(1);pieces.set(k,(pieces.get(k)||0)+1)}
   $('result-cuts').innerHTML=([...pieces].sort((a,b)=>Number(b[0])-Number(a[0])).map(([length,count])=>'<tr><td>Cadre</td><td>'+count+'</td><td>'+fmt(Number(length))+' cm</td></tr>').join('')+railPieces.map(len=>'<tr><td>Cimaise (coupe droite)</td><td>1</td><td>'+fmt(len*100)+' cm</td></tr>').join(''))||'<tr><td colspan="3">Aucun cadre réalisable</td></tr>';
   $('result-notice').textContent=[...warning,...(manual&&!proposals.length?['Aucune composition à '+desiredCols+' colonnes : essayez le mode automatique.']:[]),...(conflicts?[conflicts+' cadre(s) ou obstacle(s) à vérifier : chevauchement, distance de sécurité ou position invalide.']:[]),...(!panels.length?['Aucun panneau possible avec ces dimensions.']:[]),'Proposition décorative indicative : vérifier les dimensions et ajuster avant achat.'].join(' ');
   $('result-notice').className=conflicts||!panels.length?'warn':'hint';
 }
 // Direct frame editing in step 3; changes are kept separately for each proposed layout.
 const panelTools=document.createElement('div');panelTools.id='panel-tools';
 panelTools.innerHTML='<h3>Personnaliser les cadres</h3><p class="hint">Cliquez sur un cadre et faites-le glisser pour le déplacer. Tirez la poignée ronde en haut à droite pour le redimensionner. Les champs permettent un ajustement précis au centimètre.</p><div id="panel-edit-fields"></div><div class="buttons"><button type="button" id="panel-add" class="secondary">+ Ajouter un cadre</button><button type="button" id="panel-reset" class="secondary">Restaurer la proposition</button></div><p id="panel-edit-warning" class="warn" role="status"></p>';
 $('result-svg').after(panelTools);
 function renderPanelEditor(panels,limits,blocked,key){
   const box=$('panel-edit-fields');box.replaceChildren();
   const p=panels[selectedPanelIndex];
   if(!p){box.textContent='Sélectionnez un cadre dans le plan.';return}
   const title=document.createElement('strong');title.textContent='Cadre '+(selectedPanelIndex+1);box.append(title);
   const fields=document.createElement('div');fields.className='panel-edit-grid';
   for(const [field,label] of [['x','Position X'],['y','Position Y (depuis le sol)'],['w','Largeur'],['h','Hauteur']]){
     const row=document.createElement('label');row.textContent=label+' (cm)';
     const input=document.createElement('input');input.type='number';input.step='1';input.title='Flèches : 1 cm ; saisie libre au dixième de cm';input.min=field==='w'||field==='h'?'12':'0';input.value=String(Number(p[field].toFixed(1)));
     input.dataset.panelField=field;row.append(input);fields.append(row);
   }
   box.append(fields);
   const remove=document.createElement('button');remove.type='button';remove.className='secondary';remove.textContent='Supprimer ce cadre';remove.onclick=()=>{
     const next=panels.filter((_,i)=>i!==selectedPanelIndex).map(p=>({...p}));
     personalized=true;panelDrafts.set(key,next);selectedPanelIndex=null;calculate();
   };box.append(remove);
 }
 function validatePanel(next,limits,blocked,gapX,gapY){
   const min=12;
   for(const p of next){
     if(![p.x,p.y,p.w,p.h].every(Number.isFinite)||p.w<min||p.h<min||p.x<limits.x-0.01||p.y<limits.y-0.01||p.x+p.w>limits.x+limits.w+0.01||p.y+p.h>limits.y+limits.h+0.01)return 'Le cadre doit rester dans la zone décorative du mur (minimum 12 cm).';
     if(blocked.some(o=>overlap(p,o)))return 'Le cadre chevauche une ouverture ou sa zone de dégagement.';
   }
   for(let i=0;i<next.length;i++)for(let j=i+1;j<next.length;j++){
     const a=next[i],b=next[j],dy=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y),dx=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x);
     if(overlap(a,b))return 'Deux cadres se chevauchent.';
   }
   return '';
 }
 function currentDraft(){
   const w=num('w'),h=num('h'),base=num('base'),cornice=num('cornice'),side=num('side'),bottom=num('bottom'),top=num('top'),clearance=Number($('clearance').value)||0;
   const limits={x:side,y:base+bottom,w:w-2*side,h:h-base-bottom-cornice-top};
   const blocked=readObs().map(o=>({x:Number(o.x)-clearance,y:Number(o.y)-clearance,w:Number(o.width)+2*clearance,h:Number(o.height)+2*clearance}));
   const chosen=window.AtelierComposition.generate({bounds:limits,obstacles:readObs(),type:$('typology').value,shape:$('panel-shape').value,cols:$('column-mode').value==='manual'?Number($('column-count').value):3,gapX:num('gapX'),gapY:num('gapY'),dado:effectiveDado(),upperPercent:Number($('upper-percent').value),clearance,profile:num('profile')/10}).candidates.find(p=>p.id===selectedProposal);
   const key=lastSignature+'|'+selectedProposal;
   return {panels:(panelDrafts.get(key)||chosen?.panels||[]).map(p=>({...p})),limits,blocked,key};
 }
 $('result-svg').addEventListener('click',e=>{
   const t=e.target.closest('[data-panel]');if(!t)return;
   selectedPanelIndex=Number(t.dataset.panel);calculate();
 });
 $('result-svg').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-panel]')){e.preventDefault();selectedPanelIndex=Number(e.target.dataset.panel);calculate()}});
 panelTools.addEventListener('change',e=>{
   const field=e.target.dataset.panelField;if(!field)return;
   const d=currentDraft();if(!d.panels[selectedPanelIndex])return;
   const previous=d.panels[selectedPanelIndex][field];
   d.panels[selectedPanelIndex][field]=Number(e.target.value);
   const error=validatePanel(d.panels,d.limits,d.blocked,num('gapX'),num('gapY'));
   $('panel-edit-warning').textContent=error;
   if(error){e.target.value=String(Number(previous.toFixed(1)));return;}
   const spacingWarning=d.panels.some((a,i)=>d.panels.some((b,j)=>j>i&&((Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>0&&Math.max(a.x,b.x)-Math.min(a.x+a.w,b.x+b.w)<num('gapX')-0.01)||(Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>0&&Math.max(a.y,b.y)-Math.min(a.y+a.h,b.y+b.h)<num('gapY')-0.01))));
   personalized=true;panelDrafts.set(d.key,d.panels);calculate();
   $('panel-edit-warning').textContent=spacingWarning?'Attention : espacement recommandé entre cadres non respecté. Vous pouvez conserver cette composition.':'';
   const fieldInput=panelTools.querySelector('[data-panel-field="'+field+'"]');
   if(fieldInput){fieldInput.focus({preventScroll:true});}
 });
 $('panel-add').onclick=()=>{
   const d=currentDraft(),min=30,step=5;
   for(let y=d.limits.y;y+min<=d.limits.y+d.limits.h;y+=step){
     for(let x=d.limits.x;x+min<=d.limits.x+d.limits.w;x+=step){
       const next=[...d.panels,{x,y,w:min,h:min,kind:'personnalisé'}];
       if(!validatePanel(next,d.limits,d.blocked,num('gapX'),num('gapY'))){
         personalized=true;panelDrafts.set(d.key,next);selectedPanelIndex=next.length-1;$('panel-edit-warning').textContent='';calculate();return;
       }
     }
   }
   $('panel-edit-warning').textContent='Aucun emplacement libre de 30 × 30 cm. Vous pouvez modifier ou supprimer un cadre existant.';
 };
 $('panel-reset').onclick=()=>{const d=currentDraft();panelDrafts.delete(d.key);selectedPanelIndex=null;$('panel-edit-warning').textContent='';calculate()};
 const editCss=document.createElement('style');editCss.textContent='[data-panel]:hover,[data-panel]:focus-visible{stroke:#244447;stroke-width:5px;fill:#c9d9cd;fill-opacity:.28;outline:none}[data-panel]{pointer-events:all} #panel-tools{margin:18px 0;padding:16px;background:#e8efec;border-radius:10px}#panel-tools h3{margin:0 0 8px}#panel-edit-fields{margin:12px 0}#panel-edit-fields>strong{display:block;margin-bottom:10px}.panel-edit-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 16px}.panel-edit-grid label{display:flex;gap:8px;align-items:center;justify-content:space-between}.panel-edit-grid input{width:95px}#panel-edit-warning:empty{display:none}@media(max-width:550px){.panel-edit-grid{grid-template-columns:1fr}}';document.head.append(editCss);
 // The V2.1-A editor persists obstacles on input. Observe its editor for edits, additions and removal.
 // Pointer drag: move an obstacle visually, then refine exact X/Y in the form.
 let drag=null;
 const resultSvg=$('result-svg');
 resultSvg.addEventListener('pointerdown',e=>{
   const frameHandle=e.target.closest('[data-frame-handle]'),frame=e.target.closest('[data-panel]');
   const phase=Number(document.querySelector('.wizard-nav .active')?.dataset.step??-1);
   if((frameHandle||frame)&&phase!==2)return;

   if(frameHandle||frame){
     const index=Number((frameHandle||frame).getAttribute(frameHandle?'data-frame-handle':'data-panel'));
     selectedPanelIndex=index;
     const d=currentDraft(),p=d.panels[index];if(!p)return;
     const box=resultSvg.getBoundingClientRect(),vb=resultSvg.viewBox.baseVal;
     const scale=Math.min(540/num('w'),330/num('h'));
     const pxPerCm=scale*box.width/vb.width;
     drag={kind:'frame',index,mode:frameHandle?'resize':'move',startX:e.clientX,startY:e.clientY,original:{...p},pxPerCm,moved:false};
     resultSvg.setPointerCapture(e.pointerId);e.preventDefault();calculate();return;
   }
   const target=e.target.closest('[data-obstacle]');if(!target)return;
   const index=Number(target.getAttribute('data-obstacle')),obs=readObs(),o=obs[index];if(!o)return;
   const box=resultSvg.getBoundingClientRect(),vb=resultSvg.viewBox.baseVal,wallW=num('w'),wallH=num('h');
   const scale=Math.min(540/wallW,330/wallH),pxPerCm=scale*box.width/vb.width;
   drag={index,startX:e.clientX,startY:e.clientY,x:Number(o.x),y:Number(o.y),pxPerCm,door:o.type==='door'};
   resultSvg.setPointerCapture(e.pointerId);e.preventDefault();
 });
 resultSvg.addEventListener('pointermove',e=>{
   if(!drag)return;
   if(drag.kind==='frame'){
     const d=currentDraft(),p=d.panels[drag.index];if(!p)return;
     const dx=(e.clientX-drag.startX)/drag.pxPerCm,dy=-(e.clientY-drag.startY)/drag.pxPerCm;
     if(Math.abs(dx)>0.2||Math.abs(dy)>0.2)drag.moved=true;
     const round=v=>Math.round(v*10)/10;
     if(drag.mode==='move'){
       p.x=round(drag.original.x+dx);p.y=round(drag.original.y+dy);
     }else{
       p.w=round(drag.original.w+dx);p.h=round(drag.original.h+dy);
     }
     const target={...p},current=lastRenderedPanels[drag.index];if(!current)return;
     const valid=()=>!validatePanel(d.panels,d.limits,d.blocked,num('gapX'),num('gapY'))&&!lastRails.some(r=>overlap(p,{x:r.x,y:r.y-r.h/2,w:r.w,h:r.h}));
     const distance=Math.max(...['x','y','w','h'].map(k=>Math.abs(target[k]-current[k]))),steps=Math.max(1,Math.ceil(distance/.25));let accepted={...current};
     for(let i=1;i<=steps;i++){for(const k of ['x','y','w','h'])p[k]=current[k]+(target[k]-current[k])*i/steps;if(!valid())break;accepted={...p};}
     Object.assign(p,accepted);if(['x','y','w','h'].every(k=>p[k]===current[k]))return;
     personalized=true;panelDrafts.set(d.key,d.panels);calculate();
     $('panel-edit-warning').textContent='';e.preventDefault();return;
   }
   const obs=readObs(),o=obs[drag.index];if(!o)return;
   const x=drag.x+(e.clientX-drag.startX)/drag.pxPerCm,y=drag.door?0:drag.y-(e.clientY-drag.startY)/drag.pxPerCm;
   o.x=Math.round(Math.max(0,Math.min(num('w')-Number(o.width),x))*10)/10;
   o.y=Math.round(Math.max(0,Math.min(num('h')-Number(o.height),y))*10)/10;
   window.dispatchEvent(new CustomEvent('atelier:obstacle-edit',{detail:{index:drag.index,field:'x',value:o.x}}));
   window.dispatchEvent(new CustomEvent('atelier:obstacle-edit',{detail:{index:drag.index,field:'y',value:o.y}}));
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
 window.AtelierClearSelection=()=>{selectedPanelIndex=null;railSelection=null;calculate();};
 calculate();
})();
