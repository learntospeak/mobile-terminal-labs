const { test, expect } = require("@playwright/test");
const {
  attachSmokeData,
  createSmokeReport,
  gotoAndStabilize,
  observePage,
  pushCheck,
  runTerminalCommand
} = require("./smoke-helpers");

test.use({ screenshot: "off", trace: "off", video: "off" });

async function dismissEntryModals(page) {
  for (const selector of ["#beginnerOnboardingStartBtn", "#ticketBriefingStartBtn", "#startScenarioBtn"]) {
    const button = page.locator(selector).first();
    if (await button.isVisible().catch(() => false)) {
      await button.evaluate((node) => node.click()).catch(() => {});
      await page.waitForTimeout(150);
    }
  }
}

async function loadScenario(page, id) {
  const loaded = await page.evaluate((scenarioId) => window.TerminalEngine?.loadScenarioById?.(scenarioId), id);
  expect(loaded, `Scenario ${id} should be available on this page`).toBeTruthy();
  await page.waitForTimeout(250);
  await dismissEntryModals(page);
}

async function waitForScenarioReady(page, id, title) {
  await page.waitForFunction(
    ({ scenarioId, expectedTitle }) => {
      return window.ScenarioEngine?.scenarios?.some((scenario) => {
        return scenario?.id === scenarioId && (!expectedTitle || scenario.title === expectedTitle);
      });
    },
    { scenarioId: id, expectedTitle: title },
    { timeout: 5_000 }
  );
}

async function runAndRecord(page, report, command) {
  const result = await runTerminalCommand(page, command);
  report.commandResults.push(result);
  return result;
}

