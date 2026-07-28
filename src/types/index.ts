export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface WidgetConfig {
  botName: string;
  welcomeMessage: string;
  primaryColor: string;
  toneOfVoice: 'polite' | 'formal' | 'friendly';
  knowledgeText: string;
  faqItems: FAQItem[];
  apiKey?: string;
  botAvatar?: string;
}

export interface AnalyticsStat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  description: string;
}
