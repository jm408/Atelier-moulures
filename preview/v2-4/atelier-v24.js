(()=>{
const svg=document.querySelector('#result-svg'),stage=document.querySelector('.am-stage'),controls=document.querySelector('#atelier-preview-controls');if(!svg||!stage||!controls)return;
const colors=controls.querySelector('.preview-colors');const label=document.createElement('label');label.innerHTML='Couleur de la cimaise <input type="color" id="atelier-rail-color" value="#836f59">';colors.prepend(label);label.querySelector('input').addEventListener('input',e=>document.documentElement.style.setProperty('--atelier-rail',e.target.value));
const help=document.createElement('div');help.className='am-context-help';help.innerHTML='<details><summary>Déplacer les ouvertures et obstacles</summary><p>Cliquez et faites glisser une ouverture sur le plan, ou saisissez ses coordonnées.</p></details><details><summary>Personnaliser les cadres</summary><p>Déplacez un cadre ou tirez sa poignée supérieure droite pour le redimensionner. Les champs permettent un ajustement précis.</p></details>';stage.querySelector('.am-canvas').before(help);
const nav=document.querySelector('.wizard-nav');const sync=()=>{help.hidden=nav.querySelector('.active')?.dataset.step!=='2'};new MutationObserver(sync).observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});sync();
const notice=document.querySelector('#bar-confirm-notice');const update=()=>{if(notice)notice.dataset.confirmed=String(!!document.querySelector('#bar-confirm')?.checked&&Number(document.querySelector('[name=bar]')?.value)>=30)};if(notice)new MutationObserver(update).observe(notice,{childList:true});update();
const css=document.createElement('style');css.textContent=`
body{background:#FAFAF9!important}
#result-svg.decorative-preview rect[data-panel]{fill:transparent!important;filter:drop-shadow(1.4px 2px .65px rgba(0,0,0,.65)) drop-shadow(-1px -1px .45px rgba(255,255,255,.95))!important}
#result-svg.decorative-preview [data-rail-surface]{stroke:var(--atelier-rail,#836f59)!important;filter:drop-shadow(0 1px 1px rgba(0,0,0,.45))}
#obstacle-drag-hint{display:none!important}
#panel-tools>p.hint:first-of-type{display:none}
.am-context-help:not([hidden]){display:flex;gap:10px;flex-wrap:wrap}
.am-context-help details{flex:1 1 200px;background:#fff;border:1px solid #E7E5E4;border-radius:8px;padding:10px;font-size:13px}
.am-context-help summary{cursor:pointer;font-weight:600}.am-context-help p{margin-top:8px}
body #bar-confirm-notice{background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;border-radius:8px;font-weight:500}
body #bar-confirm-notice[data-confirmed=true]{background:#F0FDF4;color:#1B3B2E;border-color:#BBF7D0}
body .bar-confirm{background:#FAFAF9}
`;document.head.append(css);
})();