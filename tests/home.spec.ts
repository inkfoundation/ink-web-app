import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  const locator = page.locator("#threejs-loader");
  await expect(locator).toHaveCount(0);
});

test.describe("Home Page", () => {
  test.skip("has title", async ({ page }) => {
    await expect(page).toHaveTitle(/Home/);
  });
});
