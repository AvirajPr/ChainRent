export interface Property {
  id: string;
  title: string;
  location: string;
  type: 'Apartment' | 'Villa' | 'Office' | 'Studio';
  price: number; // in XLM/month
  deposit: number; // in XLM
  status: 'available' | 'rented' | 'processing';
  description: string;
  image: string;
  ownerAddress: string;
  ownerName: string;
  ownerRating: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  verified: boolean;
  amenities: string[];
}

export interface LeaseTimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'sign' | 'deposit' | 'payment' | 'dispute' | 'release';
}

export interface Lease {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  tenantName: string;
  tenantAddress: string;
  landlordName: string;
  landlordAddress: string;
  periodMonths: number;
  monthsRemaining: number;
  monthlyRent: number;
  depositAmount: number;
  status: 'active' | 'final_month' | 'expired' | 'settled';
  startDate: string;
  endDate: string;
  escrowAddress: string;
  timeline: LeaseTimelineEvent[];
}

export interface Transaction {
  id: string;
  hash: string;
  type: 'deposit_locked' | 'rent_paid' | 'deposit_released' | 'lease_created';
  amount: number;
  date: string;
  status: 'success' | 'pending' | 'failed';
  fromAddress: string;
  toAddress: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'success' | 'warning' | 'info' | 'error';
}

export interface Wallet {
  address: string | null;
  balance: number;
  network: 'Mainnet' | 'Testnet' | null;
  connected: boolean;
  provider: 'Freighter' | 'xBull' | 'Albedo' | null;
}

export interface DisputeHistoryItem {
  id: string;
  date: string;
  title: string;
  status: 'resolved' | 'no_dispute';
}

export interface Review {
  id: string;
  author: string;
  role: 'landlord' | 'tenant';
  rating: number;
  comment: string;
  date: string;
}

export interface Reputation {
  trustScore: number;
  landlordRating: number;
  tenantRating: number;
  completedLeases: number;
  paymentSuccessRate: number;
  disputeHistory: DisputeHistoryItem[];
  reviews: Review[];
}
