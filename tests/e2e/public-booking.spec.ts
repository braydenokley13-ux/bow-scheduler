import { expect, test } from "@playwright/test"

test("families can reserve an interview from the public page", async ({ page }) => {
  await page.goto("/share-your-bow-story")

  await expect(
    page.getByRole("heading", { name: /share your bow story/i })
  ).toBeVisible()

  await page.getByRole("button", { name: /virtual interview/i }).first().click()
  await page.getByLabel("Parent name").fill("Jordan Carter")
  await page.getByLabel("Student name").fill("Maya Carter")
  await page.getByLabel("Grade").fill("8th Grade")
  await page.getByLabel("Phone").fill("602-555-0142")
  await page.getByLabel("Email").fill("jordan@example.com")
  await page
    .getByLabel(/share one shift you have noticed/i)
    .fill(
      "BOW helped our student ask better questions, train with more intention, and think more calmly after competition."
    )
  await page.getByRole("checkbox").click()
  await page.getByRole("button", { name: /submit interview request/i }).click()

  await expect(
    page.getByRole("heading", { name: /your bow story interview is reserved/i })
  ).toBeVisible()
})
