(function () {
  if (window.__AI_CHAT_PULSE_WIDGET_LOADED__) return;
  window.__AI_CHAT_PULSE_WIDGET_LOADED__ = true;

  // Read bot ID from script tag
  const scriptTag = document.currentScript || document.querySelector('script[data-bot-id]');
  const botId = scriptTag ? scriptTag.getAttribute('data-bot-id') || 'demo-bot-123' : 'demo-bot-123';

  // Read configuration helper
  const getLatestConfig = () => {
    let currentConfig = {
      botName: 'Ассистент поддержки',
      welcomeMessage: 'Здравствуйте! Чем я могу помочь вам в нашем цифровом магазине?',
      primaryColor: '#2563eb',
      toneOfVoice: 'friendly',
      knowledgeText: 'График работы с 10:00 до 22:00. Инструкция по активации цифровых ключей: зайти в личный кабинет, ввести код. Возврат только при наличии видеозаписи.',
      faqItems: []
    };

    try {
      const saved = localStorage.getItem('ai_widget_config');
      if (saved) {
        currentConfig = Object.assign({}, currentConfig, JSON.parse(saved));
      }
    } catch (e) {
      console.warn('[AI Widget] LocalStorage config parse error:', e);
    }
    return currentConfig;
  };

  const config = getLatestConfig();

  // Inject Widget Styles
  const style = document.createElement('style');
  style.id = 'ai-chat-pulse-widget-styles';
  style.textContent = `
    .ai-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .ai-widget-button {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background-color: ${config.primaryColor};
      color: #ffffff;
      border: none;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, background-color 0.2s ease;
    }
    .ai-widget-button:hover {
      transform: scale(1.08);
    }
    .ai-widget-window {
      position: fixed;
      bottom: 88px;
      right: 20px;
      width: 360px;
      max-width: calc(100vw - 40px);
      height: 480px;
      max-height: calc(100vh - 110px);
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 999999;
      opacity: 0;
      transform: translateY(16px) scale(0.95);
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s ease;
    }
    .ai-widget-window.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
    .ai-widget-header {
      background-color: ${config.primaryColor};
      color: #ffffff;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .ai-widget-header-title {
      font-weight: 700;
      font-size: 14px;
      margin: 0;
    }
    .ai-widget-header-subtitle {
      font-size: 11px;
      opacity: 0.85;
      margin: 2px 0 0 0;
    }
    .ai-widget-close-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      color: #ffffff;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ai-widget-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .ai-widget-message {
      max-width: 82%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 13px;
      line-height: 1.45;
      word-wrap: break-word;
    }
    .ai-widget-message.bot {
      background: #ffffff;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .ai-widget-message.user {
      background-color: ${config.primaryColor};
      color: #ffffff;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .ai-widget-input-area {
      padding: 12px;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
    }
    .ai-widget-input {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 13px;
      outline: none;
      color: #0f172a;
    }
    .ai-widget-input:focus {
      border-color: ${config.primaryColor};
    }
    .ai-widget-send-btn {
      background-color: ${config.primaryColor};
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 8px 14px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }
    .ai-widget-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);

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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        <p class="ai-widget-header-subtitle">Онлайн • Поддержка 24/7</p>
      </div>
      <button class="ai-widget-close-btn" id="ai-widget-close-btn">&times;</button>
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

  // Interaction State & Event Listeners
  let isOpen = false;
  const history = [{ sender: 'bot', text: config.welcomeMessage }];

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

  const appendMessage = (sender, text) => {
    const msgEl = document.createElement('div');
    msgEl.className = `ai-widget-message ${sender}`;
    msgEl.textContent = text;
    messagesList.appendChild(msgEl);
    messagesList.scrollTop = messagesList.scrollHeight;
  };

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const messageText = inputEl.value.trim();
    if (!messageText) return;

    inputEl.value = '';
    appendMessage('user', messageText);
    history.push({ sender: 'user', text: messageText });

    // Show loading indicator
    submitBtn.disabled = true;
    const loadingMsgEl = document.createElement('div');
    loadingMsgEl.className = 'ai-widget-message bot';
    loadingMsgEl.id = 'ai-widget-loading-msg';
    loadingMsgEl.textContent = 'Печатает...';
    messagesList.appendChild(loadingMsgEl);
    messagesList.scrollTop = messagesList.scrollHeight;

    // Fetch latest config from localStorage
    const activeConfig = getLatestConfig();

    try {
      // Send message to API Route /api/chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId: botId,
          message: messageText,
          history: history,
          config: activeConfig
        }),
      });

      const data = await response.json();
      const loadingEl = document.getElementById('ai-widget-loading-msg');
      if (loadingEl) loadingEl.remove();

      const botReply = data.response || 'Извините, передаю ваш вопрос живому оператору.';
      appendMessage('bot', botReply);
      history.push({ sender: 'bot', text: botReply });
    } catch (err) {
      console.error('[AI Widget] API call error:', err);
      const loadingEl = document.getElementById('ai-widget-loading-msg');
      if (loadingEl) loadingEl.remove();

      appendMessage('bot', 'Извините, возникла ошибка соединения. Передаю ваш вопрос живому оператору.');
    } finally {
      submitBtn.disabled = false;
    }
  });

})();
