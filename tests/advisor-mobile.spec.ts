import { expect, test } from "@playwright/test";

test("mobile advisor is full-screen and sends with Enter", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile interaction test");
  let replyCalls = 0;
  await page.route("**/api/advisor/reply", async (route) => {
    replyCalls += 1;
    const input = route.request().postDataJSON() as { answer: string };
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        reply: "Perfecto. Cuéntame también a qué tipo de cliente ayuda el negocio.",
        nextStage: "business",
        normalizedAnswer: "",
        intent: "AI_EXPLORATION",
        quality: "recoverable",
        mode: "fallback",
        received: input.answer,
      }),
    });
  });

  await page.goto("/es");
  const launcher = page.getByRole("button", { name: "Habla con Viste" });
  await launcher.click();

  const panel = page.getByRole("dialog", { name: "Asesor de oportunidades de Viste" });
  await expect(panel).toBeVisible();
  await expect(launcher).toBeHidden();
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  await expect.poll(async () => (await panel.boundingBox())?.x).toBeLessThanOrEqual(1);
  await expect.poll(async () => (await panel.boundingBox())?.y).toBeLessThanOrEqual(1);
  const panelBox = await panel.boundingBox();
  expect(panelBox).not.toBeNull();
  expect(panelBox!.y).toBeLessThanOrEqual(1);
  expect(panelBox!.width).toBeGreaterThanOrEqual(viewport!.width - 2);
  expect(panelBox!.height).toBeGreaterThanOrEqual(viewport!.height - 2);

  const closeButton = page.getByRole("button", { name: "Cerrar asesor" });
  await expect(closeButton).toHaveCSS("width", "44px");
  await expect(closeButton).toHaveCSS("height", "44px");

  const answer = page.getByLabel("¿A qué se dedica tu empresa y a quién ayuda?");
  await expect(answer).toHaveCSS("font-size", "16px");
  await expect(page.getByText("Enter para enviar · Shift+Enter para una nueva línea")).toBeVisible();
  await answer.fill("Gestiono una peluquería familiar en Madrid.");
  await answer.press("Enter");
  await expect(page.getByText("Gestiono una peluquería familiar en Madrid.", { exact: true })).toBeVisible();
  await expect(page.getByText("Perfecto. Cuéntame también a qué tipo de cliente ayuda el negocio.")).toBeVisible();
  expect(replyCalls).toBe(1);

  await answer.fill("Atendemos sobre todo a familias del barrio");
  await answer.press("Shift+Enter");
  await expect(answer).toHaveValue("Atendemos sobre todo a familias del barrio\n");
  expect(replyCalls).toBe(1);
  await answer.press("Enter");
  await expect.poll(() => replyCalls).toBe(2);
});
