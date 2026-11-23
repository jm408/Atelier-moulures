// Project JSON v1 — explicit import/export; no automatic regeneration of edited frames.
(()=>{
 const form=document.querySelector('#settings'), wall=form.closest('.panel'),summary=document.querySelector('#wizard-summary');
 const ui=document.createElement('section');ui.id='project-import';ui.className='project-box';
 ui.innerHTML='<h3>Reprendre un projet</h3><p class="hint">Importez un fichier Atelier Moulures (.json) pour retrouver votre mur, ses ouvertures et vos cadres personnalisés.</p><label class="project-file-label">Importer un projet JSON <input id="project-import-file" type="file" accept=".json,application/json"></label><p id="project-import-status" role="status"></p>';
 wall.prepend(ui);
 const out=document.createElement('section');out.className='project-box';out.id='project-export';
 out.innerHTML='<h2>Exporter mon projet</h2><p class="hint">Sauvegarde JSON réimportable avec les dimensions, ouvertures, réglages et cadres personnalisés.</p><button type="button" id="project-export-json">Exporter en JSON</button><p id="project-export-status" role="status"></p>';
 summary.append(out);
 const css=document.createElement('style');css.textContent='.project-box{background:#edf2ef;border:1px solid #c1d1c8;border-radius:12px;padding:16px;margin:14px 0}.project-box h3{margin:0 0 10px}.project-file-label{display:flex;flex-wrap:wrap;align-items:center;gap:12px}.project-file-label input{width:min(100%,340px)}';document.head.append(css);
 const readFields=root=>Object.fromEntries([...root.querySelectorAll('input[id],select[id]')].filter(el=>el.id&&!['project-import-file'].includes(el.id)).map(el=>[el.id,el.type==='checkbox'?el.checked:el.value]));
 const getForm=()=>Object.fromEntries([...form.elements].filter(el=>el.name).map(el=>[el.name,el.type==='checkbox'?el.checked:el.value]));
 const styleIds=['typology','panel-shape','dado-height','typology-cols','column-mode','column-count','dado-rail','rail-auto','rail-height','upper-percent','clearance','proposal-auto','proposal-cols'];
 function snapshot(){
  const obstacles=JSON.parse(localStorage.getItem('atelier-moulures-obstacles-v2')||'{}').obstacles||[];
  return {format:'atelier-moulures-project',schemaVersion:1,exportedAt:new Date().toISOString(),
   wall:getForm(),style:Object.fromEntries(styleIds.filter(id=>document.getElementById(id)).map(id=>{const e=document.getElementById(id);return [id,e.type==='checkbox'?e.checked:e.value]})),
   obstacles,composition:window.AtelierProjectPanels?.export()||null,validation:{status:'draft'}};
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
   window.dispatchEvent(new CustomEvent('atelier:obstacles-import',{detail:{obstacles:d.obstacles}}));
   form.dispatchEvent(new Event('input',{bubbles:true}));
   document.getElementById('typology').dispatchEvent(new Event('change',{bubbles:true}));
   window.AtelierProjectPanels?.restore(d.composition);
   status.textContent='Projet importé. Vérifiez les dimensions avant validation et export.';
  }catch(err){status.textContent='Import impossible : '+err.message}
  finally{e.target.value=''}
 });
})();
