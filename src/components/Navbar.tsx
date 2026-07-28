'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bot, ArrowRight, UserCheck } from 'lucide-react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const logged = localStorage.getItem('ai_user_logged_in');
      if (logged === 'true') {
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Bot className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-lg tracking-tight leading-none group-hover:text-blue-600 transition-colors">
              ChatPulse
            </span>
            <span className="text-[10px] uppercase font-semibold text-blue-600 tracking-wider">
              AI Support
            </span>
          </div>
        </Link>

        {/* Working Smooth-Scroll Navigation items */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-blue-600 transition-colors">
            Возможности
          </a>
          <a href="#guidelines" className="hover:text-blue-600 transition-colors">
            Кастомизация
          </a>
          <a href="#metrics" className="hover:text-blue-600 transition-colors">
            Результаты
          </a>
          <a href="#pricing" className="hover:text-blue-600 transition-colors">
            Тарифы
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Панель управления</span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-all"
            >
              Войти в панель
            </Link>
          )}

          <Link
            href="/auth/register"
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/30 flex items-center gap-1.5 transition-all hover:shadow-md hover:scale-[1.02]"
          >
            <span>Попробовать бесплатно</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
