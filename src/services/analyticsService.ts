import { getFromStorage, setToStorage, KEYS } from './db';
import type { Transaction, Lease, Property } from '../types';

export interface WalletInteraction {
  id: string;
  address: string;
  action: 'Connect Wallet' | 'Disconnect Wallet' | 'Fund Wallet' | 'Create Property' | 'Create Lease' | 'Pay Rent' | 'Release Escrow' | 'Submit Feedback';
  transactionHash: string;
  timestamp: string;
}

export interface UserFeedback {
  id: string;
  rating: number;
  text: string;
  timestamp: string;
  userAddress: string;
  adminReply?: string;
}

export interface AnalyticsEvent {
  id: string;
  eventName: string;
  properties: any;
  timestamp: string;
}

// Initial mock data for wallet interactions and feedback to make dashboard rich on first load
const initialInteractions: WalletInteraction[] = [
  {
    id: 'wi_1',
    address: 'GDWPNBABP2XCEA5X6W76YOBXHIQ2M5DY2WATOIK3F24UCNHN5MQN3RU3',
    action: 'Connect Wallet',
    transactionHash: 'N/A',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 'wi_2',
    address: 'GDWPNBABP2XCEA5X6W76YOBXHIQ2M5DY2WATOIK3F24UCNHN5MQN3RU3',
    action: 'Fund Wallet',
    transactionHash: '8dc18a421b96a928be3f3818e3d0c9f18e2d4d4200dbf8a7a9cb7e721a9cbf8e',
    timestamp: new Date(Date.now() - 1.9 * 3600000).toISOString()
  },
  {
    id: 'wi_3',
    address: 'GBDN6SFO3JOYSHHPIDXV5JQRVBKG5QEDUHG4M5MRKUTZAOSYTRLV3CZW',
    action: 'Create Property',
    transactionHash: '3dc18a421b96a928be3f3818e3d0c9f18e2d4d4200dbf8a7a9cb7e721a9cbf3c',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString()
  }
];

const initialFeedback: UserFeedback[] = [
  {
    id: 'fb_1',
    rating: 5,
    text: 'ChainRent makes rental security deposits so much safer. The smart contract works flawlessly.',
    timestamp: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    userAddress: 'GDWPNBABP2XCEA5X6W76YOBXHIQ2M5DY2WATOIK3F24UCNHN5MQN3RU3',
    adminReply: 'Thank you James! We are committed to making renting secure and easy.'
  },
  {
    id: 'fb_2',
    rating: 4,
    text: 'Great application flow, but would love support for more wallet options in the future!',
    timestamp: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    userAddress: 'GC2NDRKUBP2QJEM54Y3N6NNR6W4LYFAGUVHQKXX4N3KZNVYFZCSW7JTC'
  }
];

const initialEvents: AnalyticsEvent[] = [
  {
    id: 'ev_1',
    eventName: 'page_view',
    properties: { path: '/' },
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 'ev_2',
    eventName: 'click_connect_wallet',
    properties: { provider: 'Freighter' },
    timestamp: new Date(Date.now() - 3.9 * 3600000).toISOString()
  }
];

