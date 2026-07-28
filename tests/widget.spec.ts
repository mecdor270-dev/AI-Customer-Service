import { test, expect } from '@playwright/test';

test('Виджет открывается, отправляет вопрос и получает ответ из базы знаний', async ({ page }) => {
  // Переходим на тестовую страницу
  await page.goto('http://localhost:3000/test-widget.html');

  // Кнопка вызова виджета видна
  const triggerBtn = page.locator('#ai-widget-trigger-btn');
  await expect(triggerBtn).toBeVisible();
  await triggerBtn.click();

  // Окно чата открылось
  const windowBox = page.locator('#ai-widget-window-box');
  await expect(windowBox).toHaveClass(/open/);

  // Вводим вопрос о времени работы
  const input = page.locator('#ai-widget-input-field');
  await input.fill('Какое время работы магазина?');

  // Нажимаем кнопку отправки
  const submitBtn = page.locator('#ai-widget-submit-btn');
  await submitBtn.click();

  // Проверяем, что в списке сообщений появился ответ с временем работы (10:00 до 22:00)
  const messagesList = page.locator('#ai-widget-messages-list');
  await expect(messagesList).toContainText('10:00 до 22:00', { timeout: 10000 });
});
