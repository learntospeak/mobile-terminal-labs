const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const {
  addLabHealth,
  attachSmokeData,
  checkNoHorizontalOverflow,
  createSmokeReport,
  observePage,
  pushCheck,
  pushWarning
} = require("./smoke-helpers");

const QUALITY_PAGES = [
  { name: "Home", url: "/index.html", expectedText: /terminal|lab|cyber|network/i },
  { name: "Beginner Roadmap", url: "/beginner-roadmap.html", expectedText: /beginner|roadmap|lab/i },
  { name: "Windows Beginner Terminal", url: "/terminal-coach.html?track=windows&mode=beginner", expectedText: /terminal|scenario|command|windows/i },
  { name: "Subnetting Lab", url: "/subnetting-lab.html", expectedText: /subnet|network|answer/i },
  { name: "HTTP Lab", url: "/web-http-lab.html", expectedText: /http|request|response|web/i }
];

const VIEWPORTS = [
  { name: "desktop", width: 1366, height: 768, minTouchSize: 0 },
  { name: "mobile", width: 390, height: 844, minTouchSize: 36 }
];

test.use({ screenshot: "off", trace: "off", video: "off" });

async function dismissKnownEntryModals(page) {
  const selectors = [
    "#beginnerOnboardingStartBtn",
    "#ticketBriefingStartBtn",
    "#taskCompleteCloseBtn",
    "[data-close]",
    "[aria-label='Close']"
  ];

  for (const selector of selectors) {
    const node = page.locator(selector).first();
    if (await node.isVisible().catch(() => false)) {
      await node.evaluate((element) => element.click()).catch(() => {});
      await page.waitForTimeout(150);
    }
  }
}

async function gotoQualityPage(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(350);
}

async function collectUsabilitySignals(page) {
  return page.evaluate(() => {
    const isVisible = (node) => {
      if (!node || node.closest("[hidden]") || node.hidden) return false;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const visibleText = (selector) => Array.from(document.querySelectorAll(selector))
      .filter(isVisible)
      .map((node) => (node.textContent || node.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim())
      .filter(Boolean);

    const actions = Array.from(document.querySelectorAll("button, a[href], input, select, textarea"))
      .filter(isVisible)
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          tag: node.tagName.toLowerCase(),
          text: (node.textContent || node.getAttribute("aria-label") || node.getAttribute("title") || node.value || "").replace(/\s+/g, " ").trim(),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          left: Math.round(rect.left)
        };
      });

    const headings = visibleText("h1, h2, [role='heading']");
    const bodyText = (document.body?.innerText || "").replace(/\s+/g, " ").trim();
    const longActionLabels = actions.filter((item) => item.text.length > 80).map((item) => item.text);
    const emptyActions = actions.filter((item) => !item.text && item.tag !== "input");

    return {
      title: document.title || "",
      headings,
      bodyTextLength: bodyText.length,
      firstScreenText: bodyText.slice(0, 600),
      actionCount: actions.length,
      primaryActionCount: actions.filter((item) => /(start|continue|open|learn|begin|run|submit|try|resume|view)/i.test(item.text)).length,
      smallTouchTargets: actions.filter((item) => item.width < 36 || item.height < 36).slice(0, 12),
      longActionLabels,
      emptyActionCount: emptyActions.length
    };
  });
}

async function collectOverlapSignals(page) {
  return page.evaluate(() => {
    const isVisible = (node) => {
      if (!node || node.closest("[hidden]") || node.hidden) return false;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const nodes = Array.from(document.querySelectorAll("button, a[href], input, select, textarea, h1, h2, [role='button']"))
      .filter(isVisible)
      .map((node) => ({
        node,
        label: (node.textContent || node.getAttribute("aria-label") || node.getAttribute("title") || node.id || node.className || node.tagName).toString().replace(/\s+/g, " ").trim().slice(0, 80),
        rect: node.getBoundingClientRect()
      }));

    const overlaps = [];
    for (let a = 0; a < nodes.length; a += 1) {
      for (let b = a + 1; b < nodes.length; b += 1) {
        if (nodes[a].node.contains(nodes[b].node) || nodes[b].node.contains(nodes[a].node)) {
          continue;
        }
        const first = nodes[a].rect;
        const second = nodes[b].rect;
        const xOverlap = Math.max(0, Math.min(first.right, second.right) - Math.max(first.left, second.left));
        const yOverlap = Math.max(0, Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top));
        if (xOverlap * yOverlap > 80) {
          overlaps.push(`${nodes[a].label} overlaps ${nodes[b].label}`);
        }
      }
    }

    return overlaps.slice(0, 12);
  });
}

