'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Check, Sparkles, Crown, CreditCard, ArrowRight, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { getSubscription, activatePlan, saveSubscription, UserSubscription } from '@/lib/usage';

export default function PricingPage() {
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

  const handleOpenPayment = (plan: 'Pro' | 'Max') => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleConfirmPayment = () => {
    const updated = activatePlan(selectedPlan, selectedGateway);
    setSub(updated);
    setIsModalOpen(false);
    showToast(`Тариф ${selectedPlan} Plan успешно АКТИВИРОВАН!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Прозрачные Тарифные Планы
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Выберите план для роста вашего бизнеса
          </h1>
          <p className="text-base text-slate-600 max-w-xl mx-auto">
            Все платные тарифы сбрасывают дневной лимит сообщений каждый день в 00:00 по Московскому времени.
          </p>
        </div>

        {/* 3 Tariff Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* PLAN 1: STARTER FREE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative">
            <div>
              <div className="font-bold text-slate-900 text-xl mb-1">Starter Free</div>
              <p className="text-xs text-slate-500 mb-6">Для знакомства с платформой и первой установки.</p>

              <div className="text-4xl font-black text-slate-900 mb-6">
                0 ₽ <span className="text-xs font-normal text-slate-400">/ навсегда</span>
              </div>

              <div className="space-y-3.5 text-xs text-slate-700 mb-8 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>30 ответов ИИ в месяц</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Базовая База Знаний (FAQ)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Кастомизация цвета виджета</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Быстрая вставка скрипта</span>
                </div>
              </div>
            </div>

            <div>
              {!sub.isPremium ? (
                <button
                  disabled
                  className="w-full py-3.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl text-center cursor-default"
                >
                  Ваш текущий тариф
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl text-center cursor-default"
                >
                  Включено в ваш подписку
                </button>
              )}
            </div>
          </div>

          {/* PLAN 2: PRO PLAN ($19/mo / 1 890 ₽) */}
          <div className={`bg-white rounded-2xl border-2 p-8 flex flex-col justify-between shadow-xl relative ${
            sub.plan === 'Pro' ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-blue-600'
          }`}>
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-extrabold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
              Популярный
            </div>

            <div>
              <div className="font-bold text-slate-900 text-xl mb-1 flex items-center gap-2">
                <span>Pro Plan</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs text-slate-500 mb-6">Для растущих интернет-магазинов и компаний.</p>

              <div className="text-4xl font-black text-slate-900 mb-6">
                1 890 ₽ <span className="text-xs font-normal text-slate-400">/ мес ($19/mo)</span>
              </div>

              <div className="space-y-3.5 text-xs text-slate-700 mb-8 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2.5 font-bold text-slate-900">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>До 2 000 ответов в день</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Сброс лимита каждый день в 00:00 МСК</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Мульти-проекты под разные сайты</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Маршрутизация на оператора (Telegram/WA)</span>
                </div>
              </div>
            </div>

            <div>
              {sub.plan === 'Max' ? (
                <button
                  disabled
                  className="w-full py-3.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl text-center cursor-default"
                >
                  Включено в ваш Max Plan
                </button>
              ) : sub.plan === 'Pro' ? (
                <button
                  disabled
                  className="w-full py-3.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl text-center cursor-default"
                >
                  Ваш текущий активный тариф
                </button>
              ) : (
                <button
                  onClick={() => handleOpenPayment('Pro')}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01]"
                >
                  <span>Подключить Pro Plan ($19/mo)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* PLAN 3: MAX PLAN ($39.99/mo / 2 990 ₽) */}
          <div className={`bg-white rounded-2xl border-2 p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden ${
            sub.plan === 'Max' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-purple-600'
          }`}>
            <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-extrabold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
              Максимальный
            </div>

            <div>
              <div className="font-bold text-slate-900 text-xl mb-1 flex items-center gap-2">
                <span>Max Plan</span>
                <Crown className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs text-slate-500 mb-6">Для крупных брендов и больших объемов продаж.</p>

              <div className="text-4xl font-black text-slate-900 mb-6">
                2 990 ₽ <span className="text-xs font-normal text-slate-400">/ мес ($39.99/mo)</span>
              </div>

              <div className="space-y-3.5 text-xs text-slate-700 mb-8 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2.5 font-bold text-purple-700">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>До 6 000 ответов в день</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Сброс лимита каждый день в 00:00 МСК</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Приоритетная скорость обработки ИИ</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Неограниченный объем документов Базы Знаний</span>
                </div>
              </div>
            </div>

            <div>
              {sub.plan === 'Max' ? (
                <button
                  disabled
                  className="w-full py-3.5 bg-amber-100 text-amber-900 font-bold text-xs rounded-xl text-center cursor-default"
                >
                  Ваш текущий активный тариф (Max)
                </button>
              ) : (
                <button
                  onClick={() => handleOpenPayment('Max')}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.01]"
                >
                  <span>Подключить Max Plan ($39.99/mo)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 relative space-y-5">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Оплата подписки {selectedPlan} Plan</h3>
                <p className="text-xs text-slate-500">Выберите удобный способ оплаты</p>
              </div>
            </div>

            {/* Gateway Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Способ оплаты:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setSelectedGateway('LavaPay')}
                  className={`cursor-pointer p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    selectedGateway === 'LavaPay'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                      LAVA
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">LavaPay</div>
                      <div className="text-[10px] text-slate-500">СБП, МИР, Карты</div>
                    </div>
                  </div>
                  {selectedGateway === 'LavaPay' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </div>

                <div
                  onClick={() => setSelectedGateway('CryptoMus')}
                  className={`cursor-pointer p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    selectedGateway === 'CryptoMus'
                      ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
                      CRYPTO
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">CryptoMus</div>
                      <div className="text-[10px] text-slate-500">USDT, BTC, TON</div>
                    </div>
                  </div>
                  {selectedGateway === 'CryptoMus' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                </div>
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Тариф:</span>
                <span>{selectedPlan} Plan ({selectedPlan === 'Pro' ? '2 000' : '6 000'} ответов/день)</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Сброс лимитов:</span>
                <span className="font-bold text-emerald-600">Каждый день в 00:00 МСК</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-200 pt-2">
                <span>К оплате:</span>
                <span className="text-blue-600">
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
                <span>Подтвердить оплату</span>
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200"
              >
                Отмена
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
