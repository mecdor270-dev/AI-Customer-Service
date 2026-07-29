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
  Crown,
  Terminal,
  FileCode2,
  Mail,
  SendHorizontal
} from 'lucide-react';
import { generateEmbedScript } from '@/lib/utils';
import { getAIResponse } from '@/lib/gemini';
import { WidgetConfig, FAQItem } from '@/types';
import { getSubscription, UserSubscription } from '@/lib/usage';
import { getProjects, saveProjects, getActiveProjectId, setActiveProjectId, createNewProject, Project } from '@/lib/projects';
import { logoutUser, getCurrentUserEmail, getOrCreateAccount } from '@/lib/auth';
import { getLanguage, setLanguage, translations, Language } from '@/lib/i18n';

export default function DashboardPage() {
  const router = useRouter();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'bot_settings' | 'knowledge' | 'operator' | 'embed' | 'analytics' | 'billing' | 'security'>('overview');
  const [platformTab, setPlatformTab] = useState<'tilda' | 'wordpress' | 'shopify' | 'custom'>('custom');

  // Multi-Project Management State
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjCategory, setNewProjCategory] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  // User Profile & Settings Modal State
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [userName, setUserName] = useState('Михаил');
  const [userEmail, setUserEmail] = useState('mikhail@store.ru');

  // Theme & Language State - DEFAULT THEME IS LIGHT MODE
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [lang, setLang] = useState<Language>('ru');

  // 4 Independent Operator Channels State
  const [opTelegram, setOpTelegram] = useState('@support_store_bot');
  const [opWhatsapp, setOpWhatsapp] = useState('+79001234567');
  const [opEmail, setOpEmail] = useState('support@store.ru');
  const [opCustom, setOpCustom] = useState('https://store.ru/help');
  const [opSubTab, setOpSubTab] = useState<'telegram' | 'whatsapp' | 'email' | 'custom'>('telegram');

  // Developer email copy state
  const [devEmailCopied, setDevEmailCopied] = useState(false);

  // Widget Configuration State
  const [config, setConfig] = useState<WidgetConfig>({
    botName: 'Ассистент поддержки',
    welcomeMessage: 'Здравствуйте! Чем я могу помочь вам в нашем магазине?',
    primaryColor: '#2563eb',
    themePreset: 'royal',
    toneOfVoice: 'friendly',
    knowledgeText: 'График работы с 10:00 до 22:00. Инструкция по активации цифровых ключей: зайти в личный кабинет, ввести код.',
    faqItems: []
  });

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
    { sender: 'bot', text: 'Здравствуйте! Чем я могу помочь вам в нашем магазине?' }
  ]);
  const [testInput, setTestInput] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  // Sync bot config to server API endpoint for embedded widget on external sites
  const syncServerBotConfig = (botId: string, updatedConfig: WidgetConfig, opDataOverride?: any) => {
    try {
      const opRouting = opDataOverride || {
        telegram: opTelegram,
        whatsapp: opWhatsapp,
        email: opEmail,
        custom: opCustom,
        destination: opTelegram,
        enabled: true
      };

      fetch('/api/widget/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId: botId,
          config: updatedConfig,
          operatorRouting: opRouting
        })
      }).catch(err => console.warn('Server sync fetch error:', err));
    } catch (e) {
      console.warn('Server config sync failed:', e);
    }
  };

  // Load Projects, Active Project, User Profile, Language on mount
  useEffect(() => {
    const loadedProjects = getProjects();
    setProjects(loadedProjects);

    const activeId = getActiveProjectId();
    const current = loadedProjects.find(p => p.id === activeId) || loadedProjects[0];
    if (current) {
      setActiveProject(current);
      setConfig(current.config);
      setTestMessages([{ sender: 'bot', text: current.config.welcomeMessage }]);

      if (current.operatorRouting) {
        if (current.operatorRouting.destination) setOpTelegram(current.operatorRouting.destination);
      }

      // Populate server store for active botId
      syncServerBotConfig(current.botId, current.config, current.operatorRouting);
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
  const saveCurrentProjectConfig = (updatedConfig: WidgetConfig, opDataOverride?: any) => {
    setConfig(updatedConfig);
    if (!activeProject) return;

    const opData = opDataOverride || {
      telegram: opTelegram,
      whatsapp: opWhatsapp,
      email: opEmail,
      custom: opCustom,
      type: 'telegram',
      destination: opTelegram,
      enabled: true,
    };

    const updatedProject: Project = {
      ...activeProject,
      config: updatedConfig,
      operatorRouting: opData
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

    // Immediately push update to server API endpoint for live widget synchronization
    syncServerBotConfig(activeProject.botId, updatedConfig, opData);
  };

  const handleConfigChange = <K extends keyof WidgetConfig>(field: K, value: WidgetConfig[K]) => {
    const updated = { ...config, [field]: value };
    saveCurrentProjectConfig(updated);
    if (field === 'welcomeMessage') {
      setTestMessages([{ sender: 'bot', text: value as string }]);
    }
  };

  const handleSelectPresetTheme = (preset: 'white' | 'royal' | 'dark') => {
    let color = '#2563eb';
    if (preset === 'white') color = '#0f172a';
    if (preset === 'dark') color = '#0f172a';
    if (preset === 'royal') color = '#2563eb';

    const updated: WidgetConfig = {
      ...config,
      themePreset: preset,
      primaryColor: color
    };
    saveCurrentProjectConfig(updated);
    showToast(
      preset === 'white'
        ? 'Активирована Светлая тема (White)'
        : preset === 'dark'
        ? 'Активирована Тёмная тема (Dark Blue)'
        : 'Активирована Фирменная синяя тема (Royal Blue)'
    );
  };

  const handleOperatorChange = (type: 'telegram' | 'whatsapp' | 'email' | 'custom', value: string) => {
    let tg = opTelegram;
    let wa = opWhatsapp;
    let em = opEmail;
    let cu = opCustom;

    if (type === 'telegram') { setOpTelegram(value); tg = value; }
    else if (type === 'whatsapp') { setOpWhatsapp(value); wa = value; }
    else if (type === 'email') { setOpEmail(value); em = value; }
    else if (type === 'custom') { setOpCustom(value); cu = value; }

    const opData = {
      telegram: tg,
      whatsapp: wa,
      email: em,
      custom: cu,
      type: 'telegram',
      destination: tg,
      enabled: true
    };

    saveCurrentProjectConfig(config, opData);
  };

  // Switch Active Project
  const handleSelectProject = (projectId: string) => {
    const target = projects.find(p => p.id === projectId);
    if (target) {
      setActiveProjectId(target.id);
      setActiveProject(target);
      setConfig(target.config);
      setTestMessages([{ sender: 'bot', text: target.config.welcomeMessage }]);
      showToast(`Переключено на проект: ${target.name}`);
      syncServerBotConfig(target.botId, target.config, target.operatorRouting);
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
    syncServerBotConfig(created.botId, created.config, created.operatorRouting);
  };

  // Toggle Language (RU <-> EN)
  const handleToggleLanguage = (targetLang: Language) => {
    setLang(targetLang);
    setLanguage(targetLang);
    showToast(targetLang === 'ru' ? 'Язык переключен на Русский' : 'Language switched to English');
  };

  // Toggle Theme (Light <-> Dark)
  const handleToggleTheme = () => {
    const nextMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextMode);
    showToast(nextMode === 'dark' ? 'Переключено на Тёмную тему' : 'Переключено на Светлую тему');
  };

  // Logout Handler
  const handleLogout = () => {
    logoutUser();
    showToast('Вы вышли из системы');
    setTimeout(() => {
      router.push('/auth/login');
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

  // Copy developer email instructions
  const handleCopyDevEmail = () => {
    const botId = activeProject ? activeProject.botId : 'bot_proj_98231a';
    const emailBody = `Привет!\nПожалуйста, вставь этот 1-строчный скрипт виджета ИИ-поддержки на наш сайт перед закрывающим тегом </body>:\n\n<script src="http://localhost:3000/widget.js" data-bot-id="${botId}" defer></script>\n\nСпасибо!`;
    navigator.clipboard.writeText(emailBody);
    setDevEmailCopied(true);
    showToast('Текст инструкции программисту скопирован!');
    setTimeout(() => setDevEmailCopied(false), 2500);
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
      themeMode === 'dark' ? 'dark bg-[#09090b] text-slate-100' : 'bg-slate-100 text-slate-950'
    }`}>
      
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* FULL-HEIGHT LEFT SIDEBAR */}
      <aside className={`w-64 border-r flex flex-col justify-between shrink-0 h-screen select-none ${
        themeMode === 'dark' ? 'bg-[#09090b] border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        
        {/* Top Vercel Project Switcher Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 space-y-3">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-slate-950 dark:text-white tracking-tight">ChatPulse</span>
            </div>

            <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-slate-200 font-mono text-[10px] font-extrabold border border-slate-300 dark:border-zinc-700">
              STARTER
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
                  : 'bg-white border-slate-300 text-slate-950 hover:border-slate-400 shadow-2xs'
              }`}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  📁 {p.name} ({p.botId})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          {/* Quick Add Project Button */}
          <button
            onClick={() => setIsAddProjectModalOpen(true)}
            className="w-full py-1.5 px-3 bg-slate-100 dark:bg-zinc-800/70 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-900 dark:text-slate-200 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-slate-300 dark:border-zinc-700/50"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t.addProject}</span>
          </button>
        </div>

        {/* Full Menu Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin">
          
          <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-900 dark:text-slate-400 uppercase tracking-wider">Разделы системы</div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md'
                : themeMode === 'dark' ? 'text-slate-300 hover:bg-zinc-900 hover:text-white' : 'text-slate-900 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Обзор дашборда</span>
          </button>

          <button
            onClick={() => setActiveTab('bot_settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'bot_settings'
                ? 'bg-blue-600 text-white shadow-md'
                : themeMode === 'dark' ? 'text-slate-300 hover:bg-zinc-900 hover:text-white' : 'text-slate-900 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>{t.botSettingsTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'knowledge'
                ? 'bg-blue-600 text-white shadow-md'
                : themeMode === 'dark' ? 'text-slate-300 hover:bg-zinc-900 hover:text-white' : 'text-slate-900 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.knowledgeTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('operator')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'operator'
                ? 'bg-blue-600 text-white shadow-md'
                : themeMode === 'dark' ? 'text-slate-300 hover:bg-zinc-900 hover:text-white' : 'text-slate-900 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>{t.operatorTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('embed')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'embed'
                ? 'bg-blue-600 text-white shadow-md'
                : themeMode === 'dark' ? 'text-slate-300 hover:bg-zinc-900 hover:text-white' : 'text-slate-900 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Connect & Инструкция</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-md'
                : themeMode === 'dark' ? 'text-slate-300 hover:bg-zinc-900 hover:text-white' : 'text-slate-900 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Аналитика & Метрики</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'billing'
                ? 'bg-blue-600 text-white shadow-md'
                : themeMode === 'dark' ? 'text-slate-300 hover:bg-zinc-900 hover:text-white' : 'text-slate-900 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <span>{t.billingTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white shadow-md'
                : themeMode === 'dark' ? 'text-slate-300 hover:bg-zinc-900 hover:text-white' : 'text-slate-900 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            <span>Безопасность ИИ</span>
          </button>

        </div>

        {/* Bottom User Profile Section with Popup */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800 relative">
          
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className={`w-full p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all shadow-2xs group ${
              themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800' : 'bg-white border-slate-300 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                МЕ
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="font-extrabold text-xs text-slate-950 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                  {userName}
                </span>
                <span className="text-[10px] text-slate-700 dark:text-slate-400 font-bold">
                  {sub.isPremium ? `${sub.plan} Plan` : 'Free'}
                </span>
              </div>
            </div>

            {!sub.isPremium && (
              <Link
                href="/pricing"
                onClick={(e) => e.stopPropagation()}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl transition-all shadow-xs shrink-0"
              >
                {t.upgradeBtn}
              </Link>
            )}
          </div>

          {/* CHATGPT-STYLE POPUP MENU */}
          {isProfileMenuOpen && (
            <div className={`absolute bottom-16 left-3 w-60 border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 text-xs font-extrabold space-y-1 ${
              themeMode === 'dark' ? 'bg-zinc-900 border-zinc-700 text-slate-100' : 'bg-white border-slate-300 text-slate-950'
            }`}>
              
              <div className="px-3 py-2 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                    МЕ
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-950 dark:text-white text-xs">{userName}</div>
                    <div className="text-[10px] text-slate-700 dark:text-slate-400 font-bold">{sub.plan} Plan</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Menu Item 1: Изменить план */}
              <Link
                href="/pricing"
                onClick={() => setIsProfileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-950 dark:text-slate-100"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{t.changePlan}</span>
              </Link>

              {/* Menu Item 2: Персонализация (Theme Toggle) */}
              <button
                onClick={handleToggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left text-slate-950 dark:text-slate-100"
              >
                {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                <span>{t.personalization} ({themeMode === 'dark' ? 'Тёмная' : 'Светлая'})</span>
              </button>

              {/* Menu Item 3: Профиль */}
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left text-slate-950 dark:text-slate-100"
              >
                <UserIcon className="w-4 h-4 text-blue-500" />
                <span>{t.profile}</span>
              </button>

              {/* Menu Item 4: Настройки */}
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setIsSettingsModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left font-extrabold text-blue-600 dark:text-blue-400"
              >
                <Settings className="w-4 h-4 text-blue-500" />
                <span>{t.settings} ({lang.toUpperCase()})</span>
              </button>

              <div className="border-t border-slate-200 dark:border-zinc-800 my-1"></div>

              {/* Menu Item 5: Справка */}
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setActiveTab('embed');
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-950 dark:text-slate-100"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-emerald-500" />
                  <span>{t.help}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Menu Item 6: Выйти */}
              <button
                id="dash-logout-btn"
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors font-extrabold"
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
      <main className={`flex-1 h-screen overflow-y-auto flex flex-col ${
        themeMode === 'dark' ? 'bg-[#09090b]' : 'bg-slate-100 text-slate-950'
      }`}>
        
        {/* Top Breadcrumb & Controls Header */}
        <div className={`px-6 py-3.5 border-b flex items-center justify-between sticky top-0 z-30 ${
          themeMode === 'dark' ? 'bg-[#0d0d0e] border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center gap-3">
            <h1 className="font-extrabold text-slate-950 dark:text-white text-sm">
              {activeProject?.name || 'Проект'} <span className="text-slate-600 dark:text-slate-400 text-xs font-bold">/ {activeTab}</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-mono border border-blue-300 dark:border-emerald-500/20 font-extrabold">
              Bot ID: {activeProject?.botId}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-800 dark:text-slate-300 hidden sm:inline font-bold">
              Дневной лимит (00:00 МСК): <span className="font-extrabold text-slate-950 dark:text-white">{sub.dailyUsageCount || 0}/{sub.plan === 'Pro' ? 2000 : sub.plan === 'Max' ? 6000 : 30}</span>
            </span>

            <Link
              href="/pricing"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all"
            >
              {t.upgradeBtn}
            </Link>
          </div>
        </div>

        {/* Workspace Grid Container */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl">
          
          {/* Main Controls Section (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* TAB: OVERVIEW DASHBOARD */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* 3 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-2xl border ${
                    themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-300 shadow-2xs text-slate-950'
                  }`}>
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-400 mb-2">
                      <span className="text-xs font-extrabold">Обращений клиентов</span>
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-950 dark:text-white">1,482</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold mt-1">↑ +14% на этой неделе</div>
                  </div>

                  <div className={`p-4 rounded-2xl border ${
                    themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-300 shadow-2xs text-slate-950'
                  }`}>
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-400 mb-2">
                      <span className="text-xs font-extrabold">Автономных ответов</span>
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-950 dark:text-white">92.4%</div>
                    <div className="text-[10px] text-slate-700 dark:text-slate-400 mt-1 font-bold">Без вызова оператора</div>
                  </div>

                  <div className={`p-4 rounded-2xl border ${
                    themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-300 shadow-2xs text-slate-950'
                  }`}>
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-400 mb-2">
                      <span className="text-xs font-extrabold">Ср. время ответа</span>
                      <Clock className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-950 dark:text-white">0.4 сек</div>
                    <div className="text-[10px] text-slate-700 dark:text-slate-400 mt-1 font-bold">Мгновенная реакция</div>
                  </div>
                </div>

                {/* Active Project Card */}
                <div className={`p-6 rounded-2xl border space-y-4 ${
                  themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-300 shadow-2xs text-slate-950'
                }`}>
                  <h3 className="font-extrabold text-slate-950 dark:text-white text-base">Информация о текущем проекте</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-700 dark:text-slate-400 block font-bold">Название</span>
                      <div className="font-extrabold text-slate-950 dark:text-white text-sm">{activeProject?.name}</div>
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-400 block font-bold">Категория</span>
                      <div className="font-extrabold text-slate-950 dark:text-white text-sm">{activeProject?.category}</div>
                    </div>
                  </div>
                  <div className="pt-2 text-xs">
                    <span className="text-slate-700 dark:text-slate-400 block font-bold mb-1">Описание</span>
                    <p className="text-slate-800 dark:text-slate-300 font-medium">{activeProject?.description}</p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: EMBED & INSTALLATION CODE */}
            {activeTab === 'embed' && (
              <div className={`p-6 rounded-2xl border space-y-6 animate-in fade-in duration-200 ${
                themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-300 shadow-2xs text-slate-950'
              }`}>
                <div>
                  <h2 className="font-extrabold text-slate-950 dark:text-white text-base flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-blue-500" />
                    Интеграция виджета на любой сайт
                  </h2>
                  <p className="text-xs text-slate-700 dark:text-slate-400 font-medium mt-1">
                    Скопируйте 1-строчный HTML скрипт и вставьте его на свой сайт перед закрывающим тегом <code>&lt;/body&gt;</code>.
                  </p>
                </div>

                {/* 1-Line Embed Code Card */}
                <div className={`p-4 rounded-xl border space-y-3 ${
                  themeMode === 'dark' ? 'bg-zinc-955 border-zinc-800' : 'bg-slate-900 text-white border-slate-800'
                }`}>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-mono flex items-center gap-1.5 font-bold">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      1-строчный код для вашего сайта:
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                      Bot ID: {activeProject?.botId}
                    </span>
                  </div>

                  <pre className="font-mono text-xs text-emerald-400 bg-black/50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-all border border-zinc-800">
                    {generateEmbedScript(activeProject?.botId || 'bot_shop_default')}
                  </pre>

                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <button
                      id="dash-copy-embed-btn"
                      onClick={handleCopyScript}
                      className="mt-3 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Скопировано в буфер!' : 'Скопировать код виджета'}</span>
                    </button>

                    <button
                      onClick={handleCopyDevEmail}
                      className="mt-3 w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                    >
                      {devEmailCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Mail className="w-4 h-4 text-amber-400" />}
                      <span>{devEmailCopied ? 'Инструкция скопирована!' : 'Скопировать для верстальщика'}</span>
                    </button>
                  </div>
                </div>

                {/* Step-by-Step Installation Guides */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-extrabold text-sm text-slate-955 dark:text-white flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-blue-500" />
                    Пошаговые инструкции установки по типам сайтов:
                  </h3>

                  {/* Tabs Selector */}
                  <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-2 overflow-x-auto pb-1 text-xs font-extrabold">
                    <button
                      onClick={() => setPlatformTab('custom')}
                      className={`px-4 py-2 rounded-t-xl transition-all border-b-2 ${
                        platformTab === 'custom'
                          ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                          : 'border-transparent text-slate-700 hover:text-slate-955 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      ⚡ Собственный сайт (HTML/PHP/React/Bitrix)
                    </button>

                    <button
                      onClick={() => setPlatformTab('tilda')}
                      className={`px-4 py-2 rounded-t-xl transition-all border-b-2 ${
                        platformTab === 'tilda'
                          ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                          : 'border-transparent text-slate-700 hover:text-slate-955 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      🔷 Tilda Publishing
                    </button>

                    <button
                      onClick={() => setPlatformTab('wordpress')}
                      className={`px-4 py-2 rounded-t-xl transition-all border-b-2 ${
                        platformTab === 'wordpress'
                          ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                          : 'border-transparent text-slate-700 hover:text-slate-955 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      🟢 WordPress
                    </button>

                    <button
                      onClick={() => setPlatformTab('shopify')}
                      className={`px-4 py-2 rounded-t-xl transition-all border-b-2 ${
                        platformTab === 'shopify'
                          ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                          : 'border-transparent text-slate-700 hover:text-slate-955 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      🛍️ Shopify / Webflow
                    </button>
                  </div>

                  {/* Platform Content */}
                  <div className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                    themeMode === 'dark' ? 'bg-zinc-955 border-zinc-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-900 font-medium'
                  }`}>
                    {platformTab === 'custom' && (
                      <ol className="list-decimal pl-4 space-y-2 leading-relaxed">
                        <li>Скопируйте 1-строчный код виджета с помощью синей кнопки <b>«Скопировать код виджета»</b> выше.</li>
                        <li>Откройте самый главный файл шаблона вашего сайта (например <code>index.html</code>, <code>index.php</code>, <code>header.php</code> или файл разметки в React/Next.js/Bitrix).</li>
                        <li>Найдите в коде тег <code>&lt;/body&gt;</code> в самом низу страницы.</li>
                        <li>Вставьте скопированную строку прямо перед этим тегом <code>&lt;/body&gt;</code> и сохраните файл.</li>
                        <li>Готово! Обновите ваш сайт — стильный чат виджета появится в правом нижнем углу.</li>
                      </ol>
                    )}

                    {platformTab === 'tilda' && (
                      <ol className="list-decimal pl-4 space-y-2 leading-relaxed">
                        <li>Скопируйте код выше.</li>
                        <li>В редакторе Tilda откройте <b>«+ Добавить блок»</b> → раздел <b>«Другое»</b> → добавьте блок <b>T123 «HTML-код»</b>.</li>
                        <li>Нажмите кнопку <b>«Контент»</b> у блока T123, вставьте код и нажмите <b>«Сохранить и закрыть»</b>.</li>
                        <li>Нажмите <b>«Опубликовать все страницы»</b>.</li>
                      </ol>
                    )}

                    {platformTab === 'wordpress' && (
                      <ol className="list-decimal pl-4 space-y-2 leading-relaxed">
                        <li>Зайдите в админ-панель вашего сайта на <b>WordPress</b>.</li>
                        <li>Перейдите в <b>Плагины</b> → <b>Добавить новый</b> и установите плагин <i>«Header and Footer Scripts»</i>.</li>
                        <li>Вставьте скопированный код в поле <b>Scripts in Footer</b> и нажмите <b>Сохранить</b>.</li>
                      </ol>
                    )}

                    {platformTab === 'shopify' && (
                      <ol className="list-decimal pl-4 space-y-2 leading-relaxed">
                        <li>Откройте <b>Online Store</b> → <b>Themes</b> → <b>Edit code</b> → файл <code>theme.liquid</code>.</li>
                        <li>Вставьте скопированный код перед тегом <code>&lt;/body&gt;</code> и нажмите <b>Save</b>.</li>
                      </ol>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: BOT SETTINGS */}
            {activeTab === 'bot_settings' && (
              <div className={`p-6 rounded-2xl border space-y-6 animate-in fade-in duration-200 ${
                themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-300 shadow-2xs text-slate-950'
              }`}>
                <div>
                  <h2 className="font-extrabold text-slate-955 dark:text-white text-base flex items-center gap-2">
                    <Palette className="w-5 h-5 text-blue-500" />
                    Персонализация стиля и личности ИИ-Консультанта
                  </h2>
                  <p className="text-xs text-slate-700 dark:text-slate-400 font-medium mt-1">
                    Настройте визуальный стиль виджета, имя и системный тон общения.
                  </p>
                </div>

                {/* 3 PRESET WIDGET THEME CARDS AS SHOWN IN SCREENSHOT 1 */}
                <div>
                  <label className="block text-xs font-extrabold mb-2 text-slate-955 dark:text-slate-200">
                    Готовые пресеты стиля виджета
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Theme Preset 1: Светлая тема (White) */}
                    <div
                      onClick={() => handleSelectPresetTheme('white')}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 relative ${
                        config.themePreset === 'white'
                          ? 'border-blue-600 bg-white ring-4 ring-blue-500/20 shadow-md'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {config.themePreset === 'white' && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </div>
                      )}
                      <div>
                        <div className="font-extrabold text-xs text-slate-900">Светлая тема (White)</div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-medium">
                          Классическая минималистичная тема для интернет-магазинов и порталов.
                        </p>
                      </div>
                      <div className="w-full bg-white border border-slate-200 rounded-xl p-2.5 space-y-1.5 shadow-2xs">
                        <div className="text-[10px] font-bold text-slate-900 flex items-center gap-1.5">
                          <Bot className="w-3 h-3 text-blue-600" />
                          <span>Support Chat</span>
                        </div>
                        <div className="bg-slate-100 text-[9px] text-slate-600 p-1.5 rounded-md font-medium">
                          Чем я могу вам помочь?
                        </div>
                      </div>
                    </div>

                    {/* Theme Preset 2: Фирменная синяя (Royal Blue) */}
                    <div
                      onClick={() => handleSelectPresetTheme('royal')}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 relative ${
                        config.themePreset === 'royal' || (!config.themePreset && config.primaryColor === '#2563eb')
                          ? 'border-blue-600 bg-white ring-4 ring-blue-500/20 shadow-md'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {(config.themePreset === 'royal' || (!config.themePreset && config.primaryColor === '#2563eb')) && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </div>
                      )}
                      <div>
                        <div className="font-extrabold text-xs text-slate-900">Фирменная синяя (Royal Blue)</div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-medium">
                          Яркий фирменный стиль B2B сервисов, привлекающий внимание пользователей.
                        </p>
                      </div>
                      <div className="w-full bg-blue-600 text-white rounded-xl p-2.5 space-y-1.5 shadow-md">
                        <div className="text-[10px] font-bold flex items-center gap-1.5">
                          <Bot className="w-3 h-3 text-white" />
                          <span>AI Assistant</span>
                        </div>
                        <div className="bg-blue-700 text-[9px] text-white p-1.5 rounded-md font-medium">
                          Задайте мне вопрос 24/7!
                        </div>
                      </div>
                    </div>

                    {/* Theme Preset 3: Темная (Dark Blue) */}
                    <div
                      onClick={() => handleSelectPresetTheme('dark')}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 relative ${
                        config.themePreset === 'dark'
                          ? 'border-blue-600 bg-white ring-4 ring-blue-500/20 shadow-md'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {config.themePreset === 'dark' && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </div>
                      )}
                      <div>
                        <div className="font-extrabold text-xs text-slate-900">Темная (Dark Blue)</div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-medium">
                          Современная темная тема для IT-продуктов, SaaS сервисов и разработчиков.
                        </p>
                      </div>
                      <div className="w-full bg-[#0f172a] text-white rounded-xl p-2.5 space-y-1.5 shadow-md">
                        <div className="text-[10px] font-bold flex items-center gap-1.5">
                          <Bot className="w-3 h-3 text-blue-400" />
                          <span>Night Chat AI</span>
                        </div>
                        <div className="bg-[#1e293b] text-[9px] text-slate-200 p-1.5 rounded-md font-medium border border-slate-700">
                          Готов к решению задач!
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold mb-1 text-slate-955 dark:text-slate-200">Имя бота</label>
                  <input
                    id="dash-bot-name-input"
                    type="text"
                    value={config.botName}
                    onChange={(e) => handleConfigChange('botName', e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold ${
                      themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold mb-1 text-slate-955 dark:text-slate-200">Приветственное сообщение</label>
                  <textarea
                    id="dash-welcome-msg-input"
                    rows={3}
                    value={config.welcomeMessage}
                    onChange={(e) => handleConfigChange('welcomeMessage', e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-medium ${
                      themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold mb-2 text-slate-955 dark:text-slate-200">Системный тон общения</label>
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
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                            : themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-900 font-bold'
                        }`}
                      >
                        <div className="font-extrabold text-xs">{tone.label}</div>
                        <div className="text-[10px] opacity-90 mt-0.5 font-medium">{tone.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: KNOWLEDGE BASE */}
            {activeTab === 'knowledge' && (
              <div className={`p-6 rounded-2xl border space-y-6 animate-in fade-in duration-200 ${
                themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-300 shadow-2xs text-slate-955'
              }`}>
                <div>
                  <h2 className="font-extrabold text-slate-955 dark:text-white text-base flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    База Знаний (Knowledge Base)
                  </h2>
                  <p className="text-xs text-slate-700 dark:text-slate-400 font-medium mt-1">
                    Введите данные для обучения ИИ клиентской поддержке.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-extrabold mb-1 text-slate-955 dark:text-slate-200">Регламенты и условия магазина (Textarea)</label>
                  <textarea
                    id="dash-knowledge-textarea"
                    rows={5}
                    value={config.knowledgeText}
                    onChange={(e) => handleConfigChange('knowledgeText', e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold leading-relaxed ${
                      themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 shadow-2xs'
                    }`}
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-955 dark:text-slate-200">Частые пары Вопрос-Ответ (FAQ)</h3>

                  <form onSubmit={handleAddFAQ} className={`p-4 rounded-xl border space-y-3 ${
                    themeMode === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50 border-slate-300'
                  }`}>
                    <input
                      id="dash-faq-question-input"
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Вопрос..."
                      className={`w-full border rounded-lg px-3 py-2 text-xs font-bold ${
                        themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                      }`}
                    />
                    <textarea
                      id="dash-faq-answer-input"
                      rows={2}
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder="Ответ ИИ..."
                      className={`w-full border rounded-lg px-3 py-2 text-xs font-medium ${
                        themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                      }`}
                    />
                    <button
                      id="dash-add-faq-btn"
                      type="submit"
                      disabled={!newQuestion.trim() || !newAnswer.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Добавить пара FAQ</span>
                    </button>
                  </form>

                  <div className="space-y-3">
                    {config.faqItems?.map((item) => (
                      <div key={item.id} className={`p-4 rounded-xl border space-y-1.5 relative ${
                        themeMode === 'dark' ? 'bg-zinc-900/80 border-zinc-800 text-slate-100' : 'bg-white border-slate-300 text-slate-955 shadow-xs'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="font-extrabold text-xs flex items-center gap-1.5 text-slate-955 dark:text-white">
                            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>{item.question}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteFAQ(item.id)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-300 pl-5 leading-relaxed font-medium">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: OPERATOR ROUTING (4 INDEPENDENT CHANNELS) */}
            {activeTab === 'operator' && (
              <div className={`p-6 rounded-2xl border space-y-6 animate-in fade-in duration-200 ${
                themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-300 shadow-2xs text-slate-955'
              }`}>
                <div>
                  <h2 className="font-extrabold text-slate-955 dark:text-white text-base flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-blue-500" />
                    Маршрутизация перевода на живого оператора
                  </h2>
                  <p className="text-xs text-slate-700 dark:text-slate-400 font-medium mt-1">
                    Заполните независимые контакты. В виджете они будут показаны как текстовые реквизиты с кнопкой быстрого копирования.
                  </p>
                </div>

                {/* Sub tabs for 4 independent channels */}
                <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-2 overflow-x-auto pb-1 text-xs font-extrabold">
                  <button
                    onClick={() => setOpSubTab('telegram')}
                    className={`px-4 py-2 rounded-t-xl transition-all border-b-2 ${
                      opSubTab === 'telegram' ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' : 'border-transparent text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    💬 Telegram
                  </button>
                  <button
                    onClick={() => setOpSubTab('whatsapp')}
                    className={`px-4 py-2 rounded-t-xl transition-all border-b-2 ${
                      opSubTab === 'whatsapp' ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'border-transparent text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    💚 WhatsApp
                  </button>
                  <button
                    onClick={() => setOpSubTab('email')}
                    className={`px-4 py-2 rounded-t-xl transition-all border-b-2 ${
                      opSubTab === 'email' ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10' : 'border-transparent text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    ✉️ Support Email
                  </button>
                  <button
                    onClick={() => setOpSubTab('custom')}
                    className={`px-4 py-2 rounded-t-xl transition-all border-b-2 ${
                      opSubTab === 'custom' ? 'border-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' : 'border-transparent text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    🌐 Другой способ / Ссылка
                  </button>
                </div>

                <div className="space-y-4">
                  {opSubTab === 'telegram' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-slate-955 dark:text-slate-300">Telegram Юзернейм или Бот поддержки:</label>
                      <input
                        type="text"
                        value={opTelegram}
                        onChange={(e) => handleOperatorChange('telegram', e.target.value)}
                        placeholder="@support_store_bot"
                        className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold ${
                          themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Отобразится в виджете как `@support_store_bot` с кнопкой копирования</p>
                    </div>
                  )}

                  {opSubTab === 'whatsapp' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-slate-955 dark:text-slate-300">WhatsApp Телефон поддержки:</label>
                      <input
                        type="text"
                        value={opWhatsapp}
                        onChange={(e) => handleOperatorChange('whatsapp', e.target.value)}
                        placeholder="+7 (900) 123-45-67"
                        className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold ${
                          themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Отобразится как телефонный номер с кнопкой копирования</p>
                    </div>
                  )}

                  {opSubTab === 'email' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-slate-955 dark:text-slate-300">Support Email адрес:</label>
                      <input
                        type="email"
                        value={opEmail}
                        onChange={(e) => handleOperatorChange('email', e.target.value)}
                        placeholder="support@store.ru"
                        className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold ${
                          themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Отобразится как почтовый адрес с кнопкой копирования</p>
                    </div>
                  )}

                  {opSubTab === 'custom' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-slate-955 dark:text-slate-300">Своя ссылка или страница контактов:</label>
                      <input
                        type="text"
                        value={opCustom}
                        onChange={(e) => handleOperatorChange('custom', e.target.value)}
                        placeholder="https://store.ru/support"
                        className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold ${
                          themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Любой URL страницы справки</p>
                    </div>
                  )}

                  <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-300 dark:border-blue-800/50 text-xs text-blue-955 dark:text-blue-200 font-medium">
                    <span className="font-extrabold">Все заведенные контакты подтянутся в виджет!</span> При запросе оператора виджет покажет реквизиты и кнопки скопировать/перейти.
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className={`p-6 rounded-2xl border space-y-6 animate-in fade-in duration-200 ${
                themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-300 shadow-2xs text-slate-955'
              }`}>
                <div>
                  <h2 className="font-extrabold text-slate-955 dark:text-white text-base flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Аналитика и детальные метрики
                  </h2>
                  <p className="text-xs text-slate-700 dark:text-slate-400 font-medium mt-1">
                    Отслеживайте нагрузку, скорость отклика и удовлетворенность клиентов.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-300 dark:border-zinc-700 space-y-1">
                    <div className="text-xs text-slate-700 dark:text-slate-400 font-extrabold">Конверсия ответов</div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">92.4%</div>
                    <div className="text-[10px] text-slate-700 dark:text-slate-400 font-medium">Клиенты получили нужный ответ</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-300 dark:border-zinc-700 space-y-1">
                    <div className="text-xs text-slate-700 dark:text-slate-400 font-extrabold">Перевод на оператора</div>
                    <div className="text-2xl font-black text-amber-500">7.6%</div>
                    <div className="text-[10px] text-slate-700 dark:text-slate-400 font-medium">Меньше 8% требуют человека</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BILLING & TARIFFS */}
            {activeTab === 'billing' && (
              <div className={`p-6 rounded-2xl border space-y-6 animate-in fade-in duration-200 ${
                themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-300 shadow-2xs text-slate-955'
              }`}>
                <div>
                  <h2 className="font-extrabold text-slate-955 dark:text-white text-base flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-500" />
                    Управление подпиской и тарифом
                  </h2>
                  <p className="text-xs text-slate-700 dark:text-slate-400 font-medium mt-1">
                    Дневные лимиты обновляются каждый день в 00:00 по Московскому времени.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-300 dark:border-zinc-700">
                    <div className="font-extrabold text-slate-955 dark:text-white text-sm">Starter Free</div>
                    <div className="text-xl font-black text-slate-955 dark:text-white my-2">0 ₽</div>
                    <p className="text-[10px] text-slate-700 dark:text-slate-400 font-medium">30 ответов в месяц</p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-600/50">
                    <div className="font-extrabold text-slate-955 dark:text-white text-sm flex items-center gap-1">
                      <span>Pro Plan</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="text-xl font-black text-slate-955 dark:text-white my-2">1 890 ₽ <span className="text-[10px] font-normal text-slate-600">/ $19</span></div>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold">2 000 ответов в день (00:00 МСК)</p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-600/50">
                    <div className="font-extrabold text-slate-955 dark:text-white text-sm flex items-center gap-1">
                      <span>Max Plan</span>
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="text-xl font-black text-slate-955 dark:text-white my-2">2 990 ₽ <span className="text-[10px] font-normal text-slate-600">/ $39.99</span></div>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-extrabold">6 000 ответов в день (00:00 МСК)</p>
                  </div>
                </div>

                <Link
                  href="/pricing"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  Перейти к выбору тарифа и оплате
                </Link>
              </div>
            )}

            {/* TAB: AI SECURITY */}
            {activeTab === 'security' && (
              <div className={`p-6 rounded-2xl border space-y-6 animate-in fade-in duration-200 ${
                themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-300 shadow-2xs text-slate-955'
              }`}>
                <div>
                  <h2 className="font-extrabold text-slate-955 dark:text-white text-base flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-500" />
                    Безопасность ИИ и Защита Данных
                  </h2>
                  <p className="text-xs text-slate-700 dark:text-slate-400 font-medium mt-1">
                    Система фильтрации Prompt Injection активна на уровне API.
                  </p>
                </div>

                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-300 space-y-2 font-medium">
                  <div className="font-extrabold flex items-center gap-2 text-emerald-955 dark:text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
            <div className={`sticky top-4 rounded-2xl p-5 border flex flex-col items-center justify-center ${
              themeMode === 'dark' ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-200/80 border-slate-300'
            }`}>
              
              <div className="w-full flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  Интерактивный Виджет
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-extrabold font-mono">
                  {activeProject?.botId}
                </span>
              </div>

              {/* Live Preview Card */}
              <div className={`w-full max-w-sm rounded-2xl shadow-2xl border flex flex-col overflow-hidden h-[440px] ${
                config.themePreset === 'dark'
                  ? 'bg-[#090d16] border-slate-800 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}>
                
                {/* Dynamic Header */}
                <div
                  style={{
                    backgroundColor: config.themePreset === 'white' ? '#ffffff' : config.themePreset === 'dark' ? '#0f172a' : config.primaryColor,
                    color: config.themePreset === 'white' ? '#0f172a' : '#ffffff',
                    borderBottom: config.themePreset === 'white' ? '1px solid #e2e8f0' : 'none'
                  }}
                  className="p-4 flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600/20 flex items-center justify-center font-bold text-sm">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm leading-tight">{config.botName || 'Ассистент поддержки'}</h4>
                      <p className="text-[10px] opacity-80 font-medium">Онлайн • Тон: {config.toneOfVoice}</p>
                    </div>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className={`flex-1 p-3.5 space-y-3 overflow-y-auto text-xs ${
                  config.themePreset === 'dark' ? 'bg-[#090d16]' : 'bg-slate-50'
                }`}>
                  {testMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        style={{
                          backgroundColor: msg.sender === 'user' ? (config.themePreset === 'white' ? '#0f172a' : config.primaryColor) : (config.themePreset === 'dark' ? '#1e293b' : '#ffffff'),
                          color: msg.sender === 'user' ? '#ffffff' : (config.themePreset === 'dark' ? '#f8fafc' : '#0f172a')
                        }}
                        className={`max-w-[85%] p-3 rounded-2xl leading-relaxed shadow-2xs font-medium ${
                          msg.sender === 'user'
                            ? 'rounded-br-none'
                            : 'border border-slate-200 dark:border-slate-700 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {testLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-300 p-2.5 rounded-2xl rounded-bl-none text-slate-700 flex items-center gap-2 text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                        <span>Генерирую ответ...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Form */}
                <form onSubmit={handleSendTestMessage} className={`p-3 border-t flex items-center gap-2 ${
                  config.themePreset === 'dark' ? 'bg-[#090d16] border-slate-800' : 'bg-white border-slate-300'
                }`}>
                  <input
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Протестируйте ответ..."
                    className={`flex-1 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                      config.themePreset === 'dark' ? 'bg-[#1e293b] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={testLoading || !testInput.trim()}
                    style={{ backgroundColor: config.themePreset === 'white' ? '#0f172a' : config.primaryColor }}
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
          <div className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 w-full max-w-md rounded-2xl p-6 relative space-y-4 text-slate-950 dark:text-white">
            <button
              onClick={() => setIsAddProjectModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">Создание нового проекта</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Каждый проект получает уникальный Bot ID и отдельный код</p>
              </div>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-slate-955 dark:text-slate-300 mb-1">Название проекта / сайта</label>
                <input
                  type="text"
                  required
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="Магазин Ключей #2"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-955 dark:text-slate-300 mb-1">Сфера деятельности / Тематика</label>
                <input
                  type="text"
                  value={newProjCategory}
                  onChange={(e) => setNewProjCategory(e.target.value)}
                  placeholder="Цифровые товары / Ритейл / Одежда"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-955 dark:text-slate-300 mb-1">Краткое описание проекта</label>
                <textarea
                  rows={2}
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Опишите, чем занимается ваш сайт..."
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 font-extrabold text-xs rounded-xl shadow-md text-white"
                >
                  Создать проект
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddProjectModalOpen(false)}
                  className="px-4 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED SETTINGS MODAL */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 w-full max-w-lg rounded-2xl p-6 relative space-y-5 text-slate-955 dark:text-white">
            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">Глобальные настройки системы</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Управление языком, параметрами аккаунта и лимитами</p>
              </div>
            </div>

            {/* Language Switcher Section */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-300 dark:border-zinc-700/80 space-y-3">
              <label className="block text-xs font-extrabold text-slate-955 dark:text-slate-200">Выбор языка интерфейса (Language):</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleLanguage('ru')}
                  className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                    lang === 'ru'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-slate-300'
                  }`}
                >
                  <span>🇷🇺 Русский (RU)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleLanguage('en')}
                  className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    lang === 'en'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-slate-300'
                  }`}
                >
                  <span>🇬🇧 English (EN)</span>
                </button>
              </div>
            </div>

            {/* Plan Info & Daily Limit 00:00 MSK */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-300 dark:border-zinc-700/80 text-xs space-y-2">
              <div className="flex justify-between font-extrabold">
                <span className="text-slate-800 dark:text-slate-300">Текущий активный план:</span>
                <span className="text-blue-600 dark:text-blue-400 font-extrabold">{sub.plan} Plan</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-400 font-medium">
                <span>Правило дневных лимитов:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Сброс каждый день в 00:00 по МСК</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-400 font-medium">
                <span>Использовано сегодня:</span>
                <span className="text-slate-955 dark:text-white font-extrabold">{sub.dailyUsageCount || 0} / {sub.plan === 'Pro' ? 2000 : sub.plan === 'Max' ? 6000 : 30} сообщений</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href="/pricing"
                onClick={() => setIsSettingsModalOpen(false)}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl text-center shadow-xs"
              >
                Изменить или обновить план
              </Link>

              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-5 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700"
              >
                Закрыть
              </button>
            </div>

          </div>
        </div>
      )}

      {/* USER PROFILE MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 w-full max-w-md rounded-2xl p-6 relative space-y-4 text-slate-955 dark:text-white">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white font-bold text-base flex items-center justify-center">
                МЕ
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-955 dark:text-white">{userName}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{userEmail}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-slate-300 dark:border-zinc-700/80 text-xs space-y-2">
              <div className="flex justify-between font-extrabold">
                <span className="text-slate-800 dark:text-slate-300">Текущий тариф:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{sub.plan} Plan</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-400 font-medium">
                <span>Дневной лимит (00:00 МСК):</span>
                <span className="text-slate-955 dark:text-white font-extrabold">{sub.plan === 'Pro' ? '2 000' : sub.plan === 'Max' ? '6 000' : '30'} сообщений</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-400 font-medium">
                <span>Всего проектов:</span>
                <span className="text-slate-955 dark:text-white font-extrabold">{projects.length}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-400 font-medium">
                <span>Язык системы:</span>
                <span className="text-slate-955 dark:text-white uppercase font-extrabold">{lang}</span>
              </div>
            </div>

            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
