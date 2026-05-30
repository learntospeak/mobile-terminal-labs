# Website QA Testing

This repo has a lightweight website QA stack built on Playwright plus axe accessibility checks.

## Commands

```bash
npm run test:website-qa
```

Runs the semi-professional website QA pass:

- desktop and mobile responsive checks
- basic comprehension checks
- horizontal overflow checks
- mobile touch target checks
- visible overlap checks
- screenshot attachments
- axe WCAG accessibility scans

```bash
npm run test:responsive
```

Runs only the responsive and comprehension checks.

```bash
npm run test:a11y
```

Runs only the accessibility scans.

```bash
npm run test:website-qa:headed
```

Runs the same QA pass with a visible browser for debugging.

## Reports

The custom reporter writes:

- `reports/smoke-report.html`
- `reports/smoke-report.json`

Playwright also writes failure details under `test-results/`.

## Current Thresholds

The QA pass fails on:

- horizontal page overflow
- missing page orientation title or heading
- first screen content that does not match the expected page topic
- pages with too little visible content
- pages without visible actions
- pages without a clear primary action or task cue
- unnamed interactive controls
- meaningful mobile touch targets smaller than 36px
- visibly overlapping key controls
- critical axe accessibility violations

Long action labels and serious non-critical accessibility findings are recorded as report warnings.
