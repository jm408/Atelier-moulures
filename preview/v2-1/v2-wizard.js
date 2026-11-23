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
 #wizard-result svg{margin-top:12px}
 @media(max-width:600px){.wizard-nav button{min-width:42%;font-size:13px}.wizard-footer{position:sticky;bottom:0;background:#f4f0e9;padding:12px 18px;z-index:5}}
 `;document.head.append(css);
 const steps=[[wall,obstacles],[composition],[result],[summary]];
 let step=0;
 function show(n){
  step=Math.max(0,Math.min(3,n));
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