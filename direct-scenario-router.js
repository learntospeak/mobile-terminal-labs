(function(){
  function route(){
    var e=window.ScenarioEngine;
    if(!e||!Array.isArray(e.scenarios))return;
    var p=new URLSearchParams(window.location.search);
    var id=p.get('scenario')||p.get('scenarioId')||p.get('lesson');
    if(!id)return;
    if(id==='incident-folder-triage')id='win-dir-incident-triage';
    var scenario=e.scenarios.find(function(s){return s&&s.id===id;});
    if(!scenario)return;
    e.scenarios=[scenario].concat(e.scenarios.filter(function(s){return s&&s.id!==id;}));
    window.__NETLAB_DIRECT_SCENARIO_ID=id;
  }
  route();
  window.addEventListener('DOMContentLoaded',route,{once:true});
})();