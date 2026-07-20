import { test, expect } from '@playwright/test';

test.describe('Gkals E2E Flow', () => {
  test('App loads and shows Demo Mode correctly', async ({ page }) => {
    await page.goto('/');

    // Click demo mode button
    await page.locator('button', { hasText: 'Abrir modo de prueba local' }).click();

    // Check main title
    await expect(page.locator('h1').first()).toContainText('Hoy');
    
    // Check mascot banner
    await expect(page.locator('.mascot-img')).toHaveAttribute('src', '/rabi.svg');
    await expect(page.locator('.mascot-bubble h3')).toHaveText('Rabi');
    
    // Check overdue hero section
    await expect(page.locator('.today-hero')).toContainText('Pendientes vencidos');
  });

  test('Navigation tabs work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Click demo mode button
    await page.locator('button', { hasText: 'Abrir modo de prueba local' }).click();

    // Click 'Progreso' tab
    await page.locator('.bottom-nav button').filter({ hasText: 'Progreso' }).click();
    await expect(page.locator('h1').first()).toContainText('Progreso');
    
    // Click 'Ajustes' tab
    await page.locator('.bottom-nav button').filter({ hasText: 'Ajustes' }).click();
    await expect(page.locator('h1').first()).toContainText('Ajustes');
  });

  test('User can complete a habit by uploading a proof', async ({ page }) => {
    await page.goto('/');
    
    // Click demo mode button
    await page.locator('button', { hasText: 'Abrir modo de prueba local' }).click();

    // Wait for habits to load
    const habitCards = page.locator('.habit-card');
    await expect(habitCards.first()).toBeVisible();

    // The complete action requires a file upload because of our strict proof system
    const firstHabitCard = habitCards.first();
    const fileInput = firstHabitCard.locator('input[type="file"]');
    
    // Upload a fake buffer file directly to the hidden input to simulate the camera
    await fileInput.setInputFiles({
      name: 'proof.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data')
    });
    
    // After uploading, the global streak should update and be visible
    await expect(page.locator('.global-streak')).toBeVisible();
  });
});
