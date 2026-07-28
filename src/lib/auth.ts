export interface UserAccount {
  id: string;
  email: string;
  companyName: string;
  botId: string;
  createdAt: string;
}

const STORAGE_ACCOUNT_KEY = 'ai_user_account_profile';

export function getOrCreateAccount(email?: string, companyName?: string): UserAccount {
  if (typeof window === 'undefined') {
    return {
      id: 'usr_demo_1',
      email: 'demo@store.ru',
      companyName: 'Мой интернет-магазин',
      botId: 'bot_shop_9823a',
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const existing = localStorage.getItem(STORAGE_ACCOUNT_KEY);
    if (existing) {
      const parsed: UserAccount = JSON.parse(existing);
      if (email && parsed.email !== email) {
        parsed.email = email;
        if (companyName) parsed.companyName = companyName;
        localStorage.setItem(STORAGE_ACCOUNT_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Error reading account profile:', e);
  }

  // Generate new unique account with a unique botId
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const newAccount: UserAccount = {
    id: `usr_${Date.now()}`,
    email: email || 'user@company.ru',
    companyName: companyName || 'Мой интернет-магазин',
    botId: `bot_shop_${randomSuffix}`,
    createdAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_ACCOUNT_KEY, JSON.stringify(newAccount));
  } catch (e) {
    console.error('Error saving account profile:', e);
  }

  return newAccount;
}
