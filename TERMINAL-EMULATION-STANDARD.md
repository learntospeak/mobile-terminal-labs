# Terminal Emulation Standard

This document defines how the terminal labs should behave before launch.

The goal is not to run a full Windows, Linux, or Cisco operating system. The goal is to create a believable training emulator that behaves consistently enough for beginners to learn real troubleshooting habits.

---

# Core Principle

The learner should feel like they are using a simplified real terminal.

That means:

- commands change state when they should
- prompts reflect current state
- folder/mode movement is realistic
- wrong commands produce useful errors
- safe exploration is allowed
- lesson guidance follows the actual state
- command buttons match the current state
- recovery is possible without resetting

The lesson should not assume the learner followed the perfect path if they did something else.

---

# Why The Current Flow Feels Wrong

The current beginner flow can behave like this:

1. Task says: move into a specific folder.
2. Command buttons offer unrelated folders.
3. Learner taps a valid but wrong command.
4. Prompt changes.
5. Lesson guidance still assumes the expected path.
6. Learner is stuck or confused.

This means the terminal state and lesson state are not fully aligned.

The fix is not just better wording. The fix is state-aware lesson logic.

---

# Required Behaviour Model

Every command attempt should be evaluated in three layers:

## 1. Shell Emulation Layer

What would the command do in this simulated environment?

Examples:

- `cd Logs` changes folder only if `Logs` exists from current location.
- `cd ..` moves up one folder.
- `dir` lists the current folder.
- `type notes.txt` reads a file only if it exists in the current folder or valid path.
- Cisco `exit` moves back one CLI mode.
- Cisco `end` returns to privileged EXEC.

This layer answers:

> What happened to the simulated machine?

## 2. Lesson Evaluation Layer

Did that command satisfy the current task?

Examples:

- If task expects `cd Reports` but learner runs `cd Logs`, shell movement may succeed, but lesson should not advance.
- If task expects `dir`, repeating `dir` should be exploration, not a failure.
- If task expects Cisco interface config and user is in user EXEC mode, do not advance; explain the missing mode.

This layer answers:

> Did this command solve the current objective?

## 3. Guidance Layer

What should the learner do next based on where they actually are?

Examples:

- Wrong folder: “You moved into Logs. This task needs Reports. Use `cd ..`, then `cd Reports`.”
- Backtracked: “You moved back to C:\\Lab. Use `dir` to see the folders, then enter the required folder.”
- Missing file: “That file is not in this folder. Use `dir` to list what is here.”
- Cisco wrong mode: “You are in Router>. Use `enable` before running show/config commands.”

This layer answers:

> How do we guide the learner from the current real state back to the objective?

---

# Lesson Flow Model

We should not necessarily start a brand-new disconnected card after every task.

A better structure is:

## Mission / Ticket

A real-world problem, such as:

- user cannot access a website
- file server is unreachable
- router interface is down
- suspicious process is running

## Stages

A mission can have several stages:

1. Understand the problem
2. Check current state
3. Navigate to evidence
4. Run diagnostic command
5. Interpret output
6. Resolve or identify issue
7. Review what happened

## Tasks

Each stage contains small tasks, but the terminal session continues.

The learner should feel like they are working through one continuous ticket, not restarting the world every few seconds.

---

# Recommended Product Decision

Keep the current scenario/card system internally, but present it as a continuous ticket.

Do not rebuild the app into one giant free terminal yet.

Instead:

- Keep scenario stages.
- Keep progress tracking.
- Keep task completion.
- Let terminal state continue within the mission.
- Allow safe movement and exploration.
- Make the UI say “Next step” rather than feeling like a brand-new disconnected card.

This gives structure without making it messy.

---

# Windows CMD Emulation Requirements

## Folder Movement

Must support:

- `cd folder`
- `cd ..`
- `cd .`
- `cd \`
- `cd C:\\Path`
- `cd C:/Path`
- relative paths like `cd Incidents\\Notes`
- quoted paths later if needed

Expected behaviour:

- prompt updates after successful `cd`
- invalid folder shows an error
- folder names should be case-insensitive in Windows CMD
- `dir` should reflect the current folder

## File Reading

Must support:

- `type file.txt`
- `type folder\\file.txt`
- missing file error
- wrong folder guidance

## Safe Exploration

These commands should generally be safe exploration unless the task specifically needs them:

- `dir`
- `cd ..`
- `cd .`
- `cd` with no target
- `tree` if supported
- `whoami`
- `hostname`

Safe exploration should not punish the learner.

## Recovery Guidance

If learner moves to wrong folder:

- do not mark task complete
- say where they are
- say where they need to be
- suggest the shortest recovery path

Example:

> You are now in C:\\Lab\\Logs. This task needs C:\\Lab\\Incidents\\Notes. Use `cd ..`, then `cd Incidents\\Notes`.

---

# Linux Shell Emulation Requirements

## Folder Movement

Must support:

- `pwd`
- `ls`
- `ls -a`
- `ls -la`
- `cd folder`
- `cd ..`
- `cd /absolute/path`
- `cd ~`
- relative paths

Expected behaviour:

- Linux paths are case-sensitive
- invalid folder gives error
- prompt updates after successful `cd`
- `pwd` always matches current state

## File Reading/Search

Must support:

- `cat file`
- `cat path/file`
- `grep pattern file`
- missing file error
- hidden file discovery via `ls -a` or `ls -la`

## Recovery Guidance

If learner is in wrong directory:

- show current directory
- suggest `pwd` or `ls`
- suggest relative or absolute path back to target

---

# Cisco IOS CLI Emulation Requirements

## Mode Movement

Must support:

- user EXEC: `Router>`
- privileged EXEC: `Router#`
- global config: `Router(config)#`
- interface config: `Router(config-if)#`

