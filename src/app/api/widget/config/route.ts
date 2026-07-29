import { NextResponse } from 'next/server';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get('botId') || 'demo-bot-123';

    // Default configuration template
    const defaultConfig = {
      botId: botId,
      botName: 'Ассистент поддержки',
      welcomeMessage: 'Здравствуйте! Чем я могу помочь вам в нашем магазине?',
      primaryColor: '#2563eb',
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
      ],
      operatorRouting: {
        type: 'telegram',
        destination: '@support_store_bot',
        enabled: true
      }
    };

    return NextResponse.json(defaultConfig, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[API /api/widget/config] Error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения конфигурации виджета' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
