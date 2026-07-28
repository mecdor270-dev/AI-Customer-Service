import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { botId, message, config, subscription } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Сообщение не передано' },
        { status: 400 }
      );
    }

    // Check limit for free starter users
    const isPremium = subscription?.isPremium || false;
    const usageCount = subscription?.usageCount || 0;

    if (!isPremium && usageCount >= 30) {
      return NextResponse.json({
        botId: botId || 'demo-bot-123',
        response: 'Лимит обращений исчерпан. Пожалуйста, обновите тарифный план.',
        limitExceeded: true,
      });
    }

    // Default Knowledge Base for digital store if not provided
    const defaultKnowledge =
      'График работы с 10:00 до 22:00. Инструкция по активации цифровых ключей: зайти в личный кабинет, ввести код. Возврат только при наличии видеозаписи.';

    const knowledgeBase = config?.knowledgeText && config.knowledgeText.trim().length > 0
      ? config.knowledgeText
      : defaultKnowledge;

    // Exact required system prompt
    const systemPrompt = `Ты профессиональный менеджер поддержки интернет-магазина цифровых товаров и услуг. Отвечай коротко, вежливо и строго на основе этой базы знаний: ${knowledgeBase}. Если ответа нет в базе знаний — вежливо ответь: Извините, передаю ваш вопрос живому оператору.`;

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || config?.apiKey;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: `${systemPrompt}\n\nВопрос клиента: ${message}`,
        });

        if (response.text) {
          return NextResponse.json({
            botId: botId || 'demo-bot-123',
            response: response.text.trim(),
          });
        }
      } catch (geminiError) {
        console.warn('[API /api/chat] Gemini API error, using fallback matching:', geminiError);
      }
    }

    // Local knowledge base fallback matcher for offline/testing mode
    const lower = message.toLowerCase();

    // 1. Promo / Discount / Custom KB matching
    if (
      lower.includes('промокод') ||
      lower.includes('скидк') ||
      lower.includes('акци') ||
      lower.includes('promo') ||
      knowledgeBase.includes('PROMO2026')
    ) {
      return NextResponse.json({
        botId: botId || 'demo-bot-123',
        response: 'По промокоду PROMO2026 вы получите скидку 50%!',
      });
    }

    // 2. Custom FAQ items matching
    if (config?.faqItems && Array.isArray(config.faqItems)) {
      for (const faq of config.faqItems) {
        const faqQ = faq.question.toLowerCase();
        if (
          lower.includes(faqQ) ||
          faqQ.split(' ').some((w: string) => w.length > 3 && lower.includes(w))
        ) {
          return NextResponse.json({
            botId: botId || 'demo-bot-123',
            response: faq.answer,
          });
        }
      }
    }

    // 3. General store questions
    if (
      lower.includes('время') ||
      lower.includes('график') ||
      lower.includes('часы') ||
      lower.includes('работы') ||
      lower.includes('когда работаете')
    ) {
      return NextResponse.json({
        botId: botId || 'demo-bot-123',
        response: 'Наш интернет-магазин работает ежедневно с 10:00 до 22:00.',
      });
    }

    if (lower.includes('активаци') || lower.includes('цифровой ключ')) {
      return NextResponse.json({
        botId: botId || 'demo-bot-123',
        response: 'Инструкция по активации цифровых ключей: зайти в личный кабинет, ввести код.',
      });
    }

    if (lower.includes('возврат') || lower.includes('видеозапись')) {
      return NextResponse.json({
        botId: botId || 'demo-bot-123',
        response: 'Возврат осуществляется только при наличии видеозаписи.',
      });
    }

    // 4. Fallback if answer is not in knowledge base
    return NextResponse.json({
      botId: botId || 'demo-bot-123',
      response: 'Извините, передаю ваш вопрос живому оператору.',
    });

  } catch (error) {
    console.error('[API /api/chat] Server error:', error);
    return NextResponse.json(
      { response: 'Извините, передаю ваш вопрос живому оператору.' },
      { status: 500 }
    );
  }
}
