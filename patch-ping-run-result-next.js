(function(){
  function q(selector){return document.querySelector(selector)}

  function enhanceResultCard(card){
    if(!card || card.dataset.pprEnhanced === '1') return;

    const originalText = card.textContent.trim();
    card.dataset.pprEnhanced = '1';
    card.dataset.pprDismissed = '0';
    card.innerHTML = '';

    const text = document.createElement('div');
    text.className = 'ppr-result-copy';
    text.textContent = originalText || 'Command complete.';

    const next = document.createElement('button');
    next.className = 'ppr-result-next';
    next.type = 'button';
    next.textContent = 'Next';
    next.addEventListener('click', function(){
      card.dataset.pprDismissed = '1';
      card.hidden = true;
    });

    card.appendChild(text);
    card.appendChild(next);
  }

  function installStyles(){
    if(q('#pprResultNextStyles')) return;
    const style = document.createElement('style');
    style.id = 'pprResultNextStyles';
    style.textContent = '@media(max-width:760px){.ppr-mobile-result{display:grid!important;grid-template-columns:1fr auto;align-items:center;gap:12px}.ppr-mobile-result[hidden]{display:none!important}.ppr-result-copy{min-width:0}.ppr-result-next{min-height:42px;border:0;border-radius:14px;background:linear-gradient(180deg,#22c55e,#15803d);color:#fff;font-weight:1000;padding:0 16px;box-shadow:0 10px 28px rgba(34,197,94,.2)}}';
    document.head.appendChild(style);
  }

  function installObserver(){
    const card = q('#pprMobileResult');
    if(!card) return false;

    installStyles();

    const observer = new MutationObserver(function(){
      if(card.hidden && card.dataset.pprDismissed !== '1'){
        card.hidden = false;
      }

      if(!card.hidden && card.dataset.pprDismissed !== '1'){
        enhanceResultCard(card);
      }
    });

    observer.observe(card, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['hidden']
    });

    document.addEventListener('click', function(event){
      const openButton = event.target && event.target.closest && event.target.closest('#pprOpenSheet, .ppr-command-option');
      if(openButton){
        card.dataset.pprDismissed = '0';
        card.dataset.pprEnhanced = '0';
      }
    }, true);

    return true;
  }

  function init(){
    if(installObserver()) return;
    setTimeout(init, 120);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();