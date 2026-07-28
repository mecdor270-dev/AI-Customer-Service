import Link from 'next/link';
import { ArrowRight, Bot, CheckCircle } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 bg-slate-900 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-radial from-blue-600/30 via-slate-900 to-slate-950 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Floating icon box */}
        <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white mx-auto mb-6 flex items-center justify-center shadow-xl shadow-blue-500/30 animate-float">
          <Bot className="w-9 h-9" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 max-w-2xl mx-auto">
          Готовы автоматизировать клиентскую поддержку?
        </h2>
        <p className="text-blue-100/80 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Подключите AI Customer Support Widget сегодня. 14 дней бесплатного периода, без привязки банковской карты.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link
            href="/auth/register"
            className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-900 bg-white hover:bg-blue-50 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <span>Попробовать бесплатно</span>
            <ArrowRight className="w-5 h-5 text-blue-600" />
          </Link>

          <Link
            href="/auth/login"
            className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-blue-600/60 hover:bg-blue-600 border border-blue-400/40 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span>Войти в панель</span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Быстрый старт за 5 минут
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Без карты при регистрации
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Современный Умный ИИ
          </span>
        </div>

      </div>
    </section>
  );
}
