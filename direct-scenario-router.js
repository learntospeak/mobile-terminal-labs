(function(){
  function getId(){
    var p=new URLSearchParams(window.location.search);
    var id=p.get('scenario')||p.get('scenarioId')||p.get('lesson');
    return id==='incident-folder-triage'?'win-dir-incident-triage':id;
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
  route();
  window.addEventListener('DOMContentLoaded',route,{once:true});
})();