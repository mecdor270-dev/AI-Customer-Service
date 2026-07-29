export interface UserAccount {
  id: string;
  email: string;
  companyName: string;
  botId: string;
  createdAt: string;
}

export function getCurrentUserEmail(): string {
  if (typeof window === 'undefined') return 'demo@store.ru';
  try {
    return localStorage.getItem('ai_user_email') || 'demo@store.ru';
  } catch (e) {
    return 'demo@store.ru';
  }
}

export function setCurrentUserEmail(email: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('ai_user_email', email);
    localStorage.setItem('ai_user_logged_in', 'true');
  } catch (e) {
    console.error('Error setting current user email:', e);
  }
}

export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('ai_user_logged_in');
    localStorage.removeItem('ai_user_email');
    localStorage.removeItem('ai_user_active_project_id');
  } catch (e) {
    console.error('Error logging out user:', e);
  }
}

export function getAccountStorageKey(targetEmail?: string): string {
  const email = targetEmail || getCurrentUserEmail();
  const safeEmail = email.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return `ai_user_account_${safeEmail}`;
}

export function getOrCreateAccount(email?: string, companyName?: string): UserAccount {
  const activeEmail = email || getCurrentUserEmail();
  
  if (typeof window === 'undefined') {
    return {
      id: 'usr_demo_1',
      email: activeEmail,
      companyName: companyName || 'Мой интернет-магазин',
      botId: `bot_shop_${activeEmail.replace(/[^a-z0-9]/gi, '')}`,
      createdAt: new Date().toISOString(),
    };
  }

  const key = getAccountStorageKey(activeEmail);

  try {
    const existing = localStorage.getItem(key);
    if (existing) {
      const parsed: UserAccount = JSON.parse(existing);
      if (companyName && parsed.companyName !== companyName) {
        parsed.companyName = companyName;
        localStorage.setItem(key, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Error reading account profile:', e);
  }

  // Generate new unique account with a unique botId
  const safeEmailTag = activeEmail.split('@')[0].replace(/[^a-z0-9]/gi, '');
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const newAccount: UserAccount = {
    id: `usr_${Date.now()}`,
    email: activeEmail,
    companyName: companyName || 'Мой интернет-магазин',
    botId: `bot_${safeEmailTag}_${randomSuffix}`,
    createdAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(key, JSON.stringify(newAccount));
  } catch (e) {
    console.error('Error saving account profile:', e);
  }

  return newAccount;
}
