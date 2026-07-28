'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bot, ArrowRight, Lock, Mail, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    
    // Store simple auth state
    localStorage.setItem('ai_user_logged_in', 'true');
    localStorage.setItem('ai_user_email', email);

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
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Вход в панель управления</h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Управляйте вашим ИИ-консультантом и базой знаний
        </p>
      </div>

      {/* Auth Card (Lovable / ChatGPT Style) */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80">
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ваш Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.ru"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Пароль</label>
                <a href="#" className="text-[11px] font-semibold text-blue-600 hover:text-blue-700">Забыли пароль?</a>
              </div>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              {loading ? (
                <span>Вход...</span>
              ) : (
                <>
                  <span>Войти в кабинет</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Ещё нет аккаунта?{' '}
              <Link href="/auth/register" className="font-bold text-blue-600 hover:text-blue-700">
                Зарегистрироваться бесплатно
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
