export interface UserSubscription {
  isPremium: boolean;
  plan: 'Starter' | 'Pro Business';
  usageCount: number;
  maxFreeLimit: number;
  paymentMethod?: 'LavaPay' | 'CryptoMus';
}

const STORAGE_KEY = 'ai_user_subscription';

const defaultSubscription: UserSubscription = {
  isPremium: false,
  plan: 'Starter',
  usageCount: 0,
  maxFreeLimit: 30,
};

export function getSubscription(): UserSubscription {
  if (typeof window === 'undefined') return defaultSubscription;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Error reading subscription from localStorage:', e);
  }
  return defaultSubscription;
}

export function saveSubscription(sub: UserSubscription): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sub));
  } catch (e) {
    console.error('Error saving subscription to localStorage:', e);
  }
}

export function incrementUsageCount(): { isLimitExceeded: boolean; usageCount: number } {
  const sub = getSubscription();
  if (sub.isPremium) {
    return { isLimitExceeded: false, usageCount: sub.usageCount + 1 };
  }

  const newCount = sub.usageCount + 1;
  const isLimitExceeded = newCount > sub.maxFreeLimit;
  sub.usageCount = newCount;
  saveSubscription(sub);

  return { isLimitExceeded, usageCount: newCount };
}

export function activateProDemo(paymentMethod: 'LavaPay' | 'CryptoMus' = 'LavaPay'): UserSubscription {
  const sub = getSubscription();
  sub.isPremium = true;
  sub.plan = 'Pro Business';
  sub.paymentMethod = paymentMethod;
  saveSubscription(sub);
  return sub;
}
