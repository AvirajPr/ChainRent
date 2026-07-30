import { getFromStorage, setToStorage, KEYS } from './db';
import type { Reputation, Review, Lease, Transaction } from '../types';

export const ReputationService = {
  getReputation(): Reputation {
    const reputation = getFromStorage<Reputation>(KEYS.REPUTATION);
    const leases = getFromStorage<Lease[]>(KEYS.LEASES) || [];
    const txs = getFromStorage<Transaction[]>(KEYS.TRANSACTIONS) || [];

    // Calculate completed leases: settled leases + 13 historical ones to match initial mock data
    const settledCount = leases.filter(l => l.status === 'settled').length;
    reputation.completedLeases = 13 + settledCount;

    // Calculate ratings based on reviews
    const landlordReviews = reputation.reviews.filter(r => r.role === 'tenant');
    const tenantReviews = reputation.reviews.filter(r => r.role === 'landlord');

    if (landlordReviews.length > 0) {
      const avgLandlord = landlordReviews.reduce((sum, r) => sum + r.rating, 0) / landlordReviews.length;
      reputation.landlordRating = parseFloat(avgLandlord.toFixed(1));
    } else {
      reputation.landlordRating = 4.8;
    }

    if (tenantReviews.length > 0) {
      const avgTenant = tenantReviews.reduce((sum, r) => sum + r.rating, 0) / tenantReviews.length;
      reputation.tenantRating = parseFloat(avgTenant.toFixed(1));
    } else {
      reputation.tenantRating = 4.9;
    }

    // Calculate trust score based on reviews rating average
    const allReviews = reputation.reviews;
    if (allReviews.length > 0) {
      const avgTotal = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      reputation.trustScore = Math.min(100, Math.round((avgTotal / 5) * 100));
    } else {
      reputation.trustScore = 98;
    }

    // Calculate payment success rate based on successful rent payments
    const rentPaidTxs = txs.filter(t => t.type === 'rent_paid');
    const successfulRentTxs = rentPaidTxs.filter(t => t.status === 'success');
    reputation.paymentSuccessRate = rentPaidTxs.length > 0 
      ? Math.round((successfulRentTxs.length / rentPaidTxs.length) * 100)
      : 98; // Fallback to 98% if no payments yet

    return reputation;
  },

  addReview(rating: number, comment: string, role: 'landlord' | 'tenant', author: string): Review {
    const reputation = this.getReputation();
    const newReview: Review = {
      id: `rev_${Date.now()}`,
      author,
      role,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0]
    };
    
    reputation.reviews.unshift(newReview);
    
    // Save to storage
    setToStorage(KEYS.REPUTATION, reputation);
    
    // Re-sync and return
    const updatedRep = this.getReputation();
    setToStorage(KEYS.REPUTATION, updatedRep);

    return newReview;
  },

  incrementCompletedLeases(): void {
    // No-op as completed leases is now derived from Leases in storage
  }
};
