# Beginner Terminal Lab Launch Backlog

This document tracks larger usability improvements that should happen AFTER launch polish stabilisation.

---

# Completed Launch Polish

## Beginner Flow
- Simplified homepage
- Reduced decision overload
- Added beginner-first messaging
- Added guided launch card
- Added roadmap emphasis
- Hidden advanced labs behind disclosure

## Mobile Usability
- Larger controls
- Cleaner mobile layout
- Reduced visible clutter
- Simplified terminology
- Added clearer action labels
- Added beginner helper text

## Progressive Disclosure
- Hidden advanced environment/progress panels by default
- Reduced visible advanced navigation
- Added optional extra controls flow

---

# Remaining Phase 2 Improvements

## 1. Tap-to-Build Commands (HIGH PRIORITY)

Goal:
Allow beginners on mobile to build commands without typing everything manually.

Examples:
- [ipconfig]
- [/all]
- [ping]
- [google.com]

Could evolve into:
- guided command assembly
- drag-and-drop commands
- smart beginner suggestions

---

## 2. Beginner Scenario Rewrite Pass

Current issue:
Some scenarios still assume prior IT knowledge.

Need:
- simpler wording
- more real-world explanations
- clearer outcomes
- stronger handholding early on

Desired beginner flow:
1. What happened
2. What this means
3. What we check first
4. Which command to try
5. Why the output matters

---

## 3. Explainer Video System

Goal:
Short visual explainers for commands and concepts.

High-priority explainers:
- ping
- ipconfig
- tracert
- nslookup
- dir
- cd
- tasklist
- netstat

Video style:
- short
- beginner-friendly
- one concept at a time
- visual packet movement
- terminal + mascot overlay

---

## 4. Scenario Difficulty Smoothing

Current issue:
Difficulty jumps too quickly in some areas.

Need:
- smaller progression increments
- more repetition early on
- reinforcement missions
- confidence-building tasks

---

## 5. Accessibility Improvements

Need:
- larger tap targets
- stronger contrast checks
- keyboard navigation pass
- screen-reader labels
- motion reduction mode

---

## 6. Better Success Feedback

Current issue:
Task completion can feel flat.

Need:
- stronger completion moments
- clearer acknowledgement
- positive reinforcement
- real-world framing

Examples:
- Ticket resolved
- Connection restored
- DNS issue identified
- First-time fix achieved

---

## 7. Smart Beginner Detection

Potential future feature:
Detect repeated failures and automatically:
- simplify hints
- offer walkthrough sooner
- reduce typing requirements
- explain outputs more deeply

---

## 8. Guided Learning Paths

Future roadmap:
- Helpdesk Path
- Networking Path
- Cyber Beginner Path
- Linux Junior Admin Path

Each path:
- structured
- sequential
- skill-based

---

## 9. Session Save UX

Potential improvements:
- clearer resume states
- continue instantly
- recent tasks list
- quick return buttons

---

## 10. Launch QA Checklist

Before public launch:
- mobile browser testing
- Safari testing
- Android keyboard testing
- account sync QA
- resume flow QA
- broken scenario detection
- walkthrough coverage
- typo cleanup
- loading-state cleanup
- empty-state cleanup

---

# Important Architecture Rule

Do NOT rewrite the terminal engine.

Future improvements should:
- layer on top
- progressively simplify
- preserve existing systems
- preserve scenario engine
- preserve progress engine
- preserve Supabase integration

Goal:
Improve usability without turning the project into a different app.
