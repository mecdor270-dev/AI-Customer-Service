import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroVisual from '@/components/landing/HeroVisual';
import BrandGuidelines from '@/components/landing/BrandGuidelines';
import StatsSection from '@/components/landing/StatsSection';
import CTASection from '@/components/landing/CTASection';
import WidgetPreview from '@/components/WidgetPreview';
import Link from 'next/link';
import { ArrowRight, Zap, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-grid-pattern">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-400/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none -z-10"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>AI Support 2.0 на базе Google GenAI</span>
            </div>

            {/* Exact Required Title */}
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
              ИИ-Консультант для вашего сайта{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600">
                за 5 минут
              </span>
            </h1>

            {/* Exact Required Description */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Автоматизируйте 80% ответов клиентам, снизьте нагрузку на саппорт и не теряйте продажи
            </p>

            {/* Exact Required Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Попробовать бесплатно</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>Войти в панель</span>
              </Link>
            </div>

            {/* Quick value props */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-slate-500 mb-12">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>14 дней бесплатно</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Без знания программирования</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Обучение на вашей базе FAQ</span>
              </div>
            </div>

            {/* Hero Interactive Visuals Card Stack (Reference Inspired) */}
            <HeroVisual />

          </div>
        </section>

        {/* STATS & METRICS SECTION */}
        <StatsSection />

        {/* BRAND & WIDGET GUIDELINES CUSTOMIZER SECTION (Reference Inspired) */}
        <BrandGuidelines />

        {/* CTA BANNER */}
        <CTASection />
      </main>

      <Footer />

      {/* Real Floating AI Support Widget in Bottom Right */}
      <WidgetPreview />
    </div>
  );
}
