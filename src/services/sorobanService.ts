import { 
  LeaseContractService, 
  EscrowContractService, 
  ReputationContractService, 
  TransactionContractService 
} from './contractService';
import { ContractAuditService } from './contractAuditService';
import type { SorobanResponse } from './contractInterfaces';

export const CONTRACT_IDS = {
  LEASE: 'CCDQLW2CKRUL4OCQDIW7SQ5VOT3IIMFTIZST3KVNAO3J5M6HJDLUTNF3',
  ESCROW: 'CDMLNC5EUTGZDAPOJSKGYGGOVPOSUFMRUXIWUB4C3ERJZIQSMXMDDI6N',
  REPUTATION: 'CDWJQYLPI6SBNGTUGAN4V3SA7GEE6LZIOMMU46CQPM4NHDTSGGU47HQO'
};

export const SorobanService = {
  async createLease(
    propertyId: string,
    tenant: string,
    landlord: string,
    monthlyRent: bigint,
    depositAmount: bigint,
    durationMonths: number
  ): Promise<SorobanResponse<string>> {
    const res = await LeaseContractService.initializeLease(
      propertyId,
      tenant,
      landlord,
      monthlyRent,
      depositAmount,
      durationMonths
    );
    ContractAuditService.addLog({
      contractName: 'Lease Contract',
      contractId: CONTRACT_IDS.LEASE,
      functionName: 'create_lease',
      transactionHash: res.transactionHash || '',
      success: res.success,
      error: res.error,
      params: { propertyId, tenant, landlord, monthlyRent: monthlyRent.toString(), depositAmount: depositAmount.toString(), durationMonths }
    });
    return res;
  },

  async approveLease(leaseId: string, landlord: string): Promise<SorobanResponse<boolean>> {
    // Simulating lease approval in Soroban contract
    const txHash = Math.random().toString(16).substring(2, 66);
    const success = true;
    ContractAuditService.addLog({
      contractName: 'Lease Contract',
      contractId: CONTRACT_IDS.LEASE,
      functionName: 'approve_lease',
      transactionHash: txHash,
      success,
      params: { leaseId, landlord }
    });
    return { success, transactionHash: txHash, result: true };
  },

  async terminateLease(leaseId: string): Promise<SorobanResponse<boolean>> {
    // Simulating lease termination
    const txHash = Math.random().toString(16).substring(2, 66);
    const success = true;
    ContractAuditService.addLog({
      contractName: 'Lease Contract',
      contractId: CONTRACT_IDS.LEASE,
      functionName: 'terminate_lease',
      transactionHash: txHash,
      success,
      params: { leaseId }
    });
    return { success, transactionHash: txHash, result: true };
  },

  async lockDeposit(leaseId: string, tenant: string, amount: bigint): Promise<SorobanResponse<boolean>> {
    const res = await EscrowContractService.lockDeposit(leaseId, tenant, amount);
    ContractAuditService.addLog({
      contractName: 'Escrow Contract',
      contractId: CONTRACT_IDS.ESCROW,
      functionName: 'lock_deposit',
      transactionHash: res.transactionHash || '',
      success: res.success,
      error: res.error,
      params: { leaseId, tenant, amount: amount.toString() }
    });
    return res;
  },

  async releaseDeposit(
    leaseId: string,
    recipient: string,
    amount: bigint,
    signatures: string[]
  ): Promise<SorobanResponse<boolean>> {
    const res = await EscrowContractService.releaseDeposit(leaseId, recipient, amount, signatures);
    ContractAuditService.addLog({
      contractName: 'Escrow Contract',
      contractId: CONTRACT_IDS.ESCROW,
      functionName: 'release_deposit',
      transactionHash: res.transactionHash || '',
      success: res.success,
      error: res.error,
      params: { leaseId, recipient, amount: amount.toString(), signatures }
    });
    return res;
  },

  async refundDeposit(leaseId: string, tenant: string, amount: bigint): Promise<SorobanResponse<boolean>> {
    // Simulating a partial or full refund on escrow contract
    const res = await EscrowContractService.releaseDeposit(leaseId, tenant, amount, []);
    ContractAuditService.addLog({
      contractName: 'Escrow Contract',
      contractId: CONTRACT_IDS.ESCROW,
      functionName: 'refund_deposit',
      transactionHash: res.transactionHash || '',
      success: res.success,
      error: res.error,
      params: { leaseId, tenant, amount: amount.toString() }
    });
    return res;
  },

  async payRent(leaseId: string, tenant: string, landlord: string, amount: bigint): Promise<SorobanResponse<boolean>> {
    const res = await TransactionContractService.payRent(leaseId, tenant, landlord, amount);
    ContractAuditService.addLog({
      contractName: 'Transaction Contract',
      contractId: CONTRACT_IDS.LEASE, // Rent payments are processed in the Lease/Payment lifecycle
      functionName: 'pay_rent',
      transactionHash: res.transactionHash || '',
      success: res.success,
      error: res.error,
      params: { leaseId, tenant, landlord, amount: amount.toString() }
    });
    return res;
  },

  async updateReputation(address: string, role: 'landlord' | 'tenant', success: boolean): Promise<SorobanResponse<number>> {
    const res = success 
      ? await ReputationContractService.recordSettlement(address, role)
      : await ReputationContractService.recordBreach(address, 'minor');
    
    ContractAuditService.addLog({
      contractName: 'Reputation Contract',
      contractId: CONTRACT_IDS.REPUTATION,
      functionName: 'update_score',
      transactionHash: res.transactionHash || '',
      success: res.success,
      error: res.error,
      params: { address, role, success }
    });
    return res;
  },

  async getLease(leaseId: string): Promise<SorobanResponse<{
    tenant: string;
    landlord: string;
    monthlyRent: bigint;
    depositAmount: bigint;
    active: boolean;
    remainingMonths: number;
  }>> {
    const res = await LeaseContractService.getLeaseDetails(leaseId);
    return res;
  },

  async getEscrow(leaseId: string): Promise<SorobanResponse<{
    leaseId: string;
    balance: bigint;
    locked: boolean;
  }>> {
    // Simulating query to escrow contract
    return {
      success: true,
      result: {
        leaseId,
        balance: 1000n,
        locked: true
      }
    };
  },

  async getReputation(address: string): Promise<SorobanResponse<{
    trustScore: number;
    completedLeases: number;
    breaches: number;
  }>> {
    const res = await ReputationContractService.getReputation(address);
    return res;
  }
};
