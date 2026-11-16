/* Street Stories — main.js (shared by all pages; every feature is guarded) */
(()=>{
'use strict';
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const B=document.body;
const safe=(fn)=>{try{fn()}catch(e){console.warn(e)}};

/* ---------- split headings into masked words ---------- */
safe(()=>$$('.split-words').forEach(el=>{
  const wrap=t=>{const w=document.createElement('span');w.className='w';const i=document.createElement('span');i.append(t);w.append(i);return w};
  const walk=n=>{[...n.childNodes].forEach(c=>{
    if(c.nodeType===3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t))f.append(' ');else f.append(wrap(t))});c.replaceWith(f)}
    else if(c.nodeType===1&&c.classList.contains('glob')){const ph=document.createComment('');c.replaceWith(ph);ph.replaceWith(wrap(c))}
    else if(c.nodeType===1)walk(c)})};
  walk(el);
  const hero=!!el.closest('.hero,.phero');
  $$('.w>span',el).forEach((s,i)=>s.style.transitionDelay=(hero?.2:0)+i*.055+'s');
}));

/* ---------- loader (home, first visit of the session only) ---------- */
let started=false;
const start=()=>{if(started)return;started=true;const l=$('#loader');if(l){l.classList.add('done');setTimeout(()=>l.remove(),1100)}B.classList.remove('loading');B.classList.add('ready');setTimeout(counters,l?1300:500)};
safe(()=>{
  const l=$('#loader');let seen=false;try{seen=sessionStorage.getItem('ss_seen')==='1';sessionStorage.setItem('ss_seen','1')}catch(e){}
  if(!l||RM||seen){if(l)l.remove();start();return}
  const pct=$('#pct');let p=0;const tick=()=>{p+=Math.max(1.5,(100-p)*.12);if(p>=99.5)p=100;pct.textContent=Math.round(p);if(p<100)setTimeout(tick,26);else setTimeout(start,180)};tick();
  setTimeout(start,4000); /* safety net */
});
if(!started&&!$('#loader'))start();

/* ---------- counters ---------- */
function counters(){$$('[data-count]').forEach(el=>{const to=+el.dataset.count,suf=el.dataset.suffix||'';if(RM){el.textContent=to+suf;return}const t0=performance.now();const f=t=>{const k=Math.min(1,(t-t0)/1300),e=1-Math.pow(1-k,4);el.textContent=Math.round(to*e)+suf;if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)})}

/* ---------- typewriter ---------- */
safe(()=>{const ty=$('#typed');if(!ty)return;const words=['somsa in Tashkent.','pad thai in Bangkok.','bánh mì in Hanoi.','jianbing in Beijing.','palov at a wedding.'];
  if(RM){ty.textContent=words[0];return}
  let wi=0,ci=0,del=false;const type=()=>{const w=words[wi];ty.textContent=w.slice(0,ci)||'​';if(!del&&ci<w.length){ci++;setTimeout(type,70)}else if(!del){del=true;setTimeout(type,1700)}else if(ci>0){ci--;setTimeout(type,32)}else{del=false;wi=(wi+1)%words.length;setTimeout(type,320)}};setTimeout(type,1800)});

/* ---------- embers (only animates while the hero is on screen) ---------- */
safe(()=>{const cv=$('#embers');if(!cv||RM)return;const cx=cv.getContext('2d');let W,H,parts=[],run=false;
  const rs=()=>{W=cv.width=cv.offsetWidth;H=cv.height=cv.offsetHeight};rs();addEventListener('resize',rs,{passive:true});
  const N=innerWidth<700?22:46;
  const mk=(any)=>({x:Math.random()*W,y:any?Math.random()*H:H+20,r:Math.random()*1.8+.7,vy:Math.random()*.9+.4,vx:(Math.random()-.5)*.4,ph:Math.random()*6.28,c:Math.random()<.7?'255,122,61':'242,177,52'});
  for(let i=0;i<N;i++)parts.push(mk(true));
  const draw=()=>{if(!run)return;cx.clearRect(0,0,W,H);for(let i=0;i<parts.length;i++){const q=parts[i];q.ph+=.03;q.y-=q.vy;q.x+=q.vx+Math.sin(q.ph)*.35;const a=Math.max(0,Math.min(1,q.y/H))*.85;
      cx.fillStyle='rgba('+q.c+','+a*.22+')';cx.beginPath();cx.arc(q.x,q.y,q.r*3.2,0,6.28);cx.fill();
      cx.fillStyle='rgba('+q.c+','+a+')';cx.beginPath();cx.arc(q.x,q.y,q.r,0,6.28);cx.fill();
      if(q.y<-10)parts[i]=mk(false)}requestAnimationFrame(draw)};
  let vis=true;const upd=()=>{const want=vis&&!document.hidden;if(want&&!run){run=true;requestAnimationFrame(draw)}else if(!want)run=false};
  new IntersectionObserver(e=>{vis=e[0].isIntersecting;upd()}).observe(cv);document.addEventListener('visibilitychange',upd)});

