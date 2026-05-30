
// ── CURSOR ──────────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{
  mx=e.clientX; my=e.clientY;
  cursor.style.left=mx+'px'; cursor.style.top=my+'px';
});
(function animRing(){
  rx+=(mx-rx)*0.12; ry+=(my-ry)*0.12;
  ring.style.left=rx+'px'; ring.style.top=ry+'px';
  requestAnimationFrame(animRing);
})();

// ── CANVAS BACKGROUND ──────────────────────────────────────
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W,H,nodes=[];
function resize(){ W=canvas.width=innerWidth; H=canvas.height=innerHeight; }
resize(); window.addEventListener('resize',resize);

class Node {
  constructor(){this.reset();}
  reset(){
    this.x=Math.random()*W; this.y=Math.random()*H;
    this.vx=(Math.random()-.5)*.3; this.vy=(Math.random()-.5)*.3;
    this.r=Math.random()*1.5+.5; this.a=Math.random();
  }
  update(){
    this.x+=this.vx; this.y+=this.vy;
    if(this.x<0||this.x>W||this.y<0||this.y>H) this.reset();
  }
}
for(let i=0;i<80;i++) nodes.push(new Node());

function drawCanvas(){
  ctx.clearRect(0,0,W,H);
  nodes.forEach(n=>n.update());
  // draw nodes
  nodes.forEach(n=>{
    ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(0,229,255,${n.a*.4})`; ctx.fill();
  });
  // draw connections
  for(let i=0;i<nodes.length;i++){
    for(let j=i+1;j<nodes.length;j++){
      const dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<120){
        ctx.beginPath();
        ctx.moveTo(nodes[i].x,nodes[i].y);
        ctx.lineTo(nodes[j].x,nodes[j].y);
        ctx.strokeStyle=`rgba(0,229,255,${(1-d/120)*.08})`;
        ctx.lineWidth=.5; ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawCanvas);
}
drawCanvas();

// ── NAV SCROLL ─────────────────────────────────────────────
window.addEventListener('scroll',()=>{
  document.getElementById('navbar').classList.toggle('scrolled',scrollY>60);
});

// ── REVEAL ON SCROLL ────────────────────────────────────────
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
},{threshold:.15});
reveals.forEach(r=>io.observe(r));

// ── STAT COUNTER ───────────────────────────────────────────
const stats = document.querySelectorAll('[data-target]');
const sio = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const el=e.target, target=parseFloat(el.dataset.target);
      const isFloat=target<10;
      let start=0, duration=1800, startTime=null;
      function tick(ts){
        if(!startTime) startTime=ts;
        const p=Math.min((ts-startTime)/duration,1);
        const ease=1-Math.pow(1-p,3);
        const val=start+(target-start)*ease;
        el.textContent=isFloat?val.toFixed(2):Math.round(val);
        if(p<1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      sio.unobserve(el);
    }
  });
},{threshold:.5});
stats.forEach(s=>sio.observe(s));

// ── SWAP LOGIC ──────────────────────────────────────────────
const tokens = [
  {name:'ETH', icon:'Ξ', cls:'eth', price:2847.5, balance:'2.4847'},
  {name:'USDC', icon:'$', cls:'usdc', price:1, balance:'1,240.00'},
  {name:'LINK', icon:'L', cls:'link', price:14.72, balance:'450.00'},
  {name:'MATIC', icon:'M', cls:'matic', price:0.847, balance:'8,000'},
  {name:'UNI', icon:'U', cls:'uni', price:7.34, balance:'320.50'},
  {name:'ARB', icon:'A', cls:'arb', price:1.14, balance:'5,200'},
];
let fromIdx=0, toIdx=1;
let walletConnected = false;

function updateTokenUI(){
  const f=tokens[fromIdx], t=tokens[toIdx];
  document.getElementById('from-icon').textContent=f.icon;
  document.getElementById('from-icon').className='token-icon '+f.cls;
  document.getElementById('from-name').textContent=f.name;
  document.getElementById('from-balance').textContent=f.balance;
  document.getElementById('to-icon').textContent=t.icon;
  document.getElementById('to-icon').className='token-icon '+t.cls;
  document.getElementById('to-name').textContent=t.name;
  document.getElementById('to-balance').textContent=t.balance;
  document.getElementById('r1').textContent=f.name;
  document.getElementById('r2').textContent=t.name;
  document.getElementById('route-rate').textContent=`1 ${f.name} = ${(tokens[fromIdx].price/tokens[toIdx].price).toFixed(4)} ${t.name}`;
  calcSwap();
}

function cycleToken(which){
  if(which==='from'){ fromIdx=(fromIdx+1)%tokens.length; if(fromIdx===toIdx) fromIdx=(fromIdx+1)%tokens.length; }
  else { toIdx=(toIdx+1)%tokens.length; if(toIdx===fromIdx) toIdx=(toIdx+1)%tokens.length; }
  updateTokenUI();
}

function flipTokens(){
  [fromIdx,toIdx]=[toIdx,fromIdx];
  const val=document.getElementById('to-amount').value;
  document.getElementById('from-amount').value=val||'';
  updateTokenUI();
}

function setMax(){
  const bal = tokens[fromIdx].balance.replace(',','');
  document.getElementById('from-amount').value=parseFloat(bal)||0;
  calcSwap();
}

function calcSwap(){
  const v=parseFloat(document.getElementById('from-amount').value)||0;
  const rate=tokens[fromIdx].price/tokens[toIdx].price;
  const out=(v*rate*0.9995).toFixed(tokens[toIdx].price>100?4:2);
  document.getElementById('to-amount').value=v>0?out:'';
  document.getElementById('from-usd').textContent=v>0?`≈ $${(v*tokens[fromIdx].price).toLocaleString('en',{maximumFractionDigits:2})}`:'≈ $0.00';
  document.getElementById('to-usd').textContent=v>0?`≈ $${(parseFloat(out)*tokens[toIdx].price).toLocaleString('en',{maximumFractionDigits:2})}`:'≈ $0.00';
  document.getElementById('route-info').style.display=v>0?'block':'none';
  document.getElementById('route-min').textContent=`${(parseFloat(out||0)*0.995).toFixed(4)} ${tokens[toIdx].name}`;
  updateSwapBtn();
}

function updateSwapBtn(){
  const v=parseFloat(document.getElementById('from-amount').value)||0;
  const btn=document.getElementById('swapBtn');
  if(!walletConnected){ btn.textContent='Connect Wallet to Swap'; return; }
  if(!v){ btn.textContent='Enter an amount'; return; }
  btn.textContent=`Swap ${tokens[fromIdx].name} → ${tokens[toIdx].name}`;
}

function handleSwap(){
  if(!walletConnected){ openModal(); return; }
  const v=parseFloat(document.getElementById('from-amount').value)||0;
  if(!v) return;
  const btn=document.getElementById('swapBtn');
  btn.textContent='Confirming…'; btn.style.opacity='.7';
  setTimeout(()=>{
    btn.textContent='Broadcasting…';
    setTimeout(()=>{
      btn.textContent=`Swap ${tokens[fromIdx].name} → ${tokens[toIdx].name}`;
      btn.style.opacity='1';
      document.getElementById('from-amount').value='';
      document.getElementById('to-amount').value='';
      document.getElementById('route-info').style.display='none';
      showToast(`Swapped successfully! View on Etherscan`);
    },1200);
  },1000);
}

// ── MODAL ──────────────────────────────────────────────────
function openModal(){ document.getElementById('connectModal').classList.add('open'); }
function closeModal(){ document.getElementById('connectModal').classList.remove('open'); }
document.getElementById('connectModal').addEventListener('click',e=>{ if(e.target===e.currentTarget) closeModal(); });

function connectWallet(name){
  closeModal();
  walletConnected=true;
  document.querySelector('.btn-connect').textContent='0x3f…a4e2';
  document.querySelector('.btn-connect').style.background='var(--surface2)';
  document.querySelector('.btn-connect').style.color='var(--text)';
  document.querySelector('.btn-connect').style.border='1px solid var(--border2)';
  document.querySelector('.btn-connect').style.boxShadow='none';
  updateSwapBtn();
  showToast(`${name} connected · Sepolia Testnet`);
}

// ── TOAST ──────────────────────────────────────────────────
function showToast(msg){
  const t=document.getElementById('toast');
  document.getElementById('toast-msg').textContent=msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3500);
}
