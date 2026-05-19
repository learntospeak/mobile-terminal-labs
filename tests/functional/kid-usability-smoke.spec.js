const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");

const ROOT = path.resolve(__dirname, "../..");
const REPORT_DIR = path.join(ROOT, "test-results");
const REPORT_PATH = path.join(REPORT_DIR, "kid-usability-smoke-report.md");
const BASE_URL = "http://127.0.0.1:4173";

const PAGES = [
  { name: "Home / Learning Hub", url: "/index.html" },
  { name: "Beginner Roadmap", url: "/beginner-roadmap.html" },
  { name: "Subnetting Lab", url: "/subnetting-lab.html" },
  { name: "Network Ports Lab", url: "/network-ports-lab.html" },
  { name: "HTTP Reference Lab", url: "/web-http-lab.html" },
  { name: "Protocol Simulator", url: "/protocol-sim.html" },
  { name: "ARP / Protocol Merge Lab", url: "/protocol-merge.html" },
  { name: "Linux Terminal Coach", url: "/terminal-coach.html?track=linux" },
  { name: "Windows Beginner Terminal Coach", url: "/terminal-coach.html?track=windows&mode=beginner" },
  { name: "Cisco CLI Lab", url: "/cisco-cli-lab.html" },
  { name: "Cyber Challenge Mode", url: "/challenge-mode.html" },
  { name: "Auth Confirmed", url: "/auth-confirmed.html" }
];

const ROOT_PAGE_URLS = new Set(["/index.html"]);

const HARD_WORDS = [
  "authentication",
  "broadcast",
  "certificate",
  "cidr",
  "credentials",
  "datagram",
  "ephemeral",
  "exploit",
  "gateway",
  "interface",
  "kerberos",
  "malicious",
  "misconfigured",
  "protocol",
  "repository",
  "subnet",
  "synchronize",
  "telemetry",
  "transport",
  "vulnerability"
];

const SIMPLE_ACTION_RE = /\b(home|back|start|next|continue|try|retry|hint|help|quiz|practice|close|exit|submit|check|run|begin|open)\b/i;
const HOME_RE = /\b(home|back|main app|exit lab|learning hub)\b/i;

function scorePage(metrics) {
  let score = 100;

  if (!metrics.hasClearTitle) score -= 20;
  if (!metrics.hasHomeNav) score -= 15;
  if (!metrics.hasObviousAction) score -= 15;
  if (metrics.desktopOverflow.hasOverflow) score -= 20;
  if (metrics.mobileOverflow.hasOverflow) score -= 20;
  if (metrics.clippedButtons.length) score -= Math.min(20, metrics.clippedButtons.length * 5);
  if (metrics.longParagraphs.length) score -= Math.min(15, metrics.longParagraphs.length * 3);
  if (metrics.hardWordHits.length > 8) score -= 10;
  if (metrics.questionIssues.length) score -= Math.min(16, metrics.questionIssues.length * 4);
  if (metrics.consoleErrors.length || metrics.pageErrors.length || metrics.requestFailures.length) score -= 12;

  if (score >= 82) return { score, rating: "Easy" };
  if (score >= 65) return { score, rating: "Okay" };
  return { score, rating: "Confusing" };
}

function unique(items) {
  return Array.from(new Set(items.filter(Boolean)));
}