/* ---------- magnetic buttons + tilt cards (desktop only) ---------- */
safe(()=>{if(!fine||RM)return;
  $$('.mag').forEach(b=>{b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.22)+'px,'+((e.clientY-r.top-r.height/2)*.3)+'px)'});b.addEventListener('mouseleave',()=>{b.style.transform=''})});
  $$('.tilt').forEach(c=>{c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;c.style.setProperty('--mx',x*100+'%');c.style.setProperty('--my',y*100+'%');c.style.transform='rotateY('+((x-.5)*10)+'deg) rotateX('+((.5-y)*10)+'deg) translateY(-6px)'});c.addEventListener('mouseleave',()=>{c.style.transform=''})})});

/* ---------- reveal on scroll ---------- */
safe(()=>{
  const show=el=>{el.classList.add('in');$$('.split-words',el).forEach(h=>h.classList.add('in'))};
  if(!('IntersectionObserver' in window)||RM){$$('.rv,.rvc').forEach(show);$$('.split-words').forEach(h=>h.classList.add('in'));return}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;const sib=[...el.parentElement.children].filter(x=>x.matches('.rv'));const d=sib.length>1?Math.min(sib.indexOf(el),8)*90:0;setTimeout(()=>show(el),d);io.unobserve(el)}),{threshold:.08,rootMargin:'0px 0px -30px 0px'});
  $$('.rv').forEach(el=>io.observe(el));
  /* .rvc elements start fully clipped, so watch their parent instead */
  const parents=new Set($$('.rvc').map(e=>e.parentElement));
  const pio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;pio.unobserve(e.target);[...e.target.children].filter(x=>x.matches('.rvc')).forEach((c,i)=>setTimeout(()=>show(c),i*120))}),{threshold:0,rootMargin:'0px 0px -60px 0px'});
  parents.forEach(p=>pio.observe(p));
  $$('.split-words').forEach(h=>{if(!h.closest('.rv,.rvc,.hero,.phero'))io.observe(h)});
  $$('.pill').forEach((p,i)=>p.style.transitionDelay=.2+(i%8)*.07+'s');
  $$('.av').forEach((a,i)=>a.style.transitionDelay=i*.045+'s');
  /* safety: never leave content hidden */
  setTimeout(()=>$$('.rv:not(.in),.rvc:not(.in)').forEach(el=>{const r=(el.matches('.rvc')?el.parentElement:el).getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)show(el)}),2500);
});

/* ---------- statement: words light up while scrolling ---------- */
let sw=[];const st=$('#statement');
safe(()=>{if(!st)return;[...st.childNodes].forEach(n=>{const hl=n.nodeType===1;const f=document.createDocumentFragment();n.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){f.append(' ');return}const s=document.createElement('span');s.className='sw'+(hl?' hl':'');s.textContent=t;sw.push(s);f.append(s)});n.replaceWith(f)})});

