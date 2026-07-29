import Link from 'next/link';
import { Check, Sparkles, Crown, ArrowRight } from 'lucide-react';

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-slate-50 border-t border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs uppercase font-extrabold text-blue-600 tracking-widest">Прозрачные тарифы</h2>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Выберите тариф для вашего бизнеса
          </p>
          <p className="text-slate-600 text-base font-normal">
            Начните с бесплатной версии или подключайте Pro Business для снятия лимитов.
          </p>
        </div>

        {/* 3 Tariff Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Plan 1: Starter Free */}
          <div className="bg-white rounded-2xl border border-slate-300 p-8 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow">
            <div>
              <div className="font-extrabold text-slate-900 text-xl mb-1">Starter Free</div>
              <p className="text-xs text-slate-600 mb-6 font-medium">Идеально для первого знакомства и небольших проектов.</p>

              <div className="text-4xl font-black text-slate-900 mb-6">
                0 ₽ <span className="text-xs font-bold text-slate-400">/ навсегда</span>
              </div>

              <div className="space-y-3.5 text-xs text-slate-800 mb-8 border-t border-slate-200 pt-6 font-medium">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>До 30 отвеченных диалогов в месяц</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Базовая база знаний (FAQ)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Визуальная кастомизация цвета</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Быстрая вставка скрипта widget.js</span>
                </div>
              </div>
            </div>

            <Link
              href="/auth/register"
              className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs rounded-xl text-center block transition-colors border border-slate-300"
            >
              Начать бесплатно
            </Link>
          </div>

          {/* Plan 2: Pro Business */}
          <div className="bg-white rounded-2xl border-2 border-blue-600 p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-extrabold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
              Рекомендуем
            </div>

            <div>
              <div className="font-extrabold text-slate-900 text-xl mb-1 flex items-center gap-2">
                <span>Pro Business</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs text-slate-600 mb-6 font-medium">Для растущих интернет-магазинов и компаний.</p>

              <div className="text-4xl font-black text-slate-900 mb-6">
                1 890 ₽ <span className="text-xs font-bold text-slate-500">/ месяц ($19/mo)</span>
              </div>

              <div className="space-y-3.5 text-xs text-slate-800 mb-8 border-t border-slate-200 pt-6 font-medium">
                <div className="flex items-center gap-2.5 font-bold text-slate-900">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>До 2 000 ответов в день</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Приоритетный Умный ИИ с мгновенным откликом</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Индивидуальная адаптация брендинга</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Неограниченный объем документов Базы Знаний</span>
                </div>
              </div>
            </div>

            <Link
              href="/auth/register"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl text-center flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01]"
            >
              <span>Подключить Pro Business</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Plan 3: Max Enterprise */}
          <div className="bg-white rounded-2xl border-2 border-purple-600 p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-extrabold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
              Максимальный
            </div>

            <div>
              <div className="font-extrabold text-slate-900 text-xl mb-1 flex items-center gap-2">
                <span>Max Enterprise</span>
                <Crown className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs text-slate-600 mb-6 font-medium">Для крупных брендов и больших объемов клиентов.</p>

              <div className="text-4xl font-black text-slate-900 mb-6">
                2 990 ₽ <span className="text-xs font-bold text-slate-500">/ месяц ($39.99/mo)</span>
              </div>

              <div className="space-y-3.5 text-xs text-slate-800 mb-8 border-t border-slate-200 pt-6 font-medium">
                <div className="flex items-center gap-2.5 font-bold text-purple-900">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>До 6 000 ответов в день</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Сброс лимита каждый день в 00:00 МСК</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Персональный менеджер и приоритетная интеграция</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Мульти-проекты без ограничений</span>
                </div>
              </div>
            </div>

            <Link
              href="/auth/register"
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl text-center flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.01]"
            >
              <span>Подключить Max Enterprise</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
