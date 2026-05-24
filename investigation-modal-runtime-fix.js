(function(){
  function applyInvestigationModalFix(){
    var overlay = document.getElementById('investigationModalOverlay');
    var panel = document.getElementById('investigationPanel');
    if (!overlay || !panel) return;

    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.left = '0';
    overlay.style.zIndex = '99999';
    overlay.style.display = overlay.hidden ? 'none' : 'grid';
    overlay.style.alignItems = window.innerWidth <= 760 ? 'start' : 'center';
    overlay.style.justifyItems = 'center';
    overlay.style.padding = window.innerWidth <= 760 ? '10px' : '16px';
    overlay.style.background = 'rgba(2, 6, 23, 0.78)';
    overlay.style.overflowY = 'auto';

    panel.style.width = window.innerWidth <= 760 ? '100%' : 'min(720px, 100%)';
    panel.style.maxWidth = '100%';
    panel.style.maxHeight = window.innerWidth <= 760 ? 'calc(100dvh - 20px)' : 'calc(100dvh - 32px)';
    panel.style.overflowY = 'auto';
    panel.style.margin = '0';

    if (!overlay.hidden) {
      document.body.classList.add('investigation-modal-open');
      document.documentElement.classList.add('investigation-modal-open');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
  }

  function restoreScrollIfClosed(){
    var overlay = document.getElementById('investigationModalOverlay');
    if (overlay && overlay.hidden) {
      document.body.classList.remove('investigation-modal-open');
      document.documentElement.classList.remove('investigation-modal-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }

  function install(){
    applyInvestigationModalFix();
    restoreScrollIfClosed();
    var tries = 0;
    var timer = setInterval(function(){
      tries += 1;
      applyInvestigationModalFix();
      restoreScrollIfClosed();
      if (tries > 80) clearInterval(timer);
    }, 150);
    document.addEventListener('click', function(){
      setTimeout(function(){
        applyInvestigationModalFix();
        restoreScrollIfClosed();
      }, 80);
    }, true);
    window.addEventListener('resize', applyInvestigationModalFix);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();