(()=>{
const form=document.querySelector('#settings'),style=document.querySelector('#typology').closest('.panel'),svg=document.querySelector('#result-svg'),stage=document.querySelector('.am-stage'),rail=document.querySelector('#atelier-rail-color'),controls=document.querySelector('#atelier-preview-controls');
const key='atelier-moulures-obstacles-v2',template=()=>[{id:'default-window',type:'window',x:145,y:85,width:110,height:120}];
const fields=[...new Set([...form.elements,...style.querySelectorAll('input,select'),...controls.querySelectorAll('input[type=color]'),...document.querySelectorAll('#proposal-auto,#proposal-cols,#bar-confirm')])].filter(e=>e.matches('input,select')&&e.type!=='radio'&&e.type!=='file');
function visibility(){const visible=document.querySelector('#dado-rail').checked&&document.querySelector('#typology').value!=='decorative';rail.closest('label').style.display=visible?'flex':'none';}
document.addEventListener('input',visibility);document.addEventListener('change',visibility);visibility();
const toolbar=document.createElement('div');toolbar.className='am-history';toolbar.innerHTML='<button type="button" class="secondary" id="am-undo">↶ Annuler</button><button type="button" class="secondary" id="am-redo">↷ Rétablir</button><span role="status" aria-live="polite"></span>';stage.querySelector('.am-canvas').before(toolbar);
const undo=toolbar.querySelector('#am-undo'),redo=toolbar.querySelector('#am-redo'),status=toolbar.querySelector('span');
const css=document.createElement('style');css.textContent='.am-history{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.am-history button{font-size:12px;padding:8px 12px}.am-history button:disabled{opacity:.4;cursor:default}.am-history span{font-size:12px;color:#57534E}';document.head.append(css);
const snapshot=()=>({fields:fields.map(e=>e.type==='checkbox'?e.checked:e.value),obstacles:JSON.parse(localStorage.getItem(key)||'{}').obstacles||[],composition:window.AtelierProjectPanels.export()});
let history=[snapshot()],index=0,restoring=false,dragging=false,timer;
function update(){undo.disabled=index===0;redo.disabled=index===history.length-1;}
function record(){if(restoring||dragging)return;const s=snapshot();if(JSON.stringify(s)===JSON.stringify(history[index]))return;history=history.slice(0,index+1);history.push(s);if(history.length>60)history.shift();index=history.length-1;update();}
function schedule(){if(restoring||dragging)return;clearTimeout(timer);timer=setTimeout(record,250);}
function restore(s){restoring=true;try{fields.forEach((e,i)=>{if(e.type==='checkbox')e.checked=s.fields[i];else e.value=s.fields[i]});window.dispatchEvent(new CustomEvent('atelier:obstacles-import',{detail:{obstacles:s.obstacles}}));for(const e of fields){e.dispatchEvent(new Event('change',{bubbles:true}));if(e.type==='color')e.dispatchEvent(new Event('input',{bubbles:true}));}form.dispatchEvent(new Event('input',{bubbles:true}));window.AtelierProjectPanels.restore(s.composition);visibility();}finally{queueMicrotask(()=>{restoring=false;update()})}}
undo.onclick=()=>{clearTimeout(timer);record();if(index>0){restore(history[--index]);status.textContent='Modification annulée.'}};
redo.onclick=()=>{clearTimeout(timer);if(index<history.length-1){restore(history[++index]);status.textContent='Modification rétablie.'}};
document.addEventListener('input',schedule);document.addEventListener('change',schedule);document.addEventListener('click',e=>{if(!toolbar.contains(e.target))schedule()});
svg.addEventListener('pointerdown',()=>{clearTimeout(timer);record();dragging=true});for(const event of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(event,()=>{dragging=false;schedule()});
new MutationObserver(schedule).observe(document.querySelector('#ob-list'),{childList:true,subtree:true});
document.querySelector('#reset').addEventListener('click',()=>{queueMicrotask(()=>{window.dispatchEvent(new CustomEvent('atelier:obstacles-import',{detail:{obstacles:template()}}));form.dispatchEvent(new Event('input',{bubbles:true}));schedule()})});
update();
})();