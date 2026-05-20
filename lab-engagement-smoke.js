(function () {
  function scenarios() {
    return Array.isArray(window.ScenarioEngine?.scenarios) ? window.ScenarioEngine.scenarios : [];
  }
  function stepText(step) {
    return [step?.objective, step?.context, step?.demoCommand, ...(step?.hints || [])].filter(Boolean).join(' ');
  }
  function hintCommands(step) {
    const out = [];
    (step?.hints || []).forEach((hint) => {
      for (const match of String(hint || '').matchAll(/`([^`]+)`/g)) out.push(match[1]);
    });
    return out;
  }
  function acceptedCommands(step) {
    return (step?.accepts || []).map((rule) => {
      if (rule.command) return rule.command;
      if (rule.rawEquals) return rule.rawEquals;
      if (rule.finalCwd) return 'cd ' + String(rule.finalCwd).split(/[\\/]/).filter(Boolean).pop();
      if (rule.fileExists) return 'create/copy ' + String(rule.fileExists).split(/[\\/]/).filter(Boolean).pop();
      return '';
    }).filter(Boolean);
  }
  function stepCommands(step) {
    return [...new Set([step?.demoCommand, ...hintCommands(step), ...acceptedCommands(step)].filter(Boolean))];
  }
  function family(command) {
    return String(command || '').trim().split(/\s+/)[0].toLowerCase();
  }
  function hasRegex(steps, regex) {
    return steps.some((step) => regex.test(stepText(step)));
  }
  function scoreScenario(scenario) {
    const steps = Array.isArray(scenario.steps) ? scenario.steps : [];
    const commands = steps.flatMap(stepCommands);
    const families = [...new Set(commands.map(family).filter(Boolean))];
    const flags = [];
    if (steps.length < 4) flags.push('too few steps');
    if (families.length < 2) flags.push('too few command types');
    if (!hasRegex(steps, /dir|ls|type|cat|show|read|inspect|list|review|confirm|verify/i)) flags.push('no discovery/evidence step');
    if (!hasRegex(steps, /verify|confirm|check|prove|show|list.*again|read.*again|status|appears/i)) flags.push('no verification step');
    if (!hasRegex(steps, /cd \.\.|exit|end|wrong|fails|cannot find|recover|if you went/i) && !(scenario.steps || []).some(s => (s.exploration || []).length || (s.partials || []).length)) flags.push('no recovery handling');
    if (steps.length <= 2) flags.push('likely under 2 minutes');
    let score = 100;
    score -= Math.max(0, 4 - steps.length) * 15;
    score -= Math.max(0, 2 - families.length) * 15;
    if (flags.includes('no discovery/evidence step')) score -= 15;
    if (flags.includes('no verification step')) score -= 15;
    if (flags.includes('no recovery handling')) score -= 10;
    score = Math.max(0, score);
    return {
      scenarioId: scenario.id || '',
      title: scenario.title || 'Untitled',
      platform: scenario.environmentCategory || scenario.shell || '',
      category: scenario.category || '',
      level: scenario.level || scenario.difficulty || '',
      stepCount: steps.length,
      commandFamilies: families.join(', '),
      estimatedMinutes: Math.max(1, Math.ceil((steps.length * 35 + families.length * 20) / 60)),
      score,
      flags: flags.join('; ') || 'ok'
    };
  }
  function flowRows() {
    return scenarios().map((scenario) => ({
      scenarioId: scenario.id || '',
      title: scenario.title || 'Untitled',
      platform: scenario.environmentCategory || scenario.shell || '',
      category: scenario.category || '',
      level: scenario.level || scenario.difficulty || '',
      objective: scenario.objective || '',
      steps: (scenario.steps || []).map((step, index) => ({
        step: index + 1,
        objective: step.objective || '',
        commands: stepCommands(step).join(' | '),
        hints: (step.hints || []).join(' | ')
      }))
    }));
  }
  function engagementRows() { return scenarios().map(scoreScenario); }
  function run() {
    const rows = engagementRows();
    const weak = rows.filter((row) => row.score < 70 || row.flags !== 'ok');
    return {
      name: 'Lab Engagement Smoke',
      summary: { scenarioCount: rows.length, weakCount: weak.length, averageScore: Math.round(rows.reduce((sum, row) => sum + row.score, 0) / Math.max(1, rows.length)) },
      rows,
      weak
    };
  }
  window.NetlabLabEngagementSmoke = { run, engagementRows, flowRows };
})();