test("Windows natural relative file commands work after copy into current folder", async ({ page }, testInfo) => {
  const report = createSmokeReport("Windows Natural File Commands", "/terminal-coach.html?track=windows&mode=beginner&skipIntro=1");
  observePage(page, report);
  await gotoAndStabilize(page, report.url);
  await waitForScenarioReady(page, "win-cd-notes-folder", "Find and Verify the Notes Folder");
  await loadScenario(page, "win-cd-notes-folder");

  for (const command of [
    "dir",
    "cd Notes",
    "dir",
    "type ticket-note.txt",
    "copy ticket-note.txt C:/Lab/Reports/"
  ]) {
    const result = await runAndRecord(page, report, command);
    expect(result.accepted || result.progressed, `${command}: ${result.notes}`).toBeTruthy();
  }

  const fullPathOpen = await runAndRecord(page, report, "type C:/Lab/Reports/ticket-note.txt");
  pushCheck(report, "full path type opens copied note from any folder", fullPathOpen.accepted && fullPathOpen.progressed, fullPathOpen.notes);
  expect(fullPathOpen.accepted, fullPathOpen.notes).toBeTruthy();
  expect(fullPathOpen.progressed, fullPathOpen.notes).toBeTruthy();
  expect(fullPathOpen.notes).not.toMatch(/Path is not a file|No such file/i);

  await loadScenario(page, "win-cd-notes-folder");
  for (const command of [
    "dir",
    "cd Notes",
    "dir",
    "type ticket-note.txt",
    "copy ticket-note.txt C:/Lab/Reports/",
    "cd C:/Lab/Reports"
  ]) {
    const result = await runAndRecord(page, report, command);
    expect(result.accepted || result.progressed, `${command}: ${result.notes}`).toBeTruthy();
  }

  const listing = await runAndRecord(page, report, "dir");
  pushCheck(report, "copied note appears as a file, not a folder", /ticket-note\.txt/i.test(listing.notes) && !/ticket-note\.txt\//i.test(listing.notes), listing.notes);
  expect(listing.notes).toMatch(/ticket-note\.txt/i);
  expect(listing.notes).not.toMatch(/ticket-note\.txt\//i);

  const relativeOpen = await runAndRecord(page, report, "type ticket-note.txt");
  pushCheck(report, "relative type opens copied note from Reports", relativeOpen.accepted && relativeOpen.progressed, relativeOpen.notes);
  expect(relativeOpen.accepted, relativeOpen.notes).toBeTruthy();
  expect(relativeOpen.progressed, relativeOpen.notes).toBeTruthy();
  expect(relativeOpen.notes).not.toMatch(/Path is not a file|No such file/i);

  await attachSmokeData(testInfo, report);
});

const WINDOWS_FILE_VARIANTS = [
  {
    id: "win-copy-case-note",
    name: "Copy and Verify a Case Note",
    upgradedTitle: "Copy and Verify a Case Note",
    setup: ["dir", "type case-note.txt", "copy case-note.txt C:/Lab/Reports/"],
    fullPath: "type C:/Lab/Reports/case-note.txt",
    folder: "C:/Lab/Reports",
    listCommand: "dir",
    relative: "type case-note.txt",
    file: "case-note.txt"
  },
  {
    id: "win-attrib-hidden-plan",
    name: "Hidden Plan Copy",
    upgradedTitle: "Hidden File Attribute Review",
    setup: ["dir", "dir /a", "attrib hidden-plan.txt", "type hidden-plan.txt", "copy hidden-plan.txt C:/Lab/Reports/"],
    fullPath: "type C:/Lab/Reports/hidden-plan.txt",
    folder: "C:/Lab/Reports",
    listCommand: "dir /a",
    relative: "type hidden-plan.txt",
    file: "hidden-plan.txt"
  },
  {
    id: "win-move-and-rename-review-note",
    name: "Move and Rename Review Note",
    upgradedTitle: "Move, Rename, and Verify a Review Note",
    setup: ["dir C:/Lab/Review", "type C:/Lab/Review/review-draft.txt", "move C:/Lab/Review/review-draft.txt C:/Lab/Reports/", "ren C:/Lab/Reports/review-draft.txt review-final.txt"],
    fullPath: "type C:/Lab/Reports/review-final.txt",
    folder: "C:/Lab/Reports",
    listCommand: "dir",
    relative: "type review-final.txt",
    file: "review-final.txt"
  }
];

for (const variant of WINDOWS_FILE_VARIANTS) {
  test(`Windows file verification variants: ${variant.name}`, async ({ page }, testInfo) => {
    const report = createSmokeReport(`${variant.name} File Variants`, `/terminal-coach.html?track=windows&skipIntro=1&scenario=${variant.id}`);
    observePage(page, report);
    await gotoAndStabilize(page, report.url);
    await waitForScenarioReady(page, variant.id, variant.upgradedTitle);
    await loadScenario(page, variant.id);

    for (const command of variant.setup) {
      const result = await runAndRecord(page, report, command);
      expect(result.accepted || result.progressed, `${variant.id} ${command}: ${result.notes}`).toBeTruthy();
    }

    const fullPathOpen = await runAndRecord(page, report, variant.fullPath);
    pushCheck(report, `${variant.file} opens by full path`, fullPathOpen.accepted && fullPathOpen.progressed, fullPathOpen.notes);
    expect(fullPathOpen.accepted, fullPathOpen.notes).toBeTruthy();
    expect(fullPathOpen.progressed, fullPathOpen.notes).toBeTruthy();
    expect(fullPathOpen.notes).not.toMatch(/Path is not a file|No such file/i);

    await loadScenario(page, variant.id);
    for (const command of [...variant.setup, `cd ${variant.folder}`]) {
      const result = await runAndRecord(page, report, command);
      expect(result.accepted || result.progressed, `${variant.id} ${command}: ${result.notes}`).toBeTruthy();
    }

    const listing = await runAndRecord(page, report, variant.listCommand);
    const listingText = listing.delta.map((line) => line.text).join("\n");
    pushCheck(report, `${variant.file} appears as a file, not a folder`, listingText.includes(variant.file) && !listingText.includes(`${variant.file}/`), listingText);
    expect(listingText).toContain(variant.file);
    expect(listingText).not.toContain(`${variant.file}/`);

    const relativeOpen = await runAndRecord(page, report, variant.relative);
    pushCheck(report, `${variant.file} opens by relative path`, relativeOpen.accepted && relativeOpen.progressed, relativeOpen.notes);
    expect(relativeOpen.accepted, relativeOpen.notes).toBeTruthy();
    expect(relativeOpen.progressed, relativeOpen.notes).toBeTruthy();
    expect(relativeOpen.notes).not.toMatch(/Path is not a file|No such file/i);

    await attachSmokeData(testInfo, report);
  });
}