/* ---------- marquee ---------- */
const tracks=[];let vel=0;
safe(()=>{$$('.track').forEach(t=>{const html=t.innerHTML;t.innerHTML=html+html+html+html;const o={el:t,x:0,base:+t.dataset.speed||.6,vis:false,w:0};o.w=t.scrollWidth/4;if(o.base<0)o.x=-o.w;tracks.push(o);new IntersectionObserver(e=>{o.vis=e[0].isIntersecting}).observe(t.parentElement)});
  if(!tracks.length||RM)return;
  addEventListener('resize',()=>tracks.forEach(o=>o.w=o.el.scrollWidth/4),{passive:true});
  const loop=()=>{if(!document.hidden)for(const t of tracks){if(!t.vis)continue;t.x-=t.base*(1+Math.min(Math.abs(vel)*.12,5));if(t.base>0&&t.x<=-t.w)t.x+=t.w;if(t.base<0&&t.x>=0)t.x-=t.w;t.el.style.transform='translate3d('+t.x+'px,0,0)'}vel*=.9;requestAnimationFrame(loop)};requestAnimationFrame(loop)});

/* ---------- scroll-driven bits ---------- */
const nav=$('#nav'),bar=$('#progress'),heroBg=$('#heroBg'),pl=$('#pathLine'),pw=$('#pathWrap'),steps=$$('.step'),parImg=$('#parImg'),totop=$('#totop'),circ=totop&&$('circle',totop),mobile=$('#mobile');
let lastY=scrollY,ticking=false,mxh=0,myh=0;
const mapHooks=[];
const onScroll=()=>{ticking=false;const y=scrollY,h=Math.max(1,document.documentElement.scrollHeight-innerHeight),k=Math.min(1,y/h);
  if(bar)bar.style.transform='scaleX('+k+')';
  if(nav){nav.classList.toggle('scrolled',y>30);nav.classList.toggle('hide',y>lastY&&y>400&&!(mobile&&mobile.classList.contains('open')))}
  vel=y-lastY;lastY=y;
  if(heroBg&&!RM&&y<innerHeight*1.2)heroBg.style.transform='translate3d('+mxh+'px,'+(y*.3+myh)+'px,0) scale(1.08)';
  if(st&&sw.length){const r=st.getBoundingClientRect();if(r.bottom>-200&&r.top<innerHeight+200){const prog=Math.min(1,Math.max(0,(innerHeight*.85-r.top)/(r.height+innerHeight*.35)));const n=RM?sw.length:Math.floor(prog*sw.length*1.15);for(let i=0;i<sw.length;i++)sw[i].classList.toggle('lit',i<n)}}
  if(pw&&steps.length){const pr=pw.getBoundingClientRect();const pp=RM?1:Math.min(1,Math.max(0,(innerHeight*.82-pr.top)/(pr.height*.9)));if(pl)pl.style.transform='scaleX('+pp+')';const narrow=innerWidth<1050;steps.forEach((s,i)=>{const on=narrow?s.getBoundingClientRect().top<innerHeight*.9:pp>=i/7.5;if(on)s.classList.add('on')})}
  if(parImg&&!RM){const ir=parImg.parentElement.getBoundingClientRect();if(ir.bottom>0&&ir.top<innerHeight)parImg.style.transform='translate3d(0,'+((ir.top/innerHeight)*-10)+'%,0)'}
  if(totop){totop.classList.toggle('show',y>700);if(circ)circ.style.strokeDashoffset=138-138*k}
  for(const f of mapHooks)f();
};
addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
addEventListener('resize',()=>{if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
safe(()=>{const hero=$('#hero');if(hero&&heroBg&&fine&&!RM)hero.addEventListener('mousemove',e=>{mxh=(e.clientX/innerWidth-.5)*-20;myh=(e.clientY/innerHeight-.5)*-14;if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true})});

/* ---------- navigation ---------- */
safe(()=>{const b=$('#burger');if(b&&mobile){const set=o=>{b.classList.toggle('open',o);mobile.classList.toggle('open',o);b.setAttribute('aria-expanded',o);b.setAttribute('aria-label',o?'Close menu':'Open menu');B.style.overflow=o?'hidden':'';$$('a',mobile).forEach((a,i)=>a.style.transitionDelay=o?Math.min(.15+i*.025,.7)+'s':'0s')};
    b.addEventListener('click',()=>set(!b.classList.contains('open')));$$('a',mobile).forEach(a=>a.addEventListener('click',()=>set(false)));addEventListener('keydown',e=>{if(e.key==='Escape')set(false)})}
  $$('.dd>button').forEach(btn=>{const dd=btn.parentElement;btn.addEventListener('click',e=>{e.stopPropagation();const o=!dd.classList.contains('open');$$('.dd.open').forEach(x=>x.classList.remove('open'));dd.classList.toggle('open',o);btn.setAttribute('aria-expanded',o)})});
  document.addEventListener('click',()=>$$('.dd.open').forEach(x=>x.classList.remove('open')));
  if(totop)totop.addEventListener('click',()=>scrollTo({top:0,behavior:RM?'auto':'smooth'}));
  $$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');if(id.length<2)return;const t=document.getElementById(id.slice(1));if(!t)return;e.preventDefault();scrollTo({top:id==='#top'?0:t.getBoundingClientRect().top+scrollY-84,behavior:RM?'auto':'smooth'});try{history.replaceState(null,'',id)}catch(_){}}))});

/* ---------- toast ---------- */
const toast=m=>{const t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2600)};

/* ---------- talking stickers ---------- */
let say=()=>{};
safe(()=>{if(!$('[data-stk]'))return;let uid=0;
const face=(cx,cy)=>'<ellipse cx="'+(cx-27)+'" cy="'+(cy+9)+'" rx="8" ry="5" fill="rgba(255,110,110,.55)"/><ellipse cx="'+(cx+27)+'" cy="'+(cy+9)+'" rx="8" ry="5" fill="rgba(255,110,110,.55)"/><g class="eyes"><circle cx="'+(cx-16)+'" cy="'+(cy-9)+'" r="9.5" fill="#fff"/><circle cx="'+(cx+16)+'" cy="'+(cy-9)+'" r="9.5" fill="#fff"/><circle class="pupil" data-x="'+(cx-16)+'" data-y="'+(cy-9)+'" cx="'+(cx-16)+'" cy="'+(cy-9)+'" r="5" fill="#1d120b"/><circle class="pupil" data-x="'+(cx+16)+'" data-y="'+(cy-9)+'" cx="'+(cx+16)+'" cy="'+(cy-9)+'" r="5" fill="#1d120b"/></g><g class="mouth"><ellipse class="m" cx="'+cx+'" cy="'+(cy+11)+'" rx="10" ry="3" fill="#3a1408"/><ellipse class="tg" cx="'+cx+'" cy="'+(cy+14)+'" rx="5.5" ry="0" fill="#ff7b7b"/></g>';
const ART={
 samsa:()=>{const g='gS'+(uid++);return '<svg viewBox="0 0 160 150" aria-hidden="true"><defs><linearGradient id="'+g+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7c862"/><stop offset="1" stop-color="#d47b25"/></linearGradient></defs><path d="M80 12C87 12 91 17 95 24L149 117C156 130 149 140 134 140H26C11 140 4 130 11 117L65 24C69 17 73 12 80 12Z" fill="url(#'+g+')"/><path d="M20 132q8 6 16 0q8 6 16 0q8 6 16 0q8 6 16 0q8 6 16 0q8 6 16 0q8 6 16 0" stroke="#b8621a" stroke-width="2.5" fill="none" opacity=".6"/><g fill="#fff3d0"><ellipse cx="76" cy="40" rx="2.4" ry="4" transform="rotate(20 76 40)"/><ellipse cx="87" cy="52" rx="2.4" ry="4" transform="rotate(-30 87 52)"/><ellipse cx="70" cy="60" rx="2.4" ry="4" transform="rotate(60 70 60)"/><ellipse cx="95" cy="70" rx="2.4" ry="4" transform="rotate(10 95 70)"/><ellipse cx="62" cy="76" rx="2.4" ry="4" transform="rotate(-50 62 76)"/></g>'+face(80,102)+'</svg>'},
 banhmi:()=>{const g='gB'+(uid++);return '<svg viewBox="0 0 160 150" aria-hidden="true"><defs><linearGradient id="'+g+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eeb058"/><stop offset="1" stop-color="#b8681e"/></linearGradient></defs><path d="M20 72l7-15 7 12 7-17 7 15 7-14 7 15 7-17 7 15 7-14 7 16 7-15 7 14 7-16 7 15 7-13 4 14z" fill="#3e9f7a"/><ellipse cx="44" cy="62" rx="7" ry="4" fill="#e4502f" transform="rotate(-25 44 62)"/><ellipse cx="118" cy="60" rx="9" ry="5" fill="#9fd36b" transform="rotate(15 118 60)"/><path d="M8 94C8 64 40 56 80 56S152 64 152 94C152 120 120 130 80 130S8 120 8 94Z" fill="url(#'+g+')"/><g stroke="#fbe2b0" stroke-width="3" stroke-linecap="round" fill="none" opacity=".7"><path d="M26 76q8-6 16-4"/><path d="M118 72q8-2 16 4"/></g>'+face(80,96)+'</svg>'},
 baozi:()=>{const g='gZ'+(uid++);return '<svg viewBox="0 0 160 150" aria-hidden="true"><defs><radialGradient id="'+g+'" cx=".45" cy=".35" r=".75"><stop offset="0" stop-color="#fffaf1"/><stop offset="1" stop-color="#e6d3b4"/></radialGradient></defs><g stroke="#cbbca4" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"><path d="M58 30c-5-7 5-11 0-18"/><path d="M80 26c-5-7 5-11 0-18"/><path d="M102 30c-5-7 5-11 0-18"/></g><path d="M16 120C12 72 42 42 80 40C118 42 148 72 144 120C122 136 38 136 16 120Z" fill="url(#'+g+')"/><g stroke="#d4bf9c" stroke-width="2.5" fill="none" stroke-linecap="round"><path d="M80 44C72 52 62 56 50 56"/><path d="M80 44C88 52 98 56 110 56"/><path d="M80 44C76 54 70 62 60 66"/><path d="M80 44C84 54 90 62 100 66"/></g><circle cx="80" cy="44" r="4" fill="#e4502f"/>'+face(80,98)+'</svg>'},
 padthai:()=>'<svg viewBox="0 0 160 150" aria-hidden="true"><g stroke="#7a4a26" stroke-width="5" stroke-linecap="round"><path d="M104 74L150 14"/><path d="M114 76L156 22"/></g><g stroke="#f2c46a" stroke-width="6" fill="none" stroke-linecap="round"><path d="M24 80C30 62 42 76 50 60S66 72 74 58S90 72 98 60S114 74 120 62S134 70 138 80"/><path d="M30 80C38 70 46 80 56 68S72 78 82 66S100 78 110 68S128 76 132 80"/></g><path d="M100 58c10-12 26-6 24 6c-1 8-10 10-14 6" stroke="#ff8a5c" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M30 70l14-16 10 18z" fill="#9fd36b" stroke="#5e9e3a" stroke-width="2"/><path d="M12 80H148C148 120 120 142 80 142S12 120 12 80Z" fill="#e4502f"/><ellipse cx="80" cy="80" rx="68" ry="7" fill="#c23a1f"/><path d="M16 92H144" stroke="#fff" stroke-width="3" stroke-dasharray="8 6" opacity=".55"/>'+face(80,112)+'</svg>'
};
$$('[data-stk]').forEach(el=>{const a=ART[el.dataset.stk];if(a)el.insertAdjacentHTML('afterbegin',a())});
/* eyes follow the pointer */
if(fine&&!RM){let px=innerWidth/2,py=innerHeight/2,rq=false;const look=()=>{rq=false;$$('.stk').forEach(s=>{const r=s.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight||!r.width)return;const sc=r.width/160;$$('.pupil',s).forEach(p=>{const ex=r.left+(+p.dataset.x)*sc,ey=r.top+(+p.dataset.y)*sc,dx=px-ex,dy=py-ey,d=Math.hypot(dx,dy)||1,k=Math.min(4.2,d/40);p.setAttribute('cx',+p.dataset.x+dx/d*k);p.setAttribute('cy',+p.dataset.y+dy/d*k)})})};
  addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY;if(!rq){rq=true;requestAnimationFrame(look)}},{passive:true})}
/* mouth */
const timers=new WeakMap();
const mouthOn=s=>{if(timers.get(s))return;s.classList.add('talking');const m=$('.m',s),tg=$('.tg',s);if(!m)return;const cy=+m.getAttribute('cy');timers.set(s,setInterval(()=>{const ry=2+Math.random()*9;m.setAttribute('ry',ry);m.setAttribute('rx',8+Math.random()*4);tg.setAttribute('ry',ry>5?Math.min(4,ry*.4):0);tg.setAttribute('cy',cy+ry*.55)},95))};
const mouthOff=s=>{clearInterval(timers.get(s));timers.delete(s);s.classList.remove('talking');const m=$('.m',s);if(m){m.setAttribute('ry',3);m.setAttribute('rx',10);$('.tg',s).setAttribute('ry',0)}};
say=(s,html,len,ms)=>{const bub=$('.bubble',s)||$('.bubble',s.parentElement);if(!bub)return;bub.innerHTML=html;bub.classList.add('show');mouthOn(s);const dur=ms||Math.max(900,len*55);clearTimeout(s._t1);clearTimeout(s._t2);s._t1=setTimeout(()=>mouthOff(s),dur);s._t2=setTimeout(()=>bub.classList.remove('show'),dur+1800)};
/* hero stickers chat + drag */
const hs=$$('.hero-stk .stk');
if(hs.length>1){const lines=[[0,'Salom! 👋'],[1,'Xin chào! Hungry yet?'],[0,'Drag me around!'],[1,'Tradition tastes better.'],[0,'Welcome to the street!']];let li=0,heroVis=true;new IntersectionObserver(e=>heroVis=e[0].isIntersecting).observe(hs[0]);
  const chat=()=>{if(B.classList.contains('ready')&&heroVis&&!document.hidden&&hs[0].offsetParent){const l=lines[li++%lines.length];say(hs[l[0]],l[1],l[1].length)}setTimeout(chat,3900)};setTimeout(chat,2400);
  hs.forEach(s=>s.addEventListener('click',()=>{if(s._moved)return;say(s,'Hey, that tickles! 😆',20)}))}
$$('.hero-stk').forEach(el=>{let sx,sy,ox,oy,on=false;const s=$('.stk',el);
  el.addEventListener('pointerdown',e=>{on=true;try{el.setPointerCapture(e.pointerId)}catch(_){}const r=el.getBoundingClientRect(),pr=el.offsetParent.getBoundingClientRect();ox=r.left-pr.left;oy=r.top-pr.top;sx=e.clientX;sy=e.clientY;s._moved=false;el.classList.add('drag');el.style.left=ox+'px';el.style.top=oy+'px';el.style.right='auto';el.style.bottom='auto'});
  el.addEventListener('pointermove',e=>{if(!on)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)+Math.abs(dy)>4)s._moved=true;el.style.left=ox+dx+'px';el.style.top=oy+dy+'px'});
  const end=()=>{on=false};el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end)});
/* crew */
const CREW={
 samsa:{nat:'Assalomu alaykum!',tr:'Hello! (Uzbek)',lang:'uz-UZ',name:'Uzbek',fact:'I’m baked on the hot wall of a clay <b>tandir</b> oven. My cousin palov joined UNESCO’s heritage list in 2016!'},
 banhmi:{nat:'Xin chào!',tr:'Hello! (Vietnamese)',lang:'vi-VN',name:'Vietnamese',fact:'My name simply means <b>“bread”</b>. A French baguette became Vietnamese — and I entered the Oxford English Dictionary in 2011.'},
 padthai:{nat:'สวัสดีครับ',tr:'Sawasdee krap! (Thai)',lang:'th-TH',name:'Thai',fact:'In the late 1930s Thailand’s government promoted me to build a <b>modern national identity</b>.'},
 baozi:{nat:'你好!',tr:'Nǐ hǎo! (Mandarin)',lang:'zh-CN',name:'Mandarin',fact:'<b>Bāo (包)</b> means “to wrap”. I’m the steamed bun people grab on the way to work.'}};
$$('.crew-item').forEach(it=>{const d=CREW[it.dataset.k],s=$('.stk',it),bub=$('.bubble',it);if(!d||!s||!bub)return;
  const greet=()=>{bub.classList.remove('wide');say(s,'<span class="nat">'+d.nat+'</span>'+d.tr,d.nat.length+8,1600)};
  const on=(a,fn)=>{const b=$('[data-a='+a+']',it);if(b)b.addEventListener('click',e=>{e.stopPropagation();fn()})};
  on('hi',greet);
  on('fact',()=>{bub.classList.add('wide');say(s,d.fact,d.fact.replace(/<[^>]+>/g,'').length*.7)});
  on('hear',()=>{try{const ss=window.speechSynthesis;if(!ss||typeof SpeechSynthesisUtterance==='undefined')throw 0;const voices=ss.getVoices();const v=voices.find(x=>x.lang.replace('_','-').toLowerCase().startsWith(d.lang.slice(0,2)));if(voices.length&&!v){toast('No '+d.name+' voice on this device — showing the greeting instead');greet();return}
      const u=new SpeechSynthesisUtterance(d.nat.replace(/!/g,''));u.lang=d.lang;if(v)u.voice=v;bub.classList.remove('wide');bub.innerHTML='<span class="nat">'+d.nat+'</span>'+d.tr;bub.classList.add('show');mouthOn(s);const done=()=>{mouthOff(s);setTimeout(()=>bub.classList.remove('show'),1200)};u.onend=done;u.onerror=done;ss.cancel();ss.speak(u);setTimeout(done,3500)}catch(_){greet()}});
  it.addEventListener('click',greet);it._greet=greet});
const crew=$('.crew');if(crew&&'IntersectionObserver' in window){const cio=new IntersectionObserver(es=>{if(es[0].isIntersecting){$$('.crew-item').forEach((it,i)=>setTimeout(()=>it._greet&&it._greet(),500+i*900));cio.disconnect()}},{threshold:.35});cio.observe(crew)}
});