async function collectMetrics(page, browser, pageDef) {
  const consoleErrors = [];
  const pageErrors = [];
  const requestFailures = [];
  const pageUrl = new URL(pageDef.url, BASE_URL).href;

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message || String(error)));
  page.on("response", (response) => {
    const status = response.status();
    if (status >= 400 && !/favicon\.ico$/i.test(response.url())) {
      requestFailures.push(`${status} ${response.url()}`);
    }
  });

  await page.goto(pageUrl, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await dismissCommonOverlays(page);

  const desktop = await page.evaluate(({ hardWords, simpleActionPattern, homePattern, isRootPage }) => {
    const isVisible = (node) => {
      if (!node || node.closest("[hidden]") || node.hidden) return false;
      let current = node;
      while (current && current.nodeType === Node.ELEMENT_NODE) {
        const style = window.getComputedStyle(current);
        if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
        current = current.parentElement;
      }
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const normalize = (text) => String(text || "").replace(/\s+/g, " ").trim();
    const visibleText = normalize(document.body.innerText || "");
    const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
      .filter(isVisible)
      .map((node) => normalize(node.textContent))
      .filter(Boolean);
    const interactive = Array.from(document.querySelectorAll("button, a[href], [role='button']"))
      .filter(isVisible)
      .map((node) => ({
        tag: node.tagName.toLowerCase(),
        text: normalize(node.textContent || node.getAttribute("aria-label") || node.getAttribute("title") || ""),
        aria: normalize(node.getAttribute("aria-label") || ""),
        rect: node.getBoundingClientRect().toJSON ? node.getBoundingClientRect().toJSON() : {}
      }));
    const buttons = Array.from(document.querySelectorAll("button, a[href], [role='button']"))
      .filter(isVisible)
      .map((node) => {
        const before = window.getComputedStyle(node, "::before");
        const style = window.getComputedStyle(node);
        const text = normalize(node.textContent || node.getAttribute("aria-label") || node.getAttribute("title") || "");
        return {
          text,
          fontSize: style.fontSize,
          hasAccessibleName: Boolean(node.getAttribute("aria-label") || node.getAttribute("title")),
          clientWidth: node.clientWidth,
          scrollWidth: node.scrollWidth,
          clientHeight: node.clientHeight,
          scrollHeight: node.scrollHeight,
          paddingRight: style.paddingRight,
          beforeRight: before.content === "none" ? "" : before.right,
          beforeTop: before.content === "none" ? "" : before.top,
          beforeTransform: before.content === "none" ? "" : before.transform,
          beforeAnimation: before.content === "none" ? "" : before.animationName
        };
      });
    const paragraphs = Array.from(document.querySelectorAll("p, li, .hint, #feedback, .ports-quiz-feedback"))
      .filter(isVisible)
      .map((node) => normalize(node.textContent))
      .filter(Boolean);
    const longParagraphs = paragraphs.filter((text) => text.length > 220).slice(0, 8);
    const hardWordHits = hardWords
      .filter((word) => new RegExp("\\b" + word + "\\b", "i").test(visibleText))
      .slice(0, 20);
    const questionTexts = Array.from(document.querySelectorAll("h1, h2, h3, p, li, button, label, #question, [id*='question'], [class*='question'], [class*='prompt']"))
      .filter(isVisible)
      .map((node) => normalize(node.textContent))
      .filter((text) => text.includes("?"))
      .map((text) => text.slice(0, 260));
    const questionIssues = questionTexts
      .filter((text) => text.length > 180 || (text.match(/\?/g) || []).length > 1)
      .slice(0, 8);

    return {
      title: document.title,
      headings,
      visibleTextLength: visibleText.length,
      interactive,
      buttons,
      longParagraphs,
      hardWordHits,
      questionTexts,
      questionIssues,
      hasClearTitle: headings.some((heading) => heading.length >= 4 && heading.length <= 80),
      hasHomeNav: isRootPage || interactive.some((item) => new RegExp(homePattern, "i").test(item.text || item.aria)),
      hasObviousAction: interactive.some((item) => new RegExp(simpleActionPattern, "i").test(item.text || item.aria)),
      desktopOverflow: {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth + 2
      }
    };
  }, {
    hardWords: HARD_WORDS,
    simpleActionPattern: SIMPLE_ACTION_RE.source,
    homePattern: HOME_RE.source,
    isRootPage: ROOT_PAGE_URLS.has(pageDef.url)
  });

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mobile = await mobileContext.newPage();
  await mobile.goto(pageUrl, { waitUntil: "domcontentloaded" });
  await mobile.waitForLoadState("networkidle").catch(() => {});
  await dismissCommonOverlays(mobile);
  const mobileOverflow = await mobile.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    hasOverflow: document.documentElement.scrollWidth > window.innerWidth + 2
  }));
  const mobileButtonProblems = await mobile.evaluate(() => {
    const isVisible = (node) => {
      if (!node || node.closest("[hidden]") || node.hidden) return false;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden") return false;
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    return Array.from(document.querySelectorAll("button, a[href], [role='button']"))
      .filter(isVisible)
      .map((node) => ({
        text: String(node.textContent || node.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 80),
        clientWidth: node.clientWidth,
        scrollWidth: node.scrollWidth,
        clientHeight: node.clientHeight,
        scrollHeight: node.scrollHeight
      }))
      .filter((item) => !(item.hasAccessibleName && item.fontSize === "0px"))
      .filter((item) => item.scrollWidth > item.clientWidth + 3 || item.scrollHeight > item.clientHeight + 6)
      .slice(0, 8);
  });
  await mobileContext.close();

  const clippedButtons = desktop.buttons
    .filter((item) => !(item.hasAccessibleName && item.fontSize === "0px"))
    .filter((item) => item.scrollWidth > item.clientWidth + 3 || item.scrollHeight > item.clientHeight + 6)
    .concat(mobileButtonProblems.map((item) => ({ ...item, mobile: true })))
    .slice(0, 10);

  const lightIssues = desktop.buttons
    .filter((item) => item.beforeRight && /netlabLight/i.test(item.beforeAnimation || "") && (item.beforeRight === "auto" || item.beforeTop === "50%" || item.beforeTransform !== "none"))
    .slice(0, 8);

  const metrics = {
    ...desktop,
    mobileOverflow,
    clippedButtons,
    lightIssues,
    consoleErrors: unique(consoleErrors),
    pageErrors: unique(pageErrors),
    requestFailures: unique(requestFailures)
  };

  return {
    ...metrics,
    ...scorePage(metrics)
  };
}

