import { WidgetConfig } from '@/types';
import { getCurrentUserEmail } from './auth';

export interface OperatorRouting {
  type: 'telegram' | 'whatsapp' | 'email' | 'webhook';
  destination: string; // e.g. "@my_support_bot" or "+79001234567"
  enabled: boolean;
}

export interface Project {
  id: string;
  name: string;
  category: string;
  description: string;
  botId: string;
  createdAt: string;
  config: WidgetConfig;
  operatorRouting: OperatorRouting;
}

export function getProjectsStorageKey(targetEmail?: string): string {
  const email = targetEmail || getCurrentUserEmail();
  const safeEmail = email.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return `ai_user_projects_${safeEmail}`;
}

export function getActiveProjectStorageKey(targetEmail?: string): string {
  const email = targetEmail || getCurrentUserEmail();
  const safeEmail = email.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return `ai_user_active_project_${safeEmail}`;
}

export function createDefaultUserProjects(email: string): Project[] {
  const safeTag = email.split('@')[0].replace(/[^a-z0-9]/gi, '');
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  
  return [
    {
      id: `proj_${Date.now()}_1`,
      name: `Проект Поддержки (${safeTag})`,
      category: 'Цифровой Магазин',
      description: 'Основной бот для консультирования клиентов и ответов на FAQ',
      botId: `bot_shop_${safeTag || 'main'}_${randomSuffix}`,
      createdAt: new Date().toISOString(),
      operatorRouting: {
        type: 'telegram',
        destination: '@support_store_bot',
        enabled: true,
      },
      config: {
        botName: 'Ассистент поддержки',
        welcomeMessage: 'Здравствуйте! Чем я могу помочь вам в нашем цифровом магазине?',
        primaryColor: '#2563eb',
        toneOfVoice: 'friendly',
        knowledgeText: 'График работы с 10:00 до 22:00. Инструкция по активации цифровых ключей: зайти в личный кабинет, ввести код. Возврат только при наличии видеозаписи.',
        faqItems: [
          {
            id: 'faq-1',
            question: 'Какой у вас график работы?',
            answer: 'Наш магазин работает ежедневно с 10:00 до 22:00.'
          },
          {
            id: 'faq-2',
            question: 'Как активировать цифровой ключ?',
            answer: 'Инструкция по активации цифровых ключей: зайдите в личный кабинет на нашем сайте и введите полученный код.'
          }
        ],
      }
    }
  ];
}

export function getProjects(targetEmail?: string): Project[] {
  const email = targetEmail || getCurrentUserEmail();
  if (typeof window === 'undefined') return createDefaultUserProjects(email);

  const key = getProjectsStorageKey(email);
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed: Project[] = JSON.parse(saved);
      if (parsed && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading projects list:', e);
  }

  // Create isolated default project list for new user
  const initialProjects = createDefaultUserProjects(email);
  saveProjects(initialProjects, email);
  return initialProjects;
}

export function saveProjects(projects: Project[], targetEmail?: string): void {
  if (typeof window === 'undefined') return;
  const email = targetEmail || getCurrentUserEmail();
  const key = getProjectsStorageKey(email);

  try {
    localStorage.setItem(key, JSON.stringify(projects));
    
    // Also save per-bot configs in localStorage for fast local lookup
    projects.forEach(p => {
      if (p.botId) {
        localStorage.setItem(`ai_bot_config_${p.botId}`, JSON.stringify(p.config));
        localStorage.setItem(`ai_bot_project_${p.botId}`, JSON.stringify(p));
      }
    });

    // Also update global fallback for preview compatibility
    if (projects.length > 0) {
      localStorage.setItem('ai_widget_config', JSON.stringify(projects[0].config));
    }
  } catch (e) {
    console.error('Error saving projects list:', e);
  }
}

export function getActiveProjectId(targetEmail?: string): string {
  const email = targetEmail || getCurrentUserEmail();
  const projects = getProjects(email);
  if (typeof window === 'undefined') return projects[0]?.id || 'proj_default_1';

  const key = getActiveProjectStorageKey(email);
  try {
    const active = localStorage.getItem(key);
    if (active && projects.some(p => p.id === active)) {
      return active;
    }
  } catch (e) {
    console.warn('Error reading active project ID:', e);
  }

  const defaultId = projects[0]?.id || 'proj_default_1';
  setActiveProjectId(defaultId, email);
  return defaultId;
}

export function setActiveProjectId(id: string, targetEmail?: string): void {
  if (typeof window === 'undefined') return;
  const email = targetEmail || getCurrentUserEmail();
  const key = getActiveProjectStorageKey(email);

  try {
    localStorage.setItem(key, id);
  } catch (e) {
    console.error('Error setting active project ID:', e);
  }
}

export function createNewProject(name: string, category: string, description: string, targetEmail?: string): Project {
  const email = targetEmail || getCurrentUserEmail();
  const projects = getProjects(email);
  const randomId = Math.floor(100000 + Math.random() * 900000);
  const safeTag = email.split('@')[0].replace(/[^a-z0-9]/gi, '');
  
  const newProject: Project = {
    id: `proj_${Date.now()}`,
    name: name.trim() || `Проект ${projects.length + 1}`,
    category: category.trim() || 'Электронная коммерция',
    description: description.trim() || 'Проект поддержки клиентов',
    botId: `bot_proj_${safeTag}_${randomId}`,
    createdAt: new Date().toISOString(),
    operatorRouting: {
      type: 'telegram',
      destination: '@operator_help',
      enabled: true,
    },
    config: {
      botName: `Ассистент ${name.trim()}`,
      welcomeMessage: `Здравствуйте! Чем я могу помочь вам в проекте "${name.trim()}"?`,
      primaryColor: '#2563eb',
      toneOfVoice: 'friendly',
      knowledgeText: `График работы проекта "${name.trim()}": 24/7. Ответы по часто задаваемым вопросам.`,
      faqItems: [],
    }
  };

  const updated = [...projects, newProject];
  saveProjects(updated, email);
  setActiveProjectId(newProject.id, email);

  return newProject;
}
