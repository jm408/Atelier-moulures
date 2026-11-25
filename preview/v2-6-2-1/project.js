// Project JSON v1 — explicit import/export; no automatic regeneration of edited frames.
(()=>{
 const form=document.querySelector('#settings'), wall=form.closest('.panel'),summary=document.querySelector('#wizard-summary');
 const ui=document.createElement('section');ui.id='project-import';ui.className='panel project-import-card';
 ui.innerHTML='<h3>Reprendre un projet</h3><p class="hint">Importez un fichier Atelier Moulures (.json) pour retrouver votre mur, ses ouvertures et vos cadres personnalisés.</p><label class="project-file-label">Importer un projet JSON <input id="project-import-file" type="file" accept=".json,application/json"></label><p id="project-import-status" role="status"></p>';
 wall.before(ui);
 const out=document.createElement('section');out.className='project-box';out.id='project-export';
 out.innerHTML='<h2>Exporter mon projet</h2><p class="hint">Sauvegarde JSON réimportable avec les dimensions, ouvertures, réglages et cadres personnalisés.</p><button type="button" id="project-export-json">Exporter en JSON</button><p id="project-export-status" role="status"></p>';
 summary.append(out);
 const pngButton=document.createElement('button');pngButton.type='button';pngButton.id='project-export-png';pngButton.className='secondary';pngButton.style.marginLeft='10px';pngButton.textContent='Exporter le plan en PNG';document.getElementById('project-export-json').after(pngButton);
 const dialog=document.createElement('dialog');dialog.style.cssText='border:1px solid #c1d1c8;border-radius:12px;padding:24px;max-width:420px;width:90%;';dialog.innerHTML='<h2>Exporter en PNG</h2><p>Choisissez la représentation à exporter.</p><label><input type="radio" name="am-export-view" value="technical"> Plan technique</label><label><input type="radio" name="am-export-view" value="decor"> Aperçu décoratif</label><div style="display:flex;gap:10px;margin-top:18px"><button type="button" data-cancel class="secondary">Annuler</button><button type="button" data-export>Exporter en PNG</button></div>';out.append(dialog);
 window.AtelierExportSVG=function(mode){
   const svg=document.getElementById('result-svg');if(!svg||!svg.querySelector('rect'))throw Error('Aucun plan à exporter.');
   const clone=svg.cloneNode(true);clone.removeAttribute('class');clone.removeAttribute('style');clone.querySelectorAll('[data-frame-handle],[data-relief]').forEach(e=>e.remove());
   const color=id=>document.getElementById(id).value;
   const rects=clone.querySelectorAll(':scope > rect');
   if(mode==='decor'){
     clone.querySelectorAll('[data-am-dimensions]').forEach(e=>e.remove());
     [color('atelier-wall-color'),color('atelier-molding-color'),color('atelier-molding-color')].forEach((c,i)=>rects[i]?.setAttribute('fill',c));
     clone.querySelectorAll('[data-panel]').forEach(e=>{e.setAttribute('fill','none');e.setAttribute('stroke',color('atelier-molding-color'));e.setAttribute('style','filter:drop-shadow(1px 2px 1px #0006) drop-shadow(-1px -1px 1px #fffd)');});
     clone.querySelectorAll('[data-rail-surface]').forEach(e=>e.setAttribute('stroke',color('atelier-rail-color')));
   }
   clone.querySelectorAll('[data-panel]').forEach(e=>{e.removeAttribute('tabindex');e.removeAttribute('role');if(mode!=='decor')e.removeAttribute('style');});
   clone.setAttribute('xmlns','http://www.w3.org/2000/svg');return clone;
 };
 pngButton.addEventListener('click',()=>{dialog.querySelector('input[value="'+document.getElementById('atelier-preview-controls').dataset.mode+'"]').checked=true;dialog.showModal();});
 dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();
 dialog.querySelector('[data-export]').onclick=async()=>{
  const mode=dialog.querySelector('input:checked').value;dialog.close();const status=document.getElementById('project-export-status');
  try{
   window.AtelierClearSelection?.();const clone=window.AtelierExportSVG(mode),bounds=clone.getAttribute('viewBox').split(/\s+/).map(Number),width=1800,height=Math.ceil(width*bounds[3]/bounds[2]);
   clone.setAttribute('width',width);clone.setAttribute('height',height);
   const xml=new XMLSerializer().serializeToString(clone),url=URL.createObjectURL(new Blob([xml],{type:'image/svg+xml;charset=utf-8'}));
   try{const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Image SVG illisible'));img.src=url});const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.fillStyle='#faf9f6';ctx.fillRect(0,0,width,height);ctx.drawImage(img,0,0,width,height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Conversion PNG impossible');const pngUrl=URL.createObjectURL(blob),a=document.createElement('a');a.href=pngUrl;a.download='atelier-moulures-'+(mode==='decor'?'decoratif':'technique')+'.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(pngUrl),1000);status.textContent='Plan PNG exporté.'}finally{URL.revokeObjectURL(url)}
  }catch(err){status.textContent='Export PNG impossible : '+err.message}
 };
 const css=document.createElement('style');css.textContent='.project-import-card{max-width:850px;width:100%;margin:0 auto 12px}.project-import-card h3{font-size:17px}.project-import-card .project-file-label{justify-content:flex-start}.project-import-card input[type=file]{width:min(100%,380px)}.project-box{background:#edf2ef;border:1px solid #c1d1c8;border-radius:12px;padding:16px;margin:14px 0}.project-box h3{margin:0 0 10px}.project-file-label{display:flex;flex-wrap:wrap;align-items:center;gap:12px}.project-file-label input{width:min(100%,340px)}';document.head.append(css);
 ui.style.display='';
 const setImportVisibility=()=>{ui.style.display=document.querySelector('.wizard-nav [data-step="0"]')?.classList.contains('active')?'':'none'};
 document.querySelector('.wizard-nav')?.addEventListener('click',()=>setTimeout(setImportVisibility,0));
 document.getElementById('wizard-prev')?.addEventListener('click',()=>setTimeout(setImportVisibility,0));
 document.getElementById('wizard-next')?.addEventListener('click',()=>setTimeout(setImportVisibility,0));
 setImportVisibility();
 const readFields=root=>Object.fromEntries([...root.querySelectorAll('input[id],select[id]')].filter(el=>el.id&&!['project-import-file'].includes(el.id)).map(el=>[el.id,el.type==='checkbox'?el.checked:el.value]));
 const getForm=()=>Object.fromEntries([...form.elements].filter(el=>el.name).map(el=>[el.name,el.type==='checkbox'?el.checked:el.value]));
 const styleIds=['typology','panel-shape','dado-height','typology-cols','column-mode','column-count','dado-rail','rail-auto','rail-height','rail-profile','upper-percent','clearance','proposal-auto','proposal-cols','layout-mode','zone-cols','center-width','bar-confirm'];
 const colorIds=['atelier-wall-color','atelier-molding-color','atelier-rail-color'];
 function snapshot(){
  const obstacles=JSON.parse(localStorage.getItem('atelier-moulures-obstacles-v2')||'{}').obstacles||[];
  return {format:'atelier-moulures-project',schemaVersion:1,exportedAt:new Date().toISOString(),
   wall:getForm(),style:Object.fromEntries(styleIds.filter(id=>document.getElementById(id)).map(id=>{const e=document.getElementById(id);return [id,e.type==='checkbox'?e.checked:e.value]})),
   appearance:{mode:document.querySelector('#atelier-preview-controls').dataset.mode,colors:Object.fromEntries(colorIds.map(id=>[id,document.getElementById(id).value]))},obstacles,composition:window.AtelierProjectPanels?.export()||null,validation:{status:'draft'}};
 }
 function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 document.getElementById('project-export-json').onclick=()=>{
  try{download('atelier-moulures-projet.json',JSON.stringify(snapshot(),null,2),'application/json');document.getElementById('project-export-status').textContent='Projet JSON enregistré.'}
  catch(e){document.getElementById('project-export-status').textContent='Export impossible : '+e.message}
 };
 function validate(d){
  if(!d||d.format!=='atelier-moulures-project'||d.schemaVersion!==1||!d.wall||typeof d.wall!=='object'||!d.style||typeof d.style!=='object'||!Array.isArray(d.obstacles)||d.obstacles.length>100)throw Error('Format ou version du projet non reconnu.');
  for(const [k,v] of Object.entries(d.wall)){const el=form.elements.namedItem(k);if(!el||typeof v!=='string'&&typeof v!=='number'&&typeof v!=='boolean')throw Error('Paramètre du mur invalide : '+k);if(el.type==='number'&&!Number.isFinite(Number(v)))throw Error('Dimension invalide : '+k)}
  if(!Number.isFinite(Number(d.wall.w))||Number(d.wall.w)<=0||!Number.isFinite(Number(d.wall.h))||Number(d.wall.h)<=0)throw Error('Dimensions du mur invalides.');
  if(d.appearance!==undefined&&(!d.appearance||!['technical','decor'].includes(d.appearance.mode)||!d.appearance.colors||colorIds.some(id=>!/^#[0-9a-f]{6}$/i.test(d.appearance.colors[id]||''))))throw Error('Couleurs ou mode de visualisation invalides.');
  if(d.obstacles.some(o=>!['door','window','radiator'].includes(o.type)||!['x','y','width','height'].every(k=>Number.isFinite(Number(o[k])))||Number(o.width)<=0||Number(o.height)<=0))throw Error('Ouvertures ou obstacles invalides.');
  if(d.composition?.panels&&(!Array.isArray(d.composition.panels)||d.composition.panels.length>200||d.composition.panels.some(p=>!['x','y','w','h'].every(k=>Number.isFinite(Number(p[k])))||Number(p.w)<=0||Number(p.h)<=0)))throw Error('Cadres personnalisés invalides.');
 }
 document.getElementById('project-import-file').addEventListener('change',async e=>{
  const file=e.target.files?.[0],status=document.getElementById('project-import-status');if(!file)return;
  try{
   if(file.size>2_000_000)throw Error('Fichier trop volumineux (maximum 2 Mo).');
   const d=JSON.parse(await file.text());validate(d);
   if(!window.confirm('Importer ce projet ? Le projet actuellement affiché sera remplacé. Exportez-le d’abord en JSON si vous souhaitez le conserver.'))return;
   for(const [k,v] of Object.entries(d.wall)){const el=form.elements.namedItem(k);if(el)el.type==='checkbox'?el.checked=Boolean(v):el.value=String(v)}
   for(const [k,v] of Object.entries(d.style)){const el=document.getElementById(k);if(el&&['INPUT','SELECT'].includes(el.tagName))el.type==='checkbox'?el.checked=Boolean(v):el.value=String(v)}
   localStorage.setItem('atelier-moulures',JSON.stringify(d.wall));
   localStorage.setItem('atelier-moulures-obstacles-v2',JSON.stringify({schemaVersion:2,obstacles:d.obstacles}));
   window.dispatchEvent(new CustomEvent('atelier:obstacles-import',{detail:{obstacles:d.obstacles}}));
   form.dispatchEvent(new Event('input',{bubbles:true}));
   document.getElementById('typology').dispatchEvent(new Event('change',{bubbles:true}));
   window.AtelierProjectPanels?.restore(d.composition);
   for(const id of colorIds){const el=document.getElementById(id);el.value=d.appearance?.colors[id]||el.defaultValue;el.dispatchEvent(new Event('input',{bubbles:true}));}
   document.querySelector('#atelier-preview-controls [data-preview="'+(d.appearance?.mode||'technical')+'"]').click();
   const stored=JSON.parse(localStorage.getItem('atelier-moulures-obstacles-v2')||'{}').obstacles||[];
   if(stored.length!==d.obstacles.length)throw Error('Les ouvertures et obstacles n’ont pas été restaurés correctement.');
   status.textContent='Projet importé : '+stored.length+' ouverture(s) ou obstacle(s) restauré(s). Vérifiez le plan avant validation.';
  }catch(err){status.textContent='Import impossible : '+err.message}
  finally{e.target.value=''}
 });
})();
