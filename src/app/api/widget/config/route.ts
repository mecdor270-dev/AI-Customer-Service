import { NextResponse } from 'next/server';
import { getStoredBotData, setStoredBotData } from '@/lib/botStore';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get('botId') || 'demo-bot-123';

    const storedData = getStoredBotData(botId);

    const responsePayload = {
      botId: storedData.botId,
      botName: storedData.config.botName,
      welcomeMessage: storedData.config.welcomeMessage,
      primaryColor: storedData.config.primaryColor,
      toneOfVoice: storedData.config.toneOfVoice,
      knowledgeText: storedData.config.knowledgeText,
      faqItems: storedData.config.faqItems || [],
      operatorRouting: storedData.operatorRouting || {
        type: 'telegram',
        destination: '@support_store_bot',
        enabled: true
      },
      updatedAt: storedData.updatedAt
    };

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[API /api/widget/config GET] Error:', error);
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { botId, config, operatorRouting } = body;

    if (!botId) {
      return NextResponse.json(
        { error: 'botId не передан' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    const updated = setStoredBotData(botId, config || {}, operatorRouting || {});

    return NextResponse.json(
      {
        success: true,
        botId: updated.botId,
        config: updated.config,
        operatorRouting: updated.operatorRouting,
        updatedAt: updated.updatedAt
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        }
      }
    );
  } catch (error) {
    console.error('[API /api/widget/config POST] Error:', error);
    return NextResponse.json(
      { error: 'Ошибка сохранения конфигурации виджета на сервере' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
