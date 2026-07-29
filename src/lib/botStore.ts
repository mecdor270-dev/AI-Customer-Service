import { WidgetConfig } from '@/types';

export interface OperatorRoutingData {
  telegram?: string;
  whatsapp?: string;
  email?: string;
  custom?: string;
  destination?: string;
  type?: string;
  enabled?: boolean;
}

export interface StoredBotData {
  botId: string;
  config: WidgetConfig;
  operatorRouting?: OperatorRoutingData;
  updatedAt: string;
}

// Global in-memory storage to survive Next.js module reloads in dev
const globalForBotStore = globalThis as unknown as {
  botStoreMap?: Map<string, StoredBotData>;
};

const botStore = globalForBotStore.botStoreMap ?? new Map<string, StoredBotData>();
if (process.env.NODE_ENV !== 'production') {
  globalForBotStore.botStoreMap = botStore;
}

// Default initial config template
export function getDefaultBotConfig(botId: string): WidgetConfig {
  return {
    botName: 'Ассистент поддержки',
    welcomeMessage: 'Здравствуйте! Чем я могу помочь вам в нашем магазине?',
    primaryColor: '#2563eb',
    themePreset: 'royal',
    toneOfVoice: 'friendly',
    knowledgeText: 'График работы с 10:00 до 22:00. Инструкция по активации цифровых ключей: зайти в личный кабинет, ввести код. Возврат только при наличии видеозаписи.',
    faqItems: [
      {
        id: 'faq-1',
        question: 'Какой у вас график работы?',
        answer: 'Наш магазин работает ежедневно с 10:00 до 22:00.'
      },
      {
        id: 'faq-2',
        question: 'Как активировать цифровой ключ?',
        answer: 'Инструкция по активации цифровых ключей: зайдите в личный кабинет на нашем сайте и введите полученный код.'
      }
    ]
  };
}

export function getDefaultOperatorRouting(): OperatorRoutingData {
  return {
    telegram: '@support_store_bot',
    whatsapp: '+79001234567',
    email: 'support@store.ru',
    custom: 'https://store.ru/help',
    destination: '@support_store_bot',
    type: 'telegram',
    enabled: true
  };
}

export function getStoredBotData(botId: string): StoredBotData {
  const existing = botStore.get(botId);
  if (existing) {
    return existing;
  }

  const defaultData: StoredBotData = {
    botId,
    config: getDefaultBotConfig(botId),
    operatorRouting: getDefaultOperatorRouting(),
    updatedAt: new Date().toISOString()
  };
  botStore.set(botId, defaultData);
  return defaultData;
}

export function setStoredBotData(
  botId: string,
  configPartial: Partial<WidgetConfig>,
  operatorRoutingPartial?: Partial<OperatorRoutingData>
): StoredBotData {
  const current = getStoredBotData(botId);

  const updatedConfig: WidgetConfig = {
    ...current.config,
    ...configPartial,
    faqItems: configPartial.faqItems ? [...configPartial.faqItems] : current.config.faqItems
  };

  const updatedOperator: OperatorRoutingData = {
    ...current.operatorRouting,
    ...operatorRoutingPartial
  };

  const updatedData: StoredBotData = {
    botId,
    config: updatedConfig,
    operatorRouting: updatedOperator,
    updatedAt: new Date().toISOString()
  };

  botStore.set(botId, updatedData);
  return updatedData;
}
