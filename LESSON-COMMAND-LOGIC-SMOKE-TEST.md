# Lesson Command Logic Smoke Test

Purpose: verify every terminal lesson behaves like a realistic beginner-safe Windows CMD, Linux shell, or Cisco IOS CLI training environment.

This test is for lesson logic, command validation, command suggestions, recovery guidance, and state handling. It is not a visual design test.

---

# Golden Rule

A learner must be able to:

1. Follow the correct path and progress.
2. Make a realistic mistake and get useful guidance.
3. Move backwards and forwards in folders/modes without breaking the lesson.
4. Use typed commands or command buttons consistently.
5. Recover without resetting unless reset is genuinely needed.

If the app says the learner is in one place but the prompt, command buttons, or next instruction imply another place, the lesson fails the smoke test.

---

# Pages To Test

## Windows CMD Lessons

URL:

`terminal-coach.html?track=windows&mode=beginner&v=smoke`

Test all Windows beginner lessons, especially:

- folder navigation
- file discovery
- reading files
- network checks
- DNS checks
- route/gateway checks
- process/service tasks
- shares/mapped drive tasks

## Linux Lessons

URL:

`terminal-coach.html?track=linux&v=smoke`

Test all Linux lessons, especially:

- `pwd`
- `ls`
- `cd`
- `cat`
- `grep`
- `/var/log` navigation
- `/etc` navigation
- service/log investigation
- network checks

## Cisco CLI Lessons

URL:

`cisco-cli-lab.html?v=smoke`

Test all Cisco lessons, especially:

- user EXEC mode
- privileged EXEC mode
- global configuration mode
- interface configuration mode
- show commands
- configuration commands
- save/copy workflow
- moving back through modes with `exit` and `end`

## Cyber Challenge Lessons

URL:

`challenge-mode.html?v=smoke`

Test whether advanced challenge commands still follow realistic terminal behaviour, even if guidance is intentionally lighter.

---

# Universal Pass Criteria

For every lesson:

- The current objective is clear.
- The terminal prompt accurately reflects the current location or mode.
- The command buttons match the current objective and current state.
- The correct command advances the task.
- A realistic wrong command gives useful guidance.
- Safe exploration commands are allowed.
- Dangerous or irrelevant commands are not encouraged in beginner mode.
- Backtracking does not confuse the lesson.
- The next instruction matches the actual current state.
- The same command behaves consistently whether typed or tapped.

---

# Windows CMD Behaviour Tests

## Windows Test 1: `dir` from current folder

Steps:

1. Start a Windows beginner lesson.
2. Run `dir`.
3. Observe the listed files/folders.
4. Run `dir` again.

Expected:

- `dir` lists the current folder.
- Repeating `dir` is treated as safe exploration.
- The lesson should not falsely advance unless the objective is to list that folder.
- The coach should not punish repeated exploration.

Fail if:

- The output does not match the current prompt path.
- Repeating `dir` creates confusing feedback.
- The lesson advances when it should not.

---

## Windows Test 2: Correct folder movement

Steps:

1. Read the current objective.
2. Move into the requested folder using `cd foldername`.
3. Confirm the prompt changes.
4. Check the next instruction.

Expected:

- The prompt changes to the correct folder.
- The lesson advances if entering that folder was the objective.
- The next instruction matches the new folder.
- Command buttons update to suit the new location.

Fail if:

- The prompt changes but the task text still assumes the old folder.
- The task says to enter one folder but suggests another folder.
- The correct folder command is missing from the buttons.

---

## Windows Test 3: Wrong folder movement

Steps:

1. When the task asks for a specific folder, enter a different folder.
2. Example: task expects `cd Reports`, but learner enters `cd Logs`.
3. Observe feedback and command buttons.

Expected:

- The prompt should show the folder actually entered.
- The task should not be marked complete.
- The coach should say the learner is not in the expected location.
- The UI should offer recovery:
  - `cd ..`
  - `dir`
  - the correct next `cd` when appropriate

Fail if:

- Wrong folder is marked correct.
- Coach says “next step” as if the learner is in the expected folder.
- Buttons keep suggesting unrelated folders.
- Learner cannot recover without reset.

---

## Windows Test 4: Backtracking with `cd ..`

Steps:

