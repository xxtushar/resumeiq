import { test, expect } from "@playwright/test";

// Needs a confirmed account: E2E_EMAIL=... E2E_PASSWORD=... npm run test:e2e
// Runs one real AI analysis, which counts toward that user's daily limit.
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

const RESUME_TXT = `Jordan Example
Software Engineer — 5 years building web applications with TypeScript,
React, Node.js and PostgreSQL. Led a migration to Next.js that cut page
load times by 40%. Mentored three junior engineers.`;

test.skip(!email || !password, "Set E2E_EMAIL and E2E_PASSWORD to run");

test("upload, rename, download and delete a resume", async ({ page }) => {
  test.setTimeout(120_000);
  const title = `e2e-${Date.now()}`;

  await page.goto("/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("**/dashboard");

  await page.goto("/analyze/new");
  await page.getByLabel(/Resume file/).setInputFiles({
    name: `${title}.txt`,
    mimeType: "text/plain",
    buffer: Buffer.from(RESUME_TXT),
  });
  await page.getByRole("radio", { name: "No job" }).click();
  await page.getByRole("button", { name: "Analyze resume" }).click();
  await page.waitForURL(/\/analyze\/[0-9a-f-]{36}\?analysis=/, { timeout: 90_000 });

  await page.goto("/dashboard");
  const menu = page.getByRole("button", { name: `Actions for ${title}` });
  await expect(menu).toBeVisible();

  // Rename
  const renamed = `${title}-renamed`;
  await menu.click();
  await page.getByRole("menuitem", { name: "Rename" }).click();
  await page.getByLabel("Resume title").fill(renamed);
  await page.getByRole("button", { name: "Save" }).click();
  const renamedMenu = page.getByRole("button", { name: `Actions for ${renamed}` });
  await expect(renamedMenu).toBeVisible();

  // Download the original file from Storage
  await renamedMenu.click();
  const download = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "Download original" }).click();
  expect((await download).suggestedFilename()).toBe(`${renamed}.txt`);

  // Delete
  await renamedMenu.click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(renamedMenu).toHaveCount(0);
});

test("matches a resume against a pasted job, requirement by requirement", async ({ page }) => {
  // Three AI calls: job parsing, analysis (plus embeddings via Supabase).
  test.setTimeout(150_000);
  const title = `e2e-match-${Date.now()}`;

  await page.goto("/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("**/dashboard");

  await page.goto("/analyze/new");
  await page.getByLabel(/Resume file/).setInputFiles({
    name: `${title}.txt`,
    mimeType: "text/plain",
    buffer: Buffer.from(RESUME_TXT),
  });
  await page
    .getByLabel("Job description")
    .fill(
      "Acme Corp is hiring a Senior Frontend Engineer. Requirements: 5+ years of " +
        "React, strong TypeScript, experience with Next.js. Nice to have: GraphQL."
    );
  await page.getByRole("button", { name: "Analyze resume" }).click();
  await page.waitForURL(/\/analyze\/[0-9a-f-]{36}\?analysis=/, { timeout: 120_000 });

  await expect(page.getByRole("heading", { name: "Requirements" })).toBeVisible();
  await expect(page.getByText("Requirement match")).toBeVisible();

  // The pasted posting is saved for reuse.
  await page.goto("/dashboard/analyses");
  await expect(page.getByText(/Senior Frontend Engineer/).first()).toBeVisible();

  // Clean up the resume (its analyses go with it).
  await page.goto("/dashboard");
  await page.getByRole("button", { name: `Actions for ${title}` }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByRole("button", { name: `Actions for ${title}` })).toHaveCount(0);
});
