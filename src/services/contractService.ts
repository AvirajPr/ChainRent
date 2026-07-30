import { getFromStorage, setToStorage } from './db';
import type { 
  SorobanResponse, 
  ILeaseContract, 
  IEscrowContract, 
  IReputationContract, 
  ITransactionContract 
} from './contractInterfaces';

export interface SorobanEvent {
  id: string;
  type: 'LeaseCreated' | 'LeaseApproved' | 'DepositLocked' | 'DepositReleased' | 'RentPaid' | 'LeaseCompleted' | 'ReputationUpdated';
  timestamp: number;
  data: any;
}

const EVENT_KEY = 'soroban_events';

// Simple Pub/Sub for events
type EventCallback = (event: SorobanEvent) => void;
const subscribers = new Set<EventCallback>();

export const ContractService = {
  getEvents(): SorobanEvent[] {
    return getFromStorage<SorobanEvent[]>(EVENT_KEY) || [];
  },

  publishEvent(type: SorobanEvent['type'], data: any) {
    const events = this.getEvents();
    const newEvent: SorobanEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      timestamp: Date.now(),
      data
    };
    events.unshift(newEvent);
    setToStorage(EVENT_KEY, events);

    // Notify active subscribers
    subscribers.forEach(cb => cb(newEvent));
  },

  subscribeToEvents(callback: EventCallback): () => void {
    subscribers.add(callback);
    return () => {
      subscribers.delete(callback);
    };
  }
};

export const LeaseContractService: ILeaseContract = {
  async initializeLease(
    propertyId: string,
    tenant: string,
    landlord: string,
    monthlyRent: bigint,
    depositAmount: bigint,
    durationMonths: number
  ): Promise<SorobanResponse<string>> {
    try {
      const leaseId = `l_s_${Date.now()}`;
      
      ContractService.publishEvent('LeaseCreated', {
        leaseId,
        propertyId,
        tenant,
        landlord,
        monthlyRent: monthlyRent.toString(),
        depositAmount: depositAmount.toString(),
        durationMonths
      });

      return {
        success: true,
        transactionHash: Math.random().toString(16).substring(2, 66),
        result: leaseId
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getLeaseDetails(_leaseId: string): Promise<SorobanResponse<{
    tenant: string;
    landlord: string;
    monthlyRent: bigint;
    depositAmount: bigint;
    active: boolean;
    remainingMonths: number;
  }>> {
    // For demo/simulated level 3, we mock this based on local storage
    return {
      success: true,
      result: {
        tenant: 'GB...',
        landlord: 'GA...',
        monthlyRent: 500n,
        depositAmount: 1000n,
        active: true,
        remainingMonths: 12
      }
    };
  }
};

export const EscrowContractService: IEscrowContract = {
  async lockDeposit(leaseId: string, tenant: string, amount: bigint): Promise<SorobanResponse<boolean>> {
    try {
      ContractService.publishEvent('DepositLocked', {
        leaseId,
        tenant,
        amount: amount.toString()
      });

      return {
        success: true,
        transactionHash: Math.random().toString(16).substring(2, 66),
        result: true
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async releaseDeposit(leaseId: string, recipient: string, amount: bigint, _signatures: string[]): Promise<SorobanResponse<boolean>> {
    try {
      ContractService.publishEvent('DepositReleased', {
        leaseId,
        recipient,
        amount: amount.toString()
      });

      return {
        success: true,
        transactionHash: Math.random().toString(16).substring(2, 66),
        result: true
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async disputeDeposit(_leaseId: string, _initiator: string, _reason: string): Promise<SorobanResponse<boolean>> {
    try {
      return {
        success: true,
        transactionHash: Math.random().toString(16).substring(2, 66),
        result: true
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async resolveDispute(_leaseId: string, _tenantRefund: bigint, _landlordPayout: bigint, _mediatorSignature: string): Promise<SorobanResponse<boolean>> {
    try {
      return {
        success: true,
        transactionHash: Math.random().toString(16).substring(2, 66),
        result: true
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

export const ReputationContractService: IReputationContract = {
  async recordSettlement(address: string, role: 'landlord' | 'tenant'): Promise<SorobanResponse<number>> {
    try {
      const currentScore = 850; // Mock base
      ContractService.publishEvent('ReputationUpdated', {
        address,
        role,
        newScore: currentScore + 20
      });

      return {
        success: true,
        transactionHash: Math.random().toString(16).substring(2, 66),
        result: currentScore + 20
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async recordBreach(_address: string, severity: 'minor' | 'major'): Promise<SorobanResponse<number>> {
    try {
      const penalty = severity === 'major' ? 100 : 20;
      return {
        success: true,
        transactionHash: Math.random().toString(16).substring(2, 66),
        result: 750 - penalty
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getReputation(_address: string): Promise<SorobanResponse<{
    trustScore: number;
    completedLeases: number;
    breaches: number;
  }>> {
    return {
      success: true,
      result: {
        trustScore: 850,
        completedLeases: 5,
        breaches: 0
      }
    };
  }
};

export const TransactionContractService: ITransactionContract = {
  async payRent(leaseId: string, tenant: string, landlord: string, amount: bigint): Promise<SorobanResponse<boolean>> {
    try {
      ContractService.publishEvent('RentPaid', {
        leaseId,
        tenant,
        landlord,
        amount: amount.toString()
      });

      return {
        success: true,
        transactionHash: Math.random().toString(16).substring(2, 66),
        result: true
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};
