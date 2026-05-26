(function(){
  const STORAGE_KEY = 'patchPingRunIntroSeen:v2';

  function q(selector){ return document.querySelector(selector); }

  function installStyles(){
    if(q('#pprIntroStyles')) return;
    const style = document.createElement('style');
    style.id = 'pprIntroStyles';
    style.textContent = `
      .ppr-intro-overlay{
        position:fixed;
        inset:0;
        z-index:95;
        display:grid;
        place-items:center;
        padding:18px;
        background:
          radial-gradient(circle at 50% 38%,rgba(34,211,238,.2),transparent 32%),
          radial-gradient(circle at 50% 65%,rgba(250,204,21,.13),transparent 28%),
          rgba(2,6,23,.94);
        color:#dbeafe;
        overflow:hidden;
      }
      .ppr-intro-overlay.is-exiting{animation:pprIntroExit .45s ease forwards}
      .ppr-intro-overlay:before{
        content:'';
        position:absolute;
        inset:0;
        background:
          linear-gradient(rgba(103,232,249,.07) 1px,transparent 1px),
          linear-gradient(90deg,rgba(103,232,249,.07) 1px,transparent 1px);
        background-size:34px 34px;
        mask-image:radial-gradient(circle at 50% 50%,black,transparent 78%);
        animation:pprIntroGridDrift 5s linear infinite;
      }
      .ppr-intro-overlay:after{
        content:'';
        position:absolute;
        left:-20%;
        right:-20%;
        top:50%;
        height:130px;
        background:linear-gradient(180deg,transparent,rgba(103,232,249,.22),rgba(250,204,21,.16),transparent);
        filter:blur(6px);
        transform:translateY(-50%);
        animation:pprIntroScan 1.9s ease-in-out infinite;
      }
      .ppr-intro-card{
        position:relative;
        z-index:2;
        width:min(560px,100%);
        padding:26px 22px;
        border-radius:30px;
        border:1px solid rgba(125,211,252,.34);
        background:linear-gradient(180deg,rgba(15,23,42,.9),rgba(2,6,23,.96));
        box-shadow:0 0 80px rgba(34,211,238,.2),inset 0 0 36px rgba(103,232,249,.08);
        text-align:center;
        transform:translateY(16px) scale(.96);
        animation:pprIntroCardIn .62s cubic-bezier(.2,1.2,.3,1) forwards;
      }
      .ppr-intro-kicker{margin:0 0 8px;color:#67e8f9;font-size:12px;font-weight:1000;letter-spacing:.18em;text-transform:uppercase}
      .ppr-intro-title{margin:0;color:#f8fafc;font-size:clamp(34px,9vw,58px);line-height:.94;text-shadow:0 0 28px rgba(103,232,249,.55)}
      .ppr-intro-copy{margin:12px auto 0;max-width:34em;color:#b6c7d9;line-height:1.45}
      .ppr-intro-route{position:relative;display:grid;grid-template-columns:repeat(6,1fr);gap:8px;align-items:center;margin:22px auto;width:min(420px,100%)}
      .ppr-intro-dot{height:12px;border-radius:999px;background:#0f172a;border:1px solid rgba(125,211,252,.28);box-shadow:0 0 12px rgba(103,232,249,.14);animation:pprIntroDot 1.4s ease-in-out infinite}
      .ppr-intro-dot:nth-child(2){animation-delay:.12s}.ppr-intro-dot:nth-child(3){animation-delay:.24s}.ppr-intro-dot:nth-child(4){animation-delay:.36s}.ppr-intro-dot:nth-child(5){animation-delay:.48s}.ppr-intro-dot:nth-child(6){animation-delay:.6s}
      .ppr-intro-terminal{
        margin:0 auto 18px;
        padding:12px 14px;
        border-radius:16px;
        border:1px solid rgba(34,197,94,.28);
        background:#020617;
        color:#86efac;
        font-family:Consolas,monospace;
        text-align:left;
        line-height:1.5;
        width:min(430px,100%);
        box-shadow:inset 0 0 20px rgba(34,197,94,.06);
      }
      .ppr-intro-cursor{display:inline-block;width:9px;height:1em;background:#86efac;vertical-align:-2px;animation:pprIntroBlink .8s steps(2,end) infinite}
      .ppr-intro-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
      .ppr-intro-start,.ppr-intro-skip{
        min-height:44px;
        border-radius:14px;
        font-weight:1000;
        padding:0 16px;
        cursor:pointer;
      }
      .ppr-intro-start{border:0;background:linear-gradient(180deg,#22c55e,#15803d);color:white;box-shadow:0 14px 34px rgba(34,197,94,.2)}
      .ppr-intro-skip{border:1px solid rgba(125,211,252,.3);background:#0f172a;color:#dbeafe}
      .ppr-intro-map-pulse .map-card{animation:pprIntroMapPulse .9s ease-in-out 2}
      @keyframes pprIntroGridDrift{to{background-position:34px 34px}}
      @keyframes pprIntroScan{0%,100%{transform:translateY(-210%) rotate(-2deg);opacity:.4}50%{transform:translateY(210%) rotate(2deg);opacity:1}}
      @keyframes pprIntroCardIn{to{transform:translateY(0) scale(1)}}
      @keyframes pprIntroDot{0%,100%{background:#0f172a;box-shadow:0 0 10px rgba(103,232,249,.15)}45%{background:#facc15;box-shadow:0 0 22px rgba(250,204,21,.9)}}
      @keyframes pprIntroBlink{50%{opacity:0}}
      @keyframes pprIntroExit{to{opacity:0;transform:scale(1.02);visibility:hidden}}
      @keyframes pprIntroMapPulse{50%{box-shadow:0 0 50px rgba(103,232,249,.35);border-color:rgba(103,232,249,.66)}}
      @media(max-width:760px){.ppr-intro-card{padding:22px 16px}.ppr-intro-route{gap:6px}.ppr-intro-terminal{font-size:13px}}
      @media(prefers-reduced-motion:reduce){.ppr-intro-overlay,.ppr-intro-overlay:before,.ppr-intro-overlay:after,.ppr-intro-card,.ppr-intro-dot,.ppr-intro-cursor,.ppr-intro-map-pulse .map-card{animation:none!important}}
    `;
    document.head.appendChild(style);
  }

  function createIntro(){
    if(q('#pprIntroOverlay')) return;
    const overlay = document.createElement('section');
    overlay.id = 'pprIntroOverlay';
    overlay.className = 'ppr-intro-overlay';
    overlay.innerHTML = `
      <div class="ppr-intro-card" role="dialog" aria-modal="true" aria-labelledby="pprIntroTitle">
        <p class="ppr-intro-kicker">Packet training simulation</p>
        <h2 id="pprIntroTitle" class="ppr-intro-title">Patch Ping Run</h2>
        <p class="ppr-intro-copy">Trace the path, reveal hidden network layers, and deliver Patch to FILESERV.</p>
        <div class="ppr-intro-route" aria-hidden="true">
          <span class="ppr-intro-dot"></span><span class="ppr-intro-dot"></span><span class="ppr-intro-dot"></span><span class="ppr-intro-dot"></span><span class="ppr-intro-dot"></span><span class="ppr-intro-dot"></span>
        </div>
        <div class="ppr-intro-terminal">C:\\Lab&gt; boot patch-ping-run<br>Loading topology...<br>Fog layer active <span class="ppr-intro-cursor"></span></div>
        <div class="ppr-intro-actions">
          <button id="pprIntroStart" class="ppr-intro-start" type="button">Start Run</button>
          <button id="pprIntroSkip" class="ppr-intro-skip" type="button">Skip Intro</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    q('#pprIntroStart').addEventListener('click', closeIntro);
    q('#pprIntroSkip').addEventListener('click', closeIntro);
  }

  function closeIntro(){
    const overlay = q('#pprIntroOverlay');
    if(!overlay) return;
    document.body.classList.add('ppr-intro-map-pulse');
    overlay.classList.add('is-exiting');
    try{ sessionStorage.setItem(STORAGE_KEY, '1'); }catch(error){}
    setTimeout(function(){ overlay.remove(); }, 460);
    setTimeout(function(){ document.body.classList.remove('ppr-intro-map-pulse'); }, 1900);
  }

  function init(){
    installStyles();
    const skipParam = new URLSearchParams(window.location.search).get('skipIntro') === '1';
    let seen = false;
    try{ seen = sessionStorage.getItem(STORAGE_KEY) === '1'; }catch(error){}
    if(!skipParam && !seen){
      setTimeout(createIntro, 240);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once:true });
  }else{
    init();
  }
})();