/* ---------- route map ---------- */
safe(()=>{const mapEl=$('.map'),cc=$('#ccIn'),rp=$('#rpath');if(!mapEl||!cc||!rp)return;
const CITIES={
 tashkent:{e:'🫓',n:'Tashkent',w:'Chorsu Bazaar · Uzbekistan',t:'Under the blue dome of Chorsu, vendors pull somsa from clay tandir ovens and stack round non bread. Food is bargained for in Uzbek and Russian at once — a daily sign of the city’s layered history.',d:['Somsa','Tandir non','Palov','Shashlik'],l:'country-uzbekistan.html'},
 beijing:{e:'🥞',n:'Beijing',w:'Hutong breakfast carts · China',t:'Before work, queues form at jianbing carts in the old hutong lanes. City campaigns to “tidy” the streets have pushed many carts indoors — raising the question of who gets to cook in public.',d:['Jianbing','Baozi','Chuan’r skewers'],l:'country-china.html'},
 hanoi:{e:'🥖',n:'Hanoi',w:'Old Quarter sidewalks · Vietnam',t:'Tiny plastic stools turn the sidewalk into a dining room. The French baguette, once a colonial import, became bánh mì — a symbol of how Vietnam made foreign food its own.',d:['Phở','Bún chả','Bánh mì'],l:'country-vietnam.html'},
 bangkok:{e:'🍜',n:'Bangkok',w:'Yaowarat (Chinatown) · Thailand',t:'Bangkok’s night markets are world-famous, and street cook Jay Fai earned a Michelin star in 2017. Yet the city has also tried to clear vendors from main roads — tradition and tourism pulling in different directions.',d:['Pad Thai','Som Tam','Moo Ping'],l:'country-thailand.html'}};
const order=['tashkent','beijing','hanoi','bangkok'];let cur='',sw_t;
const show=k=>{if(k===cur)return;cur=k;$$('.city').forEach(c=>c.classList.toggle('act',c.dataset.c===k));cc.classList.add('swap');clearTimeout(sw_t);sw_t=setTimeout(()=>{const d=CITIES[k];cc.innerHTML='<div class="stamp">'+d.e+'</div><h3>'+d.n+'</h3><div class="where">'+d.w+'</div><p>'+d.t+'</p><div class="dl">'+d.d.map(x=>'<span class="pill" style="opacity:1;transform:none">'+x+'</span>').join('')+'</div><a class="more" href="'+d.l+'">Open the case study →</a>';cc.classList.remove('swap')},220)};
$$('.city').forEach(c=>{c.addEventListener('click',()=>show(c.dataset.c));c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show(c.dataset.c)}})});
const pv=$('#cPrev'),nx=$('#cNext');if(pv)pv.addEventListener('click',()=>show(order[(order.indexOf(cur)+3)%4]));if(nx)nx.addEventListener('click',()=>show(order[(order.indexOf(cur)+1)%4]));
show('tashkent');
const cart=$('#cart'),L=rp.getTotalLength();rp.style.strokeDasharray=L;rp.style.strokeDashoffset=RM?0:L;let last='tashkent';
mapHooks.push(()=>{const r=mapEl.getBoundingClientRect();if(r.bottom<-100||r.top>innerHeight+100)return;const k=RM?1:Math.min(1,Math.max(0,(innerHeight*.85-r.top)/(r.height*1.1)));rp.style.strokeDashoffset=L*(1-k);const pt=rp.getPointAtLength(L*k);if(cart){cart.setAttribute('x',pt.x-22);cart.setAttribute('y',pt.y+14)}
  const reached=k>=.99?'bangkok':k>=.72?'hanoi':k>=.42?'beijing':'tashkent';if(reached!==last){last=reached;show(reached)}})});

