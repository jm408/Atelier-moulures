// V2.3 presentation adapter. Keeps all original engine and wizard scripts intact.
(()=>{
const main=document.querySelector('main'),svg=document.querySelector('#result-svg');if(!main||!svg)return;
const stage=document.createElement('section');stage.className='am-stage';stage.setAttribute('aria-label','Aperçu du projet');
stage.innerHTML='<div><span class="am-eyebrow">ATELIER · PROJET</span><h2>Votre composition</h2><p>Visualisation à l’échelle — ajustez votre projet depuis le panneau de droite.</p></div><div class="am-canvas"></div>';
main.prepend(stage);
const canvas=stage.querySelector('.am-canvas');
// Move the original interactive SVG, never clone it: original listeners and IDs remain.
canvas.append(svg);
const nav=document.querySelector('.wizard-nav'),steps=[...nav?.querySelectorAll('[data-step]')||[]];
steps.forEach((b,i)=>b.textContent=['01 · Mon mur','02 · Mon style','03 · Mes propositions','04 · Mon plan'][i]);
const sync=()=>{const n=Number(nav?.querySelector('.active')?.dataset.step||0);stage.querySelector('h2').textContent=['Définir mon mur','Choisir mon style','Mes propositions','Mon plan'][n]};
nav?.addEventListener('click',()=>setTimeout(sync,0));document.querySelector('#wizard-next')?.addEventListener('click',()=>setTimeout(sync,0));document.querySelector('#wizard-prev')?.addEventListener('click',()=>setTimeout(sync,0));sync();
})();