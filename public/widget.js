(function () {
  if (window.__AI_CHAT_PULSE_WIDGET_LOADED__) return;
  window.__AI_CHAT_PULSE_WIDGET_LOADED__ = true;

  // 1. Detect Script Tag & Bot ID & Base API URL
  const scriptTag = document.currentScript || document.querySelector('script[data-bot-id]');
  const botId = (scriptTag && scriptTag.getAttribute('data-bot-id')) || window.__AI_CHAT_PULSE_BOT_ID__ || 'demo-bot-123';
  
  let apiOrigin = '';
  if (scriptTag && scriptTag.src) {
    try {
      const url = new URL(scriptTag.src);
      apiOrigin = url.origin;
    } catch (e) {
      apiOrigin = '';
    }
  }

  let config = {
    botId: botId,
    botName: 'Ассистент поддержки',
    welcomeMessage: 'Здравствуйте! Чем я могу помочь вам?',
    primaryColor: '#2563eb',
    toneOfVoice: 'friendly',
    knowledgeText: '',
    faqItems: [],
    operatorRouting: {
      telegram: '@support_store_bot',
      whatsapp: '+79001234567',
      email: 'support@store.ru',
      custom: 'https://store.ru/help',
      type: 'telegram',
      enabled: true
    }
  };

  // 2. Fetch Remote Config from Server API
  async function loadRemoteConfig() {
    try {
      const localOverride = localStorage.getItem(`ai_bot_config_${botId}`) || localStorage.getItem('ai_widget_config');
      if (localOverride) {
        config = Object.assign({}, config, JSON.parse(localOverride));
      }

      // Remote API sync with cache-busting timestamp
      const res = await fetch(`${apiOrigin}/api/widget/config?botId=${encodeURIComponent(botId)}&t=${Date.now()}`, {
        cache: 'no-store'
      });

      if (res.ok) {
        const remoteData = await res.json();
        if (remoteData && remoteData.botName) {
          config = Object.assign({}, config, remoteData);
          if (localOverride) {
            config = Object.assign({}, config, JSON.parse(localOverride));
          }
        }
      }
    } catch (e) {
      console.warn('[AI Widget] Remote config sync fallback:', e);
    }
  }

  // Initializing UI after DOM Ready
  function initWidget() {
    loadRemoteConfig().then(() => {
      renderWidgetUI();
    }).catch(() => {
      renderWidgetUI();
    });
  }

  function renderWidgetUI() {
    // Inject Widget Styles
    const existingStyle = document.getElementById('ai-chat-pulse-widget-styles');
    if (existingStyle) existingStyle.remove();

    const style = document.createElement('style');
    style.id = 'ai-chat-pulse-widget-styles';
    style.textContent = `
      .ai-widget-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        box-sizing: border-box;
      }
      .ai-widget-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, ${config.primaryColor}, #1d4ed8);
        color: #ffffff;
        border: none;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.1);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
      }
      .ai-widget-button:hover {
        transform: scale(1.08);
        box-shadow: 0 14px 36px rgba(0, 0, 0, 0.3);
      }
      .ai-widget-button:active {
        transform: scale(0.95);
      }
      .ai-widget-window {
        position: fixed;
        bottom: 96px;
        right: 24px;
        width: 380px;
        max-width: calc(100vw - 32px);
        height: 540px;
        max-height: calc(100vh - 120px);
        background: #ffffff;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.06);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 999999;
        opacity: 0;
        transform: translateY(20px) scale(0.94);
        pointer-events: none;
        transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .ai-widget-window.open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      .ai-widget-header {
        background: linear-gradient(135deg, ${config.primaryColor}, #1e40af);
        color: #ffffff;
        padding: 14px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      }
      .ai-widget-header-title {
        font-weight: 700;
        font-size: 14.5px;
        margin: 0;
        letter-spacing: -0.01em;
      }
      .ai-widget-header-subtitle {
        font-size: 11px;
        opacity: 0.9;
        margin: 2px 0 0 0;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .ai-widget-online-dot {
        width: 7px;
        height: 7px;
        background-color: #22c55e;
        border-radius: 50%;
        display: inline-block;
        box-shadow: 0 0 8px #22c55e;
      }
      .ai-widget-header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .ai-widget-call-op-btn {
        background: rgba(255, 255, 255, 0.22);
        border: 1px solid rgba(255, 255, 255, 0.35);
        color: #ffffff;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: background 0.2s ease, transform 0.15s ease;
      }
      .ai-widget-call-op-btn:hover {
        background: rgba(255, 255, 255, 0.35);
        transform: translateY(-1px);
      }
      .ai-widget-close-btn {
        background: rgba(255,255,255,0.18);
        border: none;
        color: #ffffff;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;
      }
      .ai-widget-close-btn:hover {
        background: rgba(255,255,255,0.3);
      }
      .ai-widget-messages {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        background: #f8fafc;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .ai-widget-message {
        max-width: 88%;
        padding: 11px 15px;
        border-radius: 16px;
        font-size: 13.5px;
        line-height: 1.48;
        word-wrap: break-word;
        animation: aiMsgFadeIn 0.25s ease-out;
      }
      @keyframes aiMsgFadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .ai-widget-message.bot {
        background: #ffffff;
        color: #0f172a;
        border: 1px solid #e2e8f0;
        align-self: flex-start;
        border-bottom-left-radius: 4px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.03);
      }
      .ai-widget-message.user {
        background-color: ${config.primaryColor};
        color: #ffffff;
        align-self: flex-end;
        border-bottom-right-radius: 4px;
        box-shadow: 0 2px 8px rgba(37,99,235,0.25);
      }
      .ai-widget-op-card {
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .ai-widget-op-channel-item {
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .ai-widget-op-channel-header {
        font-weight: 700;
        font-size: 12px;
        color: #1e293b;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .ai-widget-op-channel-value {
        font-family: monospace;
        font-size: 12px;
        color: #2563eb;
        word-break: break-all;
        background: #ffffff;
        padding: 4px 8px;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
      }
      .ai-widget-op-channel-actions {
        display: flex;
        gap: 6px;
        margin-top: 4px;
      }
      .ai-widget-op-action-btn {
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        border: none;
        transition: background 0.15s ease;
      }
      .ai-widget-op-copy-btn {
        background: #e2e8f0;
        color: #334155;
      }
      .ai-widget-op-copy-btn:hover {
        background: #cbd5e1;
      }
      .ai-widget-op-link-btn {
        background: #2563eb;
        color: #ffffff !important;
        text-decoration: none;
        display: inline-block;
      }
      .ai-widget-op-link-btn:hover {
        background: #1d4ed8;
      }
      .ai-widget-input-area {
        padding: 12px 14px;
        background: #ffffff;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .ai-widget-input {
        flex: 1;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        padding: 10px 14px;
        font-size: 13.5px;
        outline: none;
        color: #0f172a;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .ai-widget-input:focus {
        border-color: ${config.primaryColor};
        box-shadow: 0 0 0 3px ${config.primaryColor}22;
      }
      .ai-widget-send-btn {
        background-color: ${config.primaryColor};
        color: #ffffff;
        border: none;
        border-radius: 12px;
        padding: 10px 16px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        transition: opacity 0.2s ease, transform 0.15s ease;
      }
      .ai-widget-send-btn:hover:not(:disabled) {
        opacity: 0.92;
        transform: translateY(-1px);
      }
      .ai-widget-send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);

    // Existing container check
    const oldContainer = document.getElementById('ai-widget-container-root');
    if (oldContainer) oldContainer.remove();

    // Widget Container
    const container = document.createElement('div');
    container.className = 'ai-widget-container';
    container.id = 'ai-widget-container-root';

    // Toggle Button
    const button = document.createElement('button');
    button.className = 'ai-widget-button';
    button.id = 'ai-widget-trigger-btn';
    button.ariaLabel = 'Открыть чат с ИИ-Консультантом';
    button.innerHTML = `
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;

    // Chat Window
    const windowEl = document.createElement('div');
    windowEl.className = 'ai-widget-window';
    windowEl.id = 'ai-widget-window-box';

    windowEl.innerHTML = `
      <div class="ai-widget-header">
        <div>
          <h4 class="ai-widget-header-title" id="ai-widget-title">${config.botName}</h4>
          <p class="ai-widget-header-subtitle">
            <span class="ai-widget-online-dot"></span> онлайн • Поддержка 24/7
          </p>
        </div>
        <div class="ai-widget-header-actions">
          <button class="ai-widget-call-op-btn" id="ai-widget-header-op-btn">
            👤 Оператор
          </button>
          <button class="ai-widget-close-btn" id="ai-widget-close-btn">&times;</button>
        </div>
      </div>
      <div class="ai-widget-messages" id="ai-widget-messages-list">
        <div class="ai-widget-message bot">${config.welcomeMessage}</div>
      </div>
      <form class="ai-widget-input-area" id="ai-widget-form">
        <input type="text" class="ai-widget-input" id="ai-widget-input-field" placeholder="Напишите вопрос..." />
        <button type="submit" class="ai-widget-send-btn" id="ai-widget-submit-btn">Отправить</button>
      </form>
    `;

    container.appendChild(windowEl);
    container.appendChild(button);
    document.body.appendChild(container);

    // Interactions
    let isOpen = false;

    const toggleWidget = () => {
      isOpen = !isOpen;
      if (isOpen) {
        windowEl.classList.add('open');
        document.getElementById('ai-widget-input-field').focus();
      } else {
        windowEl.classList.remove('open');
      }
    };

    button.addEventListener('click', toggleWidget);
    document.getElementById('ai-widget-close-btn').addEventListener('click', toggleWidget);

    const form = document.getElementById('ai-widget-form');
    const inputEl = document.getElementById('ai-widget-input-field');
    const messagesList = document.getElementById('ai-widget-messages-list');
    const submitBtn = document.getElementById('ai-widget-submit-btn');

    const appendMessage = (sender, text, operatorChannels) => {
      const msgEl = document.createElement('div');
      msgEl.className = `ai-widget-message ${sender}`;
      msgEl.innerHTML = text;

      if (operatorChannels && Array.isArray(operatorChannels) && operatorChannels.length > 0) {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'ai-widget-op-card';

        operatorChannels.forEach(ch => {
          const item = document.createElement('div');
          item.className = 'ai-widget-op-channel-item';

          const itemHeader = document.createElement('div');
          itemHeader.className = 'ai-widget-op-channel-header';
          itemHeader.textContent = ch.label || ch.type;

          const itemVal = document.createElement('div');
          itemVal.className = 'ai-widget-op-channel-value';
          itemVal.textContent = ch.value || ch.link;

          const actionsRow = document.createElement('div');
          actionsRow.className = 'ai-widget-op-channel-actions';

          // Copy button
          const copyBtn = document.createElement('button');
          copyBtn.className = 'ai-widget-op-action-btn ai-widget-op-copy-btn';
          copyBtn.textContent = '📋 Копировать';
          copyBtn.onclick = () => {
            navigator.clipboard.writeText(ch.value || ch.link);
            copyBtn.textContent = '✓ Скопировано!';
            setTimeout(() => { copyBtn.textContent = '📋 Копировать'; }, 2000);
          };
          actionsRow.appendChild(copyBtn);

          // Direct link button
          if (ch.link && ch.link !== '#') {
            const linkBtn = document.createElement('a');
            linkBtn.href = ch.link;
            linkBtn.target = '_blank';
            linkBtn.className = 'ai-widget-op-action-btn ai-widget-op-link-btn';
            linkBtn.textContent = 'Перейти ↗';
            actionsRow.appendChild(linkBtn);
          }

          item.appendChild(itemHeader);
          item.appendChild(itemVal);
          item.appendChild(actionsRow);
          cardContainer.appendChild(item);
        });

        msgEl.appendChild(cardContainer);
      }

      messagesList.appendChild(msgEl);
      messagesList.scrollTop = messagesList.scrollHeight;
    };

    // Helper to trigger direct operator contact details presentation
    const triggerOperatorCall = () => {
      appendMessage('user', '👤 Вызвать оператора');

      const opData = config.operatorRouting || {};
      const channels = [];

      const tg = opData.telegram || opData.destination || '@support_store_bot';
      if (tg) {
        const cleanTg = tg.startsWith('@') ? tg : `@${tg}`;
        channels.push({ type: 'telegram', label: '💬 Telegram поддержки', value: cleanTg, link: `https://t.me/${cleanTg.replace('@', '')}` });
      }
      if (opData.whatsapp) {
        channels.push({ type: 'whatsapp', label: '💚 WhatsApp поддержки', value: opData.whatsapp, link: `https://wa.me/${opData.whatsapp.replace(/[^0-9]/g, '')}` });
      }
      if (opData.email) {
        channels.push({ type: 'email', label: '✉️ Email поддержки', value: opData.email, link: `mailto:${opData.email}` });
      }
      if (opData.custom) {
        channels.push({ type: 'custom', label: '🌐 Страница контактов', value: opData.custom, link: opData.custom.startsWith('http') ? opData.custom : `https://${opData.custom}` });
      }

      appendMessage(
        'bot',
        'Вот контакты нашей живой службы поддержки:',
        channels
      );
    };

    // Attach Header Call Operator button click
    const headerOpBtn = document.getElementById('ai-widget-header-op-btn');
    if (headerOpBtn) {
      headerOpBtn.addEventListener('click', triggerOperatorCall);
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const messageText = inputEl.value.trim();
      if (!messageText) return;

      inputEl.value = '';
      appendMessage('user', messageText);

      submitBtn.disabled = true;
      const loadingMsgEl = document.createElement('div');
      loadingMsgEl.className = 'ai-widget-message bot';
      loadingMsgEl.id = 'ai-widget-loading-msg';
      loadingMsgEl.textContent = 'Печатает...';
      messagesList.appendChild(loadingMsgEl);
      messagesList.scrollTop = messagesList.scrollHeight;

      try {
        const response = await fetch(`${apiOrigin}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            botId: botId,
            message: messageText,
            config: config,
            operatorRouting: config.operatorRouting
          }),
        });

        const data = await response.json();
        const loadingEl = document.getElementById('ai-widget-loading-msg');
        if (loadingEl) loadingEl.remove();

        const botReply = data.response || 'Вы можете задать любой вопрос по базе знаний или связаться с оператором.';
        appendMessage('bot', botReply, data.operatorChannels);
      } catch (err) {
        console.error('[AI Widget] API call error:', err);
        const loadingEl = document.getElementById('ai-widget-loading-msg');
        if (loadingEl) loadingEl.remove();

        appendMessage('bot', 'Извините, возникла временная ошибка связи. Вы можете повторить вопрос или воспользоваться контактами оператора.');
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
