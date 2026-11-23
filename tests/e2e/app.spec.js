import { test, expect } from '@playwright/test';

/** Dispara um evento de toque real (TouchEvent) num ponto da tela. */
async function touch(page, type, x, y) {
  await page.evaluate(
    ([type, x, y]) => {
      const target = document.elementFromPoint(x, y) || document.body;
      const t = new Touch({ identifier: 1, target, clientX: x, clientY: y });
      const list = type === 'touchend' ? [] : [t];
      target.dispatchEvent(
        new TouchEvent(type, {
          bubbles: true,
          cancelable: true,
          touches: list,
          targetTouches: list,
          changedTouches: [t],
        }),
      );
    },
    [type, x, y],
  );
}

async function center(locator) {
  const b = await locator.boundingBox();
  return [b.x + b.width / 2, b.y + b.height / 2];
}

async function takePhotos(page, n) {
  for (let i = 0; i < n; i++) {
    await page.locator('#shot').click();
    await expect(page.locator('#badge')).toHaveText(String(i + 1));
    await page.waitForTimeout(20);
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => indexedDB.deleteDatabase('lentes'));
  await page.reload();
  await expect(page.locator('#status')).toHaveText('Ao vivo');
});

test('abre a câmera sozinho e lista as lentes', async ({ page }) => {
  await expect(page.locator('#msg')).toBeHidden();
  await expect(page.locator('#chips .chip')).not.toHaveCount(0);
});

test('foto fica guardada na galeria e sobrevive a recarregar', async ({ page }) => {
  await takePhotos(page, 2);
  await page.reload();
  await expect(page.locator('#badge')).toHaveText('2');
  await page.locator('#thumb').click();
  await expect(page.locator('#grid .cell')).toHaveCount(2);
});

test('grava vídeo e guarda na galeria', async ({ page }) => {
  await page.locator('#mVideo').click();
  await page.locator('#shot').click();
  await expect(page.locator('#timer')).toBeVisible();
  await page.waitForTimeout(1500);
  await page.locator('#shot').click();
  await expect(page.locator('#badge')).toHaveText('1');
  await page.locator('#thumb').click();
  await expect(page.locator('#grid .cell .tag')).toHaveText('vídeo');
});

test('segurar e arrastar seleciona várias, e apagar pede confirmação', async ({ page }) => {
  await takePhotos(page, 6);
  await page.locator('#thumb').click();
  const cells = page.locator('#grid .cell');
  await expect(cells).toHaveCount(6);

  const [x0, y0] = await center(cells.nth(0));
  const [x4, y4] = await center(cells.nth(4));
  await touch(page, 'touchstart', x0, y0);
  await page.waitForTimeout(600); // segurar
  await expect(page.locator('#selBar')).toBeVisible();
  await touch(page, 'touchmove', (x0 + x4) / 2, (y0 + y4) / 2);
  await touch(page, 'touchmove', x4, y4);
  await page.waitForTimeout(100);
  await touch(page, 'touchend', x4, y4);

  await expect(page.locator('#grid .cell.picked')).toHaveCount(5);
  await expect(page.locator('#sCount')).toHaveText('5 itens selecionados');

  // toque simples alterna um item
  const [x1, y1] = await center(cells.nth(1));
  await touch(page, 'touchstart', x1, y1);
  await touch(page, 'touchend', x1, y1);
  await expect(page.locator('#grid .cell.picked')).toHaveCount(4);

  await page.locator('#sDel').click();
  await expect(page.locator('#confirm')).toBeVisible();
  await expect(page.locator('#cYes')).toHaveText('Apagar 4 fotos');
  await page.locator('#cYes').click();
  await expect(page.locator('#grid .cell')).toHaveCount(2);
  await expect(page.locator('#selBar')).toBeHidden();
});

test('cancelar a confirmação não apaga nada', async ({ page }) => {
  await takePhotos(page, 2);
  await page.locator('#thumb').click();
  await page.locator('#gSelect').click();
  await page.locator('#grid .cell').first().click();
  await page.locator('#sDel').click();
  await page.locator('#cNo').click();
  await expect(page.locator('#grid .cell')).toHaveCount(2);
});

test('diagnóstico mostra o caminho para parar de pedir permissão', async ({ page }) => {
  await page.locator('#diagBtn').click();
  await expect(page.locator('#diag')).toContainText('Ajustes → Apps → Safari → Câmera → Permitir');
});
