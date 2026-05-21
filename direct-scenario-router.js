(function(){
  function getId(){
    var p=new URLSearchParams(window.location.search);
    var id=p.get('scenario')||p.get('scenarioId')||p.get('lesson');
    return id==='incident-folder-triage'?'win-dir-incident-triage':id;
  }
  function markDirect(){
    if(!getId())return;
    document.documentElement.classList.add('direct-lab-open');
    if(document.body)document.body.classList.add('direct-lab-open');
    if(!document.getElementById('directLabHideStylesheet')){
      var css=document.createElement('link');
      css.id='directLabHideStylesheet';
      css.rel='stylesheet';
      css.href='./direct-lab-hide.css?v=20260522direct1';
      document.head.appendChild(css);
    }
  }
  function allow(e,id){
    if(!e||!e.beginnerLabLevels||!Array.isArray(e.beginnerLabLevels.windows)||!id)return;
    var levels=e.beginnerLabLevels.windows;
    var exists=levels.some(function(level){return Array.isArray(level.scenarioIds)&&level.scenarioIds.indexOf(id)>=0;});
    if(!exists){
      levels.unshift({id:'direct-dev-link',title:'Direct Dev Link',description:'Direct scenario opened from dev index.',estimatedTime:'Testing',skills:['direct test'],scenarioIds:[id],unlocksAfter:null});
    }
  }
  function route(){
    var e=window.ScenarioEngine;
    if(!e||!Array.isArray(e.scenarios))return;
    var id=getId();
    if(!id)return;
    var scenario=e.scenarios.find(function(s){return s&&s.id===id;});
    if(!scenario)return;
    allow(e,id);
    e.scenarios=[scenario].concat(e.scenarios.filter(function(s){return s&&s.id!==id;}));
    window.__NETLAB_DIRECT_SCENARIO_ID=id;
    try{sessionStorage.setItem('netlab:direct-scenario-id',id);}catch(err){}
  }
  function suppressDirectIntro(){
    if(!getId())return;
    markDirect();
    ['terminalIntroOverlay','beginnerOnboardingOverlay','beginnerOnboardingCard'].forEach(function(id){
      var el=document.getElementById(id);
      if(el){el.hidden=true;el.setAttribute('aria-hidden','true');el.style.display='none';}
    });
    document.documentElement.classList.remove('terminal-intro-root-open');
    if(document.body)document.body.classList.remove('terminal-intro-open');
    try{var frame=document.getElementById('terminalIntroFrame');if(frame)frame.src='about:blank';}catch(err){}
  }
  markDirect();
  route();
  suppressDirectIntro();
  window.addEventListener('DOMContentLoaded',function(){markDirect();route();suppressDirectIntro();},{once:true});
  var count=0;
  var timer=setInterval(function(){
    markDirect();route();suppressDirectIntro();count+=1;if(count>80)clearInterval(timer);
  },150);
})();