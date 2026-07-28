import { WidgetConfig } from '@/types';

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

const STORAGE_PROJECTS_KEY = 'ai_user_projects_list';
const STORAGE_ACTIVE_PROJECT_KEY = 'ai_user_active_project_id';

const defaultProjects: Project[] = [
  {
    id: 'proj_default_1',
    name: 'Основной Магазин Ключей',
    category: 'Цифровые товары',
    description: 'Магазин цифровых ключей, лицензий и подписок',
    botId: 'bot_proj_98231a',
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

export function getProjects(): Project[] {
  if (typeof window === 'undefined') return defaultProjects;
  try {
    const saved = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (saved) {
      const parsed: Project[] = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading projects list:', e);
  }
  return defaultProjects;
}

export function saveProjects(projects: Project[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Error saving projects list:', e);
  }
}

export function getActiveProjectId(): string {
  if (typeof window === 'undefined') return defaultProjects[0].id;
  try {
    const active = localStorage.getItem(STORAGE_ACTIVE_PROJECT_KEY);
    if (active) return active;
  } catch (e) {
    console.warn('Error reading active project ID:', e);
  }
  return defaultProjects[0].id;
}

export function setActiveProjectId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_ACTIVE_PROJECT_KEY, id);
  } catch (e) {
    console.error('Error setting active project ID:', e);
  }
}

export function createNewProject(name: string, category: string, description: string): Project {
  const projects = getProjects();
  const randomId = Math.floor(100000 + Math.random() * 900000);
  
  const newProject: Project = {
    id: `proj_${Date.now()}`,
    name: name.trim() || `Проект ${projects.length + 1}`,
    category: category.trim() || 'Электронная коммерция',
    description: description.trim() || 'Проект поддержки клиентов',
    botId: `bot_proj_${randomId}`,
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
  saveProjects(updated);
  setActiveProjectId(newProject.id);

  return newProject;
}
