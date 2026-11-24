(()=>{
const stage=document.querySelector('.am-stage'),nav=document.querySelector('.wizard-nav'),svg=document.querySelector('#result-svg');
const css=document.createElement('style');css.textContent='#result-svg.am-wall-only [data-panel],#result-svg.am-wall-only [data-frame-handle],#result-svg.am-wall-only [data-rail-surface],#result-svg.am-wall-only [data-relief]{display:none!important}';document.head.append(css);
function sync(){const wall=nav.querySelector('.active')?.dataset.step==='0';svg.classList.toggle('am-wall-only',wall);if(wall)stage.querySelector('p').textContent='Définissez les dimensions du mur et positionnez les ouvertures.';else stage.querySelector('p').textContent='Visualisation à l’échelle — ajustez votre projet depuis le panneau de droite.';}
new MutationObserver(sync).observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});sync();
})();