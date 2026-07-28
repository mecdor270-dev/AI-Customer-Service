'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bot, ArrowRight, Lock, Mail, Building, User, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    // Save auth session info
    localStorage.setItem('ai_user_logged_in', 'true');
    localStorage.setItem('ai_user_email', email);
    if (company) localStorage.setItem('ai_user_company', company);

    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Bot className="w-7 h-7" />
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">ChatPulse AI</span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Создание аккаунта</h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Попробуйте ИИ-Консультанта бесплатно на 14 дней без привязки карты
        </p>
      </div>

      {/* Auth Card (Lovable / ChatGPT Style) */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80">
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ваше имя</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Алексей Иванов"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Рабочий Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@store.ru"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Название магазина / сайта</label>
              <div className="relative">
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Цифровой Магазин Ключей"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Придумайте пароль</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                {loading ? (
                  <span>Создание аккаунта...</span>
                ) : (
                  <>
                    <span>Создать аккаунт бесплатно</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Уже есть аккаунт?{' '}
              <Link href="/auth/login" className="font-bold text-blue-600 hover:text-blue-700">
                Войти в систему
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
