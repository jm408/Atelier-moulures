// V2.1-B composition engine: decorative rhythm first, obstacles second.
// Pure geometry; origin bottom-left; all distances in cm.
window.AtelierComposition=(()=>{
 const overlaps=(a,b)=>a.x<b.x+b.w-0.001&&a.x+a.w>b.x+0.001&&a.y<b.y+b.h-0.001&&a.y+a.h>b.y+0.001;
 const inside=(p,r)=>p.x>=r.x-0.001&&p.y>=r.y-0.001&&p.x+p.w<=r.x+r.w+0.001&&p.y+p.h<=r.y+r.h+0.001;
 function generate({bounds,obstacles=[],type='decorative',shape='rectangle',cols=3,gapX=15,gapY=15,dado=95,clearance=8,profile=2}){
  const warnings=[],panels=[],minimum=Math.max(12,profile*2+8);
  if(![bounds.x,bounds.y,bounds.w,bounds.h,gapX,gapY,dado,clearance,profile].every(Number.isFinite)||bounds.w<=0||bounds.h<=0||gapX<0||gapY<0)return {panels,warnings:['Dimensions de composition invalides.']};
  cols=Math.max(1,Math.min(12,Math.floor(cols)||1));
  const restricted=obstacles.map(o=>({x:Number(o.x)-clearance,y:Number(o.y)-clearance,w:Number(o.width)+2*clearance,h:Number(o.height)+2*clearance}));
  // Shared column axes: never regenerate independently inside each free rectangle.
  const width=(bounds.w-(cols-1)*gapX)/cols;
  if(width<minimum)return {panels,warnings:['Trop de colonnes pour la largeur disponible.']};
  const columns=Array.from({length:cols},(_,i)=>({x:bounds.x+i*(width+gapX),w:width}));
  let zones=[];
  if(type==='base')zones=[{name:'soubassement',y:bounds.y,h:Math.min(dado-bounds.y,bounds.h)}];
  else if(type==='mixed'){
   const lower=Math.min(dado-bounds.y,bounds.h-gapY-minimum);
   zones=[{name:'soubassement',y:bounds.y,h:lower},{name:'haut',y:bounds.y+lower+gapY,h:bounds.h-lower-gapY}];
  }else zones=[{name:'décoratif',y:bounds.y,h:bounds.h}];
  zones=zones.filter(z=>z.h>=minimum);
  if(!zones.length)return {panels,warnings:['Hauteur insuffisante pour cette typologie.']};
  const put=p=>{if(p.w>=minimum&&p.h>=minimum&&inside(p,bounds)&&!restricted.some(o=>overlaps(p,o)))panels.push(p)};
  for(const z of zones)for(const c of columns){
   const nominal={x:c.x,y:z.y,w:c.w,h:z.h,kind:z.name};
   if(shape==='square'&&type==='decorative'){
    const side=Math.min(nominal.w,nominal.h);
    nominal.x+=(nominal.w-side)/2;nominal.y+=(nominal.h-side)/2;nominal.w=side;nominal.h=side;
   }
   if(!restricted.some(o=>overlaps(nominal,o))){put(nominal);continue}
   // Preserve common axes and horizontal rhythm. Split at obstacle edges vertically;
   // never shift a single column sideways or create an arbitrary thin side strip.
   const cuts=[nominal.y,nominal.y+nominal.h];
   restricted.forEach(o=>{if(o.x<nominal.x+nominal.w&&o.x+o.w>nominal.x){cuts.push(Math.max(nominal.y,Math.min(nominal.y+nominal.h,o.y)));cuts.push(Math.max(nominal.y,Math.min(nominal.y+nominal.h,o.y+o.h)))}});
   const sorted=[...new Set(cuts.map(v=>Number(v.toFixed(3))))].sort((a,b)=>a-b);
   let segments=[];
   for(let i=0;i<sorted.length-1;i++){const candidate={...nominal,y:sorted[i],h:sorted[i+1]-sorted[i]};if(candidate.h>=minimum&&!restricted.some(o=>overlaps(candidate,o)))segments.push(candidate)}
   // Keep a single panel if possible; multiple stacked panels require the requested gap.
   segments.sort((a,b)=>b.h-a.h);
   if(segments.length){const best=segments[0];put({...best,y:best.y+Math.min(2,best.h/8),h:best.h-2*Math.min(2,best.h/8)})}
   else warnings.push('Colonne '+(columns.indexOf(c)+1)+' : espace insuffisant autour des ouvertures.');
  }
  // Adaptive alternative: when rigid columns discard most of the wall, use
  // obstacle edges as architectural anchors and propose panels in free bays.
  // Score the alternatives rather than forcing the user to move openings.
  if(type==='decorative'&&obstacles.length){
   const adaptive=[];
   const epsilon=0.01;
   const left=bounds.x,right=bounds.x+bounds.w,bottom=bounds.y,top=bounds.y+bounds.h;
   const edges=[left,right,...restricted.flatMap(o=>[Math.max(left,Math.min(right,o.x)),Math.max(left,Math.min(right,o.x+o.w))])];
   const xs=[...new Set(edges.map(v=>Number(v.toFixed(3))))].sort((a,b)=>a-b);
   // Generate full-height panels in free vertical bays and shorter panels below/above openings.
   for(let i=0;i<xs.length-1;i++){
    const x1=xs[i],x2=xs[i+1];
    if(x2-x1<minimum+4)continue;
    const crossing=restricted.filter(o=>o.x<x2-epsilon&&o.x+o.w>x1+epsilon);
    const yEdges=[bottom,top,...crossing.flatMap(o=>[Math.max(bottom,Math.min(top,o.y)),Math.max(bottom,Math.min(top,o.y+o.h))])];
    const ys=[...new Set(yEdges.map(v=>Number(v.toFixed(3))))].sort((a,b)=>a-b);
    const free=[];
    for(let j=0;j<ys.length-1;j++){
     const p={x:x1+2,y:ys[j]+2,w:x2-x1-4,h:ys[j+1]-ys[j]-4,kind:'décoratif'};
     if(p.w>=minimum&&p.h>=minimum&&!restricted.some(o=>overlaps(p,o)))free.push(p);
    }
    // Merge adjacent free bands to avoid unnecessary horizontal divisions.
    let merged=[];
    for(const p of free){const prev=merged[merged.length-1];if(prev&&Math.abs(prev.y+prev.h+4-p.y)<epsilon){prev.h=p.y+p.h-prev.y}else merged.push({...p})}
    adaptive.push(...merged);
   }
   // Merge horizontally adjacent panels with the same vertical span; the gap is
   // applied after merging so a broad wall bay becomes one intentional panel.
   adaptive.sort((a,b)=>a.y-b.y||a.h-b.h||a.x-b.x);
   const merged=[];
   for(const p of adaptive){
    const prev=merged[merged.length-1];
    if(prev&&Math.abs(prev.y-p.y)<epsilon&&Math.abs(prev.h-p.h)<epsilon&&Math.abs(prev.x+prev.w+4-p.x)<epsilon)prev.w=p.x+p.w-prev.x;
    else merged.push({...p});
   }
   const usable=merged.filter(p=>p.w>=Math.max(minimum,24)&&p.h>=Math.max(minimum,24));
   const score=arr=>arr.reduce((n,p)=>n+p.w*p.h,0)-arr.length*150;
   if(usable.length&&score(usable)>score(panels)*1.12){
    panels.splice(0,panels.length,...usable);
    warnings.length=0;
    warnings.push('Composition adaptée automatiquement aux ouvertures.');
   }
  }
  if(!panels.length)warnings.push('Aucun cadre compatible avec les contraintes.');
  return {panels,warnings};
 }
 return {generate,overlaps};
})();