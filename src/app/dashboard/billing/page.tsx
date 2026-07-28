'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Zap,
  Check,
  X,
  AlertCircle,
  Layers,
  Crown
} from 'lucide-react';
import { getSubscription, activatePlan, saveSubscription, UserSubscription } from '@/lib/usage';

export default function BillingPage() {
  const [sub, setSub] = useState<UserSubscription>({
    isPremium: false,
    plan: 'Starter',
    usageCount: 0,
    dailyUsageCount: 0,
    maxDailyLimit: 30,
    lastResetDate: '',
  });

  const [selectedPlan, setSelectedPlan] = useState<'Pro' | 'Max'>('Pro');
  const [selectedGateway, setSelectedGateway] = useState<'LavaPay' | 'CryptoMus'>('LavaPay');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setSub(getSubscription());
  }, []);

  const handleConfirmPayment = () => {
    const updated = activatePlan(selectedPlan, selectedGateway);
    setSub(updated);
    setIsModalOpen(false);
    showToast(`Тариф ${selectedPlan} Access успешно АКТИВИРОВАН (через ${selectedGateway})!`);
  };

  const handleOpenPayment = (plan: 'Pro' | 'Max') => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleResetStarter = () => {
    const updated: UserSubscription = {
      isPremium: false,
      plan: 'Starter',
      usageCount: 0,
      dailyUsageCount: 0,
      maxDailyLimit: 30,
      lastResetDate: new Date().toISOString().split('T')[0],
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
    <div className="min-h-screen bg-[#09090b] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#0d0d0e] border-b border-zinc-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>В панель управления</span>
          </Link>
          <div className="h-5 w-px bg-zinc-800"></div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm leading-tight">Управление подпиской и тарифами</h1>
              <p className="text-[11px] text-slate-400">Сброс дневных лимитов происходит каждый день в 00:00 по МСК</p>
            </div>
          </div>
        </div>

        {/* Current Active Plan Badge */}
        <div className="flex items-center gap-3">
          {sub.isPremium ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Тариф: {sub.plan.toUpperCase()} PLAN (АКТИВЕН)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Тариф: Starter Free ({sub.usageCount}/30)
            </span>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-10 space-y-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Выберите подходящий план</h2>
          <p className="text-sm text-slate-400">
            Дневные лимиты ответов обновляются автоматически каждый день в 00:00 по Московскому времени.
          </p>
        </div>

        {/* 3 Tariff Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* PLAN 1: STARTER FREE */}
          <div className={`bg-[#0d0d0e] rounded-2xl border p-6 flex flex-col justify-between relative ${
            !sub.isPremium ? 'border-blue-600 ring-1 ring-blue-500' : 'border-zinc-800'
          }`}>
            <div>
              {!sub.isPremium && (
                <span className="absolute top-4 right-4 bg-blue-500/20 text-blue-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-blue-500/30">
                  Текущий
                </span>
              )}
              <div className="font-bold text-white text-lg mb-1">Starter Free</div>
              <p className="text-xs text-slate-400 mb-4">Для знакомства с платформой.</p>
              <div className="text-3xl font-black text-white mb-6">
                0 ₽ <span className="text-xs font-normal text-slate-500">/ навсегда</span>
              </div>

              <div className="space-y-3 text-xs text-slate-300 mb-6 border-t border-zinc-800 pt-4">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>30 ответов в месяц</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Базовая модель Умного ИИ</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1 проект под виджет</span>
                </div>
              </div>
            </div>

            <div>
              {sub.isPremium ? (
                <button
                  onClick={handleResetStarter}
                  className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors"
                >
                  Переключить на Starter
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3 bg-zinc-800/50 text-slate-500 font-semibold text-xs rounded-xl cursor-default"
                >
                  Ваш текущий план
                </button>
              )}
            </div>
          </div>

          {/* PLAN 2: PRO BUSINESS ($19/mo / 1 890 ₽) */}
          <div className={`bg-[#0d0d0e] rounded-2xl border p-6 flex flex-col justify-between relative ${
            sub.plan === 'Pro' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-blue-600/80'
          }`}>
            <div>
              <div className="font-bold text-white text-lg mb-1 flex items-center gap-2">
                <span>Pro Business</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xs text-slate-400 mb-4">Для активных интернет-магазинов.</p>

              <div className="text-3xl font-black text-white mb-6">
                1 890 ₽ <span className="text-xs font-normal text-slate-400">/ мес ($19/mo)</span>
              </div>

              <div className="space-y-3 text-xs text-slate-300 mb-6 border-t border-zinc-800 pt-4">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>До 2 000 ответов в день</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Сброс лимитов в 00:00 по МСК</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Мульти-проекты и виджеты</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Маршрутизация на оператора</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleOpenPayment('Pro')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Подключить Pro ($19/mo)</span>
              </button>
            </div>
          </div>

          {/* PLAN 3: MAX PLAN ($39.99/mo / 2 990 ₽) */}
          <div className={`bg-[#0d0d0e] rounded-2xl border-2 p-6 flex flex-col justify-between relative overflow-hidden ${
            sub.plan === 'Max' ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-purple-600'
          }`}>
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-600 text-slate-950 text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-wider">
              Максимальный
            </div>

            <div>
              <div className="font-bold text-white text-lg mb-1 flex items-center gap-2">
                <span>Max Plan</span>
                <Crown className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xs text-slate-400 mb-4">Для крупных компаний и e-commerce.</p>

              <div className="text-3xl font-black text-white mb-6">
                2 990 ₽ <span className="text-xs font-normal text-slate-400">/ мес ($39.99/mo)</span>
              </div>

              <div className="space-y-3 text-xs text-slate-300 mb-6 border-t border-zinc-800 pt-4">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>До 6 000 ответов в день</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Сброс лимитов в 00:00 по МСК</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Ультра-высокая скорость ИИ</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Неограниченные Базы Знаний</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleOpenPayment('Max')}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <span>Подключить Max ($39.99/mo)</span>
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Payment Modal with Embedded Gateway Selector */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0d0d0e] border border-zinc-800 w-full max-w-lg rounded-2xl p-6 relative space-y-5 text-white">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Оплата подписки {selectedPlan} Plan</h3>
                <p className="text-xs text-slate-400">Выберите удобный способ оплаты</p>
              </div>
            </div>

            {/* Gateway Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">Способ оплаты:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <div
                  onClick={() => setSelectedGateway('LavaPay')}
                  className={`cursor-pointer p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    selectedGateway === 'LavaPay'
                      ? 'border-blue-600 bg-blue-600/10 ring-1 ring-blue-500'
                      : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                      LAVA
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">LavaPay</div>
                      <div className="text-[10px] text-slate-400">СБП, МИР, Карты</div>
                    </div>
                  </div>
                  {selectedGateway === 'LavaPay' && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                </div>

                <div
                  onClick={() => setSelectedGateway('CryptoMus')}
                  className={`cursor-pointer p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    selectedGateway === 'CryptoMus'
                      ? 'border-purple-600 bg-purple-600/10 ring-1 ring-purple-500'
                      : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
                      CRYPTO
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">CryptoMus</div>
                      <div className="text-[10px] text-slate-400">USDT, BTC, TON</div>
                    </div>
                  </div>
                  {selectedGateway === 'CryptoMus' && <CheckCircle2 className="w-4 h-4 text-purple-500" />}
                </div>

              </div>
            </div>

            {/* Order Summary Box */}
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 text-xs space-y-2">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Тариф:</span>
                <span>{selectedPlan} Plan (До {selectedPlan === 'Pro' ? '2 000' : '6 000'} ответов в день)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Сброс лимитов:</span>
                <span className="text-emerald-400 font-bold">Каждый день в 00:00 МСК</span>
              </div>
              <div className="flex justify-between font-bold text-white text-sm border-t border-zinc-800 pt-2">
                <span>К оплате:</span>
                <span className="text-blue-400">
                  {selectedPlan === 'Pro' ? '1 890 ₽ ($19)' : '2 990 ₽ ($39.99)'}
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleConfirmPayment}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Оплатить подписку {selectedPlan} Plan</span>
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2.5 bg-zinc-800 text-slate-300 font-semibold text-xs rounded-xl hover:bg-zinc-700"
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
