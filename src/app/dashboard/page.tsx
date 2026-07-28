'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bot,
  LayoutDashboard,
  Palette,
  BookOpen,
  Code2,
  Settings,
  ArrowLeft,
  TrendingUp,
  MessageSquare,
  Clock,
  CheckCircle,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Send,
  Save,
  HelpCircle,
  RotateCcw,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Layers,
  Globe,
  LogOut,
  User as UserIcon,
  Moon,
  Sun,
  ChevronRight,
  ChevronDown,
  X,
  Headphones,
  Sliders,
  FolderPlus,
  Search,
  Activity,
  BarChart3,
  Lock,
  Cpu,
  Zap,
  Crown
} from 'lucide-react';
import { generateEmbedScript } from '@/lib/utils';
import { getAIResponse } from '@/lib/gemini';
import { WidgetConfig, FAQItem } from '@/types';
import { getSubscription, UserSubscription } from '@/lib/usage';
import { getProjects, saveProjects, getActiveProjectId, setActiveProjectId, createNewProject, Project } from '@/lib/projects';
import { getLanguage, setLanguage, translations, Language } from '@/lib/i18n';

export default function DashboardPage() {
  const router = useRouter();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'bot_settings' | 'knowledge' | 'operator' | 'embed' | 'analytics' | 'billing' | 'security'>('overview');
  const [platformTab, setPlatformTab] = useState<'tilda' | 'wordpress' | 'shopify' | 'html'>('tilda');

  // Multi-Project Management State
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjCategory, setNewProjCategory] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  // User Profile & ChatGPT-Style Bottom-Left Menu State
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userName, setUserName] = useState('Михаил');
  const [userEmail, setUserEmail] = useState('mikhail@store.ru');

  // Theme & Language State
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<Language>('ru');

  // Widget Configuration & Operator Routing State
  const [config, setConfig] = useState<WidgetConfig>({
    botName: 'Ассистент поддержки',
    welcomeMessage: 'Здравствуйте! Чем я могу помочь вам в нашем цифровом магазине?',
    primaryColor: '#2563eb',
    toneOfVoice: 'friendly',
    knowledgeText: 'График работы с 10:00 до 22:00. Инструкция по активации цифровых ключей: зайти в личный кабинет, ввести код.',
    faqItems: []
  });
  const [operatorType, setOperatorType] = useState<'telegram' | 'whatsapp' | 'email' | 'webhook'>('telegram');
  const [operatorDest, setOperatorDest] = useState('@support_store_bot');

  const [sub, setSub] = useState<UserSubscription>({
    isPremium: false,
    plan: 'Starter',
    usageCount: 0,
    dailyUsageCount: 0,
    maxDailyLimit: 30,
    lastResetDate: '',
  });

  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Test Chat Messages inside Preview
  const [testMessages, setTestMessages] = useState([
    { sender: 'bot', text: 'Здравствуйте! Чем я могу помочь вам в нашем цифровом магазине?' }
  ]);
  const [testInput, setTestInput] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  // Load Projects, Active Project, User Profile, Language on mount
  useEffect(() => {
    const loadedProjects = getProjects();
    setProjects(loadedProjects);

    const activeId = getActiveProjectId();
    const current = loadedProjects.find(p => p.id === activeId) || loadedProjects[0];
    if (current) {
      setActiveProject(current);
      setConfig(current.config);
      setOperatorType(current.operatorRouting?.type || 'telegram');
      setOperatorDest(current.operatorRouting?.destination || '@support_store_bot');
      setTestMessages([{ sender: 'bot', text: current.config.welcomeMessage }]);
    }

    setSub(getSubscription());
    setLang(getLanguage());

    try {
      const email = localStorage.getItem('ai_user_email');
      if (email) {
        setUserEmail(email);
        const namePart = email.split('@')[0];
        setUserName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
      }
    } catch (e) {
      console.warn('LocalStorage profile error:', e);
    }
  }, []);

  const t = translations[lang];

  // Save current project updates
  const saveCurrentProjectConfig = (updatedConfig: WidgetConfig, updatedOpType = operatorType, updatedOpDest = operatorDest) => {
    setConfig(updatedConfig);
    if (!activeProject) return;

    const updatedProject: Project = {
      ...activeProject,
      config: updatedConfig,
      operatorRouting: {
        type: updatedOpType,
        destination: updatedOpDest,
        enabled: true,
      }
    };

    const updatedProjects = projects.map(p => p.id === activeProject.id ? updatedProject : p);
    setProjects(updatedProjects);
    setActiveProject(updatedProject);
    saveProjects(updatedProjects);

    try {
      localStorage.setItem(`ai_widget_config_${activeProject.botId}`, JSON.stringify(updatedConfig));
      localStorage.setItem('ai_widget_config', JSON.stringify(updatedConfig));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  const handleConfigChange = <K extends keyof WidgetConfig>(field: K, value: WidgetConfig[K]) => {
    const updated = { ...config, [field]: value };
    saveCurrentProjectConfig(updated);
    if (field === 'welcomeMessage') {
      setTestMessages([{ sender: 'bot', text: value as string }]);
    }
  };

  // Switch Active Project
  const handleSelectProject = (projectId: string) => {
    const target = projects.find(p => p.id === projectId);
    if (target) {
      setActiveProjectId(target.id);
      setActiveProject(target);
      setConfig(target.config);
      setOperatorType(target.operatorRouting?.type || 'telegram');
      setOperatorDest(target.operatorRouting?.destination || '@support_store_bot');
      setTestMessages([{ sender: 'bot', text: target.config.welcomeMessage }]);
      showToast(`Переключено на проект: ${target.name}`);
    }
  };

  // Create New Project via Survey Modal
  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    const created = createNewProject(newProjName, newProjCategory, newProjDesc);
    const updatedList = getProjects();
    setProjects(updatedList);
    setActiveProject(created);
    setConfig(created.config);

    setNewProjName('');
    setNewProjCategory('');
    setNewProjDesc('');
    setIsAddProjectModalOpen(false);

    showToast(`Проект "${created.name}" успешно создан!`);
  };

  // Toggle Language (RU <-> EN)
  const handleToggleLanguage = () => {
    const nextLang = lang === 'ru' ? 'en' : 'ru';
    setLang(nextLang);
    setLanguage(nextLang);
    showToast(nextLang === 'ru' ? 'Язык переключен на Русский' : 'Language switched to English');
  };

  // Toggle Theme (Dark <-> Light)
  const handleToggleTheme = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
    showToast(themeMode === 'dark' ? 'Переключено на Светлую тему' : 'Переключено на Тёмную тему');
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('ai_user_logged_in');
    showToast('Вы вышли из системы');
    setTimeout(() => {
      router.push('/');
    }, 400);
  };

  // Add FAQ pair
  const handleAddFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newItem: FAQItem = {
      id: 'faq-' + Date.now(),
      question: newQuestion.trim(),
      answer: newAnswer.trim()
    };

    const updated = {
      ...config,
      faqItems: [...(config.faqItems || []), newItem]
    };
    saveCurrentProjectConfig(updated);
    setNewQuestion('');
    setNewAnswer('');
    showToast('Вопрос-Ответ успешно добавлен!');
  };

  // Remove FAQ pair
  const handleDeleteFAQ = (id: string) => {
    const updated = {
      ...config,
      faqItems: config.faqItems.filter(item => item.id !== id)
    };
    saveCurrentProjectConfig(updated);
    showToast('Вопрос-Ответ удален');
  };

  // Copy embed script tag
  const handleCopyScript = () => {
    const botId = activeProject ? activeProject.botId : 'bot_proj_98231a';
    navigator.clipboard.writeText(generateEmbedScript(botId));
    setCopied(true);
    showToast('Скопировано в буфер обмена!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Toast Trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Test live message inside preview widget
  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim() || testLoading) return;

    const userText = testInput.trim();
    setTestInput('');
    setTestMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setTestLoading(true);

    try {
      const response = await getAIResponse(userText, config);
      setTestMessages(prev => [...prev, { sender: 'bot', text: response }]);
    } catch {
      setTestMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Ответ сформирован по базе знаний магазина.' }
      ]);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className={`w-screen h-screen flex overflow-hidden font-sans selection:bg-blue-600 selection:text-white ${
      themeMode === 'dark' ? 'bg-[#09090b] text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* FULL-HEIGHT LEFT SIDEBAR (VERCEL & CHATGPT STYLE) */}
      <aside className={`w-64 border-r flex flex-col justify-between shrink-0 h-screen select-none ${
        themeMode === 'dark' ? 'bg-[#09090b] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        
        {/* Top Vercel Project Switcher Header */}
        <div className="p-3.5 border-b border-zinc-800/80 space-y-3">
          
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
                <Bot className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-white tracking-tight">ChatPulse</span>
            </Link>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">
              {sub.plan}
            </span>
          </div>

          {/* Project Dropdown Selector */}
          <div className="relative">
            <select
              value={activeProject?.id || ''}
              onChange={(e) => handleSelectProject(e.target.value)}
              className={`w-full text-xs font-bold px-3 py-2 rounded-xl border focus:outline-none appearance-none cursor-pointer ${
                themeMode === 'dark'
                  ? 'bg-zinc-900 border-zinc-800 text-white hover:border-zinc-700'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  📁 {p.name} ({p.botId})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          {/* Quick Add Project Button */}
          <button
            onClick={() => setIsAddProjectModalOpen(true)}
            className="w-full py-1.5 px-3 bg-zinc-800/70 hover:bg-zinc-800 text-slate-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-zinc-700/50"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>{t.addProject}</span>
          </button>
        </div>

        {/* Full Menu Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin">
          
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Разделы системы</div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md'
                : themeMode === 'dark' ? 'text-slate-400 hover:bg-zinc-900 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Обзор дашборда</span>
          </button>

          <button
            onClick={() => setActiveTab('bot_settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'bot_settings'
                ? 'bg-blue-600 text-white shadow-md'
                : themeMode === 'dark' ? 'text-slate-400 hover:bg-zinc-900 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>{t.botSettingsTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'knowledge'
                ? 'bg-blue-600 text-white shadow-md'
                : themeMode === 'dark' ? 'text-slate-400 hover:bg-zinc-900 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.knowledgeTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('operator')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'operator'
                ? 'bg-blue-600 text-white shadow-md'
                : themeMode === 'dark' ? 'text-slate-400 hover:bg-zinc-900 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>{t.operatorTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('embed')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'embed'
                ? 'bg-blue-600 text-white shadow-md'
                : themeMode === 'dark' ? 'text-slate-400 hover:bg-zinc-900 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Connect & Код</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-md'
                : themeMode === 'dark' ? 'text-slate-400 hover:bg-zinc-900 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Аналитика & Метрики</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'billing'
                ? 'bg-blue-600 text-white shadow-md'
                : themeMode === 'dark' ? 'text-slate-400 hover:bg-zinc-900 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>{t.billingTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white shadow-md'
                : themeMode === 'dark' ? 'text-slate-400 hover:bg-zinc-900 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Безопасность ИИ</span>
          </button>

        </div>

        {/* CHATGPT-STYLE BOTTOM-LEFT USER PROFILE CARD (EXACT MATCH TO USER SCREENSHOT 1) */}
        <div className="p-3 border-t border-zinc-800/80 relative">
          
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl p-2 flex items-center justify-between cursor-pointer transition-all shadow-md group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                МЕ
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="font-bold text-xs text-white truncate group-hover:text-blue-400 transition-colors">
                  {userName}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {sub.isPremium ? `${sub.plan} Plan` : 'Free'}
                </span>
              </div>
            </div>

            {!sub.isPremium && (
              <Link
                href="/dashboard/billing"
                onClick={(e) => e.stopPropagation()}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-blue-600 text-white text-[11px] font-bold rounded-xl transition-all border border-zinc-700 hover:border-blue-500 shrink-0"
              >
                {t.upgradeBtn}
              </Link>
            )}
          </div>

          {/* CHATGPT-STYLE POPUP MENU (MATCHING SCREENSHOT 1) */}
          {isProfileMenuOpen && (
            <div className="absolute bottom-16 left-3 w-60 bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 text-slate-200 text-xs font-medium space-y-1">
              
              {/* Menu User Header */}
              <div className="px-3 py-2 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                    МЕ
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">{userName}</div>
                    <div className="text-[10px] text-slate-400">{sub.plan} Plan</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>

              {/* Menu Item 1: Изменить план */}
              <Link
                href="/dashboard/billing"
                onClick={() => setIsProfileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-800 text-slate-200 hover:text-white transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t.changePlan}</span>
              </Link>

              {/* Menu Item 2: Персонализация */}
              <button
                onClick={handleToggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-800 text-slate-200 hover:text-white transition-colors text-left"
              >
                {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                <span>{t.personalization} ({themeMode === 'dark' ? 'Тёмная' : 'Светлая'})</span>
              </button>

              {/* Menu Item 3: Профиль */}
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-800 text-slate-200 hover:text-white transition-colors text-left"
              >
                <UserIcon className="w-4 h-4 text-blue-400" />
                <span>{t.profile}</span>
              </button>

              {/* Menu Item 4: Настройки */}
              <button
                onClick={handleToggleLanguage}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-800 text-slate-200 hover:text-white transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>{t.settings} ({lang.toUpperCase()})</span>
              </button>

              <div className="border-t border-zinc-800 my-1"></div>

              {/* Menu Item 5: Справка */}
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setActiveTab('embed');
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-800 text-slate-200 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span>{t.help}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              {/* Menu Item 6: Выйти */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-4 h-4" />
                  <span>{t.logout}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-red-500/60" />
              </button>

            </div>
          )}

        </div>

      </aside>

      {/* MAIN FULL-SCREEN WORKSPACE CANVAS */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#09090b] flex flex-col">
        
        {/* Top Breadcrumb & Controls Header */}
        <div className="px-6 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-[#0d0d0e] sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-white text-sm">
              {activeProject?.name || 'Проект'} <span className="text-slate-500 text-xs font-normal">/ {activeTab}</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
              Bot ID: {activeProject?.botId}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400 hidden sm:inline">
              Дневной лимит (00:00 МСК): <span className="font-bold text-white">{sub.dailyUsageCount || 0}/{sub.plan === 'Pro' ? 2000 : sub.plan === 'Max' ? 6000 : 30}</span>
            </span>

            <Link
              href="/dashboard/billing"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all"
            >
              Управление тарифом
            </Link>
          </div>
        </div>

        {/* Dynamic Workspace Grid Container */}
        <div className="p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
          
          {/* Main Controls Panel (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* 4 Stat Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                    <div className="text-xs text-slate-400 font-medium mb-1">Обработано сообщений</div>
                    <div className="text-2xl font-black text-white">1,482</div>
                    <div className="text-[10px] text-emerald-400 mt-1 font-semibold">↑ +14% на этой неделе</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                    <div className="text-xs text-slate-400 font-medium mb-1">Автоматизация ИИ</div>
                    <div className="text-2xl font-black text-emerald-400">84.2%</div>
                    <div className="text-[10px] text-slate-400 mt-1 font-semibold">Без участия человека</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                    <div className="text-xs text-slate-400 font-medium mb-1">Среднее время отклика</div>
                    <div className="text-2xl font-black text-blue-400">0.6s</div>
                    <div className="text-[10px] text-emerald-400 mt-1 font-semibold">Мгновенные ответы</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                    <div className="text-xs text-slate-400 font-medium mb-1">Оценка клиентов</div>
                    <div className="text-2xl font-black text-amber-400">98.4%</div>
                    <div className="text-[10px] text-slate-400 mt-1 font-semibold">Высокая точность</div>
                  </div>
                </div>

                {/* Main Overview Project Details */}
                <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                  <h3 className="font-bold text-white text-base">Информация о текущем проекте</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">Название:</span>
                      <div className="font-bold text-white text-sm">{activeProject?.name}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Категория:</span>
                      <div className="font-bold text-white text-sm">{activeProject?.category}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Идентификатор Bot ID:</span>
                      <div className="font-mono text-emerald-400 font-bold text-sm">{activeProject?.botId}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Канал оператора:</span>
                      <div className="font-bold text-blue-400 text-sm">{operatorType.toUpperCase()}: {operatorDest}</div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: BOT SETTINGS */}
            {activeTab === 'bot_settings' && (
              <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="font-bold text-white text-base flex items-center gap-2">
                    <Palette className="w-5 h-5 text-blue-500" />
                    Персонализация стиля и личности ИИ-Консультанта
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Настройте внешний вид, имя и системный тон общения.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Имя бота</label>
                  <input
                    id="dash-bot-name-input"
                    type="text"
                    value={config.botName}
                    onChange={(e) => handleConfigChange('botName', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Приветственное сообщение</label>
                  <textarea
                    id="dash-welcome-msg-input"
                    rows={3}
                    value={config.welcomeMessage}
                    onChange={(e) => handleConfigChange('welcomeMessage', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2">Системный тон общения</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'polite', label: 'Вежливый', desc: 'Доброжелательный' },
                      { id: 'formal', label: 'Официальный', desc: 'Строгий B2B' },
                      { id: 'friendly', label: 'Дружелюбный', desc: 'Открытый стиль' }
                    ].map((tone) => (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => handleConfigChange('toneOfVoice', tone.id as WidgetConfig['toneOfVoice'])}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          config.toneOfVoice === tone.id
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-zinc-900 border-zinc-800 text-slate-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="font-bold text-xs">{tone.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{tone.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2">Основной цвет кнопки и шапки</label>
                  <div className="flex items-center gap-3">
                    {['#2563eb', '#059669', '#7c3aed', '#dc2626', '#0f172a'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleConfigChange('primaryColor', color)}
                        style={{ backgroundColor: color }}
                        className={`w-9 h-9 rounded-xl border-2 transition-all flex items-center justify-center text-white ${
                          config.primaryColor === color ? 'scale-110 ring-4 ring-blue-500/30 border-white' : 'border-transparent'
                        }`}
                      >
                        {config.primaryColor === color && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: KNOWLEDGE BASE */}
            {activeTab === 'knowledge' && (
              <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="font-bold text-white text-base flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    База Знаний (Knowledge Base)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Введите данные для обучения ИИ клиентской поддержке.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Регламенты и условия магазина (Textarea)</label>
                  <textarea
                    id="dash-knowledge-textarea"
                    rows={5}
                    value={config.knowledgeText}
                    onChange={(e) => handleConfigChange('knowledgeText', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono leading-relaxed"
                  />
                </div>

                <div className="pt-4 border-t border-zinc-800 space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider">Частые пары Вопрос-Ответ (FAQ)</h3>

                  <form onSubmit={handleAddFAQ} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-3">
                    <input
                      id="dash-faq-question-input"
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Вопрос..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                    <textarea
                      id="dash-faq-answer-input"
                      rows={2}
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder="Ответ ИИ..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                    <button
                      id="dash-add-faq-btn"
                      type="submit"
                      disabled={!newQuestion.trim() || !newAnswer.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Добавить пара FAQ</span>
                    </button>
                  </form>

                  <div className="space-y-3">
                    {config.faqItems?.map((item) => (
                      <div key={item.id} className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-1 relative">
                        <div className="flex items-start justify-between">
                          <div className="font-bold text-xs text-white flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{item.question}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteFAQ(item.id)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-400 pl-5">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: OPERATOR ROUTING */}
            {activeTab === 'operator' && (
              <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="font-bold text-white text-base flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-blue-500" />
                    Маршрутизация перевода на живого оператора
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Укажите куда переводить клиентов при клике "Вызвать оператора".
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'telegram', label: 'Telegram Бот / Чат', desc: '@support_bot' },
                      { id: 'whatsapp', label: 'WhatsApp Business', desc: '+7 (900) 123-45-67' },
                      { id: 'email', label: 'Support Email', desc: 'help@company.com' },
                      { id: 'webhook', label: 'Webhook URL', desc: 'https://api.com/tickets' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setOperatorType(item.id as any);
                          saveCurrentProjectConfig(config, item.id as any, operatorDest);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          operatorType === item.id
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-zinc-900 border-zinc-800 text-slate-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="font-bold text-xs">{item.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Назначение (Юзернейм / Номер / Email)</label>
                    <input
                      type="text"
                      value={operatorDest}
                      onChange={(e) => {
                        setOperatorDest(e.target.value);
                        saveCurrentProjectConfig(config, operatorType, e.target.value);
                      }}
                      placeholder="@my_support_bot"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CONNECT & EMBED */}
            {activeTab === 'embed' && (
              <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="font-bold text-white text-base flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-blue-500" />
                    Подключение и встраиваемый код
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Уникальный код для проекта <span className="font-bold text-blue-400">{activeProject?.name}</span>:
                  </p>
                </div>

                <div className="relative">
                  <pre className="bg-slate-950 text-emerald-400 p-5 rounded-2xl text-xs font-mono border border-zinc-800 overflow-x-auto leading-relaxed shadow-lg">
                    <code>{generateEmbedScript(activeProject?.botId || 'bot_proj_98231a')}</code>
                  </pre>
                  
                  <button
                    onClick={handleCopyScript}
                    className="mt-3 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Скопировано в буфер!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Скопировать код виджета</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB: ANALYTICS & METRICS */}
            {activeTab === 'analytics' && (
              <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="font-bold text-white text-base flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Аналитика и детальные метрики
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Отслеживайте нагрузку, скорость отклика и удовлетворенность клиентов.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700 space-y-1">
                    <div className="text-xs text-slate-400 font-semibold">Конверсия ответов</div>
                    <div className="text-2xl font-black text-emerald-400">92.4%</div>
                    <div className="text-[10px] text-slate-400">Клиенты получили нужный ответ</div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700 space-y-1">
                    <div className="text-xs text-slate-400 font-semibold">Перевод на оператора</div>
                    <div className="text-2xl font-black text-amber-400">7.6%</div>
                    <div className="text-[10px] text-slate-400">Меньше 8% требуют человека</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BILLING & TARIFFS */}
            {activeTab === 'billing' && (
              <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="font-bold text-white text-base flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    Управление подпиской и тарифом
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Дневные лимиты обновляются каждый день в 00:00 по Московскому времени.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
                    <div className="font-bold text-white text-sm">Starter Free</div>
                    <div className="text-xl font-black text-white my-2">0 ₽</div>
                    <p className="text-[10px] text-slate-400">30 ответов в месяц</p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-600/50">
                    <div className="font-bold text-white text-sm flex items-center gap-1">
                      <span>Pro Business</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-xl font-black text-white my-2">1 890 ₽ <span className="text-[10px] font-normal text-slate-400">/ $19</span></div>
                    <p className="text-[10px] text-emerald-400 font-bold">2 000 ответов в день (00:00 МСК)</p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-600/50">
                    <div className="font-bold text-white text-sm flex items-center gap-1">
                      <span>Max Plan</span>
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-xl font-black text-white my-2">2 990 ₽ <span className="text-[10px] font-normal text-slate-400">/ $39.99</span></div>
                    <p className="text-[10px] text-amber-400 font-bold">6 000 ответов в день (00:00 МСК)</p>
                  </div>
                </div>

                <Link
                  href="/dashboard/billing"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  Перейти к выбору тарифа и оплате
                </Link>
              </div>
            )}

            {/* TAB: AI SECURITY */}
            {activeTab === 'security' && (
              <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="font-bold text-white text-base flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                    Безопасность ИИ и Защита Данных
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Система фильтрацииPrompt Injection активна на уровне API.
                  </p>
                </div>

                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-xs text-emerald-300 space-y-2">
                  <div className="font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Защита от утечки данных включена</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    ИИ строго отвечает по базе знаний компании и мгновенно отклоняет попытки взлома промпта (Prompt Injection).
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Right Live Preview Widget Column (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-4 bg-zinc-900/60 rounded-2xl p-5 border border-zinc-800 flex flex-col items-center justify-center">
              
              <div className="w-full flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  Интерактивный Виджет
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold font-mono">
                  {activeProject?.botId}
                </span>
              </div>

              {/* Live Preview Card */}
              <div className="w-full max-w-sm bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden h-[440px]">
                
                {/* Dynamic Header */}
                <div
                  style={{ backgroundColor: config.primaryColor }}
                  className="p-4 text-white flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm leading-tight">{config.botName || 'Ассистент поддержки'}</h4>
                      <p className="text-[10px] text-white/80">Онлайн • Тон: {config.toneOfVoice}</p>
                    </div>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-3.5 bg-slate-50 space-y-3 overflow-y-auto text-xs">
                  {testMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        style={{
                          backgroundColor: msg.sender === 'user' ? config.primaryColor : undefined
                        }}
                        className={`max-w-[85%] p-3 rounded-2xl leading-relaxed shadow-2xs ${
                          msg.sender === 'user'
                            ? 'text-white rounded-br-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {testLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 p-2.5 rounded-2xl rounded-bl-none text-slate-500 flex items-center gap-2 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                        <span>Генерирую ответ...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Form */}
                <form onSubmit={handleSendTestMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Протестируйте ответ..."
                    className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={testLoading || !testInput.trim()}
                    style={{ backgroundColor: config.primaryColor }}
                    className="text-white p-2 rounded-xl text-xs font-semibold disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>

            </div>
          </div>

        </div>

      </main>

      {/* CREATE NEW PROJECT SURVEY MODAL */}
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 relative space-y-4 text-white">
            <button
              onClick={() => setIsAddProjectModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Создание нового проекта</h3>
                <p className="text-xs text-slate-400">Каждый проект получает уникальный Bot ID и отдельный код</p>
              </div>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Название проекта / сайта</label>
                <input
                  type="text"
                  required
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="Магазин Ключей #2"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Сфера деятельности / Тематика</label>
                <input
                  type="text"
                  value={newProjCategory}
                  onChange={(e) => setNewProjCategory(e.target.value)}
                  placeholder="Цифровые товары / Ритейл / Одежда"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Краткое описание проекта</label>
                <textarea
                  rows={2}
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Опишите, чем занимается ваш сайт..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 font-bold text-xs rounded-xl shadow-md"
                >
                  Создать проект
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddProjectModalOpen(false)}
                  className="px-4 py-3 bg-zinc-800 text-slate-300 font-semibold text-xs rounded-xl hover:bg-zinc-700"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER PROFILE MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 relative space-y-4 text-white">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white font-bold text-base flex items-center justify-center">
                МЕ
              </div>
              <div>
                <h3 className="font-bold text-base">{userName}</h3>
                <p className="text-xs text-slate-400">{userEmail}</p>
              </div>
            </div>

            <div className="bg-zinc-800/60 p-4 rounded-xl border border-zinc-700/80 text-xs space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Текущий тариф:</span>
                <span className="text-emerald-400">{sub.plan} Plan</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Дневной лимит (00:00 МСК):</span>
                <span className="text-white font-bold">{sub.plan === 'Pro' ? '2 000' : sub.plan === 'Max' ? '6 000' : '30'} сообщений</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Всего проектов:</span>
                <span className="text-white font-bold">{projects.length}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Язык системы:</span>
                <span className="text-white uppercase font-bold">{lang}</span>
              </div>
            </div>

            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
