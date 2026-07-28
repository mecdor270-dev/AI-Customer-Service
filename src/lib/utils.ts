export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function generateEmbedScript(botId: string = 'demo-bot-123'): string {
  return `<script src="http://localhost:3000/widget.js" data-bot-id="${botId}" defer></script>`;
}