async function dismissCommonOverlays(page) {
  const selectors = [
    "#beginnerOnboardingStartBtn",
    "#ticketBriefingStartBtn",
    "#referenceModalCloseBtn",
    "#portsModalCloseBtn"
  ];

  for (const selector of selectors) {
    const locator = page.locator(selector);
    if (await locator.isVisible().catch(() => false)) {
      await locator.click().catch(() => {});
      await page.waitForTimeout(120);
    }
  }
}

function markdownReport(results) {
  const lines = [];
  lines.push("# Kid Usability Smoke Report");
  lines.push("");
  lines.push("Audience assumption: a curious 10-year-old with basic reading skills and no prior networking knowledge.");
  lines.push("");
  lines.push("| Page | Rating | Score | Main Concern |");
  lines.push("| --- | --- | ---: | --- |");

  for (const result of results) {
    const concern = firstConcern(result);
    lines.push(`| ${result.name} | ${result.rating} | ${result.score} | ${concern} |`);
  }

  lines.push("");
  lines.push("## Page Notes");
  lines.push("");

  for (const result of results) {
    lines.push(`### ${result.name}`);
    lines.push(`URL: \`${result.url}\``);
    lines.push(`Rating: **${result.rating}** (${result.score}/100)`);
    lines.push("");
    lines.push("- Clear page title: " + yesNo(result.hasClearTitle));
    lines.push("- Home/back/exit navigation visible: " + yesNo(result.hasHomeNav));
    lines.push("- Obvious next action visible: " + yesNo(result.hasObviousAction));
    lines.push("- Desktop horizontal overflow: " + yesNo(result.desktopOverflow.hasOverflow));
    lines.push("- Mobile horizontal overflow: " + yesNo(result.mobileOverflow.hasOverflow));
    lines.push("- Visible interactive controls: " + result.interactive.length);
    lines.push("- Visible text load: " + result.visibleTextLength + " characters");

    if (result.headings.length) {
      lines.push("- First headings: " + result.headings.slice(0, 4).map((item) => `“${item}”`).join(", "));
    }
    if (result.hardWordHits.length) {
      lines.push("- Vocabulary to explain: " + result.hardWordHits.slice(0, 10).join(", "));
    }
    if (result.longParagraphs.length) {
      lines.push("- Long text blocks: " + result.longParagraphs.length + " found");
    }
    if (result.questionTexts.length) {
      lines.push("- Question prompts found: " + result.questionTexts.length);
    }
    if (result.questionIssues.length) {
      lines.push("- Question clarity flags: " + result.questionIssues.map((item) => `“${item}”`).join(" | "));
    }
    if (result.clippedButtons.length) {
      lines.push("- Button fit flags: " + result.clippedButtons.map((item) => `“${item.text || "(blank)"}”`).join(", "));
    }
    if (result.lightIssues.length) {
      lines.push("- Flashing-light placement flags: " + result.lightIssues.map((item) => `“${item.text || "(blank)"}”`).join(", "));
    }
    if (result.consoleErrors.length || result.pageErrors.length || result.requestFailures.length) {
      lines.push("- Technical errors:");
      result.consoleErrors.forEach((error) => lines.push("  - Console: " + error));
      result.pageErrors.forEach((error) => lines.push("  - Page: " + error));
      result.requestFailures.forEach((error) => lines.push("  - Request: " + error));
    }

    lines.push("");
  }

  lines.push("## Recommended Fix Order");
  lines.push("");
  lines.push("1. Fix pages rated Confusing first, especially missing obvious next actions or noisy first screens.");
  lines.push("2. Add short beginner definitions beside hard networking terms that appear before practice questions.");
  lines.push("3. Keep each task screen to one primary action, one helper action, and one exit/home action where possible.");
  lines.push("4. Re-run this smoke test after content or layout changes.");
  lines.push("");

  return lines.join("\n");
}

