import { test, expect } from "@playwright/test";

test("landing page shows sign-up CTA when logged out", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1 })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Get started" }).first()).toBeVisible();
});

test("login and signup pages render their forms", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();

  await page.goto("/signup");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign up" })).toBeVisible();
});

test("forgot-password page renders and login links to it", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await expect(page.getByRole("button", { name: "Send reset link" })).toBeVisible();
});

test("protected pages redirect to login when logged out", async ({ page }) => {
  for (const path of ["/dashboard/analyses", "/dashboard/settings", "/reset-password"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
  }
});

test("a bad email link lands on the explained error page, not login", async ({ page }) => {
  await page.goto("/auth/confirm?code=not-a-real-code");
  await expect(page).toHaveURL(/\/error$/);
  await expect(page.getByText(/log in to continue/)).toBeVisible();
});
