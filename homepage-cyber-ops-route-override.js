(function(){
  const cyberOpsStart = './open-lab.html?track=windows&scenario=win-dir-incident-triage&mode=beginner&intro=1&v=cyber-ops-start';

  function isWindowsJourneyLink(link){
    if(!link) return false;
    const href = link.getAttribute && (link.getAttribute('href') || '');
    const text = (link.textContent || '').toLowerCase();
    return href.includes('track=windows')
      || href.includes('win-dir-incident-triage')
      || /begin journey|start your journey|start windows lab|windows lab/.test(text);
  }

  function patchLinks(){
    document.querySelectorAll('a[href], .dashboard-nav-card, .dashboard-primary-btn, .dashboard-action-btn').forEach(function(link){
      if(!isWindowsJourneyLink(link)) return;
      link.setAttribute('href', cyberOpsStart);
      link.setAttribute('data-cyber-ops-start', 'true');
    });
  }

  document.addEventListener('click', function(event){
    const link = event.target && event.target.closest ? event.target.closest('a[href], .dashboard-nav-card, .dashboard-primary-btn, .dashboard-action-btn') : null;
    if(!isWindowsJourneyLink(link)) return;
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    window.location.href = cyberOpsStart + '&t=' + Date.now();
  }, true);

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', patchLinks, { once:true });
  }else{
    patchLinks();
  }

  setTimeout(patchLinks, 100);
  setTimeout(patchLinks, 500);
  setTimeout(patchLinks, 1200);
  setTimeout(patchLinks, 2500);
})();