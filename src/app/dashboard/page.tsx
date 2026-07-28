'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bot,
  LayoutDashboard,
  Palette,
  BookOpen,
  Code2,
  Settings,
  ArrowLeft,
  TrendingUp,
  MessageSquare,
  Clock,
  CheckCircle,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Send,
  Save,
  HelpCircle,
  RotateCcw,
  CreditCard,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { generateEmbedScript } from '@/lib/utils';
import { getAIResponse } from '@/lib/gemini';
import { WidgetConfig, FAQItem } from '@/types';
import { getSubscription, UserSubscription } from '@/lib/usage';

// Default initial config according to Prompt specifications
const defaultConfig: WidgetConfig = {
  botName: 'Ассистент поддержки',
  welcomeMessage: 'Здравствуйте! Чем я могу помочь вам в нашем цифровом магазине?',
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
    },
    {
      id: 'faq-3',
      question: 'Каковы условия возврата?',
      answer: 'Возврат цифровых товаров осуществляется только при наличии полной видеозаписи процесса покупки и активации.'
    }
  ],
  apiKey: ''
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'bot_settings' | 'knowledge' | 'embed' | 'settings'>('bot_settings');

  // Widget Configuration State
  const [config, setConfig] = useState<WidgetConfig>(defaultConfig);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Subscription State
  const [sub, setSub] = useState<UserSubscription>({
    isPremium: false,
    plan: 'Starter',
    usageCount: 0,
    maxFreeLimit: 30,
  });

  // New FAQ inputs state
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // Script Copy State & Notification Toast
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Test Chat Messages inside Preview
  const [testMessages, setTestMessages] = useState([
    { sender: 'bot', text: defaultConfig.welcomeMessage }
  ]);
  const [testInput, setTestInput] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  // Load configuration and subscription from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_widget_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
        setTestMessages([{ sender: 'bot', text: parsed.welcomeMessage || defaultConfig.welcomeMessage }]);
      }
    } catch (e) {
      console.warn('Could not parse ai_widget_config from localStorage', e);
    }
    setSub(getSubscription());
  }, []);

  // Synchronize and save to localStorage
  const saveConfigToStorage = (updatedConfig: WidgetConfig) => {
    setConfig(updatedConfig);
    try {
      localStorage.setItem('ai_widget_config', JSON.stringify(updatedConfig));
      setSaveStatus('Настройки сохранены в localStorage (ai_widget_config)');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      console.error('Error saving config to localStorage:', e);
    }
  };

  // Update single field
  const handleConfigChange = <K extends keyof WidgetConfig>(field: K, value: WidgetConfig[K]) => {
    const updated = { ...config, [field]: value };
    saveConfigToStorage(updated);
    if (field === 'welcomeMessage') {
      setTestMessages([{ sender: 'bot', text: value as string }]);
    }
  };

  // Reset to initial digital store demo data
  const handleResetDefaults = () => {
    saveConfigToStorage(defaultConfig);
    setTestMessages([{ sender: 'bot', text: defaultConfig.welcomeMessage }]);
    showToast('Сброшено к демо-данным цифрового магазина!');
  };

  // Add FAQ pair
  const handleAddFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newItem: FAQItem = {
      id: 'faq-' + Date.now(),
      question: newQuestion.trim(),
      answer: newAnswer.trim()
    };

    const updated = {
      ...config,
      faqItems: [...(config.faqItems || []), newItem]
    };
    saveConfigToStorage(updated);
    setNewQuestion('');
    setNewAnswer('');
    showToast('Вопрос-Ответ успешно добавлен!');
  };

  // Remove FAQ pair
  const handleDeleteFAQ = (id: string) => {
    const updated = {
      ...config,
      faqItems: config.faqItems.filter(item => item.id !== id)
    };
    saveConfigToStorage(updated);
    showToast('Вопрос-Ответ удален');
  };

  // Copy embed script tag
  const handleCopyScript = () => {
    navigator.clipboard.writeText(generateEmbedScript('demo-bot-123'));
    setCopied(true);
    showToast('Скопировано в буфер!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Trigger Toast Notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle live chat message submission in test widget preview
  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim() || testLoading) return;

    const userText = testInput.trim();
    setTestInput('');
    setTestMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setTestLoading(true);

    try {
      const response = await getAIResponse(userText, config);
      setTestMessages(prev => [...prev, { sender: 'bot', text: response }]);
    } catch {
      setTestMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Ошибка генерации. Проверьте настройки ИИ.' }
      ]);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>На главную</span>
          </Link>
          <div className="h-5 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: config.primaryColor }}
              className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold shadow-xs transition-colors"
            >
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm leading-tight">Панель управления ИИ-Бота</h1>
              <p className="text-[11px] text-slate-500">
                Имя бота: <span className="font-semibold text-slate-800" id="dash-bot-name-display">{config.botName}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/billing"
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>Тарифы ({sub.isPremium ? 'Pro' : 'Free'})</span>
          </Link>

          <button
            onClick={() => setActiveTab('embed')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Code2 className="w-4 h-4" />
            <span>Код виджета</span>
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-col justify-between shrink-0 hidden md:flex">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Кабинет</div>
            
            <button
              onClick={() => setActiveTab('bot_settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'bot_settings'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Настройки и цвет бота</span>
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'knowledge'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>База Знаний (FAQ)</span>
            </button>

            <button
              onClick={() => setActiveTab('embed')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'embed'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Скрипт для вставки</span>
            </button>

            <Link
              href="/dashboard/billing"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Оплата & Тарифы</span>
            </Link>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Статистика</span>
            </button>
          </div>

          {/* Quick Storage & Subscription Status */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                {sub.isPremium ? 'Pro Business' : 'Starter Free'}
              </span>
              <span className={sub.isPremium ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                {sub.isPremium ? 'Безлимит' : `${sub.usageCount}/30`}
              </span>
            </div>
            <button
              onClick={handleResetDefaults}
              className="w-full text-center text-[11px] font-semibold text-slate-600 hover:text-blue-600 flex items-center justify-center gap-1 py-1 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Сбросить демо-данные</span>
            </button>
          </div>
        </aside>

        {/* Dynamic Content Area + Live Preview Side-by-Side */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Controls Form Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Limit Warning Banner */}
            {!sub.isPremium && sub.usageCount >= sub.maxFreeLimit && (
              <div className="bg-amber-500 text-white p-4 rounded-xl shadow-md flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Лимит обращений исчерпан (30/30). Обновите тарифный план!</span>
                </div>
                <Link
                  href="/dashboard/billing"
                  className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs hover:bg-slate-100"
                >
                  Обновить
                </Link>
              </div>
            )}

            {/* TAB 1: BOT SETTINGS FORM */}
            {activeTab === 'bot_settings' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Palette className="w-5 h-5 text-blue-600" />
                    Настройки личности и стиля бота
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Изменения мгновенно отображаются в интерактивном превью виджета справа и сохраняются в `localStorage`.
                  </p>
                </div>

                {/* Bot Name Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Имя бота</label>
                  <input
                    id="dash-bot-name-input"
                    type="text"
                    value={config.botName}
                    onChange={(e) => handleConfigChange('botName', e.target.value)}
                    placeholder="Ассистент поддержки"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>

                {/* Welcome Message Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Приветственное сообщение</label>
                  <textarea
                    id="dash-welcome-msg-input"
                    rows={3}
                    value={config.welcomeMessage}
                    onChange={(e) => handleConfigChange('welcomeMessage', e.target.value)}
                    placeholder="Здравствуйте! Чем я могу помочь вам в нашем цифровом магазине?"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Tone of Voice Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Системный тон общения ИИ</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'polite', label: 'Вежливый', desc: 'Доброжелательный тон' },
                      { id: 'formal', label: 'Официальный', desc: 'Строгий B2B стиль' },
                      { id: 'friendly', label: 'Дружелюбный', desc: 'Открытый стиль' }
                    ].map((tone) => (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => handleConfigChange('toneOfVoice', tone.id as WidgetConfig['toneOfVoice'])}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          config.toneOfVoice === tone.id
                            ? 'bg-blue-50 border-blue-600 text-blue-800 ring-2 ring-blue-500/20'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-bold text-xs">{tone.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{tone.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Цвет кнопки и виджета чата</label>
                  <div className="flex items-center gap-3">
                    {[
                      { color: '#2563eb', name: 'Синий' },
                      { color: '#059669', name: 'Изумрудный' },
                      { color: '#7c3aed', name: 'Фиолетовый' },
                      { color: '#dc2626', name: 'Красный' },
                      { color: '#0f172a', name: 'Темно-серый' },
                    ].map((item) => (
                      <button
                        key={item.color}
                        type="button"
                        onClick={() => handleConfigChange('primaryColor', item.color)}
                        style={{ backgroundColor: item.color }}
                        className={`w-9 h-9 rounded-xl border-2 transition-all flex items-center justify-center text-white ${
                          config.primaryColor === item.color
                            ? 'scale-110 ring-4 ring-blue-500/30 border-white'
                            : 'border-transparent opacity-90 hover:opacity-100'
                        }`}
                      >
                        {config.primaryColor === item.color && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: KNOWLEDGE BASE */}
            {activeTab === 'knowledge' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Интерактивная База Знаний (Knowledge Base)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Введите регламенты и частые вопросы. ИИ использует их для генерации точных ответов клиентам.
                  </p>
                </div>

                {/* Main Knowledge Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Основной регламент и информация магазина (Textarea)
                  </label>
                  <textarea
                    id="dash-knowledge-textarea"
                    rows={5}
                    value={config.knowledgeText}
                    onChange={(e) => handleConfigChange('knowledgeText', e.target.value)}
                    placeholder="Введите графики, условия доставки, правила возврата..."
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    💡 Введенные данные автоматически сохранены в `localStorage` и передаются ИИ.
                  </p>
                </div>

                {/* FAQ Pairs Manager */}
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Частые пары Вопрос-Ответ (FAQ)
                  </h3>

                  {/* Add New FAQ Form */}
                  <form onSubmit={handleAddFAQ} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="text-xs font-semibold text-slate-800">Добавить новую пару FAQ</div>
                    <input
                      id="dash-faq-question-input"
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Вопрос (например: 'Как получить скидку?')"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 bg-white"
                    />
                    <textarea
                      id="dash-faq-answer-input"
                      rows={2}
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder="Точный ответ ИИ..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 bg-white"
                    />
                    <button
                      id="dash-add-faq-btn"
                      type="submit"
                      disabled={!newQuestion.trim() || !newAnswer.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Добавить Вопрос-Ответ</span>
                    </button>
                  </form>

                  {/* Existing FAQ List */}
                  <div className="space-y-3">
                    {config.faqItems?.map((item) => (
                      <div key={item.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1 relative group">
                        <div className="flex items-start justify-between">
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{item.question}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteFAQ(item.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 pl-5">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: EMBED SCRIPT GENERATOR */}
            {activeTab === 'embed' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
                <div>
                  <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-blue-600" />
                    Генератор встраиваемого скрипта
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Скопируйте данный код и вставьте его на ваш сайт перед закрывающим тегом <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">&lt;/body&gt;</code>.
                  </p>
                </div>

                {/* Styled Code Box */}
                <div className="relative">
                  <pre className="bg-slate-900 text-emerald-400 p-5 rounded-2xl text-xs font-mono border border-slate-800 overflow-x-auto leading-relaxed shadow-lg">
                    <code>{`<script src="http://localhost:3000/widget.js" data-bot-id="demo-bot-123" defer></script>`}</code>
                  </pre>
                  
                  {/* Working Copy Button */}
                  <button
                    onClick={handleCopyScript}
                    className="mt-3 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Скопировано в буфер!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Скопировать код</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: OVERVIEW & STATS */}
            {activeTab === 'overview' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
                <h2 className="font-bold text-slate-900 text-base">Статистика ИИ-Ассистента</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500 font-semibold mb-1">Обработано вопросов</div>
                    <div className="text-2xl font-black text-slate-900">1,482</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500 font-semibold mb-1">Процент автоматизации</div>
                    <div className="text-2xl font-black text-emerald-600">84.2%</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: AI MODEL & SETTINGS */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs animate-in fade-in duration-200">
                <h2 className="font-bold text-slate-900 text-base">Настройки Google GenAI API</h2>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ключ Google GenAI (опционально)</label>
                  <input
                    type="password"
                    value={config.apiKey || ''}
                    onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Right Preview Column (5 cols) - Realtime Reactivity Widget */}
          <div className="lg:col-span-5">
            <div className="sticky top-20 bg-slate-900/5 rounded-2xl p-5 border border-slate-200/80 flex flex-col items-center justify-center">
              
              <div className="w-full flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Интерактивное Превью
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  Обновление в реальном времени
                </span>
              </div>

              {/* Responsive Live Widget Card */}
              <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden h-[440px] transition-all">
                
                {/* Dynamic Header */}
                <div
                  style={{ backgroundColor: config.primaryColor }}
                  className="p-4 text-white flex items-center justify-between transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xs font-bold text-sm">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm leading-tight">{config.botName || 'Ассистент поддержки'}</h4>
                      <p className="text-[10px] text-white/80">Онлайн • Тон: {config.toneOfVoice}</p>
                    </div>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-3.5 bg-slate-50 space-y-3 overflow-y-auto text-xs">
                  {testMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        style={{
                          backgroundColor: msg.sender === 'user' ? config.primaryColor : undefined
                        }}
                        className={`max-w-[85%] p-3 rounded-2xl leading-relaxed shadow-2xs ${
                          msg.sender === 'user'
                            ? 'text-white rounded-br-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {testLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 p-2.5 rounded-2xl rounded-bl-none text-slate-500 flex items-center gap-2 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                        <span>Генерирую ответ...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Form */}
                <form onSubmit={handleSendTestMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Протестируйте ответ ИИ..."
                    className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={testLoading || !testInput.trim()}
                    style={{ backgroundColor: config.primaryColor }}
                    className="text-white p-2 rounded-xl text-xs font-semibold disabled:opacity-50 transition-opacity"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
