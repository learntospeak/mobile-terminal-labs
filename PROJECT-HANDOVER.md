# Mobile Terminal Labs — Project Handover

Last updated: 2026-05-22

This document is the central handover for the Mobile Terminal Labs / Networking Game project. Use it for future ChatGPT, VS Code, Codex, or manual development sessions so important context does not get lost in a long chat thread.

---

## 1. Working Repository

Active working repository:

`learntospeak/mobile-terminal-labs`

This is the safe working repo for Terminal Labs / Networking Game changes.

Important rule:

Do not touch the original/local-connected project repo unless the user explicitly asks. This repo exists so changes can be tested safely away from the user's local PC copy.

---

## 2. Public Site URLs

Main GitHub Pages site:

`https://learntospeak.github.io/mobile-terminal-labs/`

Homepage cache-bust example:

`https://learntospeak.github.io/mobile-terminal-labs/?v=current`

Windows beginner terminal coach:

`https://learntospeak.github.io/mobile-terminal-labs/terminal-coach.html?track=windows&mode=beginner`

Linux terminal coach:

`https://learntospeak.github.io/mobile-terminal-labs/terminal-coach.html?track=linux`

---

## 3. Dev / Admin Testing Area

Dev index page:

`https://learntospeak.github.io/mobile-terminal-labs/admin-dev.html?v=dev1`

Access word:

`patch`

Important: this is only a lightweight client-side gate for GitHub Pages. It hides test tools from normal navigation, but it is not true server-side security.

The dev index links to:

- emulator smoke tests
- connectivity smoke tests
- lab flow / engagement report
- direct links to patched Windows labs

Known issue: direct scenario links can still open the wrong beginner lab because the terminal engine may restore saved progress after the query parameter is processed. `direct-scenario-router.js` was added, but a deeper `terminalEngine.js` startup fix may still be needed.

---

## 4. Internal Test Pages

Emulator smoke test:

`https://learntospeak.github.io/mobile-terminal-labs/emulator-smoke-test.html?v=dev1`

Connectivity smoke test:

`https://learntospeak.github.io/mobile-terminal-labs/connectivity-smoke-test.html?v=dev1`

Lab flow / engagement report:

`https://learntospeak.github.io/mobile-terminal-labs/lab-flow-report.html?v=dev1`

The lab flow report can download:

- JSON report
- CSV engagement table
- flow cheat sheet showing lab steps and likely commands

---

## 5. Login / Secret Handling

Known non-sensitive dev access word:

`patch`

Do not store real passwords, Supabase keys, OpenAI keys, GitHub tokens, or billing credentials in this repo or in this document.

Supabase is used/planned for:

- user accounts
- login state
- progress tracking
- future subscription / paid plan status

Current note from development: progress/login behaviour may interact with terminal lab routing. When logged in, direct test links may restore previous progress and open the wrong lab. This needs direct startup-routing logic in `terminalEngine.js`.

---

## 6. Business / Product Direction

Working product name / direction:

Mobile Terminal Labs / Networking Game / Beginner Terminal Labs

Audience:

Beginners learning terminal, networking, troubleshooting, and cyber-adjacent workflows.

Goal:

Create a beginner-friendly but realistic training app where users practise Windows CMD, Linux terminal, Cisco CLI, networking checks, and support-ticket style troubleshooting.

Main product principle:

Labs should feel like realistic mini support tickets, not one-command flashcards.

Good lab pattern:

1. Read or understand the ticket.
2. Discover current state.
3. Inspect folders/files/network/processes safely.
4. Allow wrong but realistic commands.
5. Coach the user back if they go the wrong way.
6. Perform the real action.
7. Verify the result.
8. Create a short handover/conclusion note where useful.

Monetisation direction:

- Free beginner access with ads or limits.
- Paid/pro/admin tier later for more labs, progress tracking, advanced cyber labs, and AI coach features.
- Keep beginner experience polished before adding more business complexity.

---

## 7. Major UX Problem Identified

Many labs are too short on mobile.

The engagement report found:

- 143 total labs
- 114 weak or too short labs
- average engagement score: 64

