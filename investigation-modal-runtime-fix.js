(function(){
  function applyInvestigationModalFix(){
    var overlay = document.getElementById('investigationModalOverlay');
    var panel = document.getElementById('investigationPanel');
    if (!overlay || !panel) return;

    overlay.style.position = 'fixed