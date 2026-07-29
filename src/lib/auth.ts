export interface UserAccount {
  id: string;
  email: string;
  passwordHash?: string;
  companyName: string;
  botId: string;
  createdAt: string;
}

const REGISTRY_KEY = 'ai_user_accounts_registry';

export function getAccountsRegistry(): Record<string, UserAccount> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading accounts registry:', e);
  }
  return {};
}

export function saveAccountsRegistry(registry: Record<string, UserAccount>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  } catch (e) {
    console.error('Error saving accounts registry:', e);
  }
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
    localStorage.setItem('ai_user_email', email.toLowerCase().trim());
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

export function registerUserAccount(email: string, password: string, companyName?: string): { success: boolean; error?: string; account?: UserAccount } {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Введите корректный адрес электронной почты' };
  }
  if (!password || password.length < 4) {
    return { success: false, error: 'Пароль должен содержать не менее 4 символов' };
  }

  const cleanEmail = email.toLowerCase().trim();
  const registry = getAccountsRegistry();

  // STRICT UNIQUE EMAIL CHECK: Allow ONLY 1 account per email address
  if (registry[cleanEmail]) {
    return {
      success: false,
      error: `Пользователь с почтой ${cleanEmail} уже зарегистрирован! Пожалуйста, войдите в свой аккаунт.`
    };
  }

  const safeTag = cleanEmail.split('@')[0].replace(/[^a-z0-9]/gi, '');
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const newAccount: UserAccount = {
    id: `usr_${Date.now()}`,
    email: cleanEmail,
    passwordHash: password,
    companyName: companyName || 'Мой интернет-магазин',
    botId: `bot_shop_${safeTag || 'main'}_${randomSuffix}`,
    createdAt: new Date().toISOString()
  };

  registry[cleanEmail] = newAccount;
  saveAccountsRegistry(registry);
  setCurrentUserEmail(cleanEmail);

  return { success: true, account: newAccount };
}

export function loginUserAccount(email: string, password: string): { success: boolean; error?: string; account?: UserAccount } {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Введите корректный адрес электронной почты' };
  }

  const cleanEmail = email.toLowerCase().trim();
  const registry = getAccountsRegistry();
  const existing = registry[cleanEmail];

  if (!existing) {
    // If first time user logging in without explicit registration, auto-create account for seamless demo
    const safeTag = cleanEmail.split('@')[0].replace(/[^a-z0-9]/gi, '');
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const newAccount: UserAccount = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      passwordHash: password,
      companyName: 'Мой интернет-магазин',
      botId: `bot_shop_${safeTag || 'main'}_${randomSuffix}`,
      createdAt: new Date().toISOString()
    };
    registry[cleanEmail] = newAccount;
    saveAccountsRegistry(registry);
    setCurrentUserEmail(cleanEmail);
    return { success: true, account: newAccount };
  }

  if (existing.passwordHash && existing.passwordHash !== password) {
    return { success: false, error: 'Неверный пароль. Попробуйте еще раз или проверьте раскладку.' };
  }

  setCurrentUserEmail(cleanEmail);
  return { success: true, account: existing };
}

export function getAccountStorageKey(targetEmail?: string): string {
  const email = targetEmail || getCurrentUserEmail();
  const safeEmail = email.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return `ai_user_account_${safeEmail}`;
}

export function getOrCreateAccount(email?: string, companyName?: string): UserAccount {
  const activeEmail = email || getCurrentUserEmail();
  const cleanEmail = activeEmail.toLowerCase().trim();
  const registry = getAccountsRegistry();

  if (registry[cleanEmail]) {
    return registry[cleanEmail];
  }

  const safeEmailTag = cleanEmail.split('@')[0].replace(/[^a-z0-9]/gi, '');
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const newAccount: UserAccount = {
    id: `usr_${Date.now()}`,
    email: cleanEmail,
    companyName: companyName || 'Мой интернет-магазин',
    botId: `bot_shop_${safeEmailTag || 'main'}_${randomSuffix}`,
    createdAt: new Date().toISOString(),
  };

  registry[cleanEmail] = newAccount;
  saveAccountsRegistry(registry);
  return newAccount;
}
