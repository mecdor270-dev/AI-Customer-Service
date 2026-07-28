import { GoogleGenAI } from '@google/genai';
import { WidgetConfig } from '@/types';

export async function getAIResponse(
  userPrompt: string,
  config?: Partial<WidgetConfig>
): Promise<string> {
  const key = config?.apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const toneInstructions = {
    polite: 'Тон общения: Выражено вежливый, доброжелательный, корректный.',
    formal: 'Тон общения: Строго официальный, деловой, точный.',
    friendly: 'Тон общения: Дружелюбный, открытый, вовлекающий.',
  };

  const currentTone = config?.toneOfVoice ? toneInstructions[config.toneOfVoice] : toneInstructions.friendly;
  const botName = config?.botName || 'Ассистент поддержки';
  const knowledge = config?.knowledgeText || '';
  const faqText = config?.faqItems?.map(item => `В: ${item.question}\nО: ${item.answer}`).join('\n\n') || '';

  if (key) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Имя ИИ: ${botName}.\n${currentTone}\n\nБаза знаний компании:\n${knowledge}\n\nЧастые вопросы (FAQ):\n${faqText}\n\nВопрос клиента: ${userPrompt}\n\nДай точный и вежливый ответ по базе знаний:`,
      });
      if (response.text) {
        return response.text;
      }
    } catch (error) {
      console.warn('Gemini API call failed, falling back to local KB search:', error);
    }
  }

  // Local knowledge base & FAQ search matcher
  const lower = userPrompt.toLowerCase();

  // Check matching FAQ items
  if (config?.faqItems && config.faqItems.length > 0) {
    for (const faq of config.faqItems) {
      if (
        lower.includes(faq.question.toLowerCase()) ||
        faq.question.toLowerCase().split(' ').some(word => word.length > 3 && lower.includes(word))
      ) {
        return faq.answer;
      }
    }
  }

  // Check digital store keywords from knowledge base text
  if (lower.includes('график') || lower.includes('время') || lower.includes('работы') || lower.includes('часы')) {
    return 'Наш график работы: ежедневно с 10:00 до 22:00.';
  }
  if (lower.includes('активаци') || lower.includes('ключ') || lower.includes('код')) {
    return 'Инструкция по активации цифровых ключей: зайдите в личный кабинет на сайте и введите полученный код в соответствующее поле.';
  }
  if (lower.includes('возврат') || lower.includes('гаранти') || lower.includes('видео')) {
    return 'Обратите внимание: возврат цифровых товаров осуществляется только при наличии непрерывной видеозаписи процесса покупки и активации.';
  }
  if (lower.includes('привет') || lower.includes('здравствуй') || lower.includes('добрый')) {
    return `Здравствуйте! Меня зовут ${botName}. Чем я могу помочь вам сегодня?`;
  }

  // Fallback answer based on custom knowledge text or default summary
  if (knowledge && knowledge.trim().length > 0) {
    return `Согласно нашей базе знаний: ${knowledge.substring(0, 150)}... Если у вас остались вопросы, обратитесь к менеджеру!`;
  }

  return `Спасибо за обращение! Я — ${botName}. Отвечаю на любые вопросы по товарам и услугам нашего магазина 24/7.`;
}
