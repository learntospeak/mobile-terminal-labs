const { test, expect } = require("@playwright/test");
const {
  checkNoHorizontalOverflow,
  gotoAndStabilize,
  readText,
  runTerminalCommand
} = require("./smoke-helpers");

async function clearProgress(page) {
  await page.evaluate(() => {
    localStorage.removeItem("netlab-guest-progress-v2");
    localStorage.removeItem("netlab-progress-v1");
  });
}

test("Home Resume button opens a safe beginner lab fallback", async ({ page }) => {
  await gotoAndStabilize(page, "/index.html");
  await clearProgress(page);
  await page.reload({ waitUntil: "domcontentloaded" });

  const resume = page.locator("#resumeLastBtn");
  await expect(resume).toBeVisible();
  await expect(resume).toHaveText(/Resume/i);

  await resume.click();
  await expect(page).toHaveURL(/terminal-coach\.html.*track=windows/);
  await expect(page.locator("#terminalPageTitle")).toBeVisible();
});

test("Home Resume button continues saved lab progress", async ({ page }) => {
  await gotoAndStabilize(page, "/index.html");
  await clearProgress(page);
  await page.evaluate(() => {
    window.NetlabApp.saveSectionProgress("linux-terminal", {
      currentItemId: "smoke-linux",
      currentItemLabel: "Linux smoke task",
      completedCount: 1,
      totalCount: 5,
      state: null
    });
  });
  await expect(page.locator("#resumeLastBtn")).toHaveText(/Resume Last Lab/);

  await page.locator("#resumeLastBtn").click();
  await expect(page.locator("#hubResumeModal")).toBeVisible();
  await page.locator("#hubResumeContinue").click();
  await expect(page).toHaveURL(/terminal-coach\.html.*track=linux/);
  await expect(page.locator("#terminalOutput")).toBeVisible();
});

test("Terminal major buttons trigger visible behavior", async ({ page }) => {
  await gotoAndStabilize(page, "/terminal-coach.html?track=linux");
  await clearProgress(page);

  const start = page.locator("#ticketBriefingStartBtn");
  if (await start.isVisible().catch(() => false)) {
    await start.click();
  }

  const beforeHintLines = await page.locator("#terminalOutput .terminal-line").count();
  await page.locator("#hintBtn").click();
  await expect.poll(() => page.locator("#terminalOutput .terminal-line").count()).toBeGreaterThan(beforeHintLines);

  await page.locator("#watchWalkthroughBtn").click();
  await expect(page.locator("#walkthroughCard")).toBeVisible();
  const firstCounter = (await readText(page, "#walkthroughStepCounter")).trim();
  await page.locator("#walkthroughNextBtn").click();
  if (/of 1/i.test(firstCounter)) {
    await expect(page.locator("#walkthroughCard")).toBeHidden();
  } else {
    await expect(page.locator("#walkthroughStepCounter")).toContainText(/2/);
    await page.locator("#walkthroughCloseBtn").click();
  }
  await expect(page.locator("#walkthroughCard")).toBeHidden();

  const beforeObjective = (await readText(page, "#stepObjective")).trim();
  const result = await runTerminalCommand(page, "pwd");
  expect(result.delta.length).toBeGreaterThan(0);

  if (await page.locator("#taskCompleteCard").isVisible().catch(() => false)) {
    await expect(page.locator("#taskCompleteNextBtn")).toBeVisible();
    await page.locator("#taskCompleteNextBtn").click();
    await expect(page.locator("#taskCompleteCard")).toBeHidden();
    expect((await readText(page, "#stepObjective")).trim().length).toBeGreaterThan(0);
    expect((await readText(page, "#stepObjective")).trim()).not.toBe(beforeObjective);
  }

  await page.locator("#terminalInput").fill("ls");
  await page.locator("#terminalForm button[type='submit']").click();
  await expect.poll(() => page.locator("#terminalOutput .terminal-line").count()).toBeGreaterThan(0);
});

test("Mobile terminal command-choice and popup controls remain usable", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await gotoAndStabilize(page, "/terminal-coach.html?track=windows&mode=beginner&start=1");
  await clearProgress(page);

  const overflow = await checkNoHorizontalOverflow(page);
  expect(overflow.hasOverflow).toBeFalsy();

  if (await page.locator("#beginnerOnboardingStartBtn").isVisible().catch(() => false)) {
    await page.locator("#beginnerOnboardingStartBtn").click();
  }
  if (await page.locator("#ticketBriefingStartBtn").isVisible().catch(() => false)) {
    await page.locator("#ticketBriefingStartBtn").click();
  }

  await expect(page.locator("#terminalInput")).toBeHidden();
  const firstChoice = page.locator("[data-mobile-command-choice]").first();
  await expect(firstChoice).toBeVisible();
  const beforeLines = await page.locator("#terminalOutput .terminal-line").count();
  await firstChoice.click();
  await expect.poll(() => page.locator("#terminalOutput .terminal-line").count()).toBeGreaterThan(beforeLines);

  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("button", { name: /Beginner Guide|Instructions/ }).click();
  await expect(page.locator(".terminal-mobile-info-overlay")).toBeVisible();
  await page.locator(".terminal-mobile-info-overlay .terminal-mobile-overlay-close").click();
  await expect(page.locator(".terminal-mobile-info-overlay")).toBeHidden();

  await context.close();
});
