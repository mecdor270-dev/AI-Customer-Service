'use client';

import { useState } from 'react';
import { Bot, Sparkles, Send, CheckCircle2, Zap, Shield, Globe } from 'lucide-react';
import { getAIResponse } from '@/lib/gemini';

export default function HeroVisual() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Здравствуйте! Я ваш ИИ-консультант. Задайте мне любой вопрос о наших продуктах!' },
    { sender: 'user', text: 'Как быстро я могу подключить виджет на свой сайт?' },
    { sender: 'bot', text: 'Установка занимает ровно 5 минут: скопируйте скрипт из панели управления и вставьте на сайт!' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const reply = await getAIResponse(userText);
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Спасибо за вопрос! Виджет мгновенно отвечает на 80% запросов клиентов.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto my-8">
      {/* Glow Backdrop effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-80 bg-blue-500/20 blur-3xl rounded-full pointer-events-none -z-10 animate-pulse-slow"></div>

      {/* 3D Visual Cards Stack Container */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-6">

        {/* 3D Visual Cards Stack representation */}
        <div className="w-full lg:w-1/2 space-y-4">
          <div className="relative p-6 rounded-2xl bg-white/90 backdrop-blur-xl border border-blue-200/80 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:border-blue-400 transition-all duration-300 transform lg:-rotate-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Умный AI Виджет</h3>
                  <p className="text-xs text-blue-600 font-medium">Статус: Онлайн (0.8s отклик)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Авто-ответ 80%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 mb-4 text-center">
              <div className="p-2 rounded-lg bg-blue-50/50">
                <Zap className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="text-[11px] font-medium text-slate-600">5 мин инсталляция</span>
              </div>
              <div className="p-2 rounded-lg bg-blue-50/50">
                <Shield className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="text-[11px] font-medium text-slate-600">Обучение на FAQ</span>
              </div>
              <div className="p-2 rounded-lg bg-blue-50/50">
                <Globe className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="text-[11px] font-medium text-slate-600">Мультиязычный</span>
              </div>
            </div>

            {/* Embedded Script Code Snippet Preview */}
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase mb-1 font-sans font-semibold">1-Click Вставка на ваш сайт:</div>
              <code className="text-blue-400">
                &lt;script src=&quot;http://localhost:3000/widget.js&quot; data-bot-id=&quot;demo-bot-123&quot; defer&gt;&lt;/script&gt;
              </code>
            </div>
          </div>
        </div>

        {/* Live Interactive Chat Simulator Window */}
        <div className="w-full lg:w-1/2">
          <div className="glass-card-blue p-5 rounded-2xl shadow-2xl border border-blue-200/90 relative">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Интерактивный тест AI-консультанта</span>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-semibold">
                Умный ИИ
              </span>
            </div>

            {/* Message History Container */}
            <div className="h-64 overflow-y-auto space-y-3 pr-1 text-sm scrollbar-thin">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2.5 text-xs text-slate-500 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                    <span>ИИ генерирует ответ...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Задайте вопрос ИИ-консультанту..."
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <span>Отправить</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
