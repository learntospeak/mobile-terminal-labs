(function(){
  const stableWindowsStart = './open-lab.html?track=windows&scenario=win-dir-incident-triage&mode=beginner&v=home-start-stable';

  function shouldRouteToWindowsLab(link){
    if(!link || !link.href) return false;
    const text = (link.textContent || '').toLowerCase();
    const href = link.getAttribute('href') || '';
    return href.includes('terminal-coach.html') && href.includes('track=windows')
      || /start windows lab|windows lab|start your journey/.test(text);
  }

  function patchLinks(){
    document.querySelectorAll('a[href], .dashboard-nav-card').forEach(function(link){
      if(!shouldRouteToWindowsLab(link)) return;
      link.setAttribute('href', stableWindowsStart);
      link.addEventListener('click', function(event){
        event.preventDefault();
        window.location.href = stableWindowsStart + '&t=' + Date.now();
      });
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchLinks, { once: true });
  else patchLinks();
  setTimeout(patchLinks, 500);
  setTimeout(patchLinks, 1500);
})();