(function(){
  function escFilename(value){return String(value||'report').replace(/[^a-z0-9-]+/gi,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').toLowerCase();}
  function getRows(){
    var rows=[];
    document.querySelectorAll('#results .check').forEach(function(card){
      var statusText=(card.querySelector('.status')&&card.querySelector('.status').textContent||'').toUpperCase();
      var stageText=(card.querySelector('.stage-tag')&&card.querySelector('.stage-tag').textContent||'').replace(/[^0-9]/g,'');
      var title=(card.querySelector('.stage-title')&&card.querySelector('.stage-title').textContent||'').trim();
      var detailNodes=Array.from(card.querySelectorAll('.detail')).map(function(el){return el.textContent.trim();}).filter(Boolean);
      var subchecks=Array.from(card.querySelectorAll('.subcheck')).map(function(el){return{ok:el.classList.contains('pass'),label:el.textContent.replace(/^[✓✗]\s*/,'').trim()};});
      rows.push({stage:Number(stageText||0),label:title,status:statusText.indexOf('PASS')>=0?'pass':'fail',details:detailNodes,subchecks:subchecks});
    });
    return rows;
  }
  function buildReport(){
    if(typeof window.run==='function') window.run();
    var rows=getRows();
    return {
      generatedAt:new Date().toISOString(),
      pageUrl:location.href,
      userAgent:navigator.userAgent,
      pilotId:'win-dir-incident-triage',
      summary:{complete:rows.filter(function(r){return r.status==='pass';}).length,remaining:rows.filter(function(r){return r.status!=='pass';}).length,total:rows.length,ok:rows.length>0&&rows.every(function(r){return r.status==='pass';})},
      stages:rows
    };
  }
  function download(){
    var payload=buildReport();
    var blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    var stamp=new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
    a.href=url;
    a.download=escFilename('investigation-mode-smoke-'+stamp)+'.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }
  function addButton(){
    if(document.getElementById('downloadInvestigationSmokeBtn')) return;
    var run=document.getElementById('runBtn');
    if(!run) return;
    var btn=document.createElement('button');
    btn.id='downloadInvestigationSmokeBtn';
    btn.className='btn secondary';
    btn.type='button';
    btn.textContent='Download JSON Report';
    btn.style.marginLeft='10px';
    btn.addEventListener('click',download);
    run.insertAdjacentElement('afterend',btn);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(addButton,300);});
  else setTimeout(addButton,300);
})();