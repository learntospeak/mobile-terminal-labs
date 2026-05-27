# Windows Beginner Journey Smoke Test

Purpose: use this checklist before and after every Windows Beginner Lab usability or functionality change.

This is a manual smoke test. Do not move on to the next upgrade until every required item passes or the failure is documented and fixed.

## Hard safety rules

- Target repo must be `learntospeak/mobile-terminal-labs`.
- Do not use or edit `learntospeak/Networking-game`.
- Do not touch Patch Ping Run files unless the task is specifically about Patch Ping Run.
- Keep each upgrade small enough that this checklist can identify what broke.

## Files that must stay untouched during normal Terminal Lab work

- `patch-ping-run-tree.html`
- `patch-ping-run-fog.js`
- `patch-ping-run-result-next.js`
- `patch-ping-run-premium-ending.js`
- `patch-ping-run-premium-egg.css`
- `patch-ping-run-map-render.js`

## Test environment notes

Record these before testing:

- Date:
- Tester:
- Browser:
- Device:
- Screen size:
- Branch/commit:
- Change being tested:

## Required smoke test path

Expected user path:

`index.html` -> `windows-beginner-intro.html` -> `side-scroller-intro/index.html?embed=terminal` -> `terminal-coach.html?track=windows&mode=beginner&skipIntro=1&scenario=win-dir-incident-triage&resetLab=1&directLab=1`

## A. Repo and file safety

| Status | Test | Expected result |
|---|---|---|
| [ ] | Confirm repository | Repo is `learntospeak/mobile-terminal-labs` |
| [ ] | Confirm homepage title | `index.html` title is `Terminal Learning - Beginner Labs` |
| [ ] | Confirm launcher exists | `windows-beginner-intro.html` exists |
| [ ] | Confirm Patch Ping Run files untouched | No Patch Ping Run file appears in changed files |
| [ ] | Confirm change scope | Changed files match the current upgrade only |

## B. Homepage start flow

| Status | Test | Expected result |
|---|---|---|
| [ ] | Open `index.html` | Homepage loads without console errors that block usage |
| [ ] | Click main Start Windows Lab button | Opens `windows-beginner-intro.html` |
| [ ] | Click sidebar Windows Lab card | Opens `windows-beginner-intro.html` |
| [ ] | Click terminal preview Run button | Opens `windows-beginner-intro.html` |
| [ ] | Click Linux Beginner | Opens Linux lab, not Windows launcher |
| [ ] | Click Cisco CLI Basics | Opens Cisco lab |
| [ ] | Click Cyber Security | Opens Cyber mode |

## C. Cyber Ops intro launcher

| Status | Test | Expected result |
|---|---|---|
| [ ] | Open `windows-beginner-intro.html` directly | Cyber Ops intro page loads |
| [ ] | Confirm iframe source | Intro iframe uses `./side-scroller-intro/index.html?embed=terminal` |
| [ ] | Watch intro start | No flash back to terminal coach during intro |
| [ ] | Wait for intro completion | Redirects to Windows Beginner Lab automatically |
| [ ] | Click Skip Intro | Immediately opens Windows Beginner Lab |
| [ ] | Wait long enough for Continue button | Continue appears if intro takes too long |
| [ ] | Click Continue | Opens Windows Beginner Lab |

## D. Windows Beginner Lab load

| Status | Test | Expected result |
|---|---|---|
| [ ] | Confirm final URL | URL includes `track=windows`, `mode=beginner`, `skipIntro=1`, `scenario=win-dir-incident-triage`, `resetLab=1`, `directLab=1` |
| [ ] | Confirm no embedded intro flash | `terminal-coach.html` does not show the Cyber Ops intro overlay again |
| [ ] | Confirm lab UI loads | Windows Beginner Lab content appears |
| [ ] | Confirm terminal is usable | Terminal input can be focused |
| [ ] | Confirm user can type | Typed command appears in input |
| [ ] | Submit a command | Terminal accepts Enter/click submit path |

## E. Unwanted Task Note regression

| Status | Test | Expected result |
|---|---|---|
| [ ] | Inspect page visually after command | No `Task note` card appears |
| [ ] | Inspect DOM if possible | `#taskCompleteCard` is hidden or not visible |
| [ ] | Inspect DOM if possible | `#taskCompleteOverlay` is hidden or not visible |
| [ ] | Complete a task | No unwanted inline `Task note` popup appears |
| [ ] | Move to next task | User can continue via the intended lab controls |

## F. Beginner task behaviour

| Status | Test | Expected result |
|---|---|---|
| [ ] | Read active task | Current objective is clear |
| [ ] | Enter a wrong command | User receives helpful feedback, not a broken state |
| [ ] | Enter the expected command | User receives a correct/success response |
| [ ] | Complete first task | Progress advances normally |
| [ ] | Start next task | Next objective appears clearly |
| [ ] | Refresh page | Lab remains usable after refresh |

## G. Mobile usability quick check

| Status | Test | Expected result |
|---|---|---|
| [ ] | Open homepage on mobile width | No horizontal scrolling caused by layout |
| [ ] | Start Windows Lab on mobile | Launcher opens cleanly |
| [ ] | Skip intro on mobile | Button is tappable and opens lab |
| [ ] | Focus terminal input on mobile | Input remains visible enough to use |
| [ ] | Type command on mobile | Keyboard does not completely block the active task/input flow |
| [ ] | Scroll terminal output | User can reach latest output |

## H. Regression checks for other areas

| Status | Test | Expected result |
|---|---|---|
| [ ] | Linux lab opens | Linux lab still loads |
| [ ] | Cisco lab opens | Cisco CLI lab still loads |
| [ ] | Cyber mode opens | Cyber Security/Cyber Mode still loads |
| [ ] | Beginner roadmap opens | Roadmap still loads |
| [ ] | Patch Ping Run standalone path opens, if tested | Patch Ping Run still works and was not modified |

## I. Console and visual stability

| Status | Test | Expected result |
|---|---|---|
| [ ] | Check browser console on homepage | No critical errors blocking navigation |
| [ ] | Check browser console on intro launcher | No critical errors blocking redirect |
| [ ] | Check browser console on Windows lab | No critical errors blocking terminal usage |
| [ ] | Observe page transitions | No repeated flashing or redirect loop |
| [ ] | Test browser Back button | User can recover without getting trapped |

## Pass/fail decision

The upgrade passes only if:

- All required Windows Beginner journey tests pass.
- No Patch Ping Run files were touched.
- Other main lab links still open.
- No new flashing, redirect loops, or unwanted popups appear.
- Any failures are fixed before the next upgrade begins.

## Failure log

Use this section when something fails.

| Date | Test ID/section | Failure | Suspected file | Fix commit | Retested |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## Upgrade gate

Before starting a new usability upgrade, write the proposed change here:

- Upgrade name:
- User problem it solves:
- Files expected to change:
- Smoke tests most likely to catch regressions:
- Rollback plan:

Do not start coding until this section is filled in for the upgrade.
