import { test, expect } from "../playwright-fixture";

const publicRoutes = [
  { route: "/", title: /AI-Powered Freight Operating System \| LoadHawk/, heading: /Find loads\. Know your profit\./i },
  { route: "/pricing", title: /Pricing \| LoadHawk/, heading: /Simple, honest pricing/i },
  { route: "/compare", title: /Compare Load Boards \| LoadHawk/, heading: /How LoadHawk compares/i },
  { route: "/resources", title: /Freight Resources \| LoadHawk/, heading: /Freight Resources/i },
  { route: "/terms", title: /Terms of Service \| LoadHawk/, heading: /Terms of Service/i },
  { route: "/privacy", title: /Privacy Policy \| LoadHawk/, heading: /Privacy Policy/i },
  { route: "/dashboard", title: /Dashboard \| LoadHawk/, heading: /Find Your Next Load/i },
  { route: "/broker-ratings", title: /Broker Ratings \| LoadHawk/, heading: /Broker Ratings/i },
];

for (const { route, title, heading } of publicRoutes) {
  test(`renders ${route}`, async ({ page }) => {
    await page.goto(route);

    await expect(page).toHaveTitle(title);
    await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
  });
}

test("renders the load search page and table", async ({ page }) => {
  await page.goto("/find-loads");

  await expect(page).toHaveTitle(/Find Loads \| LoadHawk/);
  await expect(page.getByRole("textbox", { name: /Filter by origin/i })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Origin" })).toBeVisible();
});

test("renders the not found page for unknown routes", async ({ page }) => {
  await page.goto("/definitely-missing");

  await expect(page).toHaveTitle(/Page Not Found \| LoadHawk/);
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});

test("opens the mobile navigation menu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: /Toggle menu/i }).click();

  await expect(page.getByRole("navigation").getByRole("link", { name: "Pricing" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible();
});

test("toggles the color theme", async ({ page }) => {
  await page.goto("/");

  const before = await page.evaluate(() => document.documentElement.className);
  await page.getByRole("button", { name: /Toggle theme/i }).click();
  const after = await page.evaluate(() => document.documentElement.className);

  expect(after).not.toBe(before);
});

test("home Start Free opens the auth modal", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Start Free" }).first().click();

  await expect(page.getByPlaceholder("driver@loadhawk.io")).toBeVisible();
  await expect(page.getByRole("button", { name: "JOIN FREE", exact: true }).first()).toBeVisible();
});

test("compare page CTA opens the auth modal", async ({ page }) => {
  await page.goto("/compare");

  await page.getByRole("button", { name: "Try LoadHawk free" }).click();

  await expect(page.getByPlaceholder("driver@loadhawk.io")).toBeVisible();
});
