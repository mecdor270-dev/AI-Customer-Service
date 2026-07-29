'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bot, ArrowRight, Lock, Mail, Building, User, Sparkles } from 'lucide-react';

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

    localStorage.setItem('ai_user_logged_in', 'true');
    localStorage.setItem('ai_user_email', email);
    if (company) localStorage.setItem('ai_user_company', company);

    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="w-screen h-screen bg-[#0d0d0e] flex font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
      
      {/* Left Form Section (Lovable Dark Auth Card) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16 z-10 overflow-y-auto">
        
        {/* Brand Logo */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">ChatPulse AI</span>
          </Link>
        </div>

        {/* Main Register Box */}
        <div className="max-w-md w-full mx-auto my-auto py-6 space-y-5">
          
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Create your account</h1>
            <p className="mt-1.5 text-xs text-slate-400">
              Попробуйте ИИ-Консультанта бесплатно на 14 дней без привязки карты
            </p>
          </div>

          {/* Social Logins */}
          <div className="space-y-2.5">
            <button
              onClick={handleRegister}
              className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-3 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
              </svg>
              <span>Sign up with Google</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-800 w-full"></div>
            <span className="bg-[#0d0d0e] px-3 text-xs text-slate-500 font-semibold uppercase">Or</span>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Название магазина / сайта</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Цифровой Ритейл 24"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Рабочий Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@store.ru"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Придумайте пароль</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
            >
              {loading ? (
                <span>Создание аккаунта...</span>
              ) : (
                <>
                  <span>Создать аккаунт бесплатно</span>
                  <ArrowRight className="w-4 h-4 text-slate-900" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-1">
            <p className="text-xs text-slate-400">
              Уже есть аккаунт?{' '}
              <Link href="/auth/login" className="font-bold text-white hover:underline">
                Войти в систему
              </Link>
            </p>
          </div>

        </div>

        <div className="text-xs text-slate-600 text-center sm:text-left">
          🔒 SSO available on <span className="underline">Business and Enterprise</span> plans
        </div>

      </div>

      {/* Right Side: Lovable Colorful Gradient Artwork Canvas */}
      <div className="hidden lg:flex w-1/2 h-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>

        <div className="relative z-10 w-full max-w-lg bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-3xl shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-white/20 mx-auto flex items-center justify-center text-white shadow-inner">
            <Sparkles className="w-7 h-7 text-amber-300 animate-spin" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            Создайте ИИ-помощника для любого сайта
          </h2>
          <p className="text-xs text-white/80 leading-relaxed">
            Подключайте ваш магазин, обучайте на FAQ и передавайте сложные запросы живым операторам в 1 клик.
          </p>

          <div className="bg-white/90 text-slate-900 p-3 rounded-2xl flex items-center justify-between shadow-xl">
            <span className="text-xs font-semibold px-2">Start building your AI support assistant...</span>
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
