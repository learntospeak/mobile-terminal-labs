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

  function getEggRowsFromDom(){
    var rows=[];
    document.querySelectorAll('#eggSmokeResults .check').forEach(function(card){
      var statusText=(card.querySelector('.status')&&card.querySelector('.status').textContent||'').toUpperCase();
      var title=(card.querySelector('.stage-title')&&card.querySelector('.stage-title').textContent||'').trim();
      var detail=(card.querySelector('.detail')&&card.querySelector('.detail').textContent||'').trim();
      rows.push({
        id:title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),
        label:title,
        detail:detail,
        ok:statusText.indexOf('PASS')>=0,
        status:statusText.indexOf('PASS')>=0?'pass':'fail'
      });
    });
    return rows;
  }

  function getEggRows(){
    if(window.NetlabEggSmoke && typeof window.NetlabEggSmoke.run === 'function') {
      try { window.NetlabEggSmoke.run(); } catch(e) {}
    }

    var domRows = getEggRowsFromDom();
    if(domRows.length) return domRows;

    var rows = Array.isArray(window.__NetlabEggSmokeRows) ? window.__NetlabEggSmokeRows : [];
    return rows.map(function(row){return {id:row.id||'',label:row.label||'',detail:row.detail||'',ok:Boolean(row.ok),status:row.ok?'pass':'fail'};});
  }

  function summarizeRows(rows){
    return {complete:rows.filter(function(r){return r.status==='pass'||r.ok===true;}).length,remaining:rows.filter(function(r){return !(r.status==='pass'||r.ok===true);}).length,total:rows.length,ok:rows.length>0&&rows.every(function(r){return r.status==='pass'||r.ok===true;})};
  }

  function buildReport(){
    if(typeof window.run==='function') window.run();
    if(window.NetlabEggSmoke && typeof window.NetlabEggSmoke.run === 'function') {
      try { window.NetlabEggSmoke.run(); } catch(e) {}
    }
    var rows=getRows();
    var eggRows=getEggRows();
    var investigationSummary=summarizeRows(rows);
    var eggSummary=summarizeRows(eggRows);
    return {
      generatedAt:new Date().toISOString(),
      pageUrl:location.href,
      userAgent:navigator.userAgent,
      pilotId:'win-dir-incident-triage',
      summary:{
        complete:investigationSummary.complete,
        remaining:investigationSummary.remaining,
        total:investigationSummary.total,
        ok:investigationSummary.ok,
        eggComplete:eggSummary.complete,
        eggRemaining:eggSummary.remaining,
        eggTotal:eggSummary.total,
        eggOk:eggSummary.ok
      },
      stages:rows,
      goldenEggSmoke:{summary:eggSummary,checks:eggRows}
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

  window.NetlabInvestigationSmokeDownload = { buildReport: buildReport, download: download, getEggRows: getEggRows };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(addButton,300);});
  else setTimeout(addButton,300);
})();