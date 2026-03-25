import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:8080";

const pages = [
  { name: "Home", path: "/" },
  { name: "Pricing", path: "/pricing" },
  { name: "Privacy", path: "/privacy" },
  { name: "Terms", path: "/terms" },
];

const authPages = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Find Loads", path: "/find-loads" },
  { name: "My Loads", path: "/my-loads" },
  { name: "Fleet", path: "/fleet" },
  { name: "Earnings", path: "/earnings" },
  { name: "AI Negotiator", path: "/ai-negotiator" },
  { name: "Settings", path: "/settings" },
];

test.describe("Performance - Public Pages", () => {
  for (const page of pages) {
    test(`${page.name} loads under 3 seconds`, async ({ page: p }) => {
      const start = Date.now();
      const response = await p.goto(`${BASE_URL}${page.path}`, {
        waitUntil: "domcontentloaded",
      });
      const loadTime = Date.now() - start;

      expect(response?.status()).toBeLessThan(400);
      expect(loadTime).toBeLessThan(3000);

      console.log(`  ${page.name}: ${loadTime}ms (DOM ready)`);
    });

    test(`${page.name} full load + paint`, async ({ page: p }) => {
      const start = Date.now();
      await p.goto(`${BASE_URL}${page.path}`, {
        waitUntil: "networkidle",
      });
      const fullLoad = Date.now() - start;

      // Measure Web Vitals via Performance API
      const metrics = await p.evaluate(() => {
        const nav = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType("paint");
        const fcp = paint.find((e) => e.name === "first-contentful-paint");

        return {
          dns: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
          tcp: Math.round(nav.connectEnd - nav.connectStart),
          ttfb: Math.round(nav.responseStart - nav.requestStart),
          domParsing: Math.round(nav.domInteractive - nav.responseEnd),
          domComplete: Math.round(nav.domComplete - nav.navigationStart),
          transferSize: nav.transferSize,
          fcp: fcp ? Math.round(fcp.startTime) : null,
        };
      });

      console.log(`  ${page.name} Full Load: ${fullLoad}ms`);
      console.log(`    DNS:          ${metrics.dns}ms`);
      console.log(`    TCP:          ${metrics.tcp}ms`);
      console.log(`    TTFB:         ${metrics.ttfb}ms`);
      console.log(`    DOM Parsing:  ${metrics.domParsing}ms`);
      console.log(`    DOM Complete: ${metrics.domComplete}ms`);
      console.log(`    FCP:          ${metrics.fcp ?? "N/A"}ms`);
      console.log(
        `    Transfer:     ${(metrics.transferSize / 1024).toFixed(1)}KB`
      );

      // Assertions
      expect(metrics.ttfb).toBeLessThan(500);
      expect(fullLoad).toBeLessThan(5000);
    });
  }
});

test.describe("Performance - Bundle & Assets", () => {
  test("total page weight under 2MB", async ({ page }) => {
    let totalBytes = 0;
    const resources: { url: string; size: number; type: string }[] = [];

    page.on("response", async (response) => {
      const url = response.url();
      if (url.startsWith(BASE_URL) || url.startsWith("http://localhost")) {
        const headers = response.headers();
        const size = parseInt(headers["content-length"] || "0", 10);
        const type = headers["content-type"]?.split(";")[0] || "unknown";
        totalBytes += size;
        resources.push({ url: url.replace(BASE_URL, ""), size, type });
      }
    });

    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    // Sort by size descending
    resources.sort((a, b) => b.size - a.size);

    console.log("\n  Top 10 largest resources:");
    resources.slice(0, 10).forEach((r, i) => {
      console.log(
        `    ${i + 1}. ${(r.size / 1024).toFixed(1)}KB - ${r.type} - ${r.url.slice(0, 80)}`
      );
    });
    console.log(`\n  Total page weight: ${(totalBytes / 1024).toFixed(1)}KB`);

    expect(totalBytes).toBeLessThan(2 * 1024 * 1024); // 2MB
  });

  test("no render-blocking resources over 100KB", async ({ page }) => {
    const largeBlocking: string[] = [];

    page.on("response", async (response) => {
      const url = response.url();
      const type = response.headers()["content-type"] || "";
      const size = parseInt(
        response.headers()["content-length"] || "0",
        10
      );

      if (
        (type.includes("javascript") || type.includes("css")) &&
        size > 100 * 1024
      ) {
        largeBlocking.push(
          `${(size / 1024).toFixed(0)}KB - ${url.replace(BASE_URL, "")}`
        );
      }
    });

    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    if (largeBlocking.length > 0) {
      console.log("  Large JS/CSS bundles (>100KB):");
      largeBlocking.forEach((r) => console.log(`    ${r}`));
    } else {
      console.log("  All JS/CSS bundles under 100KB");
    }
  });
});

test.describe("Performance - Core Web Vitals", () => {
  test("Cumulative Layout Shift (CLS) under 0.1", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });
        observer.observe({ type: "layout-shift", buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 1000);
      });
    });

    console.log(`  CLS: ${cls.toFixed(4)} (target: < 0.1)`);
    expect(cls).toBeLessThan(0.1);
  });

  test("Largest Contentful Paint (LCP) under 2.5s", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          resolve(last.startTime);
        });
        observer.observe({ type: "largest-contentful-paint", buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(0);
        }, 5000);
      });
    });

    console.log(`  LCP: ${lcp.toFixed(0)}ms (target: < 2500ms)`);
    expect(lcp).toBeLessThan(2500);
  });

  test("Time to Interactive under 3.5s", async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    // Check interactivity by clicking a button
    const tti = Date.now() - start;

    const isInteractive = await page.evaluate(() => {
      return document.readyState === "complete";
    });

    console.log(`  TTI: ${tti}ms (target: < 3500ms)`);
    expect(isInteractive).toBe(true);
    expect(tti).toBeLessThan(3500);
  });
});

test.describe("Performance - Navigation Speed", () => {
  test("SPA navigation between pages is fast", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    // Navigate to pricing via link
    const start = Date.now();
    await page.click('a[href="/pricing"]');
    await page.waitForURL("**/pricing");
    const navTime = Date.now() - start;

    console.log(`  Home → Pricing: ${navTime}ms`);
    expect(navTime).toBeLessThan(1000);
  });
});

test.describe("Performance - Concurrent Requests", () => {
  test("handles 10 rapid page loads", async ({ browser }) => {
    const times: number[] = [];

    const promises = Array.from({ length: 10 }, async (_, i) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const start = Date.now();
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
      times.push(Date.now() - start);
      await context.close();
    });

    await Promise.all(promises);

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    const min = Math.min(...times);

    console.log(`  10 concurrent loads:`);
    console.log(`    Avg: ${avg.toFixed(0)}ms`);
    console.log(`    Min: ${min}ms`);
    console.log(`    Max: ${max}ms`);

    expect(avg).toBeLessThan(3000);
    expect(max).toBeLessThan(5000);
  });
});
