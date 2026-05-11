import { test, expect } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const MIN_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

test("fluxo cadastro, login, upload e lista", async ({ page }) => {
  const email = `e2e_${Date.now()}@test.local`;
  const password = "senha123456";
  const pngPath = path.join(os.tmpdir(), `e2e-${Date.now()}.png`);
  fs.writeFileSync(pngPath, MIN_PNG);

  await page.goto("/login");
  await page.getByRole("link", { name: "Cadastrar" }).click();
  await expect(page.getByRole("heading", { name: "Cadastro" })).toBeVisible();

  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Cadastrar" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByText(email)).toBeVisible();

  await page.setInputFiles('input[type="file"]', pngPath);
  await expect(page.getByText("Upload concluído")).toBeVisible({ timeout: 30_000 });
  await expect(page.locator(".file-row strong")).toHaveText(/e2e-.*\.png$/);
  await expect(page.locator("img.thumb")).toBeVisible();
});
