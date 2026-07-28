'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Wallet,
  ShieldCheck,
  Zap,
  Check,
  Bot,
  Layers,
  X,
  AlertCircle
} from 'lucide-react';
import { getSubscription, activateProDemo, saveSubscription, UserSubscription } from '@/lib/usage';

export default function BillingPage() {
  const [sub, setSub] = useState<UserSubscription>({
    isPremium: false,
    plan: 'Starter',
    usageCount: 0,
    maxFreeLimit: 30,
  });

  const [selectedGateway, setSelectedGateway] = useState<'LavaPay' | 'CryptoMus'>('LavaPay');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setSub(getSubscription());
  }, []);

  const handleActivatePro = (gateway: 'LavaPay' | 'CryptoMus' = selectedGateway) => {
    const updated = activateProDemo(gateway);
    setSub(updated);
    setIsModalOpen(false);
    showToast(`Статус подписки обновлен: Pro Access (через ${gateway}) АКТИВЕН!`);
  };

  const handleResetStarter = () => {
    const updated: UserSubscription = {
      isPremium: false,
      plan: 'Starter',
      usageCount: 0,
      maxFreeLimit: 30,
    };
    saveSubscription(updated);
    setSub(updated);
    showToast('Сброшено на бесплатный тариф Starter (0/30 сообщений)');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>В панель управления</span>
          </Link>
          <div className="h-5 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm leading-tight">Управление подпиской и тарифами</h1>
              <p className="text-[11px] text-slate-500">Сервис AI Customer Support Widget</p>
            </div>
          </div>
        </div>

        {/* Current Active Plan Badge */}
        <div className="flex items-center gap-3">
          {sub.isPremium ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Статус: PRO ACCESS (АКТИВЕН)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Тариф: Starter Free ({sub.usageCount}/30)
            </span>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8">
        
        {/* Banner if Limit Exceeded */}
        {!sub.isPremium && sub.usageCount >= sub.maxFreeLimit && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-red-600 text-white p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Бесплатный лимит обращений исчерпан!</h3>
                <p className="text-xs text-amber-100">Вы ответили на 30 сообщений бота. Перейдите на тариф Pro Business для снятия ограничений.</p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-slate-900 hover:bg-slate-100 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shrink-0 transition-transform active:scale-95"
            >
              Перейти на Pro Access
            </button>
          </div>
        )}

        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Выберите тарифный план</h2>
          <p className="text-sm text-slate-600">
            Подключите Pro Business для доступа к безупречной скорости Gemini Flash и неограниченным диалогам.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* PLAN 1: STARTER FREE */}
          <div className={`bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-xs transition-all relative ${
            !sub.isPremium ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200'
          }`}>
            <div>
              {!sub.isPremium && (
                <span className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                  Текущий тариф
                </span>
              )}
              <div className="font-bold text-slate-900 text-lg mb-1">Starter (Free)</div>
              <p className="text-xs text-slate-500 mb-4">Для тестирования и небольших сайтов.</p>
              <div className="text-3xl font-black text-slate-900 mb-6">
                0 ₽ <span className="text-xs font-normal text-slate-400">/ навсегда</span>
              </div>

              <div className="space-y-3 text-xs text-slate-700 mb-6 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>До 30 диалогов в месяц</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Базовая модель ИИ</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Кастомизация цвета виджета</span>
                </div>
              </div>
            </div>

            <div>
              {sub.isPremium ? (
                <button
                  onClick={handleResetStarter}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Переключить на Starter (Free)
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3 bg-slate-100 text-slate-400 font-semibold text-xs rounded-xl cursor-default"
                >
                  Ваш текущий план
                </button>
              )}
            </div>
          </div>

          {/* PLAN 2: PRO BUSINESS */}
          <div className={`bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-xl transition-all relative overflow-hidden ${
            sub.isPremium ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-blue-600'
          }`}>
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-extrabold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
              Рекомендуем
            </div>

            <div>
              <div className="font-bold text-slate-900 text-lg mb-1 flex items-center gap-2">
                <span>Pro Business</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs text-slate-500 mb-4">Для полноценного бизнеса и малого e-commerce.</p>

              <div className="text-3xl font-black text-slate-900 mb-6">
                1 890 ₽ <span className="text-xs font-normal text-slate-400">/ месяц ($19/mo)</span>
              </div>

              <div className="space-y-3 text-xs text-slate-700 mb-6 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Безлимитные сообщения без ограничений</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Приоритетная обработка через Gemini Flash</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Полная интеграция public/widget.js</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Неограниченный объем Базы Знаний</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <CreditCard className="w-4 h-4" />
                <span>Оформить подписку Pro</span>
              </button>

              {/* DEMO PRO ACCESS BUTTON (Required by Prompt #4) */}
              <button
                id="activate-demo-pro-btn"
                onClick={() => handleActivatePro('LavaPay')}
                className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Активировать Демо Pro Access</span>
              </button>
            </div>

          </div>

        </div>

        {/* Payment Gateways Selection Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-4xl mx-auto space-y-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Выбор платежного шлюза
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* LavaPay Option */}
            <div
              onClick={() => setSelectedGateway('LavaPay')}
              className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-all ${
                selectedGateway === 'LavaPay'
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  LAVA
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">LavaPay (Карты СНГ, СБП, МИР)</div>
                  <div className="text-[11px] text-slate-500">Мгновенное зачисление в рублях</div>
                </div>
              </div>
              {selectedGateway === 'LavaPay' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
            </div>

            {/* CryptoMus Option */}
            <div
              onClick={() => setSelectedGateway('CryptoMus')}
              className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-all ${
                selectedGateway === 'CryptoMus'
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  CRYPTO
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">CryptoMus (USDT, BTC, TON)</div>
                  <div className="text-[11px] text-slate-500">Оплата криптовалютой</div>
                </div>
              </div>
              {selectedGateway === 'CryptoMus' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
            </div>

          </div>
        </div>

      </main>

      {/* Payment Modal Simulation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Оплата подписки Pro Business</h3>
                <p className="text-xs text-slate-500">Шлюз: {selectedGateway}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 mb-6">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Тариф:</span>
                <span>Pro Business (1 Месяц)</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-700">
                <span>К оплате:</span>
                <span className="text-slate-900 font-bold">1 890 ₽ ($19)</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Способ:</span>
                <span>{selectedGateway === 'LavaPay' ? 'СБП / МИР / LavaPay' : 'CryptoMus (USDT)'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleActivatePro(selectedGateway)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Подтвердить оплату (Симуляция)</span>
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
