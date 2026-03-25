import { test, expect, type Page } from "../playwright-fixture";

const protectedRoutes = [
  "/ai-negotiator",
  "/my-loads",
  "/earnings",
  "/fleet",
  "/settings",
];

async function expectAuthModal(page: Page) {
  await expect(page.getByRole("button", { name: "SIGN IN", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "JOIN FREE", exact: true }).first()).toBeVisible();
  await expect(page.getByPlaceholder("driver@loadhawk.io")).toBeVisible();
}

test("dashboard shows live load data", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: /Find Your Next Load/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Available Loads" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Book Now" }).first()).toBeVisible();
});

test("dashboard search navigates to matching find-loads results", async ({ page }) => {
  await page.goto("/dashboard");

  await page.getByRole("textbox", { name: /Search loads/i }).fill("Nashville");
  await page.getByRole("textbox", { name: /Search loads/i }).press("Enter");

  await expect(page).toHaveURL(/\/find-loads\?q=Nashville/);
  await expect(page.getByRole("table")).toContainText("Nashville, TN");
  await expect(page.getByRole("table")).toContainText("Jacksonville, FL");
});

test("find-loads filters narrow the table", async ({ page }) => {
  await page.goto("/find-loads");

  await page.getByRole("textbox", { name: /Filter by origin/i }).fill("Nashville");

  await expect(page.getByRole("table")).toContainText("Nashville, TN");
  await expect(page.getByRole("table")).toContainText("Jacksonville, FL");
});

for (const route of protectedRoutes) {
  test(`unauthenticated users are guarded on ${route}`, async ({ page }) => {
    await page.goto(route);

    await expect(page).toHaveURL(/\/dashboard$/);
    await expectAuthModal(page);
  });
}

test("unauthenticated users are prompted to sign in before booking a load", async ({ page }) => {
  await page.goto("/find-loads");

  await page.getByRole("button", { name: "Book" }).first().click();

  await expectAuthModal(page);
});

test("unauthenticated users are prompted to sign in before negotiating", async ({ page }) => {
  await page.goto("/find-loads");

  await page.getByRole("button", { name: "Negotiate" }).first().click();

  await expectAuthModal(page);
});

test("signup requires accepting the terms", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start Free" }).first().click();

  await page.getByPlaceholder("driver@loadhawk.io").fill(`qa+${Date.now()}@example.com`);
  await page.getByPlaceholder("Min 6 characters").fill("testpass123");
  await page.getByPlaceholder("Repeat password").fill("testpass123");
  await page.getByRole("button", { name: /CONTINUE/i }).click();

  const fullName = page.getByPlaceholder("Marcus Davis");
  await expect(fullName).toBeVisible();
  await fullName.fill("QA Runner");
  await page.getByPlaceholder("+1 (555) 000-0000").fill("5551234567");
  await page.locator("select").selectOption("Class A");

  await page.getByText("AGREE TO TERMS").click();
  await page.getByRole("button", { name: /CREATE MY ACCOUNT/i }).click();

  await expect(page.getByText("You must agree to the Terms of Service")).toBeVisible();
});

test("pricing upgrade prompts unauthenticated users to sign up", async ({ page }) => {
  await page.goto("/pricing");

  await page.getByRole("button", { name: "Upgrade to Pro" }).click();

  await expectAuthModal(page);
});

test("broker ratings rate flow prompts unauthenticated users to sign in", async ({ page }) => {
  await page.goto("/broker-ratings");

  await page.getByRole("button", { name: "Rate a Broker" }).click();

  await expectAuthModal(page);
});

test("forgot password requires an email before sending reset", async ({ page }) => {
  await page.goto("/my-loads");
  await expectAuthModal(page);

  await page.getByText("FORGOT?").click();

  await expect(page.getByText("Enter your email first")).toBeVisible();
});
