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
  FolderPlus
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
  const [activeTab, setActiveTab] = useState<'bot_settings' | 'knowledge' | 'operator' | 'embed' | 'billing' | 'overview'>('bot_settings');
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
    maxFreeLimit: 30,
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
    showToast(nextLang === 'ru' ? 'Язык изменен на Русский' : 'Language changed to English');
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
    <div className={`min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white ${
      themeMode === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className={`px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 border-b ${
        themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>На главную</span>
          </Link>
          <div className="h-5 w-px bg-slate-800"></div>
          <h1 className="sr-only">Панель управления ИИ-Бота</h1>
          
          {/* Active Project Dropdown & Multi-Project Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 hidden sm:inline">{t.selectProject}:</span>
            <select
              value={activeProject?.id || ''}
              onChange={(e) => handleSelectProject(e.target.value)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none ${
                themeMode === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.botId})
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsAddProjectModalOpen(true)}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.addProject}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/billing"
            className="px-3.5 py-1.5 bg-blue-600/10 text-blue-500 border border-blue-500/30 hover:bg-blue-600/20 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <CreditCard className="w-4 h-4 text-blue-500" />
            <span>{sub.isPremium ? 'Pro Business' : 'Free (Starter)'}</span>
          </Link>

          <button
            onClick={() => setActiveTab('embed')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Code2 className="w-4 h-4" />
            <span>Код виджета</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6 relative">
        
        {/* Left Sidebar (ChatGPT Style Dark Card with Bottom Profile) */}
        <aside className={`w-64 rounded-2xl border p-3 flex flex-col justify-between shrink-0 hidden md:flex ${
          themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {activeProject?.name || 'Разделы'}
            </div>
            
            <button
              onClick={() => setActiveTab('bot_settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'bot_settings'
                  ? 'bg-blue-600 text-white shadow-md'
                  : themeMode === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>{t.botSettingsTab}</span>
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'knowledge'
                  ? 'bg-blue-600 text-white shadow-md'
                  : themeMode === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{t.knowledgeTab}</span>
            </button>

            <button
              onClick={() => setActiveTab('operator')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'operator'
                  ? 'bg-blue-600 text-white shadow-md'
                  : themeMode === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>{t.operatorTab}</span>
            </button>

            <button
              onClick={() => setActiveTab('embed')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'embed'
                  ? 'bg-blue-600 text-white shadow-md'
                  : themeMode === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>{t.embedTab}</span>
            </button>

            <Link
              href="/dashboard/billing"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                themeMode === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>{t.billingTab}</span>
            </Link>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : themeMode === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t.statsTab}</span>
            </button>
          </div>

          {/* CHATGPT-STYLE BOTTOM-LEFT USER PROFILE CARD (MATCHING USER SCREENSHOT EXACTLY) */}
          <div className="relative pt-3 border-t border-slate-800/60">
            
            {/* User Profile Card Button */}
            <div
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between cursor-pointer transition-all shadow-md group"
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
                    {sub.isPremium ? 'Pro Access' : 'Free'}
                  </span>
                </div>
              </div>

              {!sub.isPremium && (
                <Link
                  href="/dashboard/billing"
                  onClick={(e) => e.stopPropagation()}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 text-white text-[11px] font-bold rounded-xl transition-all border border-slate-700 hover:border-blue-500 shrink-0"
                >
                  {t.upgradeBtn}
                </Link>
              )}
            </div>

            {/* CHATGPT-STYLE POPUP MENU (EXACT MATCH TO USER ATTACHED SCREENSHOT) */}
            {isProfileMenuOpen && (
              <div className="absolute bottom-16 left-0 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 text-slate-200 text-xs font-medium space-y-1">
                
                {/* Menu Header User */}
                <div className="px-3 py-2.5 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                      МЕ
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{userName}</div>
                      <div className="text-[10px] text-slate-400">{sub.isPremium ? 'Pro Business' : 'Free'}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>

                {/* Menu Item 1: Изменить план */}
                <Link
                  href="/dashboard/billing"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{t.changePlan}</span>
                </Link>

                {/* Menu Item 2: Персонализация (Theme Toggle) */}
                <button
                  onClick={handleToggleTheme}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors text-left"
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
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors text-left"
                >
                  <UserIcon className="w-4 h-4 text-blue-400" />
                  <span>{t.profile}</span>
                </button>

                {/* Menu Item 4: Настройки (Language Toggle) */}
                <button
                  onClick={handleToggleLanguage}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>{t.settings} ({lang.toUpperCase()})</span>
                </button>

                <div className="border-t border-slate-800 my-1"></div>

                {/* Menu Item 5: Справка */}
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setActiveTab('embed');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
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

        {/* Dynamic Main Workspace (7 cols) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-7 space-y-6">
            
            {/* TAB 1: BOT SETTINGS */}
            {activeTab === 'bot_settings' && (
              <div className={`rounded-2xl border p-6 space-y-6 ${
                themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div>
                  <h2 className="font-bold text-base flex items-center gap-2">
                    <Palette className="w-5 h-5 text-blue-500" />
                    {t.botSettingsTab}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Проект: <span className="font-bold text-blue-400">{activeProject?.name}</span> (ID: <span className="font-mono">{activeProject?.botId}</span>)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Имя бота</label>
                  <input
                    id="dash-bot-name-input"
                    type="text"
                    value={config.botName}
                    onChange={(e) => handleConfigChange('botName', e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-semibold ${
                      themeMode === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Приветственное сообщение</label>
                  <textarea
                    id="dash-welcome-msg-input"
                    rows={3}
                    value={config.welcomeMessage}
                    onChange={(e) => handleConfigChange('welcomeMessage', e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs ${
                      themeMode === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2">Системный тон общения ИИ</label>
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
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                            : themeMode === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs">{tone.label}</div>
                        <div className="text-[10px] opacity-80 mt-0.5">{tone.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2">Цвет кнопки виджета</label>
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

            {/* TAB 2: KNOWLEDGE BASE */}
            {activeTab === 'knowledge' && (
              <div className={`rounded-2xl border p-6 space-y-6 ${
                themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div>
                  <h2 className="font-bold text-base flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    {t.knowledgeTab}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    База знаний проекта <span className="font-bold text-blue-400">{activeProject?.name}</span> (ID: <span className="font-mono">{activeProject?.botId}</span>).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Регламенты и информация магазина</label>
                  <textarea
                    id="dash-knowledge-textarea"
                    rows={5}
                    value={config.knowledgeText}
                    onChange={(e) => handleConfigChange('knowledgeText', e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-mono leading-relaxed ${
                      themeMode === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider">Частые пары Вопрос-Ответ (FAQ)</h3>

                  <form onSubmit={handleAddFAQ} className={`p-4 rounded-xl border space-y-3 ${
                    themeMode === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <input
                      id="dash-faq-question-input"
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Вопрос..."
                      className={`w-full border rounded-lg px-3 py-2 text-xs ${
                        themeMode === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                    <textarea
                      id="dash-faq-answer-input"
                      rows={2}
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder="Ответ ИИ..."
                      className={`w-full border rounded-lg px-3 py-2 text-xs ${
                        themeMode === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
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
                      <div key={item.id} className={`p-3.5 rounded-xl border space-y-1 relative ${
                        themeMode === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="font-bold text-xs flex items-center gap-1.5">
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

            {/* TAB 3: OPERATOR ESCALATION ROUTING */}
            {activeTab === 'operator' && (
              <div className={`rounded-2xl border p-6 space-y-6 ${
                themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div>
                  <h2 className="font-bold text-base flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-blue-500" />
                    {t.operatorTitle}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">{t.operatorDesc}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-2">Канал связи для перевода:</label>
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
                              : themeMode === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="font-bold text-xs">{item.label}</div>
                          <div className="text-[10px] opacity-80 mt-0.5">{item.desc}</div>
                        </button>
                      ))}
                    </div>
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
                      className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-mono ${
                        themeMode === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-xs space-y-1">
                    <div className="font-bold text-blue-400">💡 Как это работает в виджете:</div>
                    <p className="text-slate-300 leading-relaxed">
                      При клике клиента на кнопку <b>"Вызвать оператора"</b> виджет перенаправит его на указанный Telegram / WhatsApp аккаунт.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: EMBED SCRIPT */}
            {activeTab === 'embed' && (
              <div className={`rounded-2xl border p-6 space-y-6 ${
                themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div>
                  <h2 className="font-bold text-base flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-blue-500" />
                    Встраиваемый код виджета
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Уникальный код для проекта <span className="font-bold text-blue-400">{activeProject?.name}</span> (Bot ID: <span className="font-mono text-emerald-400 font-bold">{activeProject?.botId}</span>):
                  </p>
                </div>

                <div className="relative">
                  <pre className="bg-slate-950 text-emerald-400 p-5 rounded-2xl text-xs font-mono border border-slate-800 overflow-x-auto leading-relaxed shadow-lg">
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

            {/* TAB 5: STATS */}
            {activeTab === 'overview' && (
              <div className={`rounded-2xl border p-6 space-y-6 ${
                themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <h2 className="font-bold text-base">Статистика проекта {activeProject?.name}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className="text-xs text-slate-400 font-semibold mb-1">Обработано вопросов</div>
                    <div className="text-2xl font-black text-white">1,482</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className="text-xs text-slate-400 font-semibold mb-1">Автоматизация ИИ</div>
                    <div className="text-2xl font-black text-emerald-400">84.2%</div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Preview Column (5 cols) */}
          <div className="lg:col-span-5">
            <div className={`sticky top-20 rounded-2xl p-5 border flex flex-col items-center justify-center ${
              themeMode === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-200/60 border-slate-300'
            }`}>
              
              <div className="w-full flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  Интерактивное Превью
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  {activeProject?.botId}
                </span>
              </div>

              {/* Responsive Live Widget Card */}
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
                    placeholder="Задайте вопрос превью..."
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
      </div>

      {/* CREATE NEW PROJECT SURVEY MODAL */}
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 relative space-y-4 text-white">
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
                <p className="text-xs text-slate-400">Каждый проект получает уникальный Bot ID и отдельный скрипт</p>
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Сфера деятельности / Тематика</label>
                <input
                  type="text"
                  value={newProjCategory}
                  onChange={(e) => setNewProjCategory(e.target.value)}
                  placeholder="Цифровые товары / Ритейл / Одежда"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Краткое описание проекта</label>
                <textarea
                  rows={2}
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Опишите, чем занимается ваш сайт..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500"
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
                  className="px-4 py-3 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-700"
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
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 relative space-y-4 text-white">
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

            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 text-xs space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Текущий тариф:</span>
                <span className="text-emerald-400">{sub.isPremium ? 'Pro Business' : 'Free (Starter)'}</span>
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