Core issue:

On mobile, command choices can make some labs feel like answer buttons. The user can finish a lab in seconds without thinking.

Preferred fix:

Do not just hide answers. Instead, make labs longer and more meaningful:

- discovery step
- choice step
- action step
- verification step
- follow-up step from manager/ticket

Future mobile improvement:

Mobile buttons should show command families and staged sub-choices instead of always exposing the full final command.

Example staged mobile choices:

- Choose operation: `copy`
- Choose source: `ticket-note.txt`
- Choose destination: `Reports`
- Then build/submit the full command

---

## 8. Core Files Added During This Work

Testing / report files:

- `terminal-emulator-smoke.js`
- `emulator-smoke-test.html`
- `lesson-audit-core.js`
- `lesson-scenario-audit.js`
- `lesson-flow-smoke.js`
- `connectivity-flow-smoke.js`
- `connectivity-smoke-test.html`
- `lab-engagement-smoke.js`
- `lab-flow-report.html`
- `admin-dev.html`

Standards / notes:

- `TERMINAL-EMULATION-STANDARD.md`
- `LESSON-COMMAND-LOGIC-SMOKE-TEST.md`

Shared behaviour patches:

- `terminal-recovery-patterns.js`
- `modal-scroll-fix.css`
- `direct-scenario-router.js`

Patch loader:

- `mascot.js` currently loads shared theme, modal fixes, recovery patterns, and individual lab upgrade patch files.

---

## 9. Important Fixes Already Added

### Shared recovery layer

File:

`terminal-recovery-patterns.js`

Purpose:

Adds reusable recovery behaviour:

- Windows CMD: `dir`, `cd ..`, wrong folder recovery, file-read recovery.
- Linux: `pwd`, `ls`, `cd ..`, wrong directory recovery.
- Cisco: `show`, `exit`, `end`, mode recovery.

### Modal scroll / width fix

File:

`modal-scroll-fix.css`

Purpose:

Mission review / completion modals could be too wide or impossible to scroll to the bottom on mobile. This file constrains width and allows scrolling.

### Dev index

File:

`admin-dev.html`

Purpose:

A central index for smoke tests, flow report, and direct links.

### Direct scenario routing

File:

`direct-scenario-router.js`

Purpose:

Attempts to force `?scenario=...` links to open the requested lab.

Known issue:

Still may not win against terminal engine saved-progress restore. Needs direct engine-level fix if links still route to the wrong lab.

---

## 10. Patched / Expanded Windows Labs

The following Windows labs have been patched or partially patched into longer workflows.

### `win-dir-incident-triage`

Patch file:

`incident-folder-gold.js`

Status:

Gold standard starter lesson.

Expanded concept:

Find the incident note, read it, receive a manager follow-up, copy evidence to Reports/Handover, verify the copied file.

### `win-cd-notes-folder`

Patch file:

`windows-notes-upgrade.js`

Expanded concept:

`dir → cd Notes → dir → type ticket-note.txt → copy to Reports → verify copied file`

### `win-ping-fileserver`

Patch file:

`windows-ping-fileserver-upgrade.js`

Expanded concept:

`type ticket → ipconfig → ping by name → ping by IP → nslookup → conclusion note`

### `win-taskkill-updater`

Patch file:

`windows-taskkill-upgrade.js`

Expanded concept:

`tasklist → tasklist | findstr Updater → taskkill → verify → cleanup note`

### `win-attrib-hidden-plan`

Patch file:

`windows-attrib-upgrade.js`

Expanded concept:

`dir → dir /a → attrib hidden-plan.txt → type hidden-plan.txt → copy to Reports → verify copied file`

### `win-tree-toolbox-map`

Patch file:

`windows-tree-upgrade.js`

Expanded concept:

`dir → tree Tools → cd Tools/Docs → type checklist.txt → create toolbox-map note → verify`

### `win-copy-case-note`

Patch file:

`windows-copy-note-upgrade.js`

Expanded concept:

`dir → type case-note.txt → copy to Reports → verify copied note → list destination`

### `win-delete-old-dump`

Patch file:

