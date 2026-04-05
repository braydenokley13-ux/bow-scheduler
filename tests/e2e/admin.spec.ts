import { expect, test } from "@playwright/test"

test("staff can create a slot from the admin console", async ({ page }) => {
  const uniqueNote = `Playwright slot ${Date.now()}`

  await page.goto("/admin/login")
  await page.getByLabel(/shared admin password/i).fill("preview-access")
  await page.getByRole("button", { name: /enter admin panel/i }).click()

  await expect(
    page.getByRole("heading", { name: /story scheduling admin/i })
  ).toBeVisible()

  await page.getByLabel("Date").fill("2030-01-14")
  await page.getByLabel("Start time").fill("11:00")
  await page.getByLabel("End time").fill("11:15")
  await page.getByLabel("Notes").fill(uniqueNote)
  await page.getByRole("button", { name: /create slot/i }).click()

  await expect(page.getByText(uniqueNote)).toBeVisible()
})
