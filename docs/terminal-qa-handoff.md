# Terminal QA Handoff

Date: 2026-05-28

## Why This Exists

The current priority is making the mobile/browser simulated labs reliable before considering VM or real-shell training modes. The product value is the guided learning layer: mobile command choices, coaching, hints, visual context, and safe repeatable labs.

The risk we are addressing is not just one Windows `type` bug. It is the broader class of issues where a lab looks correct but a learner cannot complete it because the simulated command engine, scenario state, mobile command choices, or completion matching disagree.

## New Test Stack

Run the full terminal QA stack:

```bash
npm run test:terminal-qa -- --reporter=list
```

Run individual layers:

```bash
npm run test:lab-health -- --reporter=list
npm run test:terminal-completion -- --reporter=list
npm run test:command-usability -- --reporter=list
```

From this WSL environment, Node is currently available through Windows rather than Linux, so use:

```bash
cmd.exe /c "cd /d C:\Users\Owner\Desktop\Terminal labs\mobile-terminal-labs && npm run test:terminal-qa -- --reporter=list"
```

## What Each Layer Checks

`test:lab-health`

- Static scenario contract audit for Windows, Linux, and Cisco.
- Checks scenario/step text for placeholders like `undefined`, `null`, `todo`, empty command snippets, and missing command candidates.
- Checks mobile first-step command controls for every scenario.
- Checks virtual filesystem properties for Windows/Linux path normalization, relative reads, full paths, copy-into-folder, move, and hidden-file listing behavior.

`test:terminal-completion`

- Runs the expected command path through every tested lab.
- Has separate mobile and desktop tests.
- Mobile verifies that each expected command is visible as a command choice and progresses the step.
- Desktop verifies that the typed expected command progresses the step.

`test:command-usability`

- Regression and realistic-variant tests.
- Covers the reported Windows lab: `Find and Verify the Notes Folder`.
- Verifies copied files open by full path and relative path.
- Verifies copied files appear as files, not accidental directories.
- Extends the pattern to case-note copy, hidden-plan copy, and move/rename verification.

## Current Results Before Handoff

Latest focused runs:

- `test:lab-health`: 3 passed.
- `test:command-usability`: 4 passed.
- `test:terminal-completion`: 2 passed.

Run `test:terminal-qa` after this memo to confirm the complete bundle in one command.

## Next Best Work

Broaden `test:lab-health` further so it discovers more issues without manual lab testing:

- Add static checks for file paths named in `type`, `cat`, `copy`, `move`, `ren`, `attrib`, `grep`, and Cisco `show` steps.
- Simulate expected file creation across scenario steps and flag verify steps that cannot possibly open the target file.
- Add Windows slash/backslash variants for path commands.
- Add Linux relative/full path variants for `cat`, `cp`, `mv`, `grep`, `tar`, `unzip`.
- Add Cisco abbreviation/alias checks such as `show ip int brief`, `sh ip int br`, `conf t`, `int g0/0`.
- Add reset checks: complete part of a lab, reset it, then confirm files/state return to the original environment.
- Add wrong-but-reasonable command checks that expect helpful guidance rather than dead-end failure.

## Product Direction Note

Do not pivot away from the current mobile/browser approach yet. Keep the simulated terminal for mobile and beginner labs. VM/container-backed environments can come later for deeper desktop practice, but the immediate reliability win is automated lab discovery and broader command-engine property tests.
