(function(){
  const INTRO_URL='https://learntospeak.github.io/Networking-game/side-scroller-intro/index.html?embed=terminal';
  const STORAGE_KEY='patch-ping-run:cyber-ops-briefing-seen:v1';

  function q(selector){return document.querySelector(selector)}

  function installStyles(){
    if(q('#pprCyberOpsBriefingStyles'))return;
    const style=document.createElement('style');
    style.id='pprCyberOpsBriefingStyles';
    style.textContent='.ppr-cyber-ops-overlay{position:fixed;inset:0;z-index:120;display:grid;place-items:center;background:rgba(2,6,23,.92);padding:14px}.ppr-cyber-ops-overlay[hidden]{display:none!important}.ppr-cyber-ops-shell{width:min(1180px,100%);height:min(780px,94vh);display:grid;grid-template-rows:auto 1fr;border:1px solid rgba(125,211,252,.34);border-radius:24px;background:#020617;box-shadow:0 24px 90px rgba(0,0,0,.58);overflow:hidden}.ppr-cyber-ops-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border-bottom:1px solid rgba(125,211,252,.22);background:linear-gradient(180deg,rgba(15,23,42,.98),rgba(2,6,23,.96))}.ppr-cyber-ops-kicker{margin:0;color:#67e8f9;font-size:11px;font-weight:1000;letter-spacing:.16em;text-transform:uppercase}.ppr-cyber-ops-bar h2{margin:2px 0 0;color:#f8fafc;font-size:22px}.ppr-cyber-ops-skip{min-height:40px;border-radius:12px;border:1px solid rgba(125,211,252,.3);background:#0f172a;color:#dbeafe;font-weight:900;padding:0 12px}.ppr-cyber-ops-frame{width:100%;height:100%;border:0;background:#020617}@media(max-width:760px){.ppr-cyber-ops-overlay{padding:6px}.ppr-cyber-ops-shell{height:96vh;border-radius:18px}.ppr-cyber-ops-bar h2{font-size:17px}.ppr-cyber-ops-kicker{font-size:9px}.ppr-cyber-ops-skip{min-height:38px}}';
    document.head.appendChild(style);
  }

  function closeIntro(){
    const overlay=q('#pprCyberOpsBriefingOverlay');
    const frame=q('#pprCyberOpsBriefingFrame');
    if(!overlay)return;
    overlay.hidden=true;
    if(frame)frame.src='about:blank';
    document.body.classList.remove('ppr-cyber-ops-open');
    try{sessionStorage.setItem(STORAGE_KEY,'1')}catch(error){}
  }

  function openIntro(){
    const overlay=q('#pprCyberOpsBriefingOverlay');
    const frame=q('#pprCyberOpsBriefingFrame');
    if(!overlay||!frame)return;
    frame.src=INTRO_URL;
    overlay.hidden=false;
    document.body.classList.add('ppr-cyber-ops-open');
  }

  function createIntro(){
    if(q('#pprCyberOpsBriefingOverlay'))return;
    const overlay=document.createElement('section');
    overlay.id='pprCyberOpsBriefingOverlay';
    overlay.className='ppr-cyber-ops-overlay';
    overlay.hidden=true;
    overlay.innerHTML='<div class="ppr-cyber-ops-shell"><div class="ppr-cyber-ops-bar"><div><p class="ppr-cyber-ops-kicker">Beginner Lab Intro</p><h2>Cyber Ops Briefing</h2></div><button id="pprCyberOpsBriefingSkip" class="ppr-cyber-ops-skip" type="button">Skip Intro</button></div><iframe id="pprCyberOpsBriefingFrame" class="ppr-cyber-ops-frame" title="Cyber Ops animated intro" loading="eager" allow="autoplay"></iframe></div>';
    document.body.appendChild(overlay);
    q('#pprCyberOpsBriefingSkip').addEventListener('click',closeIntro);
  }

  function shouldShow(){
    const params=new URLSearchParams(window.location.search);
    if(params.get('skipIntro')==='1')return false;
    if(params.get('intro')==='1')return true;
    try{return sessionStorage.getItem(STORAGE_KEY)!=='1'}catch(error){return true}
  }

  window.addEventListener('message',function(event){
    const frame=q('#pprCyberOpsBriefingFrame');
    const fromFrame=frame&&frame.contentWindow&&event.source===frame.contentWindow;
    if(!fromFrame)return;
    if(event.data&&event.data.type==='netlab:intro-complete')closeIntro();
  });

  function init(){
    installStyles();
    createIntro();
    if(shouldShow())setTimeout(openIntro,180);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();