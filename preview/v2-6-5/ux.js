(()=>{
const $=id=>document.getElementById(id),svg=$('result-svg'),select=$('ob-type'),add=$('ob-add'),nav=document.querySelector('.wizard-nav');
const types={door:['Porte',0,83,204,'<rect x="32" y="8" width="36" height="76" fill="#e7dfd0" stroke="#836f59" stroke-width="2"/><rect x="37" y="13" width="26" height="71" fill="#f6efe2" stroke="#836f59"/><circle cx="58" cy="48" r="2" fill="#836f59"/>'],window:['Fenêtre',85,110,120,'<rect x="15" y="17" width="70" height="55" fill="#d3e4e8" stroke="#836f59" stroke-width="3"/><path d="M50 17V72M15 44H85M10 75H90" stroke="#836f59" stroke-width="3"/>'],radiator:['Radiateur',15,90,65,'<rect x="12" y="28" width="76" height="40" rx="4" fill="#e7e5e4" stroke="#836f59" stroke-width="2"/>'+Array.from({length:9},(_,i)=>'<path d="M'+(18+i*8)+' 34V62" stroke="#a8a29e" stroke-width="2"/>').join('')+'<path d="M20 68V76M80 68V76" stroke="#836f59" stroke-width="3"/>']};
const palette=document.createElement('div');palette.className='am-ob-palette';select.closest('.buttons').before(palette);select.closest('.buttons').hidden=true;
const help=document.createElement('p');help.className='hint';help.textContent='Cliquez sur un élément pour l’ajouter ou glissez-le directement sur le mur.';palette.after(help);
const active=()=>nav.querySelector('.active')?.dataset.step==='0'&&!document.body.classList.contains('am-project-locked');
const status=$('ob-notes');
function insert(type,point){if(!active()||!types[type])return;const [,y,w,h]=types[type],form=$('settings'),W=Number(form.elements.w.value),H=Number(form.elements.h.value);if(!window.AtelierInputValid()||w>W||h>H){status.textContent='Cet élément ne tient pas dans le mur. Vérifiez ses dimensions.';return;}
const key='atelier-moulures-obstacles-v2',obs=JSON.parse(localStorage.getItem(key)||'{}').obstacles||[];if(obs.length>=100){status.textContent='Nombre maximal d’obstacles atteint.';return;}
const clamp=(v,max)=>Math.round(Math.max(0,Math.min(max,v))*10)/10;
obs.push({id:'ob-'+Date.now()+'-'+obs.length,type,x:clamp(point?point.x-w/2:(W-w)/2,W-w),y:type==='door'?0:clamp(point?point.y-h/2:y,H-h),width:w,height:h});
window.dispatchEvent(new CustomEvent('atelier:obstacles-import',{detail:{obstacles:obs}}));}
let dragging=null;
for(const [type,[label,,,,art]] of Object.entries(types)){const b=document.createElement('button');b.type='button';b.className='am-ob-card secondary';b.draggable=true;b.innerHTML='<svg viewBox="0 0 100 90" aria-hidden="true">'+art+'</svg><strong>'+label+'</strong><span>+ Ajouter</span>';b.onclick=()=>insert(type);b.ondragstart=e=>{if(!active()){e.preventDefault();return;}dragging=type;e.dataTransfer.setData('text/plain',type);e.dataTransfer.effectAllowed='copy';};b.ondragend=()=>{dragging=null;svg.classList.remove('am-drop-target');};palette.append(b);}
svg.addEventListener('dragover',e=>{if(active()&&dragging){e.preventDefault();e.dataTransfer.dropEffect='copy';svg.classList.add('am-drop-target');}});
svg.addEventListener('dragleave',()=>svg.classList.remove('am-drop-target'));
svg.addEventListener('drop',e=>{svg.classList.remove('am-drop-target');if(!active()||!dragging)return;e.preventDefault();const type=dragging;dragging=null;const wall=svg.querySelector('[data-wall-surface]')||svg.querySelector('rect'),matrix=svg.getScreenCTM();if(!wall||!matrix)return;const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(matrix.inverse()),x=Number(wall.getAttribute('x')),y=Number(wall.getAttribute('y')),w=Number(wall.getAttribute('width')),h=Number(wall.getAttribute('height'));if(q.x<x||q.x>x+w||q.y<y||q.y>y+h)return;insert(type,{x:(q.x-x)/w*Number($('settings').elements.w.value),y:(y+h-q.y)/h*Number($('settings').elements.h.value)});});
function toggle(input,label){const row=input.closest('label');if(!row)return;row.classList.add('am-switch-row');input.setAttribute('role','switch');input.setAttribute('aria-label',label);row.replaceChildren(document.createTextNode(label),input);}
toggle($('proposal-auto'),'Recommandation automatique');toggle(document.querySelector('#am-dimension-options input'),'Afficher les cotations');
$('project-export').querySelector('h2').textContent='Mon projet';$('project-export').querySelector('p.hint').textContent='Enregistrez votre projet pour le reprendre ultérieurement, ou exportez une image à tout moment. Le dossier PDF est disponible après validation.';
$('project-export-json').textContent='Enregistrer mon projet';$('project-export-png').textContent='Exporter une image';
$('project-import').querySelector('h3').textContent='Ouvrir un projet enregistré';$('project-import').querySelector('p.hint').textContent='Retrouvez votre mur, ses ouvertures et vos cadres à partir d’un projet enregistré.';
const file=$('project-import-file');file.closest('label').replaceChildren(document.createTextNode('Choisir un fichier projet '),file);
const css=document.createElement('style');css.textContent=`
.am-ob-palette{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}
.am-ob-palette .am-ob-card{display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px;background:#fafaf9;border:1px solid #e7e5e4;border-radius:9px;cursor:grab;color:#1b3b2e;min-width:0}
.am-ob-card svg{width:100%;max-width:90px;height:72px}.am-ob-card span{font-size:11px;color:#57534e}.am-ob-card:disabled{cursor:not-allowed;opacity:.5}.am-ob-card:hover:not(:disabled){border-color:#836f59;background:#f6efe2}
#result-svg.am-drop-target{outline:2px dashed #836f59;outline-offset:-3px}
.am-switch-row{display:flex!important;justify-content:space-between!important;align-items:center!important;gap:12px!important;line-height:1.4}
.am-switch-row input[type=checkbox]{appearance:none!important;flex:0 0 40px;width:40px!important;height:23px!important;border-radius:20px;background:#a8a29e;border:0!important;padding:0!important;margin:0!important;position:relative;cursor:pointer}
.am-switch-row input:before{content:'';position:absolute;width:17px;height:17px;top:3px;left:3px;background:white;border-radius:50%;transition:transform .15s}
.am-switch-row input:checked{background:#1b3b2e}.am-switch-row input:checked:before{transform:translateX(17px)}.am-switch-row input:disabled{opacity:.5;cursor:not-allowed}.am-switch-row input:focus-visible{outline:2px solid #c5a059;outline-offset:2px}
`;document.head.append(css);
})();