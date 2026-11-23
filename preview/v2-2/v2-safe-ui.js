// V2.2 safe design layer: no DOM relocation, no geometry mutation.
(()=>{
 document.body.classList.add('atelier-v22-safe');
 const nav=document.querySelector('.wizard-nav');
 if(!nav)return;
 const buttons=[...nav.querySelectorAll('[data-step]')];
 buttons.forEach((b,i)=>{b.textContent=['Mon mur','Mon style','Mes propositions','Mon plan'][i];b.dataset.number=String(i+1)});
 const update=()=>{const active=Number(nav.querySelector('button.active')?.dataset.step||0);buttons.forEach((b,i)=>b.classList.toggle('completed',i<active))};
 nav.addEventListener('click',()=>setTimeout(update,0));
 document.querySelector('#wizard-next')?.addEventListener('click',()=>setTimeout(update,0));
 document.querySelector('#wizard-prev')?.addEventListener('click',()=>setTimeout(update,0));
 const style=document.createElement('style');style.textContent=`
 @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@500;600&display=swap');
 body.atelier-v22-safe{background:#FAFAF9!important;color:#1C1917!important;font-family:'DM Sans',system-ui,sans-serif}
 body.atelier-v22-safe>header{background:#FAFAF9!important;color:#1C1917!important;border-bottom:1px solid #E7E5E4!important;padding:20px max(18px,calc((100vw - 1100px)/2))}
 body.atelier-v22-safe>header h1{color:#1C1917!important;font-family:'Playfair Display',Georgia,serif;font-size:29px}
 body.atelier-v22-safe>header p{color:#57534E!important}
 body.atelier-v22-safe main{max-width:1100px!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:14px!important}
 body.atelier-v22-safe .panel{background:#fff!important;border-color:#E7E5E4!important;box-shadow:0 5px 18px rgba(28,25,23,.035)}
 body.atelier-v22-safe h2{font-family:'Playfair Display',Georgia,serif;color:#1C1917!important}
 body.atelier-v22-safe .wizard-nav{max-width:1100px;justify-content:center;gap:0!important}
 body.atelier-v22-safe .wizard-nav button{background:transparent!important;border:0!important;color:#A8A29E!important;box-shadow:none!important;display:inline-flex;align-items:center;justify-content:center;gap:9px;min-width:0!important;padding:10px!important;flex:0 1 auto}
 body.atelier-v22-safe .wizard-nav button::before{content:attr(data-number);display:inline-flex;align-items:center;justify-content:center;width:29px;height:29px;border-radius:50%;background:#E7E5E4;color:#78716C;font-size:12px;font-weight:700}
 body.atelier-v22-safe .wizard-nav button.active{color:#1C1917!important;font-weight:700}
 body.atelier-v22-safe .wizard-nav button.active::before{background:#1B3B2E;color:#fff}
 body.atelier-v22-safe .wizard-nav button.completed::before{content:'✓';background:#C5A059;color:#fff}
 body.atelier-v22-safe .wizard-nav button:not(:last-child)::after{content:'—';color:#D6D3D1;margin-left:9px}
 body.atelier-v22-safe button:not(.wizard-nav button):not(.secondary){background:#1B3B2E}
 body.atelier-v22-safe .wizard-footer{max-width:1100px}
 body.atelier-v22-safe #wizard-result svg{max-width:100%}
 @media(max-width:760px){body.atelier-v22-safe .wizard-nav{flex-wrap:wrap}body.atelier-v22-safe .wizard-nav button{flex:1 1 44%;font-size:12px}body.atelier-v22-safe .wizard-nav button::after{display:none}}
 `;document.head.append(style);update();
})();