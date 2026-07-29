import { test, expect } from '@playwright/test';

test.describe('E2E Тестирование Изоляции Аккаунтов и Внедрения Виджета на Внешние Сайты', () => {

  test('Полный тест изоляции аккаунтов: Настройки Пользователя A НЕ утекают к Пользователю B', async ({ page }) => {
    // 1. Регистрация и настройка Пользователя A
    await page.goto('/auth/register');
    await page.fill('input[type="email"]', 'user_a@company.ru');
    await page.fill('input[type="password"]', 'password123');
    await page.fill('input[placeholder="Цифровой Ритейл 24"]', 'Магазин А');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Переходим в настройки бота и устанавливаем УНИКАЛЬНОЕ имя
    await page.click('text=Настройки и цвет бота');
    const nameInput = page.locator('#dash-bot-name-input');
    await nameInput.fill('УНИКАЛЬНЫЙ БОТ ПОЛЬЗОВАТЕЛЯ А');
    await page.waitForTimeout(300);

    // 2. Выход из аккаунта Пользователя A
    await page.click('#dash-profile-menu-trigger');
    await page.click('#dash-logout-btn');

    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });

    // 3. Регистрация Нового Пользователя B
    await page.goto('/auth/register');
    await page.fill('input[type="email"]', 'user_b@store.ru');
    await page.fill('input[type="password"]', 'password456');
    await page.fill('input[placeholder="Цифровой Ритейл 24"]', 'Магазин B');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // 4. Проверка: Пользователь B НЕ видит бота Пользователя A
    await page.click('text=Настройки и цвет бота');
    const botNameInputB = page.locator('#dash-bot-name-input');
    const valueB = await botNameInputB.inputValue();
    expect(valueB).not.toContain('УНИКАЛЬНЫЙ БОТ ПОЛЬЗОВАТЕЛЯ А');
    expect(valueB).toContain('Ассистент');
  });

  test('Проверка API конфигурации виджета /api/widget/config для внешних сайтов', async ({ request }) => {
    const response = await request.get('/api/widget/config?botId=bot_test_client_1');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('botId', 'bot_test_client_1');
    expect(data).toHaveProperty('botName');
    expect(data).toHaveProperty('primaryColor');
    expect(data).toHaveProperty('welcomeMessage');
  });

});
