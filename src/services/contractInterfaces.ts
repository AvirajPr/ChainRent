export interface SorobanResponse<T> {
  success: boolean;
  transactionHash?: string;
  result?: T;
  error?: string;
}

export interface ILeaseContract {
  /**
   * Deploys a new lease contract with the given parameters.
   */
  initializeLease(
    propertyId: string,
    tenant: string,
    landlord: string,
    monthlyRent: bigint,
    depositAmount: bigint,
    durationMonths: number
  ): Promise<SorobanResponse<string>>;

  /**
   * Retrieves the current state and parameters of the lease contract.
   */
  getLeaseDetails(leaseId: string): Promise<SorobanResponse<{
    tenant: string;
    landlord: string;
    monthlyRent: bigint;
    depositAmount: bigint;
    active: boolean;
    remainingMonths: number;
  }>>;
}

export interface IEscrowContract {
  /**
   * Locks the security deposit into the escrow contract.
   */
  lockDeposit(leaseId: string, tenant: string, amount: bigint): Promise<SorobanResponse<boolean>>;

  /**
   * Releases the deposit back to the tenant or landlord based on terms.
   */
  releaseDeposit(leaseId: string, recipient: string, amount: bigint, signatures: string[]): Promise<SorobanResponse<boolean>>;

  /**
   * Initiates a dispute, locking funds until resolved.
   */
  disputeDeposit(leaseId: string, initiator: string, reason: string): Promise<SorobanResponse<boolean>>;

  /**
   * Resolves a dispute, distributing the funds as determined by mediator/court.
   */
  resolveDispute(leaseId: string, tenantRefund: bigint, landlordPayout: bigint, mediatorSignature: string): Promise<SorobanResponse<boolean>>;
}

export interface IReputationContract {
  /**
   * Records a successful lease settlement, boosting the trust score of both parties.
   */
  recordSettlement(address: string, role: 'landlord' | 'tenant'): Promise<SorobanResponse<number>>;

  /**
   * Records a contract breach or dispute, impacting the trust score.
   */
  recordBreach(address: string, severity: 'minor' | 'major'): Promise<SorobanResponse<number>>;

  /**
   * Retrieves the on-chain trust score and statistics for an address.
   */
  getReputation(address: string): Promise<SorobanResponse<{
    trustScore: number;
    completedLeases: number;
    breaches: number;
  }>>;
}

export interface ITransactionContract {
  /**
   * Processes a monthly rent payment.
   */
  payRent(leaseId: string, tenant: string, landlord: string, amount: bigint): Promise<SorobanResponse<boolean>>;
}
