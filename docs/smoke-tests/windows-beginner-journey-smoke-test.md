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

## J. Upgrade 1: Beginner text simplification checks

Use this section specifically when simplifying the first Windows Beginner Lab mission text and investigation-start instructions.

Upgrade goal:

- New users should not see a wall of text before they understand what to do.
- The first screen should answer only: what is the mission, what is the current step, and what should I try next?
- Detailed context should still be available through existing details/help/case-file areas if needed.

Suggested target copy style:

```text
Mission: Find the incident note and move it to the handover folder.

Step 1: Look around the current folder.

Try: dir
```

### J1. Safety and scope

| Status | Test | Expected result |
|---|---|---|
| [ ] | Confirm repository before editing | Repo is `learntospeak/mobile-terminal-labs` |
| [ ] | Confirm wrong repo avoided | No files from `learntospeak/Networking-game` are opened for editing |
| [ ] | Confirm Patch Ping Run untouched | No Patch Ping Run file appears in changed files |
| [ ] | Confirm limited file scope | Only files related to Windows beginner mission text/investigation instructions are changed |
| [ ] | Confirm no broad redesign | Layout, routing, and unrelated lab systems are not rewritten |

### J2. First terminal message

| Status | Test | Expected result |
|---|---|---|
| [ ] | Open Windows Beginner Lab on mobile width | First terminal screen is readable without feeling like a long document |
| [ ] | Count visible intro sections | Initial terminal output shows no more than 3 core ideas: mission, current step, suggested action |
| [ ] | Check repeated labels | Repeated `[Mission]`, `[Stage]`, environment, and machine-context lines are removed or hidden from the first-view terminal output |
| [ ] | Check command clarity | User can see the first useful command or action without scrolling far |
| [ ] | Check terminal realism | Text still feels like a terminal/lab, not a generic webpage paragraph |
| [ ] | Check desktop view | Shorter text still looks correct on desktop |

### J3. Investigation-start / mission popup instructions

| Status | Test | Expected result |
|---|---|---|
| [ ] | Start investigation flow | Any mission-start or investigation popup uses short beginner-friendly wording |
| [ ] | Check popup length | Popup does not require reading multiple dense paragraphs before action |
| [ ] | Check first action | Popup makes the first decision/action obvious |
| [ ] | Check complexity ramp | First mission stays simple; later tickets may contain more detail as difficulty increases |
| [ ] | Check close/continue controls | User can dismiss or continue without confusion |
| [ ] | Check no duplicate instructions | Popup and terminal do not repeat the same long explanation |

### J4. Learning and support preservation

| Status | Test | Expected result |
|---|---|---|
| [ ] | Check help/details access | Extra mission context is still available through existing help/details/case-file controls if present |
| [ ] | Check Ask Coach/Hint/Commands | Help controls still work after the copy simplification |
| [ ] | Check wrong command feedback | Wrong commands still receive useful beginner feedback |
| [ ] | Check correct command feedback | Correct command still advances or confirms progress |
| [ ] | Check next task | Next task remains clear after the first task |

### J5. Mobile readability acceptance

| Status | Test | Expected result |
|---|---|---|
| [ ] | Test on phone-sized viewport | User can understand the first step in under 10 seconds |
| [ ] | Check scroll burden | User does not need to scroll through a long intro before seeing command choices/input |
| [ ] | Check tap targets | Command buttons remain visible and tappable |
| [ ] | Check mascot/overlays | Mascot or decorative elements do not cover important text/actions |
| [ ] | Check visual calm | First screen feels lighter and less intimidating than before |

### J6. Regression checks after Upgrade 1

| Status | Test | Expected result |
|---|---|---|
| [ ] | Run sections A-I above | Existing journey smoke test still passes |
| [ ] | Direct Windows lab URL | `terminal-coach.html?...skipIntro=1...` still opens correctly |
| [ ] | Linux lab | Linux text/flow is not unexpectedly changed |
| [ ] | Cisco lab | Cisco flow is not unexpectedly changed |
| [ ] | Cyber mode | Cyber mode is not unexpectedly changed |
| [ ] | Patch Ping Run | Patch Ping Run files remain untouched |

## Pass/fail decision

The upgrade passes only if:

- All required Windows Beginner journey tests pass.
- No Patch Ping Run files were touched.
- Other main lab links still open.
- No new flashing, redirect loops, or unwanted popups appear.
- For Upgrade 1, the first Windows beginner screen is noticeably shorter and easier to understand on mobile.
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
