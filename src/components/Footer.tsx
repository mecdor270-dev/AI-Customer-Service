import Link from 'next/link';
import { Bot, Globe, Share2, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">ChatPulse AI</span>
            </div>
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
              Умный ИИ-Консультант для автоматизации поддержки клиентов на сайтах B2B и e-commerce за 5 минут.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Все системы работают
              </span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Продукт</h4>
            <ul className="space-y-2.5">
              <li><a href="#features" className="hover:text-white transition-colors">Возможности</a></li>
              <li><a href="#guidelines" className="hover:text-white transition-colors">Кастомизация виджета</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Тарифы</a></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Панель управления</Link></li>
            </ul>
          </div>

          {/* Col 3: Integrations */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Интеграции</h4>
            <ul className="space-y-2.5">
              <li><span className="hover:text-white transition-colors cursor-pointer">AmoCRM</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Bitrix24</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Telegram Bot</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">WhatsApp Business</span></li>
            </ul>
          </div>

          {/* Col 4: Legal & Support */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Документы</h4>
            <ul className="space-y-2.5">
              <li><span className="hover:text-white transition-colors cursor-pointer">Политика конфиденциальности</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Условия использования</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">База знаний</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Связаться с разработчиками</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ChatPulse Inc. Все права защищены.</p>
          <div className="flex items-center gap-4">
            <Globe className="w-4 h-4 cursor-pointer hover:text-slate-300 transition-colors" />
            <Share2 className="w-4 h-4 cursor-pointer hover:text-slate-300 transition-colors" />
            <MessageSquare className="w-4 h-4 cursor-pointer hover:text-slate-300 transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
}
