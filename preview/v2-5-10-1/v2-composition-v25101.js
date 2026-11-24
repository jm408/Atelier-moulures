// Deterministic decorative proposal engine. Coordinates in cm, bottom-left origin.
window.AtelierComposition=(()=>{
 const overlap=(a,b)=>a.x<b.x+b.w-1e-6&&a.x+a.w>b.x+1e-6&&a.y<b.y+b.h-1e-6&&a.y+a.h>b.y+1e-6;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const unique=a=>[...new Set(a.filter(Number.isFinite).map(n=>+n.toFixed(2)))].sort((a,b)=>a-b);
 const rnd=n=>+n.toFixed(2);
 function propose(input){
  const {bounds:b,obstacles=[],type='decorative',shape='rectangle',cols=3,gapX=15,gapY=15,dado=95,upperPercent=70,clearance=8,profile=2}=input;
  const min=Math.max(12,2*profile+8),errors=[];
  const halfX=Math.max(2,gapX/2),halfY=Math.max(2,gapY/2);
  if(!b||![b.x,b.y,b.w,b.h,gapX,gapY,dado,upperPercent,clearance,profile].every(Number.isFinite)||b.w<=0||b.h<=0||gapX<0||gapY<0||clearance<0)return {candidates:[],recommendedCandidateId:null,warnings:['Dimensions invalides.']};
  const left=b.x,right=b.x+b.w,low=b.y,high=b.y+b.h;
  const blocked=obstacles.map(o=>({x:+o.x-clearance,y:+o.y-clearance,w:+o.width+2*clearance,h:+o.height+2*clearance}));
  if(blocked.some(o=>![o.x,o.y,o.w,o.h].every(Number.isFinite)||o.w<=0||o.h<=0))return {candidates:[],recommendedCandidateId:null,warnings:['Ouverture ou obstacle invalide.']};
  const valid=p=>p.w>=min&&p.h>=min&&p.x>=left-1e-5&&p.y>=low-1e-5&&p.x+p.w<=right+1e-5&&p.y+p.h<=high+1e-5&&!blocked.some(o=>overlap(p,o));
  const lowerHeight=type==='mixed'?(b.h-gapY)*(1-clamp(upperPercent,10,90)/100):Math.min(high,dado)-low;
  const zones=type==='base'?[{y:low,h:lowerHeight,kind:'soubassement'}]:type==='mixed'?[{y:low,h:lowerHeight,kind:'soubassement'},{y:low+lowerHeight+gapY,h:b.h-lowerHeight-gapY,kind:'haut'}]:[{y:low,h:b.h,kind:'décoratif'}];
  const safeZones=zones.filter(z=>z.h>=min);
  const candidates=[],seen=new Set();
  const add=(panels,method,reason)=>{
   const clean=panels.map(p=>({...p,x:Math.ceil((p.x-1e-8)*100)/100,y:Math.ceil((p.y-1e-8)*100)/100,w:Math.floor((p.x+p.w+1e-8)*100)/100-Math.ceil((p.x-1e-8)*100)/100,h:Math.floor((p.y+p.h+1e-8)*100)/100-Math.ceil((p.y-1e-8)*100)/100})).filter(valid);
   if(!clean.length)return;
   // Candidate must not contain overlapping frames.
   if(clean.some((p,i)=>clean.slice(i+1).some(q=>{const sharedY=Math.min(p.y+p.h,q.y+q.h)-Math.max(p.y,q.y);const sharedX=Math.min(p.x+p.w,q.x+q.w)-Math.max(p.x,q.x);return overlap(p,q)||(sharedY>1e-5&&Math.max(p.x,q.x)-Math.min(p.x+p.w,q.x+q.w)<gapX-1e-5)||(sharedX>1e-5&&Math.max(p.y,q.y)-Math.min(p.y+p.h,q.y+q.h)<gapY-1e-5)})))return;
   const key=clean.map(p=>[p.x,p.y,p.w,p.h].join(':')).sort().join('|');if(seen.has(key))return;seen.add(key);
   const area=clean.reduce((s,p)=>s+p.w*p.h,0),coverage=area/(b.w*b.h);
   const xCenters=clean.map(p=>p.x+p.w/2),balance=1-Math.min(1,Math.abs(clean.reduce((s,p)=>s+(p.x+p.w/2-(left+right)/2)*p.w*p.h,0)/(area*b.w/2||1)));
   const tops=unique(clean.map(p=>p.y+p.h)),bottoms=unique(clean.map(p=>p.y));
   const alignment=1-Math.min(1,((tops.length-1)+(bottoms.length-1))/Math.max(1,clean.length*2));
   const ratios=clean.map(p=>Math.max(p.w/p.h,p.h/p.w));
   const proportions=clean.reduce((s,p,i)=>s+Math.max(0,1-Math.max(0,ratios[i]-3)/5),0)/clean.length;
   const simplicity=1-Math.min(1,(unique(clean.map(p=>p.w)).length+unique(clean.map(p=>p.h)).length-2)/Math.max(4,clean.length*2));
   const levels=unique(clean.flatMap(p=>[p.y,p.y+p.h]));
   const columnCount=Math.max(0,...levels.slice(1).map((y,i)=>{const mid=(y+levels[i])/2;return clean.filter(p=>p.y<mid&&p.y+p.h>mid).length;}));
   const rhythm=1-Math.min(1,Math.abs(columnCount-(Number(cols)||3))/Math.max(3,Number(cols)||3));
   const scoreBreakdown={alignment:rnd(alignment),balance:rnd(balance),proportions:rnd(proportions),rhythm:rnd(rhythm),simplicity:rnd(simplicity)};
   const score=rnd(Math.min(100,100*(.30*alignment+.25*balance+.20*proportions+.15*rhythm+.10*simplicity)+Math.min(12,coverage*16)));
   candidates.push({id:'proposal-'+(candidates.length+1),panels:clean,columns:columnCount,score,scoreBreakdown,explanations:[reason],warnings:[],metrics:{count:clean.length,meters:rnd(clean.reduce((s,p)=>s+2*(p.w+p.h),0)/100)},method});
  };
  // Family A: balanced regular rhythms, vary the number of columns.
  for(const count of unique([1,2,3,4,5,6,cols]).filter(n=>n>=1&&n<=8)){
   const width=(b.w-(count-1)*gapX)/count;if(width<min)continue;
   const panels=[];
   for(const z of safeZones)for(let i=0;i<count;i++){
    let p={x:left+i*(width+gapX),y:z.y,w:width,h:z.h,kind:z.kind};
    if(shape==='square'&&type==='decorative'){const side=Math.min(p.w,p.h);p={...p,x:p.x+(p.w-side)/2,y:p.y+(p.h-side)/2,w:side,h:side}}
    if(valid(p))panels.push(p);
   }
   if(panels.length===count*safeZones.length) add(panels,'regular','Rythme régulier avec '+count+' colonne(s).');
  }
  // Family B: opening-aware architectural bays. Use obstacle edges as anchors;
  // add a panel under windows and tall panels in side bays when possible.
  const edges=unique([left,right,...blocked.flatMap(o=>[clamp(o.x,left,right),clamp(o.x+o.w,left,right)])]);
  const bays=[];
  for(let i=0;i<edges.length-1;i++){
   const x=edges[i]+halfX,w=edges[i+1]-edges[i]-2*halfX;if(w<min)continue;
   for(const z of safeZones){
    const cuts=unique([z.y,z.y+z.h,...blocked.filter(o=>o.x<x+w&&o.x+o.w>x).flatMap(o=>[clamp(o.y,z.y,z.y+z.h),clamp(o.y+o.h,z.y,z.y+z.h)])]);
    let free=[];
    for(let j=0;j<cuts.length-1;j++){
     const p={x,y:cuts[j]+halfY,w,h:cuts[j+1]-cuts[j]-2*halfY,kind:z.kind};
     if(valid(p))free.push(p);
    }
    // Merge vertically adjacent bands where there is no obstacle.
    const merged=[];
    for(const p of free){const prev=merged[merged.length-1];if(prev&&Math.abs(prev.y+prev.h+2*halfY-p.y)<.1){const candidate={...prev,h:p.y+p.h-prev.y};if(valid(candidate)){prev.h=candidate.h;continue}}merged.push({...p})}
    bays.push(...merged);
   }
  }
  // Consolidate horizontal neighboring bays with the same vertical bounds,
  // but never cross a blocked rectangle.
  function combine(items){
   const result=items.map(p=>({...p}));let changed=true;
   while(changed){changed=false;outer:for(let i=0;i<result.length;i++)for(let j=i+1;j<result.length;j++){
    const a=result[i],c=result[j];
    if(Math.abs(a.y-c.y)>.1||Math.abs(a.h-c.h)>.1)continue;
    const l=Math.min(a.x,c.x),r=Math.max(a.x+a.w,c.x+c.w);
    if(r-l>a.w+c.w+Math.max(10,gapX))continue;
    const p={...a,x:l,w:r-l};if(valid(p)){result.splice(j,1);result[i]=p;changed=true;break outer}
   }}
   return result;
  }
  const merged=combine(bays);
  // Architectural dado candidates: split the wall into horizontal free runs
  // for each zone, then choose a sensible number of panels in each run.
  if(type==='base'||type==='mixed'){
   const selected=[],wide=[];
   for(const z of safeZones){
    const xCuts=unique([left,right,...blocked.flatMap(o=>[clamp(o.x,left,right),clamp(o.x+o.w,left,right)])]);
    const runs=[];
    for(let i=0;i<xCuts.length-1;i++){
     const a=xCuts[i],c=xCuts[i+1],p={x:a+halfX,y:z.y,w:c-a-2*halfX,h:z.h,kind:z.kind};
     if(!valid(p))continue;
     const previous=runs[runs.length-1];
     if(previous&&Math.abs(previous[1]-a)<.01)previous[1]=c;
     else runs.push([a,c]);
    }
    for(const [a,c] of runs){
     const span=c-a-2*halfX;
     const count=Math.max(1,Math.min(5,Math.round(span/95)));
     const width=(span-(count-1)*gapX)/count;
     const pieces=Array.from({length:count},(_,i)=>({x:a+halfX+i*(width+gapX),y:z.y,w:width,h:z.h,kind:z.kind}));
     if(pieces.every(valid))selected.push(...pieces);
     const single={x:a+halfX,y:z.y,w:span,h:z.h,kind:z.kind};
     if(valid(single))wide.push(single);
    }
   }
   add(selected,'dado-adaptive',type==='base'?'Soubassement adapté aux ouvertures, à hauteur commune.':'Panneaux hauts et bas adaptés aux ouvertures.');
   add(wide,'dado-wide','Variante avec panneaux plus larges.');
  }

  // Full-height free runs per typology band, subdivided proportionally.
  // Use the same anchors in each band when the openings intersect both.
  const runsByZone=safeZones.map(z=>{
   const intervals=blocked.filter(o=>o.y<z.y+z.h-1e-6&&o.y+o.h>z.y+1e-6).map(o=>[Math.max(left,o.x),Math.min(right,o.x+o.w)]).filter(([a,c])=>c>a).sort((a,c)=>a[0]-c[0]);
   const runs=[];let cursor=left;
   for(const [a,c] of intervals){if(a>cursor)runs.push([cursor,a]);cursor=Math.max(cursor,c);}
   if(cursor<right)runs.push([cursor,right]);
   return {z,runs:runs.filter(([a,c])=>c-a>=min)};
  });
  for(const target of unique([1,2,3,4,5,6,7,8,cols]).filter(n=>n>=1&&n<=8)){
   const panels=[];let possible=true;
   for(const {z,runs} of runsByZone){
    if(!runs.length)continue;
    const total=runs.reduce((sum,[a,c])=>sum+c-a,0);
    // Equal-width bays receive equal counts; do not force an odd count
    // onto a symmetric pair simply to satisfy a nominal grid.
    for(const [a,c] of runs){
     const span=c-a;
     const capacity=Math.floor((span+gapX)/(min+gapX));
     const count=Math.max(1,Math.min(capacity,Math.round(target*span/total)));
     const width=(span-(count-1)*gapX)/count;
     for(let i=0;i<count;i++){
      let p={x:a+i*(width+gapX),y:z.y,w:width,h:z.h,kind:z.kind};
      if(shape==='square'&&type==='decorative'){const side=Math.min(width,z.h);p={...p,x:p.x+(width-side)/2,y:p.y+(z.h-side)/2,w:side,h:side};}
      if(!valid(p)){possible=false;break;}panels.push(p);
     }
    }
   }
   if(possible)add(panels,'zone-rhythm','Cadres répartis dans les zones disponibles.');
  }
  // Explore common target widths, including narrow bays beside radiators.
  for(const targetWidth of [35,45,55,65,75,90,110,140]){
   const panels=[];
   for(const {z,runs} of runsByZone)for(const [a,c] of runs){
    const span=c-a,capacity=Math.floor((span+gapX)/(min+gapX));
    const count=Math.max(1,Math.min(8,capacity,Math.round((span+gapX)/(targetWidth+gapX))));
    const width=(span-(count-1)*gapX)/count;
    for(let i=0;i<count;i++){
     let p={x:a+i*(width+gapX),y:z.y,w:width,h:z.h,kind:z.kind};
     if(shape==='square'&&type==='decorative'){const side=Math.min(width,z.h);p={...p,x:p.x+(width-side)/2,y:p.y+(z.h-side)/2,w:side,h:side};}
     panels.push(p);
    }
   }
   if(panels.every(valid))add(panels,'zone-width','Cadres ajustés à la largeur des zones disponibles.');
  }
  add(merged,'architectural','Cadres adaptés aux axes des portes et fenêtres.');
  add(bays,'architectural-detail','Cadres indépendants dans les espaces disponibles.');
  // Family C: prefer strong tall panels and a short panel below the window.
  const tall=merged.filter(p=>p.h>=Math.max(min,b.h*.48));
  const short=merged.filter(p=>p.h<Math.max(min,b.h*.48)&&p.w>=min*1.5);
  add([...tall,...short],'architectural-mixed','Panneaux verticaux et cadres sous les fenêtres.');
  // Rank only valid proposals; stable tie-breaker by fewer panels.
  // Prefer candidates that occupy every usable full-height run, when feasible.
  const complete=p=>runsByZone.every(({z,runs})=>runs.every(([a,c])=>p.panels.some(q=>q.kind===z.kind&&q.x>=a-.02&&q.x+q.w<=c+.02&&q.y<z.y+z.h&&q.y+q.h>z.y)));
  const eligible=candidates.some(complete)?candidates.filter(complete):candidates;
  eligible.sort((a,c)=>c.score-a.score||a.panels.length-c.panels.length||a.id.localeCompare(c.id));
  // Variants represent different column counts, not unrelated algorithms.
  const perColumn=new Map();
  for(const candidate of eligible)if(!perColumn.has(candidate.columns))perColumn.set(candidate.columns,candidate);
  // Avoid alternatives that leave most of the usable wall undecorated.
  const ranked=[...perColumn.values()].sort((a,c)=>c.score-a.score);
  const bestCoverage=Math.max(0,...ranked.map(p=>p.panels.reduce((sum,r)=>sum+r.w*r.h,0)));
  const distinct=ranked.filter(p=>{
    const covered=p.panels.reduce((sum,r)=>sum+r.w*r.h,0);
    if(bestCoverage>0&&covered<bestCoverage*.58)return false;
    if(obstacles.length&&ranked.some(q=>q.panels.length>=4)&&p.panels.length<=2&&covered<bestCoverage*.80)return false;
    return true;
  });
  // A visually indistinguishable alternative is not a genuine proposal.
  // In particular, obstacle-derived x-centres may differ while the same
  // seven frames are shown. Do not offer those as separate column options.
  const meaningful=[];
  for(const p of distinct){
   if(meaningful.some(q=>q.panels.length===p.panels.length && q.columns===p.columns))continue;
   meaningful.push(p);
  }
  return {candidates:meaningful,recommendedCandidateId:meaningful[0]?.id||null,warnings:meaningful.length?[]:['Aucune composition réalisable avec les contraintes actuelles.']};
 }
 function generate(input){const r=propose(input),c=r.candidates[0];return {panels:c?.panels||[],warnings:r.warnings,candidates:r.candidates,recommendedCandidateId:r.recommendedCandidateId}}
 return {propose,generate,overlaps:overlap};
})();