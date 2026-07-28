export interface UserSubscription {
  isPremium: boolean;
  plan: 'Starter' | 'Pro' | 'Max';
  usageCount: number; // monthly or daily usage
  dailyUsageCount: number; // daily responses used
  maxDailyLimit: number; // e.g. 2000 for Pro, 6000 for Max
  lastResetDate: string; // ISO date format YYYY-MM-DD
  paymentMethod?: string;
}

const STORAGE_KEY = 'ai_user_subscription';

export function getMSKDateString(): string {
  const now = new Date();
  // MSK is UTC+3
  const mskTime = new Date(now.getTime() + 3 * 3600 * 1000);
  return mskTime.toISOString().split('T')[0];
}

export function getSubscription(): UserSubscription {
  if (typeof window === 'undefined') {
    return {
      isPremium: false,
      plan: 'Starter',
      usageCount: 0,
      dailyUsageCount: 0,
      maxDailyLimit: 30,
      lastResetDate: getMSKDateString(),
    };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: UserSubscription = JSON.parse(saved);
      const todayMSK = getMSKDateString();
      
      // Auto reset daily usage at 00:00 MSK
      if (parsed.lastResetDate !== todayMSK) {
        parsed.dailyUsageCount = 0;
        parsed.lastResetDate = todayMSK;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Error reading subscription from localStorage:', e);
  }

  const initial: UserSubscription = {
    isPremium: false,
    plan: 'Starter',
    usageCount: 0,
    dailyUsageCount: 0,
    maxDailyLimit: 30,
    lastResetDate: getMSKDateString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch (e) {
    console.error('Error saving initial subscription:', e);
  }

  return initial;
}

export function saveSubscription(sub: UserSubscription): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sub));
  } catch (e) {
    console.error('Error saving subscription to localStorage:', e);
  }
}

export function activatePlan(plan: 'Pro' | 'Max', gateway: string = 'LavaPay'): UserSubscription {
  const current = getSubscription();
  const maxLimit = plan === 'Pro' ? 2000 : 6000;

  const updated: UserSubscription = {
    ...current,
    isPremium: true,
    plan: plan,
    maxDailyLimit: maxLimit,
    dailyUsageCount: 0,
    lastResetDate: getMSKDateString(),
    paymentMethod: gateway,
  };

  saveSubscription(updated);
  return updated;
}

export function activateProDemo(gateway: string = 'LavaPay'): UserSubscription {
  return activatePlan('Pro', gateway);
}

export function incrementUsage(): UserSubscription {
  const current = getSubscription();
  const todayMSK = getMSKDateString();

  let dailyCount = current.dailyUsageCount || 0;
  if (current.lastResetDate !== todayMSK) {
    dailyCount = 0;
  }

  const updated: UserSubscription = {
    ...current,
    usageCount: (current.usageCount || 0) + 1,
    dailyUsageCount: dailyCount + 1,
    lastResetDate: todayMSK,
  };

  saveSubscription(updated);
  return updated;
}