1. Move into a subfolder.
2. Run `cd ..`.
3. Run `dir`.
4. Continue toward the objective.

Expected:

- `cd ..` moves up one folder.
- `dir` now lists the parent folder.
- The app should guide the learner forward again.
- Backtracking should be treated as exploration or recovery, not a fatal mistake.

Fail if:

- The prompt moves back but guidance still assumes the subfolder.
- Buttons use stale folder context.
- The lesson cannot recover.

---

## Windows Test 5: Invalid folder

Steps:

1. Run `cd madeupfolder`.
2. Observe output and coach guidance.

Expected:

- CMD-style error, such as path not found.
- Prompt remains unchanged.
- Coach suggests `dir` or the expected folder.

Fail if:

- The app moves into a nonexistent folder.
- The prompt changes incorrectly.
- Coach gives unrelated guidance.

---

## Windows Test 6: File read workflow

Steps:

1. Navigate to a folder with files.
2. Run `dir`.
3. Run `type filename.txt`.
4. Try `type` on the wrong file or missing file.

Expected:

- `type` displays file content when file exists.
- Missing file produces an error and does not advance.
- Wrong file should be treated as exploration unless it is unsafe.
- The coach should guide the learner to the correct file.

Fail if:

- Wrong file completes the task.
- Missing file changes state incorrectly.
- Command buttons point to files that do not exist in the current folder.

---

## Windows Test 7: Network command realism

Commands to test:

- `ipconfig`
- `ipconfig /all`
- `ping target`
- `ping fileserver`
- `nslookup fileserver`
- `tracert web-lab`
- `route print`
- `arp -a`
- `netstat -ano`

Expected:

- Output should match the simulated environment.
- Correct command advances only when it answers the objective.
- Similar but incomplete commands should produce partial guidance.
- Dangerous commands should be simulated, not actually destructive.

Fail if:

- A network command gives impossible or inconsistent output.
- The coach tells the learner to run a command that does not work.
- Buttons offer command variations irrelevant to the current objective.

---

# Linux Shell Behaviour Tests

## Linux Test 1: `pwd`, `ls`, `cd`

Steps:

1. Run `pwd`.
2. Run `ls`.
3. Move into a listed folder with `cd folder`.
4. Run `pwd` again.
5. Run `cd ..`.

Expected:

- `pwd` always shows the current directory.
- `ls` matches that directory.
- `cd folder` only works for real directories.
- `cd ..` moves up one level.
- Prompt/location and task guidance stay aligned.

Fail if:

- `ls` shows files for the wrong directory.
- The app advances when the learner moved to the wrong folder.
- Command buttons do not update after `cd`.

---

## Linux Test 2: Absolute vs relative paths

Steps:

1. From any folder, run an absolute path command like `cd /var/log` if relevant.
2. From a parent folder, run a relative path command like `cd logs` if relevant.
3. Try invalid casing where Linux should be case-sensitive.

Expected:

- Absolute paths work from anywhere if valid.
- Relative paths work only from the correct current directory.
- Linux path casing matters.
- Guidance explains path mistakes simply.

Fail if:

- Linux behaves like Windows case-insensitive paths.
- Invalid relative paths incorrectly work.
- The coach assumes the learner is somewhere else.

---

## Linux Test 3: File read and search

Commands to test where relevant:

- `cat filename`
- `less filename` if supported
- `grep pattern filename`
- `ls -la`

Expected:

- Existing files show expected content.
- Missing files produce useful errors.
- Search commands only complete the task when the correct evidence is found.

Fail if:

- Wrong file completes the task.
- Missing file advances.
- Hidden-file tasks do not explain `ls -a` or `ls -la`.

---

## Linux Test 4: Safe exploration

Steps:

1. Run `pwd`, `ls`, and `cd ..` at different points.
2. Repeat safe commands.
3. Try going into unrelated folders.

Expected:

- Exploration is allowed.
- The lesson keeps track of the real current directory.
- The coach helps the learner return to the task.

Fail if:

- Exploration breaks progression.
- The learner gets trapped.
- The next instruction becomes stale.

---

# Cisco IOS CLI Behaviour Tests

## Cisco Test 1: Mode transitions

Commands to test:

- `enable`
- `configure terminal`
- `interface GigabitEthernet0/0`
- `exit`
- `end`

