// Frozen recommendation policy: advisory only, no geometry changes.
window.AtelierFallback=function(input,engine){
 if(input.type!=='mixed'||!input.obstacles?.length)return null;
 const best=type=>engine.propose({...input,type}).candidates.find(p=>p.columns>=2)||engine.propose({...input,type}).candidates[0];
 const mixed=best('mixed');
 if(mixed&&mixed.score>=80&&mixed.scoreBreakdown.uniformity>=.75&&mixed.panels.some(p=>p.kind==='haut')&&mixed.panels.some(p=>p.kind==='soubassement')&&mixed.panels.every(p=>Math.max(p.w/p.h,p.h/p.w)<=4))return null;
 const alternatives=['base','decorative'].map(type=>({type,candidate:best(type)})).filter(a=>a.candidate);
 alternatives.sort((a,b)=>b.candidate.score-a.candidate.score);
 return alternatives[0]||null;
};