`windows-delete-dump-upgrade.js`

Expanded concept:

`dir → type current-note.txt → del old-memory.dmp → dir verify → cleanup note → verify note`

### `win-type-more-audit-log`

Patch file:

`windows-type-more-upgrade.js`

Expanded concept:

`dir → type audit-log.txt → more audit-log.txt → findstr WARN → audit summary note → verify note`

### `win-host-and-user-identity`

Patch file:

`windows-host-user-upgrade.js`

Expanded concept:

`hostname → whoami → dir Reports → identity note → verify note`

### `win-xcopy-toolkit-bundle`

Patch file:

`windows-xcopy-upgrade.js`

Expanded concept:

`dir → dir Toolkit → xcopy Toolkit to Archive → cd copied Docs → type checklist.txt`

Known test issue:

Direct links may still open another saved lab, usually Hidden Attributes. Fix direct routing before relying on direct test URLs.

---

## 11. Current Known Bug

Problem:

Direct links from the dev page, such as:

`terminal-coach.html?track=windows&mode=beginner&scenario=win-xcopy-toolkit-bundle&resetLab=1`

can still open the hidden attributes lab after the intro/start button.

Likely reason:

`terminalEngine.js` builds the beginner roadmap scenario pool before or after query routing in a way that ignores the requested scenario, especially when saved progress exists.

Likely fix:

Patch `terminalEngine.js` directly near `configuredScenarioPool()` and/or scenario selection/startup state so:

- `scenario`, `scenarioId`, or `lesson` query parameter always overrides saved progress.
- Requested scenario is inserted into the beginner roadmap allowed IDs if missing.
- `resetLab=1` clears or ignores prior selected scenario/progress for that page load.

Do this before relying on direct admin links.

---

## 12. Remaining Windows File / Navigation Work

Continue with remaining weak Windows file/navigation labs from the flow report.

Still likely needing upgrades:

- `win-mkdir-rmdir-temp-workspace`
- `win-move-and-rename-review-note`
- possible cleanup/retest of `win-xcopy-toolkit-bundle` after routing fixed

Already patched in this category:

- `win-dir-incident-triage`
- `win-cd-notes-folder`
- `win-tree-toolbox-map`
- `win-copy-case-note`
- `win-xcopy-toolkit-bundle`
- `win-delete-old-dump`
- `win-type-more-audit-log`
- `win-attrib-hidden-plan`

---

## 13. Remaining Patch Categories

After Windows file/navigation is stable, continue in grouped categories:

1. Windows system/environment labs
2. Windows networking labs
3. Windows process/service labs
4. Windows users/shares/admin labs
5. Windows search/comparison labs
6. Linux/Nmap short labs
7. Netcat short labs
8. Proxy short labs
9. Cisco short labs
10. Challenge/advanced cleanup labs

Patch in small chunks. Large all-in-one patches have been blocked or interrupted.

---

## 14. Recommended Workflow For Future Sessions

When user says “continue patching”:

1. Pick the next weak lab from the current category.
2. Create one small patch file.
3. Load it through `mascot.js`.
4. Give only a short status and test link.
5. Avoid long explanations.

When blocked:

- retry smaller
- one lab per file
- avoid giant multi-lab patch files

Preferred user instruction:

> Execute only. No recap unless blocked.

---

## 15. Business Plan Snapshot

Short-term goal:

Make the beginner Windows/CMD learning path feel polished, useful, and not boring on mobile.

Medium-term goal:

Apply the same workflow model to Linux, Cisco, Nmap, Netcat, and proxy labs.

Long-term goal:

Turn the app into a beginner-to-intermediate terminal, networking, and cyber troubleshooting trainer with:

- user accounts
- saved progress
- streaks / daily challenges
- skill paths
- more realistic tickets
- AI helper / tutor
- paid advanced labs
- ads or freemium monetisation

Key principle:

Quality of the first few labs matters more than adding many shallow labs.

---

## 16. Final Reminder

The user does not want long repeating summaries during active implementation.

When implementing:

- make the change
- commit it
- provide the link
- say what was changed in one or two lines only

Keep this handover updated after major changes.
