'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bot, ArrowRight, Lock, Mail, Building, User, Sparkles, AlertCircle } from 'lucide-react';
import { registerUserAccount } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Пожалуйста, заполните ваш Email и пароль.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    const result = registerUserAccount(email, password, company || name);

    if (!result.success) {
      setLoading(false);
      setErrorMsg(result.error || 'Ошибка при регистрации аккаунта.');
      return;
    }

    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 400);
  };

  return (
    <div className="w-screen h-screen bg-[#0d0d0e] flex font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
      
      {/* Left Form Section */}
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
            <h1 className="text-3xl font-black text-white tracking-tight">Создать новый аккаунт</h1>
            <p className="mt-1.5 text-xs text-slate-400">
              На 1 адрес электронной почты можно зарегистрировать строго 1 кабинет компании
            </p>
          </div>

          {/* Error Alert Container */}
          {errorMsg && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

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
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
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
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
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
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
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
                  <span>Зарегистрироваться</span>
                  <ArrowRight className="w-4 h-4 text-slate-900" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-1">
            <p className="text-xs text-slate-400">
              Уже зарегистрированы?{' '}
              <Link href="/auth/login" className="font-bold text-blue-400 hover:underline">
                Войти в аккаунт
              </Link>
            </p>
          </div>

        </div>

        <div className="text-xs text-slate-600 text-center sm:text-left font-medium">
          🔒 Все данные защищены и зашифрованы
        </div>

      </div>

      {/* Right Side Canvas */}
      <div className="hidden lg:flex w-1/2 h-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"></div>
        <div className="relative z-10 w-full max-w-lg bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-3xl shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-white/20 mx-auto flex items-center justify-center text-white shadow-inner">
            <Sparkles className="w-7 h-7 text-amber-300 animate-spin" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            Создайте ИИ-помощника для любого сайта
          </h2>
          <p className="text-xs text-white/80 leading-relaxed font-medium">
            Подключайте ваш магазин, обучайте на FAQ и передавайте сложные запросы живым операторам в 1 клик.
          </p>
        </div>
      </div>

    </div>
  );
}
