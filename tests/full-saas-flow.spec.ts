import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Комплексный E2E сквозной тест AI Customer Support Widget', () => {

  test.beforeAll(async () => {
    // Ensure screenshots folder exists
    const dir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  test('Полный пользовательский сценарий SaaS: Лендинг -> Дашборд -> База Знаний -> Виджет -> Оплата Pro', async ({ page }) => {

    // 1. Переход на Главную страницу (Лендинг)
    await page.goto('/');
    const title = page.locator('h1');
    await expect(title).toContainText('ИИ-Консультант для вашего сайта за 5 минут');
    await page.screenshot({ path: 'tests/screenshots/01-landing-page.png', fullPage: true });

    // 2. Переход в Панель Управления (Dashboard)
    await page.click('text=Войти в панель');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1')).toContainText('Панель управления');
    await page.screenshot({ path: 'tests/screenshots/02-dashboard-overview.png', fullPage: true });

    // 3. Изменение имени бота и обновление Базы Знаний
    const nameInput = page.locator('#dash-bot-name-input');
    await nameInput.fill('Инновационный ИИ-Консультант');

    // Переход во вкладку Базы Знаний
    await page.click('text=База Знаний (FAQ)');
    const kbTextarea = page.locator('#dash-knowledge-textarea');
    await kbTextarea.fill('График работы с 10:00 до 22:00. Специальная акция: по промокоду PROMO2026 доступна скидка 50%.');

    // Добавление FAQ пары
    await page.locator('#dash-faq-question-input').fill('Какой промокод на скидку?');
    await page.locator('#dash-faq-answer-input').fill('По промокоду PROMO2026 вы получите скидку 50%!');
    await page.locator('#dash-add-faq-btn').click();

    await page.screenshot({ path: 'tests/screenshots/03-bot-customizer-kb.png', fullPage: true });

    // 4. Открытие внешнего тестового сайта и проверка ответа виджета
    await page.goto('/test-widget.html');
    const triggerBtn = page.locator('#ai-widget-trigger-btn');
    await expect(triggerBtn).toBeVisible();
    await triggerBtn.click();

    const input = page.locator('#ai-widget-input-field');
    await input.fill('Какой промокод на скидку?');
    await page.locator('#ai-widget-submit-btn').click();

    // Проверка ответа из Базы Знаний
    const messagesList = page.locator('#ai-widget-messages-list');
    await expect(messagesList).toContainText('PROMO2026', { timeout: 10000 });
    await page.screenshot({ path: 'tests/screenshots/04-widget-query-response.png' });

    // 5. Переход на страницу оплаты /dashboard/billing и активация Демо Pro Access
    await page.goto('/dashboard/billing');
    await expect(page.locator('h2')).toContainText('Выберите тарифный план');

    // Активация Демо Pro Access
    const demoProBtn = page.locator('#activate-demo-pro-btn');
    await expect(demoProBtn).toBeVisible();
    await demoProBtn.click();

    // Проверка смены статуса подписки на Активен
    await expect(page.locator('text=PRO ACCESS (АКТИВЕН)')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/05-billing-pro-activated.png', fullPage: true });

  });

});