Commands:

- `enable`
- `configure terminal`
- `interface ...`
- `exit`
- `end`

Expected:

- prompt always reflects mode
- `exit` moves back one mode
- `end` returns to privileged EXEC
- config commands only work in valid modes
- show commands should behave according to mode rules used in this training shell

## Configuration State

If learner configures:

- hostname
- interface description
- IP address
- no shutdown
- route

Then later `show` output should reflect it.

## Recovery Guidance

If learner runs config command in wrong mode:

> You are in Router>. Use `enable`, then `configure terminal` before changing configuration.

If learner is in interface mode but needs global config:

> You are in interface mode. Use `exit` to return to global configuration mode.

---

# Command Buttons Must Be State-Aware

Command buttons should not be static generic choices.

They must be generated from:

- current shell/platform
- current objective
- current cwd/mode
- available files/folders
- expected target path/mode
- recovery state

## Good Button Logic

If task expects moving into `C:\\Lab\\Incidents\\Notes` and learner is at `C:\\Lab`:

Show:

- `dir`
- `cd Incidents`
- maybe `cd Incidents\\Notes` if direct path is acceptable

If learner is at `C:\\Lab\\Logs` by mistake:

Show:

- `cd ..`
- `dir`
- `cd ..\\Incidents\\Notes` if supported

If learner is already in correct folder:

Show:

- `dir`
- `type relevant-file.txt`
- next task command

## Bad Button Logic

Do not show random sibling folders just because they exist.

Do not show:

- `cd Logs`
- `cd Reports`
- `cd Shares`

unless they are directly useful for the current objective or recovery.

---

# Lesson Evaluation Categories

Every command should return one of these categories:

## success

The command satisfies the current task.

## exploration

The command is valid and safe but does not complete the task.

Examples:

- `dir`
- `pwd`
- `ls`
- `cd ..`
- repeating the previous context-check command

## partial

The command is related but incomplete.

Examples:

- `ipconfig` when task needs `ipconfig /all`
- `show interfaces` when task needs `show ip interface brief`
- `ls` when task needs `ls -la`

## wrong_context

The command is valid but run from the wrong location or mode.

Examples:

- `type note.txt` from wrong folder
- Cisco `ip address` outside interface config mode

## invalid_command

Command does not exist in this simulated shell.

## syntax_error

Command exists but arguments are malformed.

---

# Continuous Mission Recommendation

We should make beginner labs feel like one continuous terminal session per mission.

Recommended UX:

- Ticket opens once.
- Stage/task text updates as the learner progresses.
- Terminal history remains visible.
- Prompt and current directory/mode persist.
- Task complete says “Next step” instead of feeling like a reset.
- New mission starts only after the current ticket is finished.

This avoids making the app feel like disconnected flashcards.

---

# Automated Test Harness Goal

Manual testing is not enough.

We should build a small internal test harness that can run scripted command sequences against every scenario.

Each test should include:

- scenario id
- platform
- starting state
- command sequence
- expected cwd/mode after each command
- expected classification after each command
- expected step index movement
- expected recovery guidance keywords

Example Windows test:

```json
{
  "scenarioId": "windows-folder-triage",
  "commands": [
    { "input": "dir", "expect": { "classification": "exploration", "cwd": "C:/Lab" } },
    { "input": "cd Logs", "expect": { "classification": "exploration", "cwd": "C:/Lab/Logs", "advance": false } },
    { "input": "cd ..", "expect": { "classification": "exploration", "cwd": "C:/Lab" } },
    { "input": "cd Incidents", "expect": { "classification": "success", "cwd": "C:/Lab/Incidents" } }
  ]
}
```

Example Cisco test:

```json
{
  "scenarioId": "cisco-interface-recovery",
  "commands": [
    { "input": "ip address 192.168.10.1 255.255.255.0", "expect": { "classification": "wrong_context", "mode": "user-exec" } },
    { "input": "enable", "expect": { "classification": "exploration", "mode": "privileged-exec" } },
    { "input": "configure terminal", "expect": { "classification": "success", "mode": "global-config" } }
  ]
}
```

---

# Implementation Plan

## Phase 1: Stabilise Shell Emulation

- Verify Windows `cd`, `dir`, `type`, paths, and errors.
- Verify Linux `pwd`, `ls`, `cd`, `cat`, paths, and errors.
- Verify Cisco mode transitions and prompt updates.

## Phase 2: Fix Lesson Evaluation

- Ensure accepted commands check final state, not just raw input.
- Make wrong folders/modes fail gracefully.
- Add partial/exploration rules to beginner scenarios.

## Phase 3: Fix Command Buttons

- Generate command buttons from current state and objective.
- Prioritise safest beginner command.
- Add recovery buttons after mistakes.

## Phase 4: Continuous Ticket Feel

- Keep current terminal history.
- Avoid unnecessary card resets.
- Use “Next step” language.
- Keep mission context visible.

## Phase 5: Automated Regression Runner

- Add scripted test cases for Windows, Linux, Cisco.
- Run tests in browser or Node-compatible harness if possible.
- Use this before changing future lessons.

---

# Launch Standard

The labs are launch-ready only when:

- a learner can make normal mistakes and recover
- command buttons never point them in a wrong direction without explanation
- prompts always match state
- instructions always match state
- typed and tapped commands behave the same
- every beginner lesson passes the smoke test
