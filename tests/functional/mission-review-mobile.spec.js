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

async function loadMobileNotesMission(page) {
  await gotoAndStabilize(page, "/terminal-coach.html?track=windows&mode=beginner&skipIntro=1");
  await page.evaluate(() => localStorage.setItem("networkingGame.explainerSeen.ping", "1")).catch(() => {});
  await page.evaluate(() => window.TerminalEngine?.loadScenarioById?.("win-cd-notes-folder"));
  await page.waitForTimeout(200);
  await dismissTicketBriefingIfPresent(page);
  await dismissCommandExplainerIfPresent(page);
}

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
  await loadMobileNotesMission(page);

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

test("mobile mission review stays hidden before mission completion", async ({ page }) => {
  await loadMobileNotesMission(page);
  await expect(page.locator("#missionReviewCard")).toBeHidden();
  await expect(page.locator("[data-mobile-command-choice]").first()).toBeVisible();

  const hiddenState = await page.evaluate(() => {
    const card = document.querySelector("#missionReviewCard");
    const rect = card?.getBoundingClientRect();
    return {
      hiddenAttr: card?.hasAttribute("hidden") || false,
      display: card ? getComputedStyle(card).display : "",
      bodyLocked: document.body.classList.contains("terminal-review-open"),
      width: rect?.width || 0,
      height: rect?.height || 0
    };
  });

  expect(hiddenState.hiddenAttr).toBe(true);
  expect(hiddenState.display).toBe("none");
  expect(hiddenState.bodyLocked).toBe(false);
  expect(hiddenState.width).toBe(0);
  expect(hiddenState.height).toBe(0);
});

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

  await page.locator("#missionReviewCard .mission-review-close").click();
  await expect(review).toBeHidden();
  await expect(page.locator("[data-mobile-command-choice]").first()).toBeVisible();
  await expect(page.locator("body")).not.toHaveClass(/terminal-review-open/);
});

test("wide mobile mission review renders above the haze", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 768, height: 844 } });
  try {
    await completeNotesMission(page);
    const review = page.locator("#missionReviewCard");
    await expect(review).toBeVisible();

    const paintState = await page.evaluate(() => {
      const card = document.querySelector("#missionReviewCard");
      const close = document.querySelector("#missionReviewCard .mission-review-close");
      const rect = card?.getBoundingClientRect();
      const centerX = rect ? Math.floor(rect.left + rect.width / 2) : 0;
      const centerY = rect ? Math.floor(rect.top + Math.min(rect.height / 2, 220)) : 0;
      const topElement = document.elementFromPoint(centerX, centerY);
      return {
        display: card ? getComputedStyle(card).display : "",
        zIndex: card ? Number(getComputedStyle(card).zIndex) : 0,
        closeVisible: close ? getComputedStyle(close).display !== "none" : false,
        topElementInsideCard: Boolean(topElement && card?.contains(topElement)),
        width: rect?.width || 0,
        height: rect?.height || 0
      };
    });

    expect(paintState.display).not.toBe("none");
    expect(paintState.zIndex).toBeGreaterThanOrEqual(10000);
    expect(paintState.closeVisible).toBe(true);
    expect(paintState.topElementInsideCard).toBe(true);
    expect(paintState.width).toBeGreaterThan(0);
    expect(paintState.height).toBeGreaterThan(0);
  } finally {
    await page.close();
  }
});
