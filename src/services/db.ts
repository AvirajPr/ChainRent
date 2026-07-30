import { mockProperties, mockLeases, mockTransactions, mockNotifications, mockReputation } from '../data/mockData';
import type { Wallet } from '../types';

export const KEYS = {
  PROPERTIES: 'chainrent_properties',
  LEASES: 'chainrent_leases',
  TRANSACTIONS: 'chainrent_transactions',
  NOTIFICATIONS: 'chainrent_notifications',
  REPUTATION: 'chainrent_reputation',
  WALLET: 'chainrent_wallet',
  THEME: 'chainrent_theme',
  SETTINGS: 'chainrent_settings',
  FEEDBACK: 'chainrent_feedback',
  WALLET_INTERACTIONS: 'chainrent_wallet_interactions',
  ANALYTICS_EVENTS: 'chainrent_analytics_events'
};

const defaultWallet: Wallet = {
  address: null,
  balance: 12450.82,
  network: null,
  connected: false,
  provider: null
};

const defaultSettings = {
  profileName: 'James D.',
  email: 'james.d@stellar.org',
  notificationsEnabled: true,
  securityMfa: false,
  walletPreferences: 'Freighter',
  appLanguage: 'English'
};

export const resetKeyToDefault = (key: string): void => {
  try {
    switch (key) {
      case KEYS.PROPERTIES:
        localStorage.setItem(KEYS.PROPERTIES, JSON.stringify(mockProperties));
        break;
      case KEYS.LEASES:
        localStorage.setItem(KEYS.LEASES, JSON.stringify(mockLeases));
        break;
      case KEYS.TRANSACTIONS:
        localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(mockTransactions));
        break;
      case KEYS.NOTIFICATIONS:
        localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(mockNotifications));
        break;
      case KEYS.REPUTATION:
        localStorage.setItem(KEYS.REPUTATION, JSON.stringify(mockReputation));
        break;
      case KEYS.WALLET:
        localStorage.setItem(KEYS.WALLET, JSON.stringify(defaultWallet));
        break;
      case KEYS.SETTINGS:
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(defaultSettings));
        break;
      default:
        break;
    }
  } catch (err) {
    console.error('Failed to reset localStorage key', key, err);
  }
};

export const initStorage = () => {
  try {
    // Purge outdated mock data with malformed Stellar addresses if present
    const propertiesData = localStorage.getItem(KEYS.PROPERTIES);
    if (propertiesData && propertiesData.includes('KJH89SFD88SF9G7')) {
      console.log('Purging legacy malformed mock data from localStorage...');
      localStorage.removeItem(KEYS.PROPERTIES);
      localStorage.removeItem(KEYS.LEASES);
      localStorage.removeItem(KEYS.TRANSACTIONS);
      localStorage.removeItem(KEYS.NOTIFICATIONS);
      localStorage.removeItem(KEYS.REPUTATION);
    }

    if (!localStorage.getItem(KEYS.PROPERTIES)) {
      resetKeyToDefault(KEYS.PROPERTIES);
    }
    if (!localStorage.getItem(KEYS.LEASES)) {
      resetKeyToDefault(KEYS.LEASES);
    }
    if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
      resetKeyToDefault(KEYS.TRANSACTIONS);
    }
    if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
      resetKeyToDefault(KEYS.NOTIFICATIONS);
    }
    if (!localStorage.getItem(KEYS.REPUTATION)) {
      resetKeyToDefault(KEYS.REPUTATION);
    }
    if (!localStorage.getItem(KEYS.WALLET)) {
      resetKeyToDefault(KEYS.WALLET);
    }
    if (!localStorage.getItem(KEYS.SETTINGS)) {
      resetKeyToDefault(KEYS.SETTINGS);
    }
  } catch (err) {
    console.error('Failed to initialize localStorage keys', err);
  }
};

export const getFromStorage = <T>(key: string): T => {
  initStorage();
  try {
    const data = localStorage.getItem(key);
    if (data === null) {
      resetKeyToDefault(key);
      const fresh = localStorage.getItem(key);
      return fresh ? (JSON.parse(fresh) as T) : (null as any);
    }
    return JSON.parse(data) as T;
  } catch (err) {
    console.warn(`Local storage corrupted for key: ${key}. Restoring default mock data...`, err);
    resetKeyToDefault(key);
    const recovered = localStorage.getItem(key);
    try {
      return recovered ? (JSON.parse(recovered) as T) : (null as any);
    } catch {
      return null as any;
    }
  }
};

export const setToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to set item in localStorage for key: ${key}`, err);
  }
};
