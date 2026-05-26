(function(){
  const stableWindowsStart = './open-lab.html?track=windows&scenario=win-dir-incident-triage&mode=beginner&intro=1&v=home-start-stable';

  function shouldRouteToWindowsLab(link){
    if(!link || !link.href) return false;
    const text = (link.textContent || '').toLowerCase();
    const href = link.getAttribute('href') || '';
    return (href.includes('terminal-coach.html') && href.includes('track=windows'))
      || href.includes('scenario=win-dir-incident-triage')
      || /start windows lab|windows lab|start your journey/.test(text);
  }

  function goStable(event){
    const link = event.target && event.target.closest ? event.target.closest('a[href], .dashboard-nav-card') : null;
    if(!shouldRouteToWindowsLab(link)) return;
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    window.location.href = stableWindowsStart + '&t=' + Date.now();
  }

  function patchLinks(){
    document.querySelectorAll('a[href], .dashboard-nav-card').forEach(function(link){
      if(!shouldRouteToWindowsLab(link)) return;
      link.setAttribute('href', stableWindowsStart);
      link.setAttribute('data-stable-windows-route', 'true');
    });
  }

  document.addEventListener('click', goStable, true);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchLinks, { once: true });
  else patchLinks();
  setTimeout(patchLinks, 300);
  setTimeout(patchLinks, 900);
  setTimeout(patchLinks, 1800);
})();