const { test, expect } = require("@playwright/test");
const {
  dismissCommandExplainerIfPresent,
  dismissTaskCompleteIfPresent,
  dismissTicketBriefingIfPresent,
  gotoAndStabilize
} = require("./smoke-helpers");

test.use({
  viewport: { width: 390, height: 844 },
  screenshot: "only-on-failure",
  trace: "retain-on-failure"
});

async function clickMobileCommand(page, command) {
  const clicked = await page.evaluate((target) => {
    const normalizedTarget = target.trim().toLowerCase();
    const button = Array.from(document.querySelectorAll("[data-mobile-command-choice]"))
      .find((node) => (node.getAttribute("data-mobile-command-choice") || "").trim().toLowerCase() === normalizedTarget);
    if (!button) return false;
    button.click();
    return true;
  }, command);
  expect(clicked, `Expected mobile command choice "${command}" to be visible`).toBe(true);
}

async function completeNotesMission(page) {
  await gotoAndStabilize(page, "/terminal-coach.html?track=windows&mode=beginner&skipIntro=1");
  await page.evaluate(() => localStorage.setItem("networkingGame.explainerSeen.ping", "1")).catch(() => {});
  await page.evaluate(() => window.TerminalEngine?.loadScenarioById?.("win-cd-notes-folder"));
  await page.waitForTimeout(200);
  await dismissTicketBriefingIfPresent(page);
  await dismissCommandExplainerIfPresent(page);

  for (const command of [
    "dir",
    "cd Notes",
    "dir",
    "type ticket-note.txt",
    "copy ticket-note.txt C:/Lab/Reports/",
    "type C:/Lab/Reports/ticket-note.txt"
  ]) {
    await dismissTaskCompleteIfPresent(page);
    await clickMobileCommand(page, command);
    await page.waitForFunction(() => {
      const snapshot = window.TerminalEngine?.getRuntimeSnapshot?.();
      return Boolean(snapshot?.scenarioCompleted || document.querySelector("#taskCompleteCard:not([hidden])"));
    }, null, { timeout: 8_000 }).catch(() => {});
  }
}

test("mobile mission review opens as a contained readable modal", async ({ page }) => {
  await completeNotesMission(page);
  const review = page.locator("#missionReviewCard");
  await expect(review).toBeVisible();

  const layout = await page.evaluate(() => {
    const card = document.querySelector("#missionReviewCard");
    const head = card?.querySelector(".mission-review-head");
    const close = card?.querySelector(".mission-review-close");
    const grid = card?.querySelector(".mission-review-grid");
    if (!card || !head || !close || !grid) {
      return { missing: true };
    }

    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const cardRect = card.getBoundingClientRect();
    const headRect = head.getBoundingClientRect();
    const closeRect = close.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    const gridColumns = getComputedStyle(grid).gridTemplateColumns
      .split(" ")
      .filter(Boolean).length;

    return {
      missing: false,
      bodyLocked: document.body.classList.contains("terminal-review-open"),
      card: {
        top: cardRect.top,
        left: cardRect.left,
        right: cardRect.right,
        bottom: cardRect.bottom,
        width: cardRect.width,
        height: cardRect.height
      },
      closeWidth: closeRect.width,
      closeTop: closeRect.top,
      closeLeft: closeRect.left,
      headBottom: headRect.bottom,
      gridTop: gridRect.top,
      gridColumns,
      viewport
    };
  });

  expect(layout.missing).toBe(false);
  expect(layout.bodyLocked).toBe(true);
  expect(layout.card.left).toBeGreaterThanOrEqual(0);
  expect(layout.card.right).toBeLessThanOrEqual(layout.viewport.width);
  expect(layout.card.top).toBeGreaterThanOrEqual(0);
  expect(layout.card.bottom).toBeLessThanOrEqual(layout.viewport.height);
  expect(layout.closeWidth).toBeLessThan(layout.card.width * 0.45);
  expect(layout.closeLeft).toBeGreaterThan(layout.card.left + layout.card.width * 0.55);
  expect(layout.gridTop).toBeGreaterThan(layout.headBottom - 1);
  expect(layout.gridColumns).toBe(1);
});