export const AnalyticsService = {
  getWalletInteractions(): WalletInteraction[] {
    const data = localStorage.getItem(KEYS.WALLET_INTERACTIONS);
    if (!data) {
      setToStorage(KEYS.WALLET_INTERACTIONS, initialInteractions);
      return initialInteractions;
    }
    return JSON.parse(data);
  },

  trackWalletInteraction(
    address: string,
    action: WalletInteraction['action'],
    transactionHash: string = 'N/A'
  ): void {
    const interactions = this.getWalletInteractions();
    const newInteraction: WalletInteraction = {
      id: `wi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      address,
      action,
      transactionHash,
      timestamp: new Date().toISOString()
    };
    interactions.unshift(newInteraction);
    setToStorage(KEYS.WALLET_INTERACTIONS, interactions);
    this.trackEvent(`wallet_${action.toLowerCase().replace(' ', '_')}`, { address, transactionHash });
  },

  getFeedback(): UserFeedback[] {
    const data = localStorage.getItem(KEYS.FEEDBACK);
    if (!data) {
      setToStorage(KEYS.FEEDBACK, initialFeedback);
      return initialFeedback;
    }
    return JSON.parse(data);
  },

  submitFeedback(rating: number, text: string, userAddress: string): UserFeedback {
    const feedbackList = this.getFeedback();
    const newFeedback: UserFeedback = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      rating,
      text,
      timestamp: new Date().toISOString(),
      userAddress: userAddress || 'Anonymous'
    };
    feedbackList.unshift(newFeedback);
    setToStorage(KEYS.FEEDBACK, feedbackList);
    this.trackEvent('feedback_submitted', { rating });
    return newFeedback;
  },

  addAdminReply(feedbackId: string, replyText: string): void {
    const feedbackList = this.getFeedback();
    const index = feedbackList.findIndex(f => f.id === feedbackId);
    if (index !== -1) {
      feedbackList[index].adminReply = replyText;
      setToStorage(KEYS.FEEDBACK, feedbackList);
    }
  },

  getEvents(): AnalyticsEvent[] {
    const data = localStorage.getItem(KEYS.ANALYTICS_EVENTS);
    if (!data) {
      setToStorage(KEYS.ANALYTICS_EVENTS, initialEvents);
      return initialEvents;
    }
    return JSON.parse(data);
  },

  trackEvent(eventName: string, properties: any = {}): void {
    const events = this.getEvents();
    const newEvent: AnalyticsEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventName,
      properties,
      timestamp: new Date().toISOString()
    };
    events.unshift(newEvent);
    setToStorage(KEYS.ANALYTICS_EVENTS, events);

    // Simulation of Vercel Analytics / PostHog in console
    console.log(`[Monitoring-Integration] Event Tracked: ${eventName}`, properties);
  },

  getMetrics() {
    const leases = getFromStorage<Lease[]>(KEYS.LEASES) || [];
    const transactions = getFromStorage<Transaction[]>(KEYS.TRANSACTIONS) || [];
    
    // Calculate unique users
    const userAddresses = new Set<string>();
    leases.forEach(l => {
      userAddresses.add(l.tenantAddress);
      userAddresses.add(l.landlordAddress);
    });
    transactions.forEach(t => {
      userAddresses.add(t.fromAddress);
      userAddresses.add(t.toAddress);
    });
    
    // Seed default users if none calculated
    const totalUsers = Math.max(18, userAddresses.size);

    const activeLeases = leases.filter(l => l.status === 'active' || l.status === 'final_month');
    const totalActiveLeases = activeLeases.length;
    
    const totalTransactions = transactions.length;

    const depositsLocked = activeLeases.reduce((sum, l) => sum + l.depositAmount, 0);

    const rentPaymentsList = transactions.filter(t => t.type === 'rent_paid');
    const totalRentPayments = rentPaymentsList.reduce((sum, t) => sum + t.amount, 0);

    return {
      totalUsers,
      totalActiveLeases,
      totalTransactions,
      depositsLocked,
      totalRentPayments
    };
  },

  getProductStatistics() {
    const properties = getFromStorage<Property[]>(KEYS.PROPERTIES) || [];
    const leases = getFromStorage<Lease[]>(KEYS.LEASES) || [];

    const totalProperties = properties.length;
    const verifiedProperties = properties.filter(p => p.verified).length;
    const verificationRate = totalProperties > 0 ? Math.round((verifiedProperties / totalProperties) * 100) : 0;

    const completedLeasesCount = leases.filter(l => l.status === 'settled').length;
    const totalLeasesCount = leases.length;
    const completionRate = totalLeasesCount > 0 ? Math.round((completedLeasesCount / totalLeasesCount) * 100) : 0;

    const averageRent = totalProperties > 0 ? Math.round(properties.reduce((sum, p) => sum + p.price, 0) / totalProperties) : 0;

    const averageLeaseTerm = totalLeasesCount > 0 ? Math.round(leases.reduce((sum, l) => sum + l.periodMonths, 0) / totalLeasesCount) : 0;

    return {
      totalProperties,
      verifiedProperties,
      verificationRate,
      completedLeasesCount,
      completionRate,
      averageRent,
      averageLeaseTerm
    };
  }
};
