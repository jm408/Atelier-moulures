// Four-step guided workflow; existing calculation and obstacle editing stay intact.
(()=>{
 const main=document.querySelector('main'),wall=document.querySelector('#settings').closest('.panel'),
 obstacles=document.querySelector('#ob-add').closest('.panel'),
 composition=document.querySelector('#typology').closest('.panel');
 const result=document.createElement('section');result.className='panel';result.id='wizard-result';
 const summary=document.createElement('section');summary.className='panel';summary.id='wizard-summary';
 // Move the existing output nodes instead of duplicating calculation/visualization.
 const heading=[...composition.querySelectorAll('h2')].find(h=>h.textContent.includes('Proposition recommandée'));
 if(!heading)return;
 const outputNodes=[];let node=heading;
 while(node){const next=node.nextSibling;outputNodes.push(node);node=next}
 for(const n of outputNodes)result.append(n);
 const metrics=[...result.children].find(e=>e.tagName==='H3'&&e.textContent.includes('Dimensions'));
 if(metrics){let n=metrics;while(n){const next=n.nextSibling;summary.append(n);n=next}}
 main.append(result,summary);
 // Single visible column input: legacy advanced input is only an internal compatibility field.
 const duplicate=document.querySelector('#typology-cols')?.closest('label');if(duplicate)duplicate.remove();
 const advanced=document.querySelector('#advanced');
 const dialog=document.createElement('dialog');dialog.id='composition-dialog';
 dialog.innerHTML='<div class="dialog-head"><h2>Réglages de la composition</h2><button type="button" id="dialog-close" class="secondary">Fermer ✕</button></div><p class="hint">Vérifiez notamment la longueur réelle des baguettes avant de préparer vos achats.</p><div id="dialog-controls"></div><div class="dialog-actions"><button type="button" id="dialog-done">Appliquer et fermer</button></div>';
 document.body.append(dialog);
 const controls=document.querySelector('#composition-controls');
 dialog.querySelector('#dialog-controls').append(controls);
 advanced.remove();
 const launch=document.createElement('button');launch.type='button';launch.className='secondary';launch.id='open-composition';launch.textContent='⚙ Réglages et fournitures';
 composition.append(launch);
 const launchResult=launch.cloneNode(true);launchResult.id='open-composition-result';result.prepend(launchResult);
 function openDialog(){dialog.showModal()}
 function closeDialog(){dialog.close()}
 launch.addEventListener('click',openDialog);launchResult.addEventListener('click',openDialog);
 dialog.querySelector('#dialog-close').addEventListener('click',closeDialog);
 dialog.querySelector('#dialog-done').addEventListener('click',closeDialog);
 dialog.addEventListener('click',e=>{if(e.target===dialog)closeDialog()});
 const bar=document.querySelector('[name="bar"]');
 const barRow=bar?.closest('label');
 if(barRow){barRow.insertAdjacentHTML('afterend','<label class="bar-confirm"><input type="checkbox" id="bar-confirm"> J’ai vérifié la longueur réelle de mes baguettes</label>')}
 const confirmation=document.createElement('p');confirmation.id='bar-confirm-notice';confirmation.className='warn';
 summary.prepend(confirmation);
 const confirm=document.querySelector('#bar-confirm');
 const updateBarStatus=()=>{const confirmed=confirm?.checked&&Number(bar.value)>0;confirmation.textContent=confirmed?'Longueur des baguettes confirmée : estimation indicative à vérifier avec le plan de coupe.':'⚠ Longueur des baguettes non confirmée : quantité de barres indicative, ne pas utiliser pour l’achat.';};
 bar?.addEventListener('input',()=>{confirm.checked=false;updateBarStatus()});
 confirm?.addEventListener('change',updateBarStatus);updateBarStatus();

 const refine=document.createElement('div');refine.id='proposal-refine';refine.innerHTML=`
 <div class="refine-header"><strong>Ajuster mon plan</strong><span class="hint">Les changements recalculent la composition.</span></div>
 <label>Nombre de colonnes <input id="proposal-cols" type="number" min="1" max="8" step="1" value="3"></label>
 <label><input id="proposal-auto" type="checkbox" checked> Recommandation automatique</label>
 <div id="proposal-obstacle-fields"></div>
 `;
 result.insertBefore(refine,result.querySelector('#proposal-choices'));
 const auto=refine.querySelector('#proposal-auto'),count=refine.querySelector('#proposal-cols');
 const mode=document.querySelector('#column-mode'),manualCount=document.querySelector('#column-count');
 const syncColumn=()=>{mode.value=auto.checked?'auto':'manual';manualCount.value=count.value;mode.dispatchEvent(new Event('change',{bubbles:true}));};
 auto.addEventListener('change',syncColumn);count.addEventListener('input',()=>{auto.checked=false;syncColumn()});
 function obstacleEditor(){
  let obstacles=[];try{obstacles=JSON.parse(localStorage.getItem('atelier-moulures-obstacles-v2')||'{}').obstacles||[]}catch{}
  refine.querySelector('#proposal-obstacle-fields').innerHTML=obstacles.map((o,i)=>`<fieldset style="border:1px solid #ddd8cd;border-radius:8px;margin:10px 0"><legend>${({door:'Porte',window:'Fenêtre',radiator:'Radiateur'})[o.type]||'Obstacle'} ${i+1}</legend><div class="refine-grid">${[['x','X (cm)'],['y','Y (cm)'],['width','Largeur (cm)'],['height','Hauteur (cm)']].map(([field,label])=>`<label>${label}<input type="number" step=".1" min="0" data-refine-index="${i}" data-refine-field="${field}" value="${Number(o[field])}"></label>`).join('')}</div></fieldset>`).join('');
 }
 refine.addEventListener('input',e=>{const t=e.target;if(!t.matches('[data-refine-field]'))return;window.dispatchEvent(new CustomEvent('atelier:obstacle-edit',{detail:{index:Number(t.dataset.refineIndex),field:t.dataset.refineField,value:Number(t.value)}}));document.querySelector('#typology').dispatchEvent(new Event('input',{bubbles:true}));});
 // Obstacle changes in step 1 and dragging on step 3 stay synchronized.
 const observer=new MutationObserver(()=>{if(step===2&&document.activeElement?.dataset.refineField===undefined)obstacleEditor()});
 observer.observe(document.querySelector('#ob-list'),{childList:true,subtree:false});

 const nav=document.createElement('nav');nav.className='wizard-nav';nav.setAttribute('aria-label','Étapes du projet');
 nav.innerHTML='<button type="button" data-step="0">1 · Mon mur</button><button type="button" data-step="1">2 · Mon style</button><button type="button" data-step="2">3 · Mes propositions</button><button type="button" data-step="3">4 · Mon plan</button>';
 main.before(nav);
 const foot=document.createElement('div');foot.className='wizard-footer';
 foot.innerHTML='<button type="button" class="secondary" id="wizard-prev">← Précédent</button><span id="wizard-progress" aria-live="polite"></span><button type="button" id="wizard-next">Suivant →</button>';
 main.after(foot);
 const css=document.createElement('style');css.textContent=`
 .wizard-nav,.wizard-footer{max-width:850px;margin:16px auto;display:flex;gap:8px;flex-wrap:wrap;padding:0 18px}
 .wizard-nav button{flex:1;min-width:130px;background:#e5e9e4;color:#244447;text-align:center}
 .wizard-nav button.active{background:#244447;color:white}
 .wizard-footer{justify-content:space-between;align-items:center;margin-bottom:40px}
 #style-essentials{padding:12px 16px;background:#f5f3ee;border-radius:10px;margin:14px 0}
 #style-essentials input[type=checkbox]{width:auto}
 #proposal-choices button{flex:1;min-width:125px}
 #proposal-refine{padding:14px;background:#f5f3ee;border-radius:10px;margin:14px 0}
 .refine-header{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
 .refine-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 16px}
 .refine-grid input{width:90px}
 #proposal-refine input[type=checkbox]{width:auto}
 #wizard-result svg{margin-top:12px}
 #composition-dialog{width:min(720px,94vw);max-height:88vh;border:0;border-radius:14px;padding:24px;box-shadow:0 16px 60px #0005;overflow:auto}
 #composition-dialog::backdrop{background:#1c292bb8}
 .dialog-head,.dialog-actions{display:flex;align-items:center;justify-content:space-between;gap:12px}
 .dialog-head h2{margin:0}.dialog-actions{margin-top:20px}
 #open-composition,#open-composition-result{margin:14px 0}
 .bar-confirm{background:#fff3dc;padding:12px;border-radius:8px}
 .bar-confirm input{width:auto}
 #bar-confirm-notice{padding:12px;background:#fff3dc;border-radius:8px}
 @media(max-width:600px){.wizard-nav button{min-width:42%;font-size:13px}.wizard-footer{position:sticky;bottom:0;background:#f4f0e9;padding:12px 18px;z-index:5}}
 `;document.head.append(css);
 const steps=[[wall,obstacles],[composition],[result],[summary]];
 let step=0;
 function show(n){
  step=Math.max(0,Math.min(3,n));if(step===2)obstacleEditor();
  steps.forEach((group,i)=>group.forEach(p=>p.style.display=i===step?'':'none'));
  nav.querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('active',i===step);b.setAttribute('aria-current',i===step?'step':'false')});
  document.querySelector('#wizard-prev').disabled=step===0;
  document.querySelector('#wizard-next').textContent=step===3?'Retour aux propositions':'Suivant →';
  document.querySelector('#wizard-progress').textContent='Étape '+(step+1)+' sur 4';
  window.scrollTo({top:0,behavior:'instant'});
 }
 nav.addEventListener('click',e=>{const b=e.target.closest('[data-step]');if(b)show(Number(b.dataset.step))});
 document.querySelector('#wizard-prev').addEventListener('click',()=>show(step-1));
 document.querySelector('#wizard-next').addEventListener('click',()=>show(step===3?2:step+1));
 // Explicitly reveal key style controls, leaving technical dimensions optional.
 const rail=document.querySelector('#dado-rail');if(rail)rail.checked=true;
 const t=document.querySelector('#typology');
 t?.dispatchEvent(new Event('change',{bubbles:true}));
 show(0);
})();