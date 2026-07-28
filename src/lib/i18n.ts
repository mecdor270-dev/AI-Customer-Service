export type Language = 'ru' | 'en';

const STORAGE_LANG_KEY = 'ai_app_language';

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'ru';
  try {
    const saved = localStorage.getItem(STORAGE_LANG_KEY);
    if (saved === 'en' || saved === 'ru') return saved;
  } catch (e) {
    console.warn('Error reading language preference:', e);
  }
  return 'ru';
}

export function setLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_LANG_KEY, lang);
  } catch (e) {
    console.error('Error saving language preference:', e);
  }
}

export const translations = {
  ru: {
    dashboardTitle: 'Панель управления ИИ-Бота',
    botSettingsTab: 'Настройки и цвет бота',
    knowledgeTab: 'База Знаний (FAQ)',
    operatorTab: 'Маршрутизация Оператора',
    embedTab: 'Скрипт & Инструкция',
    billingTab: 'Оплата & Тарифы',
    statsTab: 'Статистика',
    upgradeBtn: 'Обновить',
    changePlan: 'Изменить план',
    personalization: 'Персонализация',
    profile: 'Профиль',
    settings: 'Настройки',
    help: 'Справка',
    logout: 'Выйти',
    addProject: 'Добавить проект',
    selectProject: 'Проект',
    operatorTitle: 'Маршрутизация перевода на живого оператора',
    operatorDesc: 'Укажите куда перенаправлять клиента при клике "Вызвать оператора"',
    telegram: 'Telegram Бот / Юзернейм',
    whatsapp: 'WhatsApp Номер',
    email: 'Support Email',
    webhook: 'Webhook URL',
  },
  en: {
    dashboardTitle: 'AI Bot Control Panel',
    botSettingsTab: 'Bot Settings & Styling',
    knowledgeTab: 'Knowledge Base (FAQ)',
    operatorTab: 'Operator Routing',
    embedTab: 'Embed Code & Guide',
    billingTab: 'Billing & Plans',
    statsTab: 'Analytics',
    upgradeBtn: 'Upgrade',
    changePlan: 'Change Plan',
    personalization: 'Personalization',
    profile: 'Profile',
    settings: 'Settings',
    help: 'Help & Docs',
    logout: 'Log Out',
    addProject: 'Add Project',
    selectProject: 'Project',
    operatorTitle: 'Human Operator Escalation Routing',
    operatorDesc: 'Specify where to transfer customers when they request a human agent',
    telegram: 'Telegram Bot / Username',
    whatsapp: 'WhatsApp Number',
    email: 'Support Email',
    webhook: 'Webhook URL',
  }
};
