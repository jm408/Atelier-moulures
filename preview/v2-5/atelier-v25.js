(()=>{
const select=document.getElementById('typology');if(!select)return;
const label=select.closest('label');if(!label)return;
const group=document.createElement('fieldset');group.className='am-typologies';group.innerHTML='<legend>Typologie</legend><p>Choisissez la disposition de vos moulures.</p><div class="am-type-grid"></div><p class="am-type-description" aria-live="polite"></p>';
const options=[['base','Soubassement','Des cadres uniquement sur la partie basse du mur.'],['mixed','Composition mixte','Des cadres en partie haute et en partie basse du mur.'],['decorative','Cadres décoratifs','Des cadres sur toute la hauteur disponible du mur.']];
const grid=group.querySelector('.am-type-grid');
for(const [value,name] of options){
 const b=document.createElement('label');b.className='am-type-card';
 let shapes='<rect x="5" y="5" width="110" height="90" fill="#e9e5de" stroke="#a8a29e"/><path d="M5 9H115 M5 91H115" stroke="#9c9384" stroke-width="3"/>';
 for(const x of [12,46,80]){
 if(value!=='decorative')shapes+='<rect x="'+x+'" y="65" width="28" height="20" fill="none" stroke="#9c9384" stroke-width="1.8"/>';
 if(value!=='base')shapes+='<rect x="'+x+'" y="16" width="28" height="'+(value==='mixed'?40:69)+'" fill="none" stroke="#9c9384" stroke-width="1.8"/>';
 }
 if(value!=='decorative')shapes+='<path d="M5 60H115" stroke="#9c9384" stroke-width="2.5"/>';
 b.innerHTML='<input type="radio" name="am-typology-choice" value="'+value+'"><svg viewBox="0 0 120 100" aria-hidden="true">'+shapes+'</svg><span>'+name+'</span>';
 b.querySelector('input').addEventListener('change',()=>{select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}));select.dispatchEvent(new Event('input',{bubbles:true}));sync()});grid.append(b);
}
function sync(){for(const b of grid.querySelectorAll('label')){const input=b.querySelector('input');input.checked=input.value===select.value;b.classList.toggle('selected',input.checked)}group.querySelector('.am-type-description').textContent=options.find(o=>o[0]===select.value)?.[2]||'';}
label.hidden=true;label.style.display='none';label.after(group);select.addEventListener('change',sync);select.addEventListener('input',sync);document.querySelector('#settings').addEventListener('input',sync);document.querySelector('#reset').addEventListener('click',()=>queueMicrotask(sync));sync();
const css=document.createElement('style');css.textContent=`
.am-typologies{border:0;padding:0;margin:12px 0 20px;min-width:0}.am-typologies legend{font-weight:600;font-size:14px}.am-typologies p{font-size:12px;color:#57534E;margin:6px 0 10px}.am-type-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.am-type-grid .am-type-card{position:relative;display:flex;flex-direction:column;justify-content:flex-start;align-items:center;gap:6px;margin:0;padding:7px 4px;border:1px solid #D6D3D1;border-radius:9px;cursor:pointer;text-align:center;background:#fff;min-width:0}.am-type-card.selected{border-color:#1B3B2E;box-shadow:inset 0 0 0 1px #1B3B2E;background:#edf2ef}.am-type-card svg{width:100%;height:auto;display:block}.am-type-card span{font-size:11px;line-height:1.25;overflow-wrap:anywhere;font-weight:600}.am-type-card input{position:absolute;opacity:0;width:1px;height:1px}.am-type-card:focus-within{outline:2px solid #C5A059;outline-offset:2px}.am-type-card:after{content:'';width:12px;height:12px;border:1px solid #a8a29e;border-radius:50%;margin-top:auto}.am-type-card.selected:after{background:#1B3B2E;border-color:#1B3B2E;box-shadow:inset 0 0 0 2px #edf2ef}
`;document.head.append(css);
})();