/* ---------- before / after ---------- */
safe(()=>{const ba=$('#ba');if(!ba)return;const rng=$('input',ba);rng.addEventListener('input',()=>ba.style.setProperty('--pos',rng.value+'%'));
  if(RM||!('IntersectionObserver' in window))return;const io=new IntersectionObserver(es=>{if(!es[0].isIntersecting)return;io.disconnect();const t0=performance.now();const f=t=>{const k=(t-t0)/2200;if(k>=1){rng.value=50;ba.style.setProperty('--pos','50%');return}const v=50+Math.sin(k*Math.PI*2)*28;rng.value=v;ba.style.setProperty('--pos',v+'%');requestAnimationFrame(f)};requestAnimationFrame(f)},{threshold:.5});io.observe(ba)});

/* ---------- flip cards ---------- */
safe(()=>$$('.flip').forEach(f=>f.addEventListener('click',()=>{const o=f.classList.toggle('on');f.setAttribute('aria-pressed',o)})));

/* ---------- inner pages: table of contents ---------- */
safe(()=>{const toc=$('#toc'),art=$('.prose');if(!toc||!art)return;const hs=$$('h2',art);if(hs.length<2){const a=toc.closest('.toc');if(a)a.style.display='none';return}
  hs.forEach((h,i)=>{if(!h.id)h.id='s'+(i+1);const a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent;a.addEventListener('click',e=>{e.preventDefault();scrollTo({top:h.getBoundingClientRect().top+scrollY-90,behavior:RM?'auto':'smooth'})});toc.append(a)});
  const links=$$('a',toc);if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const i=hs.indexOf(e.target);links.forEach((l,j)=>l.classList.toggle('on',i===j))}}),{rootMargin:'-20% 0px -65% 0px'});hs.forEach(h=>io.observe(h))}});

