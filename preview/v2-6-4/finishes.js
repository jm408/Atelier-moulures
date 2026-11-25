(()=>{
const $=id=>document.getElementById(id),out=$('project-export');
out.querySelector('p.hint').textContent='Sauvegardez votre projet en JSON pour le reprendre ultérieurement, ou exportez une image PNG à tout moment. Le dossier PDF est disponible après validation du projet.';
const actions=document.createElement('div');actions.className='am-export-actions';out.querySelector('p.hint').after(actions);for(const id of ['project-export-json','project-export-png','project-export-pdf'])actions.append($(id));
const notice=document.createElement('p');notice.id='am-import-success';notice.className='am-import-success';notice.hidden=true;$('wizard-result').prepend(notice);
const bar=$('bar-confirm'),msg=$('bar-confirm-notice');function sync(){msg.classList.toggle('am-confirmed',bar.checked&&Number($('settings').elements.bar.value)>=30);}
bar.addEventListener('change',sync);new MutationObserver(sync).observe(msg,{childList:true,characterData:true,subtree:true});sync();
const css=document.createElement('style');css.textContent=`
.am-export-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:12px 0}
#project-export .am-export-actions button{margin:0!important;min-height:36px}
#project-export-pdf:disabled,#am-validate:disabled{background:#e7e5e4!important;color:#78716c!important;border-color:#d6d3d1!important;opacity:1!important;cursor:not-allowed!important;box-shadow:none!important}
label.bar-confirm{display:flex!important;justify-content:flex-start!important;align-items:flex-start;gap:8px;background:#fafaf9!important;border:1px solid #e7e5e4;padding:10px!important;line-height:1.45}
label.bar-confirm input{width:auto!important;flex:0 0 auto;margin:3px 0 0!important}
#bar-confirm-notice{background:#f6efe2!important;color:#92400e!important;border:1px solid #e5d5b7!important;border-radius:8px!important;font-weight:400!important;padding:10px!important;line-height:1.45}
#bar-confirm-notice.am-confirmed,.am-import-success{background:#edf2ef!important;color:#1b3b2e!important;border:1px solid #c1d1c8!important;border-radius:8px;padding:10px}
`;document.head.append(css);
})();