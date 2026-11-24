(()=>{
const style=document.querySelector('#typology').closest('.panel'),form=document.querySelector('#settings');
const fields=[...style.querySelectorAll('input,select')].filter(e=>e.name!=='am-typology-choice');
const resetField=e=>{if(e.type==='checkbox')e.checked=e.defaultChecked;else if(e.tagName==='SELECT')e.selectedIndex=Math.max(0,[...e.options].findIndex(o=>o.defaultSelected));else e.value=e.defaultValue;};
function button(parent,text,fn){const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent=text;b.style.marginTop='12px';b.addEventListener('click',fn);parent.append(b);return b;}
button(style,'Réinitialiser mon style',()=>{fields.forEach(resetField);for(const e of fields)e.dispatchEvent(new Event('change',{bubbles:true}));form.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#panel-reset')?.click();});
const controls=document.querySelector('#atelier-preview-controls');
button(controls.querySelector('.preview-colors'),'Réinitialiser les couleurs',()=>{for(const id of ['atelier-wall-color','atelier-molding-color','atelier-rail-color']){const e=document.getElementById(id);if(e){resetField(e);e.dispatchEvent(new Event('input',{bubbles:true}));}}});
document.querySelector('#reset').textContent='Réinitialiser mon mur';
})();