/* ---------- filters (team roles, glossary / references search) ---------- */
safe(()=>{$$('[data-filter-group]').forEach(g=>{const target=$(g.dataset.filterGroup);if(!target)return;$$('button',g).forEach(b=>b.addEventListener('click',()=>{$$('button',g).forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)});const f=b.dataset.f;[...target.children].forEach(c=>{c.hidden=!(f==='all'||(c.dataset.tags||'').split(' ').includes(f))})}))});
  $$('[data-search]').forEach(inp=>{const target=$(inp.dataset.search),empty=$(inp.dataset.empty||'#none');if(!target)return;inp.addEventListener('input',()=>{const q=inp.value.trim().toLowerCase();let n=0;[...target.children].forEach(c=>{const ok=!q||c.textContent.toLowerCase().includes(q);c.hidden=!ok;if(ok)n++});if(empty)empty.hidden=n>0})})});

/* ---------- copy buttons ---------- */
safe(()=>$$('[data-copy]').forEach(b=>b.addEventListener('click',()=>{const txt=b.dataset.copy||location.href;const ok=()=>toast('Link copied ✦');try{navigator.clipboard.writeText(txt).then(ok,()=>toast(txt))}catch(e){toast(txt)}})));

/* ---------- placeholders that are not live yet ---------- */
safe(()=>$$('[data-soon]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();toast(el.dataset.soon||'Coming soon ✦')})));

onScroll();
})();