Expected:

- Prompt changes realistically.
- `exit` moves back one mode.
- `end` returns to privileged EXEC mode.
- Commands only work in the correct mode.
- Coach guidance follows the current mode.

Fail if:

- Config commands work in user EXEC mode.
- Prompt mode is wrong.
- The app tells user to run an interface command from the wrong mode without explaining how to get there.

---

## Cisco Test 2: Show commands

Commands to test:

- `show ip interface brief`
- `show running-config`
- `show startup-config`
- `show ip route`

Expected:

- Show commands work from privileged EXEC mode.
- Useful errors or guidance appear from incorrect modes.
- Output reflects configured changes.

Fail if:

- Output does not update after configuration.
- Wrong mode still completes objective incorrectly.

---

## Cisco Test 3: Configuration and save

Commands to test:

- `hostname RouterName`
- `description ...`
- `ip address ...`
- `no shutdown`
- `copy running-config startup-config`

Expected:

- Configuration changes update simulated device state.
- Save workflow only completes after the appropriate save command.
- Prompt and mode remain correct.

Fail if:

- Save completes without config being correct.
- Interface changes do not affect show output.
- Mode navigation breaks.

---

# Mobile Command Button Tests

Run this on every lesson type.

## Button Test 1: Correct command present

For the current objective:

- The correct command should be present as a button if mobile command buttons are being used.
- If several commands are valid, the safest beginner command should appear first.

Fail if:

- Correct command is missing.
- First button leads learner away from the objective.
- Button uses a folder/file that does not exist from current location.

---

## Button Test 2: Buttons update after state changes

Steps:

1. Tap one command button.
2. Observe prompt/output.
3. Check the new buttons.
4. Go back or move to another folder/mode.
5. Check buttons again.

Expected:

- Buttons always match current state.
- Recovery buttons appear after mistakes.
- Irrelevant stale buttons disappear.

Fail if:

- Buttons are generated from the old state.
- Buttons assume learner is in the wrong folder or mode.
- Buttons keep suggesting completed steps.

---

# Mistake Recovery Tests

## Recovery Test 1: Typo

Examples:

- Windows: `dr`, `cd Reprots`, `ipconfg`
- Linux: `sl`, `cd /var/lgo`, `gerp`
- Cisco: `enabel`, `conf t` if unsupported, wrong interface name

Expected:

- Error is understandable.
- Prompt/mode does not change incorrectly.
- Coach suggests the likely intended command.

Fail if:

- Typo changes state.
- Coach gives unrelated advice.
- Command buttons do not help recover.

---

## Recovery Test 2: Out-of-order command

Examples:

- Run `type note.txt` before entering the correct folder.
- Run Cisco `ip address` before entering interface config mode.
- Run Linux `cat file` before finding the file.

Expected:

- The app explains what prerequisite is missing.
- The app points user back to the correct step.

Fail if:

- Out-of-order command completes task.
- User receives vague incorrect feedback.

---

# Regression Checklist For Each Lesson

For each lesson, record:

- Lesson name:
- Platform: Windows / Linux / Cisco / Cyber
- First objective clear? Yes / No
- Correct command works? Yes / No
- Wrong command handled? Yes / No
- Backtracking handled? Yes / No
- Buttons match state? Yes / No
- Typed and tapped commands match? Yes / No
- Prompt accurate? Yes / No
- Can recover without reset? Yes / No
- Notes:

---

# Known Issue To Fix First

Windows Beginner Lab folder/navigation scenario:

Observed bug:

- Learner is told to move into a notes folder.
- Command buttons offer unrelated folders such as `cd Logs` or `cd Incidents`.
- If learner moves backward or into the wrong folder, coach guidance does not reliably adapt to actual prompt/current folder.

Expected fix:

- Button generation must be state-aware and objective-aware.
- Wrong folder movement must trigger recovery guidance.
- Correct next folder must be shown when available.
- `cd ..` and `dir` should be treated as safe recovery/exploration.

---

# Implementation Rule

Do not patch one lesson by hardcoding only one command.

Fix the general command logic so every platform behaves like the environment it is simulating:

- Windows CMD path logic
- Linux path logic
- Cisco IOS mode logic
- typed command and button command consistency
- state-aware suggestions
- useful recovery feedback
