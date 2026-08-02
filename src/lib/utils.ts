export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'https://ai-customer-service-dun.vercel.app';
}

export function generateEmbedScript(botId: string = 'demo-bot-123'): string {
  const baseUrl = getAppBaseUrl();
  return `<script src="${baseUrl}/widget.js" data-bot-id="${botId}" defer></script>`;
}
