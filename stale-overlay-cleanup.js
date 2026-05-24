(function(){
  const ACTIVE_SELECTORS = [
    '#terminalIntroOverlay:not([hidden])',
    '#commandExplainerCard:not([hidden])',
    '#commandExplainerOverlay:not([hidden])',
    '#ticketBriefingOverlay:not([hidden])',
    '#ticketBriefingCard:not([hidden])',
    '.ticket-briefing-overlay:not([hidden])',
    '.ticket-briefing-card:not([hidden])'
  ];

  function hasVisibleOverlay(){
    return ACTIVE_SELECTORS.some(function(sel){
      return Array.from(document.querySelectorAll(sel)).some(function(el){
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) !== 0 && r.width > 0 && r.height > 0;
      });
    });
  }

  function labLooksActive(){
    return Boolean(
      document.querySelector('#terminalInput, #commandInput, .terminal-input, .terminal-output, #terminalOutput, .command-options button, .trainer-controls button')
    );
  }

  function clearStaleState(){
    const visible = hasVisibleOverlay();
    const active = labLooksActive();

    if (visible && !active) return;

    if (!visible && active) {
      ['terminal-intro-open','terminal-intro-root-open','command-explainer-open','ticket-briefing-open','briefing-open','modal-open','overlay-open'].forEach(function(cls){
        document.body.classList.remove(cls);
        document.documentElement.classList.remove(cls);
      });
      document.body.style.overflow = '';
      document.body.style.overflowY = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.overflowY = '';
      document.body.style.filter = '';
      document.documentElement.style.filter = '';
      document.querySelectorAll('.modal-backdrop,.overlay-backdrop,.terminal-intro-backdrop,.ticket-briefing-backdrop').forEach(function(el){
        if (!el.closest('[role="dialog"]')) el.remove();
      });
    }
  }

  function install(){
    clearStaleState();
    document.addEventListener('click', function(){ setTimeout(clearStaleState, 120); }, true);
    document.addEventListener('keydown', function(){ setTimeout(clearStaleState, 120); }, true);
    let tries = 0;
    const timer = setInterval(function(){
      tries += 1;
      clearStaleState();
      if (tries > 120) clearInterval(timer);
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();