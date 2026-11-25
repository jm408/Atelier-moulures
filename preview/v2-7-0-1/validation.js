(()=>{
 const $=id=>document.getElementById(id),summary=$('wizard-summary'),svg=$('result-svg'),form=$('settings');
 const box=document.createElement('section');box.id='am-validation';box.className='project-box';box.innerHTML='<h2>Validation du projet</h2><p class="hint">Vérification des dimensions et des fournitures. Les choix décoratifs restent libres.</p><ul id="am-validation-checks"></ul><p id="am-validation-status" role="status"></p><button type="button" id="am-validate">Valider le projet</button><button type="button" id="am-unlock" class="secondary" hidden>Modifier le projet</button>';summary.insertBefore(box,$('project-export'));
 let locked=false,states=[];const permitted=e=>e.closest('#am-validation,#project-export,.wizard-nav,.wizard-footer,#am-guide,.am-guide-help')||e.matches('[data-preview],#am-dimension-options input');
 document.addEventListener('click',e=>{if(locked&&e.target.closest('button,input,select,textarea')&&!permitted(e.target.closest('button,input,select,textarea'))){e.preventDefault();e.stopImmediatePropagation();}},true);
 const checks=()=>[
  ['Dimensions valides',window.AtelierInputValid()&&svg.dataset.invalid!=='true'],
  ['Absence de collision', $('result-conflicts').textContent.trim()==='0'],
  ['Au moins un cadre',Number($('result-count').textContent)>0],
  ['Longueur des baguettes confirmée',$('bar-confirm').checked&&Number(form.elements.bar.value)>=30],
  ['Quantités calculables',Number.isFinite(Number($('result-count').textContent))&&Number($('result-count').textContent)>0]
 ];
 function refresh(){const rows=checks();$('am-validation-checks').replaceChildren(...rows.map(([name,ok])=>{const li=document.createElement('li');li.textContent=(ok?'✓ ':'✗ ')+name;li.style.color=ok?'#1B3B2E':'#B91C1C';return li}));$('am-validate').disabled=locked||!rows.every(x=>x[1]);$('am-validation-status').textContent=locked?'Projet validé — paramètres verrouillés.':rows.every(x=>x[1])?'Projet prêt à être validé.':'Corrigez les points signalés avant validation.';}
 function setLock(value){locked=value;document.body.classList.toggle('am-project-locked',value);if(value){
  states=[...document.querySelectorAll('input,select,textarea,button')].filter(e=>!e.closest('#am-validation,#project-export,.wizard-nav,.wizard-footer,#am-guide,.am-guide-help')&&!e.matches('[data-preview],#am-dimension-options input') ).map(e=>[e,e.disabled]);states.forEach(([e])=>e.disabled=true);
  if(document.activeElement instanceof HTMLElement)document.activeElement.blur();
 }else{states.forEach(([e,d])=>{if(e.isConnected)e.disabled=d});states=[];}
 $('am-validate').hidden=value;$('am-unlock').hidden=!value;refresh();}
 $('am-validate').onclick=()=>{if(checks().every(x=>x[1])){window.AtelierClearSelection();setLock(true);}};$('am-unlock').onclick=()=>setLock(false);
 const css=document.createElement('style');css.textContent='.am-project-locked #result-svg{pointer-events:none}.am-project-locked #result-svg [tabindex]{pointer-events:none}.am-project-locked #atelier-preview-controls .preview-colors{pointer-events:none;opacity:.6}#am-validation li{margin:6px 0}#am-validation [hidden]{display:none!important}';document.head.append(css);
 document.addEventListener('keydown',e=>{if(locked&&(e.target.closest('#result-svg')||((e.ctrlKey||e.metaKey)&&['z','y'].includes(e.key.toLowerCase())))){e.preventDefault();e.stopImmediatePropagation();}},true);
 document.addEventListener('input',()=>queueMicrotask(refresh));document.addEventListener('change',()=>queueMicrotask(refresh));
 const lockObserver=new MutationObserver(()=>{if(locked)document.querySelectorAll('input,select,textarea,button').forEach(e=>{if(!permitted(e)&&!e.disabled){states.push([e,false]);e.disabled=true;}});});lockObserver.observe(document.body,{childList:true,subtree:true});
 const observer=new MutationObserver(refresh);for(const id of ['result-count','result-conflicts','result-bars'])observer.observe($(id),{childList:true,characterData:true,subtree:true});
 window.AtelierValidation={isValidated:()=>locked&&checks().every(x=>x[1])};refresh();
})();