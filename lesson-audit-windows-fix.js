(function(){
  var engine = window.ScenarioEngine;
  if (!engine || !Array.isArray(engine.scenarios)) return;
  var oldCmd = String.fromCharCode(112,115);
  var newCmd = 'tasklist';

  function targetScenario(s){
    return s && (s.id === 'windows-rogue-process' || /windows.*process.*cleanup/i.test(String(s.title || '')));
  }

  function patchObj(obj){
    if (!obj || typeof obj !== 'object') return;
    if (typeof obj.command === 'string' && obj.command.trim().toLowerCase() === oldCmd) obj.command = newCmd;
    if (typeof obj.demoCommand === 'string' && obj.demoCommand.trim().toLowerCase() === oldCmd) obj.demoCommand = newCmd;
    if (obj.match && typeof obj.match === 'object' && typeof obj.match.command === 'string' && obj.match.command.trim().toLowerCase() === oldCmd) obj.match.command = newCmd;
  }

  engine.scenarios.forEach(function(scenario){
    if (!targetScenario(scenario)) return;
    (scenario.steps || []).forEach(function(step){
      if (String(step.commandFamily || '').toLowerCase() === oldCmd) step.commandFamily = newCmd;
      if (typeof step.demoCommand === 'string' && step.demoCommand.trim().toLowerCase() === oldCmd) step.demoCommand = newCmd;
      if (Array.isArray(step.hints)) step.hints = step.hints.map(function(hint){ return String(hint).split('`' + oldCmd + '`').join('`' + newCmd + '`'); });
      ['accepts','partials','exploration','walkthrough'].forEach(function(name){ (step[name] || []).forEach(patchObj); });
    });
  });
})();