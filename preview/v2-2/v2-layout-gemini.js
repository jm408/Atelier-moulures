// V2.2 layout shell. All existing DOM nodes, event listeners and SVG engine remain intact.
(()=>{
 const main=document.querySelector('main'),nav=document.querySelector('.wizard-nav');
 const wall=document.querySelector('#settings')?.closest('.panel'),obstacles=document.querySelector('#ob-add')?.closest('.panel'),style=document.querySelector('#typology')?.closest('.panel'),proposals=document.querySelector('#wizard-result'),plan=document.querySelector('#wizard-summary');
 if(!main||!nav||!wall||!obstacles||!style||!proposals||!plan)return;
 document.body.classList.add('atelier-v22');
 const shell=document.createElement('div');shell.className='atelier-shell';
 const stage=document.createElement('section');stage.className='atelier-stage';stage.setAttribute('aria-label','Visualisation du projet');
 const aside=document.createElement('aside');aside.className='atelier-sidebar';aside.setAttribute('aria-label','Paramètres de l’étape');
 const stageHead=document.createElement('div');stageHead.className='atelier-stage-head';stageHead.innerHTML='<div><span class="atelier-eyebrow">ATELIER · PROJET</span><h2>Votre mur, votre composition</h2><p>Visualisation fidèle à vos dimensions.</p></div><span class="atelier-stage-badge">Aperçu à l’échelle</span>';
 const canvas=document.querySelector('#drawing')?.closest('.panel');
 if(canvas){stage.append(stageHead,canvas);canvas.classList.add('atelier-canvas-card')}
 else stage.append(stageHead);
 main.replaceChildren(shell);shell.append(stage,aside);
 const importCard=document.querySelector('#project-import');if(importCard)aside.append(importCard);aside.append(wall,obstacles,style,proposals,plan);
 const originalShow=()=>{const active=Number(nav.querySelector('[data-step].active')?.dataset.step||0);
  if(importCard)importCard.style.display=active===0?'':'none';
  const source=active>=2?document.querySelector('#result-svg'):document.querySelector('#drawing');
  const title=['Définir mon mur','Choisir mon style','Personnaliser mes cadres','Préparer mon plan'][active];
  stageHead.querySelector('h2').textContent=title;
  stageHead.querySelector('p').textContent=['Dimensions et ouvertures du projet','Explorez vos réglages décoratifs','Déplacez et redimensionnez les cadres','Vérifiez votre composition avant export'][active];
  if(source&&source.id==='result-svg'){
   const host=source.closest('.panel');stage.append(host);host.classList.add('atelier-canvas-card');
   // Keep the plan and editing controls together to preserve all interactions.
  }else if(canvas){stage.append(canvas);canvas.style.display='';}
  if(canvas)canvas.style.display=source?.id==='result-svg'?'none':'';
  // Step 3 panel has been moved to the stage: step 4 still keeps the actual plan visible.
  if(active===3&&proposals){proposals.style.display='';stage.append(proposals);}
  if(active===2&&proposals){proposals.style.display='';stage.append(proposals);}
  if(active<2&&proposals){aside.append(proposals);proposals.style.display='none';}
  if(active===3&&plan){plan.style.display='';aside.append(plan);}
 };
 nav.addEventListener('click',()=>setTimeout(originalShow,0));
 document.querySelector('#wizard-next')?.addEventListener('click',()=>setTimeout(originalShow,0));
 document.querySelector('#wizard-prev')?.addEventListener('click',()=>setTimeout(originalShow,0));
 const css=document.createElement('style');css.textContent=`
 @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600&display=swap');
 body.atelier-v22{background:#f4f1eb;color:#253c39;font-family:'DM Sans',system-ui,sans-serif}
 .atelier-v22 header{background:#203c39;padding:22px max(24px,calc((100vw - 1420px)/2));border-bottom:3px solid #bda477}
 .atelier-v22 header h1,.atelier-v22 h2{font-family:'Playfair Display',Georgia,serif;letter-spacing:-.025em}
 .atelier-v22 header h1{font-size:31px;font-weight:600}
 .atelier-v22 header p{color:#d9d5c9;font-size:13px}
 .atelier-v22 .wizard-nav{max-width:1420px;margin:22px auto 12px;gap:6px;padding:0 24px}
 .atelier-v22 .wizard-nav button{background:transparent;border:1px solid #dcd9d1;color:#50645f;border-radius:6px!important;font-weight:600;padding:13px 8px}
 .atelier-v22 .wizard-nav button.active{background:#203c39;color:#fff;border-color:#203c39;box-shadow:inset 0 -3px #bda477}
 .atelier-v22 main{display:block;max-width:1420px;padding:12px 24px 25px;margin:auto}
 .atelier-shell{display:grid;grid-template-columns:minmax(0,7fr) minmax(300px,3fr);gap:22px;align-items:start}
 .atelier-stage{min-width:0;position:sticky;top:12px;background:#e9e4da;border:1px solid #ded8cc;border-radius:14px;padding:22px;min-height:500px}
 .atelier-stage-head{display:flex;justify-content:space-between;gap:12px;align-items:start;margin-bottom:20px}
 .atelier-stage-head h2{font-size:27px;margin:7px 0}
 .atelier-stage-head p{margin:0;color:#64716b;font-size:13px}
 .atelier-eyebrow{font-size:10px;letter-spacing:.18em;color:#9a8059;font-weight:700}
 .atelier-stage-badge{background:#fffaf1;border:1px solid #ded1b8;border-radius:30px;padding:7px 10px;font-size:11px;white-space:nowrap;color:#79684b}
 .atelier-v22 .atelier-canvas-card{background:#f9f7f2;border:1px solid #e3ded5;box-shadow:0 8px 25px rgba(34,47,43,.06);padding:18px;border-radius:10px}
 .atelier-v22 .atelier-canvas-card>h2:first-child{display:none}
 .atelier-v22 .atelier-canvas-card svg{background:#f3f0e9}
 .atelier-sidebar{min-width:0;display:flex;flex-direction:column;gap:14px}
 .atelier-sidebar>.panel{margin:0;padding:23px;border-radius:10px;box-shadow:0 5px 20px rgba(34,47,43,.04)}
 .atelier-sidebar .panel h2{font-size:22px}
 .atelier-v22 .panel input{max-width:48%}
 .atelier-v22 .wizard-footer{max-width:1420px;padding:0 24px}
 .atelier-v22 #project-import{max-width:none;margin:0}
 @media(max-width:900px){.atelier-shell{grid-template-columns:1fr}.atelier-stage{position:static;min-height:0}.atelier-v22 .wizard-nav button{min-width:44%;font-size:12px}.atelier-v22 main{padding:12px}.atelier-v22 .wizard-nav{padding:0 12px}.atelier-v22 .atelier-stage{padding:12px}.atelier-stage-badge{display:none}}
 `;document.head.append(css);
 originalShow();

 const palette=document.createElement('style');palette.textContent=`
 :root{--bg-app:#FAFAF9;--bg-canvas:#F5F5F4;--bg-panel:#FFFFFF;--border-subtle:#E7E5E4;--wall-default:#D6D3D1;--color-primary:#1B3B2E;--color-primary-hover:#142C22;--color-accent:#C5A059;--color-accent-light:#F6EFE2;--text-main:#1C1917;--text-muted:#57534E;--text-subtle:#A8A29E;--state-warning-text:#D97706;--state-warning-bg:#FEF3C7;--state-error-text:#B91C1C;--state-error-bg:#FEE2E2;--blueprint-bg:#0A192F;--blueprint-stroke:#64FFDA;--blueprint-grid:rgba(100,255,218,.12)}
 body.atelier-v22{background:var(--bg-app)!important;color:var(--text-main)!important}
 .atelier-v22 header{background:var(--bg-app)!important;color:var(--text-main)!important;border-bottom:1px solid var(--border-subtle)!important;padding-top:18px!important;padding-bottom:18px!important}
 .atelier-v22 header h1{color:var(--text-main)!important}
 .atelier-v22 header p{color:var(--text-muted)!important}
 .atelier-v22 .atelier-stage{background:var(--bg-canvas)!important;border-color:var(--border-subtle)!important;box-shadow:none!important}
 .atelier-v22 .atelier-canvas-card,.atelier-v22 .atelier-sidebar>.panel{background:var(--bg-panel)!important;border-color:var(--border-subtle)!important}
 .atelier-v22 .atelier-stage-head h2,.atelier-v22 .atelier-sidebar h2{color:var(--text-main)!important}
 .atelier-v22 .atelier-stage-head p,.atelier-v22 .hint{color:var(--text-muted)}
 .atelier-v22 .atelier-stage-badge{background:var(--color-accent-light);border-color:#e9ddc7;color:#8a6b34}
 .atelier-v22 .wizard-nav{display:flex;justify-content:center;align-items:center;gap:0!important;margin:16px auto 10px!important}
 .atelier-v22 .wizard-nav button{flex:0 1 auto;min-width:0!important;background:transparent!important;border:0!important;border-radius:0!important;color:var(--text-subtle)!important;box-shadow:none!important;display:flex;align-items:center;justify-content:center;gap:9px;padding:12px 14px!important;font-size:13px;white-space:nowrap}
 .atelier-v22 .wizard-nav button::before{content:attr(data-number);width:29px;height:29px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:#E7E5E4;color:#78716C;font-weight:700;font-size:12px;flex-shrink:0}
 .atelier-v22 .wizard-nav button.active{color:var(--text-main)!important;font-weight:700}
 .atelier-v22 .wizard-nav button.active::before{background:var(--color-primary);color:white}
 .atelier-v22 .wizard-nav button.completed{color:var(--text-muted)!important}
 .atelier-v22 .wizard-nav button.completed::before{content:'✓';background:var(--color-accent);color:#fff}
 .atelier-v22 .wizard-nav button:not(:last-child)::after{content:'';width:26px;height:1px;background:#D6D3D1;margin-left:8px}
 .atelier-v22 button:not(.wizard-nav button):not(.secondary){background:var(--color-primary)}
 .atelier-v22 button:not(.wizard-nav button):not(.secondary):hover{background:var(--color-primary-hover)}
 .atelier-v22 input:focus-visible,.atelier-v22 button:focus-visible{outline:2px solid var(--color-accent);outline-offset:2px}
 .atelier-v22 .warn{color:var(--state-warning-text)}
 @media(max-width:720px){.atelier-v22 .wizard-nav{flex-wrap:wrap}.atelier-v22 .wizard-nav button{flex:1 1 46%;font-size:12px;padding:8px!important}.atelier-v22 .wizard-nav button::after{display:none}}
 `;document.head.append(palette);
 const stepButtons=[...nav.querySelectorAll('[data-step]')];
 stepButtons.forEach((b,i)=>{b.dataset.number=String(i+1);b.textContent=['Mon mur','Mon style','Mes propositions','Mon plan'][i]});
 const paintSteps=()=>{const active=Number(nav.querySelector('[data-step].active')?.dataset.step||0);stepButtons.forEach((b,i)=>{b.classList.toggle('completed',i<active);b.setAttribute('aria-label',(i<active?'Étape terminée : ':i===active?'Étape actuelle : ':'Étape à venir : ')+b.textContent)})};
 nav.addEventListener('click',()=>setTimeout(paintSteps,0));
 document.querySelector('#wizard-next')?.addEventListener('click',()=>setTimeout(paintSteps,0));
 document.querySelector('#wizard-prev')?.addEventListener('click',()=>setTimeout(paintSteps,0));
 paintSteps();
})();