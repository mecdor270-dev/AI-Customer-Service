'use client';

import { useState } from 'react';
import { Palette, Check, Sparkles, Sliders, MessageCircle, Bot } from 'lucide-react';

export default function BrandGuidelines() {
  const [selectedTheme, setSelectedTheme] = useState<'white' | 'blue' | 'dark'>('blue');
  const [selectedTone, setSelectedTone] = useState<'formal' | 'friendly' | 'sales'>('friendly');

  return (
    <section id="guidelines" className="py-20 bg-white border-y border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-200/60">
            <Palette className="w-3.5 h-3.5" />
            Индивидуальная адаптация
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Настройка бренда и стилей виджета
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Виджет идеально интегрируется в дизайн вашего сайта. Выберите цветовую схему, тон общения и фирменную символику.
          </p>
        </div>

        {/* Brand Theme Cards (Exact match to reference image palette cards layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

          {/* Theme Card 1: White / Light */}
          <div
            onClick={() => setSelectedTheme('white')}
            className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 border ${
              selectedTheme === 'white'
                ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-lg'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-slate-900 text-base">Светлая тема (White)</span>
              {selectedTheme === 'white' && (
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-6">Классическая минималистичная тема для интернет-магазинов и корпоративных порталов.</p>
            <div className="h-28 rounded-xl bg-white border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px]">
                  <Bot className="w-3 h-3" />
                </div>
                <span className="text-xs font-semibold text-slate-800">Support Chat</span>
              </div>
              <div className="bg-slate-100 p-2 rounded-lg text-[11px] text-slate-700 w-3/4">
                Чем я могу вам помочь?
              </div>
            </div>
          </div>

          {/* Theme Card 2: Royal Blue (Default Highlighted) */}
          <div
            onClick={() => setSelectedTheme('blue')}
            className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 border ${
              selectedTheme === 'blue'
                ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-xl'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-slate-900 text-base">Фирменная синяя (Royal Blue)</span>
              {selectedTheme === 'blue' && (
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-6">Яркий фирменный стиль B2B сервисов, привлекающий внимание пользователей.</p>
            <div className="h-28 rounded-xl bg-blue-600 text-white p-3 flex flex-col justify-between shadow-md">
              <div className="flex items-center gap-2 border-b border-blue-500/50 pb-2">
                <div className="w-5 h-5 rounded-full bg-white text-blue-600 flex items-center justify-center text-[10px] font-bold">
                  <Bot className="w-3 h-3" />
                </div>
                <span className="text-xs font-semibold text-white">AI Assistant</span>
              </div>
              <div className="bg-blue-700/80 p-2 rounded-lg text-[11px] text-blue-100 w-3/4 border border-blue-500/30">
                Задайте мне вопрос 24/7!
              </div>
            </div>
          </div>

          {/* Theme Card 3: Dark Blue / Night */}
          <div
            onClick={() => setSelectedTheme('dark')}
            className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 border ${
              selectedTheme === 'dark'
                ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-lg'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-slate-900 text-base">Темная (Dark Blue)</span>
              {selectedTheme === 'dark' && (
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-6">Современная темная тема для IT-продуктов, SaaS сервисов и разработчиков.</p>
            <div className="h-28 rounded-xl bg-slate-900 text-slate-100 p-3 flex flex-col justify-between shadow-md border border-slate-800">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  <Bot className="w-3 h-3" />
                </div>
                <span className="text-xs font-semibold text-slate-200">Night Chat AI</span>
              </div>
              <div className="bg-slate-800 p-2 rounded-lg text-[11px] text-slate-300 w-3/4 border border-slate-700">
                Готов к решению задач!
              </div>
            </div>
          </div>

        </div>

        {/* Tone of Voice Selector */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Выбор тональности общения ИИ (Tone of Voice)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedTone('friendly')}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedTone === 'friendly'
                  ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                  : 'bg-white/60 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-semibold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Дружелюбный (Friendly)
              </div>
              <p className="text-xs text-slate-500">Открытый и вовлекающий стиль с эмодзи. Отлично подходит для ритейла и e-commerce.</p>
            </button>

            <button
              onClick={() => setSelectedTone('formal')}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedTone === 'formal'
                  ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                  : 'bg-white/60 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-semibold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-blue-600" />
                Деловой (Formal B2B)
              </div>
              <p className="text-xs text-slate-500">Строгий бизнес-стиль без лишних деталей. Идеально для банков, юридических и корпоративных сайтов.</p>
            </button>

            <button
              onClick={() => setSelectedTone('sales')}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedTone === 'sales'
                  ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                  : 'bg-white/60 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-semibold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Продающий (Sales Focused)
              </div>
              <p className="text-xs text-slate-500">Фокус на конверсии: задает уточнительные вопросы и направляет клиента к покупке.</p>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
