(function(){
  const SUCCESS_PATH = ['YOUR-PC','ACCESS-SW','ROUTER-A','CORE-SW','FIREWALL','VAULT-GATE','FILESERV'];
  let endingStarted = false;

  function q(selector){ return document.querySelector(selector); }
  function qa(selector){ return Array.from(document.querySelectorAll(selector)); }

  function installStyles(){
    if(q('#pprPremiumEndingStyles')) return;
    const style = document.createElement('style');
    style.id = 'pprPremiumEndingStyles';
    style.textContent = `
      .ppr-victory-mode .node:not(.ppr-victory-node){opacity:.22;filter:grayscale(.75) brightness(.68)}
      .ppr-victory-mode .line:not(.ppr-victory-line){opacity:.08!important;filter:grayscale(1)}
      .ppr-victory-node{z-index:7!important;animation:pprVictoryNodePulse .72s ease-in-out infinite alternate!important}
      .ppr-victory-line{stroke:#facc15!important;stroke-width:5!important;filter:drop-shadow(0 0 14px rgba(250,204,21,.95)) drop-shadow(0 0 28px rgba(34,211,238,.55))!important;animation:pprVictoryLineFlow .95s linear infinite!important;stroke-dasharray:16 9!important}
      .ppr-victory-target strong{animation:pprTargetBurst 1s ease-in-out infinite alternate!important;color:#fef3c7!important;filter:drop-shadow(0 0 24px rgba(250,204,21,1)) drop-shadow(0 0 42px rgba(34,211,238,.75))!important}
      .ppr-vault-open strong{animation:pprVaultOpen 1.1s ease-in-out both!important;color:#fef08a!important}
      .ppr-worm-hyper{animation:pprWormHyper .38s ease-in-out infinite alternate!important;box-shadow:0 0 34px rgba(34,211,238,.9),0 0 72px rgba(250,204,21,.7)!important;background:linear-gradient(90deg,#facc15,#67e8f9,#22c55e)!important}
      .ppr-security-sweep{position:absolute;inset:0;z-index:9;pointer-events:none;overflow:hidden;border-radius:24px}
      .ppr-security-sweep:before{content:'';position:absolute;top:-15%;bottom:-15%;width:130px;left:-160px;background:linear-gradient(90deg,transparent,rgba(103,232,249,.05),rgba(103,232,249,.34),rgba(250,204,21,.36),transparent);filter:blur(4px);animation:pprSecuritySweep 1.35s ease-in-out forwards}
      .ppr-byte-stream{position:absolute;z-index:8;pointer-events:none;color:#67e8f9;font-family:Consolas,monospace;font-size:13px;font-weight:1000;text-shadow:0 0 12px rgba(103,232,249,.9);animation:pprByteFloat 1.1s ease-out forwards}
      .ppr-confetti{position:fixed;z-index:80;width:8px;height:14px;border-radius:3px;background:#facc15;top:-20px;animation:pprConfettiFall 1.9s ease-in forwards;box-shadow:0 0 14px rgba(250,204,21,.65)}
      .ppr-victory-overlay{position:fixed;inset:0;z-index:70;display:grid;place-items:center;background:radial-gradient(circle at 50% 32%,rgba(250,204,21,.2),transparent 28%),rgba(2,6,23,.72);opacity:0;pointer-events:none;transition:opacity .32s ease;padding:18px}
      .ppr-victory-overlay.is-visible{opacity:1;pointer-events:auto}
      .ppr-victory-card{position:relative;width:min(520px,100%);padding:28px 22px;border-radius:30px;border:1px solid rgba(250,204,21,.55);background:linear-gradient(180deg,rgba(69,26,3,.9),rgba(2,6,23,.98));text-align:center;box-shadow:0 0 90px rgba(250,204,21,.28),inset 0 0 34px rgba(250,204,21,.09);overflow:hidden;transform:translateY(18px) scale(.94);animation:pprCardArrive .58s cubic-bezier(.2,1.2,.3,1) forwards}
      .ppr-victory-card:before{content:'';position:absolute;inset:-60%;background:conic-gradient(from 90deg,transparent,rgba(250,204,21,.26),transparent,rgba(103,232,249,.2),transparent);animation:pprCardSpin 5s linear infinite;opacity:.55}
      .ppr-victory-content{position:relative;z-index:2}
      .ppr-victory-kicker{margin:0 0 8px;color:#67e8f9;font-size:12px;font-weight:1000;letter-spacing:.16em;text-transform:uppercase}
      .ppr-victory-title{margin:0;color:#fef3c7;font-size:clamp(30px,8vw,48px);line-height:.95;text-shadow:0 0 26px rgba(250,204,21,.76)}
      .ppr-victory-subtitle{margin:12px auto 0;max-width:34em;color:#dbeafe;line-height:1.45}
      .ppr-premium-egg{position:relative;margin:24px auto;width:132px;height:166px;border-radius:50% 50% 44% 44%;background:radial-gradient(circle at 32% 21%,#fffde7 0 7%,transparent 8%),linear-gradient(135deg,#fff7ad,#facc15 30%,#f59e0b 52%,#92400e);box-shadow:0 0 72px rgba(250,204,21,.92),0 0 132px rgba(250,204,21,.38),inset -13px -17px 24px rgba(69,26,3,.38),inset 12px 10px 19px rgba(255,255,255,.34);animation:pprEggFloat 1.3s ease-in-out infinite alternate}
      .ppr-premium-egg:before{content:'◆';position:absolute;top:-33px;left:45px;color:#fef3c7;font-size:42px;text-shadow:0 0 25px #facc15;animation:pprGemTwinkle .8s ease-in-out infinite alternate}
      .ppr-premium-egg:after{content:'◕  ◕';position:absolute;top:61px;left:37px;color:#451a03;font-weight:1000}
      .ppr-score-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:18px}
      .ppr-score-pill{padding:10px 8px;border-radius:16px;border:1px solid rgba(250,204,21,.28);background:rgba(15,23,42,.74)}
      .ppr-score-pill strong{display:block;color:#fef3c7;font-size:13px}.ppr-score-pill span{display:block;margin-top:2px;color:#94a3b8;font-size:11px}
      .ppr-victory-actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:18px}
      .ppr-victory-btn{min-height:44px;border-radius:14px;border:1px solid rgba(250,204,21,.35);background:linear-gradient(180deg,#facc15,#d97706);color:#451a03;font-weight:1000;padding:0 16px;cursor:pointer}
      .ppr-victory-btn.secondary{background:#0f172a;color:#dbeafe;border-color:rgba(125,211,252,.3)}
      .ppr-screen-shake{animation:pprScreenShake .42s ease-in-out both}
      @keyframes pprVictoryNodePulse{from{transform:translateY(0) scale(1);filter:drop-shadow(0 0 12px rgba(250,204,21,.72))}to{transform:translateY(-5px) scale(1.13);filter:drop-shadow(0 0 26px rgba(250,204,21,1))}}
      @keyframes pprVictoryLineFlow{to{stroke-dashoffset:-50}}
      @keyframes pprTargetBurst{from{transform:scale(1)}to{transform:scale(1.28)}}
      @keyframes pprVaultOpen{0%{transform:scale(1) rotate(0)}55%{transform:scale(1.35) rotate(-9deg)}100%{transform:scale(1.1) rotate(0)}}
      @keyframes pprWormHyper{from{transform:translateY(0) scale(1)}to{transform:translateY(-4px) scale(1.08)}}
      @keyframes pprSecuritySweep{to{left:calc(100% + 180px)}}
      @keyframes pprByteFloat{0%{opacity:0;transform:translateY(0) scale(.8)}15%{opacity:1}100%{opacity:0;transform:translateY(-58px) scale(1.12)}}
      @keyframes pprConfettiFall{0%{transform:translateY(-30px) rotate(0);opacity:1}100%{transform:translateY(110vh) rotate(620deg);opacity:.2}}
      @keyframes pprCardArrive{to{transform:translateY(0) scale(1)}}
      @keyframes pprCardSpin{to{transform:rotate(360deg)}}
      @keyframes pprEggFloat{from{transform:translateY(0) scale(1)}to{transform:translateY(-10px) scale(1.04)}}
      @keyframes pprGemTwinkle{from{opacity:.72;transform:scale(.92)}to{opacity:1;transform:scale(1.12)}}
      @keyframes pprScreenShake{0%,100%{transform:translate(0,0)}20%{transform:translate(-4px,2px)}40%{transform:translate(4px,-2px)}60%{transform:translate(-3px,-1px)}80%{transform:translate(3px,1px)}}
      @media(max-width:760px){.ppr-score-grid{grid-template-columns:1fr}.ppr-victory-overlay{padding:12px}.ppr-victory-card{padding:24px 16px}.ppr-premium-egg{width:112px;height:144px}.ppr-premium-egg:before{left:36px}.ppr-premium-egg:after{left:28px;top:53px}}
      @media(prefers-reduced-motion:reduce){.ppr-victory-node,.ppr-victory-line,.ppr-victory-card,.ppr-victory-card:before,.ppr-premium-egg,.ppr-premium-egg:before,.ppr-screen-shake{animation:none!important}}
    `;
    document.head.appendChild(style);
  }

  function nodeEl(id){ return document.querySelector('[data-id="'+id+'"]'); }

  function pathEdges(){
    const pairs = [];
    for(let index=0; index<SUCCESS_PATH.length-1; index += 1){
      pairs.push([SUCCESS_PATH[index], SUCCESS_PATH[index+1]].sort().join('|'));
    }
    return new Set(pairs);
  }

  function markRoute(){
    const edgeSet = pathEdges();
    SUCCESS_PATH.forEach(function(id, index){
      const element = nodeEl(id);
      if(!element) return;
      setTimeout(function(){
        element.classList.add('ppr-victory-node');
        if(id === 'FILESERV') element.classList.add('ppr-victory-target');
        if(id === 'VAULT-GATE') element.classList.add('ppr-vault-open');
      }, index * 130);
    });

    const lines = qa('.line');
    const edges = [
      ['YOUR-PC','ACCESS-SW'],['ACCESS-SW','ROUTER-A'],['ROUTER-A','CORE-SW'],['CORE-SW','FIREWALL'],['FIREWALL','VAULT-GATE'],['VAULT-GATE','FILESERV'],['ACCESS-SW','SALES-01'],['ACCESS-SW','SALES-02'],['ACCESS-SW','SALES-PRN'],['ACCESS-SW','RECEPTION'],['ACCESS-SW','LOBBY-AP'],['LOBBY-AP','KIOSK'],['ROUTER-A','DNS01'],['ROUTER-A','DHCP01'],['ROUTER-A','WEB-DMZ'],['ROUTER-A','ARCHIVE'],['CORE-SW','ACCOUNTS-PC'],['ACCOUNTS-PC','NAS-ACCOUNTS'],['NAS-ACCOUNTS','PAYROLL'],['NAS-ACCOUNTS','BACKUP-NAS'],['CORE-SW','WAREHOUSE-PC'],['WAREHOUSE-PC','SCANNER'],['SCANNER','LABEL-PRN'],['CORE-SW','PACKET-LOSS'],['PACKET-LOSS','MONITOR01'],['VAULT-GATE','DOOR-CTRL']
    ];
    lines.forEach(function(line, index){
      const pair = edges[index];
      if(pair && edgeSet.has(pair.slice().sort().join('|'))){
        setTimeout(function(){ line.classList.add('ppr-victory-line'); }, index * 35);
      }
    });
  }

  function addSweep(){
    const mapCard = q('.map-card');
    if(!mapCard) return;
    const sweep = document.createElement('div');
    sweep.className = 'ppr-security-sweep';
    mapCard.appendChild(sweep);
    setTimeout(function(){ sweep.remove(); }, 1700);
  }

  function emitBytes(){
    const map = q('#map');
    if(!map) return;
    const labels = ['0101','ACK','TTL','TLS','200','OK','PING','ICMP','SEC'];
    for(let i=0;i<34;i+=1){
      setTimeout(function(){
        const bit = document.createElement('div');
        bit.className = 'ppr-byte-stream';
        bit.textContent = labels[Math.floor(Math.random()*labels.length)];
        bit.style.left = (8 + Math.random()*84) + '%';
        bit.style.top = (18 + Math.random()*64) + '%';
        map.appendChild(bit);
        setTimeout(function(){ bit.remove(); }, 1200);
      }, i * 48);
    }
  }

  function confetti(){
    const colors = ['#facc15','#67e8f9','#22c55e','#fef3c7','#a78bfa'];
    for(let i=0;i<80;i+=1){
      setTimeout(function(){
        const piece = document.createElement('div');
        piece.className = 'ppr-confetti';
        piece.style.left = Math.random()*100 + 'vw';
        piece.style.background = colors[Math.floor(Math.random()*colors.length)];
        piece.style.animationDuration = (1.3 + Math.random()*1.3) + 's';
        piece.style.transform = 'rotate('+Math.floor(Math.random()*180)+'deg)';
        document.body.appendChild(piece);
        setTimeout(function(){ piece.remove(); }, 2800);
      }, i * 18);
    }
  }

  function createOverlay(){
    if(q('#pprVictoryOverlay')) return q('#pprVictoryOverlay');
    const overlay = document.createElement('section');
    overlay.id = 'pprVictoryOverlay';
    overlay.className = 'ppr-victory-overlay';
    overlay.innerHTML = `
      <div class="ppr-victory-card" role="dialog" aria-modal="true" aria-labelledby="pprVictoryTitle">
        <div class="ppr-victory-content">
          <p class="ppr-victory-kicker">Network Secured</p>
          <h2 id="pprVictoryTitle" class="ppr-victory-title">Golden Egg Retrieved</h2>
          <div class="ppr-premium-egg" aria-hidden="true"></div>
          <p class="ppr-victory-subtitle">Patch delivered the packet through the secure route, verified the target, and brought the prize home.</p>
          <div class="ppr-score-grid" aria-label="Run summary">
            <div class="ppr-score-pill"><strong>Clean Route</strong><span>No wrong branch required</span></div>
            <div class="ppr-score-pill"><strong>Secure Path</strong><span>Gateway chain verified</span></div>
            <div class="ppr-score-pill"><strong>Packet Safe</strong><span>0% loss confirmed</span></div>
          </div>
          <div class="ppr-victory-actions">
            <button id="pprVictoryAgain" class="ppr-victory-btn" type="button">Run Again</button>
            <button id="pprVictoryClose" class="ppr-victory-btn secondary" type="button">View Map</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#pprVictoryClose').addEventListener('click', function(){ overlay.classList.remove('is-visible'); });
    overlay.querySelector('#pprVictoryAgain').addEventListener('click', function(){ window.location.reload(); });
    return overlay;
  }

  function hideOriginalReward(){
    const reward = q('#reward');
    if(reward) reward.hidden = true;
  }

  function startEnding(){
    if(endingStarted) return;
    endingStarted = true;
    installStyles();
    hideOriginalReward();
    const mapCard = q('.map-card');
    const worm = q('#worm');
    if(mapCard) mapCard.classList.add('ppr-victory-mode','ppr-screen-shake');
    if(worm) worm.classList.add('ppr-worm-hyper');
    markRoute();
    addSweep();
    emitBytes();
    confetti();
    setTimeout(function(){ hideOriginalReward(); }, 300);
    setTimeout(function(){ hideOriginalReward(); createOverlay().classList.add('is-visible'); }, 1650);
  }

  function observeReward(){
    const reward = q('#reward');
    if(!reward) return false;
    const observer = new MutationObserver(function(){
      if(!reward.hidden) startEnding();
    });
    observer.observe(reward, { attributes:true, attributeFilter:['hidden'] });
    return true;
  }

  function observeLog(){
    const log = q('#log');
    if(!log) return false;
    const observer = new MutationObserver(function(){
      if(/FILESERV reached|Golden Egg|Golden Egg route confirmed/i.test(log.textContent || '')){
        setTimeout(startEnding, 520);
      }
    });
    observer.observe(log, { childList:true, characterData:true, subtree:true });
    return true;
  }

  function init(){
    installStyles();
    if(!observeReward() || !observeLog()){
      setTimeout(init, 160);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }
})();