for (const viewport of VIEWPORTS) {
  test.describe(`Responsive QA: ${viewport.name}`, () => {
    test.describe.configure({ timeout: 15_000 });
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const qualityPage of QUALITY_PAGES) {
      test(`Responsive layout and comprehension: ${qualityPage.name} on ${viewport.name}`, async ({ page }, testInfo) => {
        const report = createSmokeReport(`${qualityPage.name} ${viewport.name} QA`, qualityPage.url);
        addLabHealth(report, { pagesTested: [`${qualityPage.name} ${viewport.name}`] });
        observePage(page, report);

        await gotoQualityPage(page, qualityPage.url);
        await dismissKnownEntryModals(page);

        const issues = [];
        const overflow = await checkNoHorizontalOverflow(page);
        pushCheck(report, "no horizontal overflow", !overflow.hasOverflow, JSON.stringify(overflow));
        if (overflow.hasOverflow) issues.push(`horizontal overflow: ${JSON.stringify(overflow)}`);

        const signals = await collectUsabilitySignals(page);
        const hasExpectedText = qualityPage.expectedText.test(signals.firstScreenText);
        const hasOrientation = signals.title.trim().length > 0 || signals.headings.length > 0;
        const hasUsefulContent = signals.bodyTextLength > 120;
        const hasActions = signals.actionCount > 0;
        const hasClearPrimaryAction = signals.primaryActionCount > 0 || /terminal|question|command/i.test(signals.firstScreenText);

        pushCheck(report, "page has orientation title or heading", hasOrientation, JSON.stringify({ title: signals.title, headings: signals.headings.slice(0, 3) }));
        pushCheck(report, "first screen matches expected topic", hasExpectedText, signals.firstScreenText);
        pushCheck(report, "page has useful visible content", hasUsefulContent, String(signals.bodyTextLength));
        pushCheck(report, "page has usable actions", hasActions, String(signals.actionCount));
        pushCheck(report, "primary action or task is understandable", hasClearPrimaryAction, signals.firstScreenText);
        pushCheck(report, "action labels are concise", signals.longActionLabels.length === 0, signals.longActionLabels.join(" | "));
        pushCheck(report, "interactive controls have names", signals.emptyActionCount === 0, String(signals.emptyActionCount));
        if (signals.longActionLabels.length) {
          pushWarning(report, `Long action labels: ${signals.longActionLabels.join(" | ")}`);
        }

        if (!hasOrientation) issues.push("missing title or visible heading");
        if (!hasExpectedText) issues.push("first screen does not match expected topic");
        if (!hasUsefulContent) issues.push(`not enough visible content: ${signals.bodyTextLength} chars`);
        if (!hasActions) issues.push("no visible interactive actions");
        if (!hasClearPrimaryAction) issues.push("missing clear primary action or task cue");
        if (signals.emptyActionCount) issues.push(`${signals.emptyActionCount} interactive controls have no accessible name`);

        if (viewport.minTouchSize) {
          const meaningfulSmallTargets = signals.smallTouchTargets.filter((item) => item.text && !/x|×/i.test(item.text));
          pushCheck(report, "mobile touch targets are large enough", meaningfulSmallTargets.length === 0, JSON.stringify(meaningfulSmallTargets));
          if (meaningfulSmallTargets.length) issues.push(`small mobile touch targets: ${JSON.stringify(meaningfulSmallTargets)}`);
        }

        const overlaps = await collectOverlapSignals(page);
        pushCheck(report, "key controls do not visibly overlap", overlaps.length === 0, overlaps.join(" | "));
        if (overlaps.length) issues.push(`visible overlap: ${overlaps.join(" | ")}`);

        await testInfo.attach(`${qualityPage.name}-${viewport.name}-screenshot`, {
          body: await page.screenshot({ fullPage: false, timeout: 5_000 }),
          contentType: "image/png"
        });

        await attachSmokeData(testInfo, report);
        expect(issues).toEqual([]);
      });
    }
  });
}

test.describe("Accessibility QA", () => {
  test.describe.configure({ timeout: 20_000 });

  for (const qualityPage of QUALITY_PAGES) {
    test(`Accessibility scan: ${qualityPage.name}`, async ({ page }, testInfo) => {
      const report = createSmokeReport(`${qualityPage.name} Accessibility`, qualityPage.url);
      addLabHealth(report, { pagesTested: [`${qualityPage.name} accessibility`] });
      observePage(page, report);

      await gotoQualityPage(page, qualityPage.url);
      await dismissKnownEntryModals(page);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const seriousOrCritical = results.violations.filter((item) => ["serious", "critical"].includes(item.impact));
      const critical = results.violations.filter((item) => item.impact === "critical");

      pushCheck(report, "no critical accessibility violations", critical.length === 0, critical.map((item) => item.id).join(" | "));
      pushCheck(report, "serious/critical accessibility issues recorded", seriousOrCritical.length === 0, seriousOrCritical.map((item) => `${item.impact}:${item.id}`).join(" | "));

      if (seriousOrCritical.length) {
        pushWarning(report, `Accessibility issues: ${seriousOrCritical.map((item) => `${item.impact}:${item.id}`).join(", ")}`);
      }

      await testInfo.attach("axe-results", {
        body: Buffer.from(JSON.stringify(results, null, 2), "utf8"),
        contentType: "application/json"
      });
      await attachSmokeData(testInfo, report);

      expect(critical).toEqual([]);
    });
  }
});