function firstConcern(result) {
  if (result.pageErrors.length) return "JavaScript page error";
  if (result.requestFailures.length) return "Missing or failed resource";
  if (!result.hasClearTitle) return "Page purpose not obvious";
  if (!result.hasHomeNav) return "No clear way back";
  if (!result.hasObviousAction) return "Next action unclear";
  if (result.mobileOverflow.hasOverflow) return "Mobile horizontal scrolling";
  if (result.clippedButtons.length) return "Button text may not fit";
  if (result.longParagraphs.length) return "Long reading blocks";
  if (result.hardWordHits.length > 8) return "Heavy vocabulary";
  return "Looks navigable";
}

function yesNo(value) {
  return value ? "Yes" : "No";
}

test("10-year-old navigation smoke audit for all pages", async ({ browser }, testInfo) => {
  test.setTimeout(180_000);

  const context = await browser.newContext({ viewport: { width: 1280, height: 850 } });
  const page = await context.newPage();
  const results = [];

  for (const pageDef of PAGES) {
    const metrics = await collectMetrics(page, browser, pageDef);
    results.push({ ...pageDef, ...metrics });
  }

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const markdown = markdownReport(results);
  fs.writeFileSync(REPORT_PATH, markdown, "utf8");

  await testInfo.attach("kid-usability-smoke-report", {
    body: Buffer.from(markdown, "utf8"),
    contentType: "text/markdown"
  });
  await testInfo.attach("kid-usability-smoke-data", {
    body: Buffer.from(JSON.stringify(results, null, 2), "utf8"),
    contentType: "application/json"
  });

  await context.close();

  expect(results.length).toBe(PAGES.length);
  expect(results.every((result) => result.desktopOverflow && result.mobileOverflow)).toBeTruthy();
});
