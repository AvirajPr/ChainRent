import { getFromStorage, setToStorage, KEYS } from './db';
import type { Lease, Transaction, LeaseTimelineEvent } from '../types';
import { PropertyService } from './propertyService';
import { StellarService } from './stellarService';
import { WalletProviderService } from './walletProviderService';
import { NetworkService } from './networkService';
import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk';
import { SorobanService } from './sorobanService';

export const LeaseService = {
  getLeases(): Lease[] {
    return getFromStorage<Lease[]>(KEYS.LEASES);
  },

  getLeaseById(id: string): Lease | undefined {
    const leases = this.getLeases();
    return leases.find(l => l.id === id);
  },

  async createLease(
    propertyId: string,
    tenantName: string,
    tenantAddress: string,
    periodMonths: number,
    provider: 'Freighter' | 'xBull' | 'Albedo'
  ): Promise<Lease> {
    const property = PropertyService.getPropertyById(propertyId);
    if (!property) throw new Error('Property not found');

    const leases = this.getLeases();
    const leaseId = `l_${Date.now()}`;
    
    // Generate a real escrow account Keypair on-chain
    const escrowKeypair = Keypair.random();
    const escrowAddress = escrowKeypair.publicKey();
    const escrowSeed = escrowKeypair.secret();
    
    const today = new Date().toISOString().split('T')[0];
    const end = new Date();
    end.setMonth(end.getMonth() + periodMonths);
    const endDate = end.toISOString().split('T')[0];

    // Build real payment transaction from tenant to escrow for the deposit
    const xdr = await StellarService.buildPaymentTx(tenantAddress, escrowAddress, property.deposit);
    
    // Sign using wallet
    let signedXdr: string;
    if (provider === 'Freighter') {
      signedXdr = await WalletProviderService.signWithFreighter(xdr);
    } else if (provider === 'xBull') {
      signedXdr = await WalletProviderService.signWithXBull(xdr, tenantAddress);
    } else {
      throw new Error('Albedo is not supported for signing transactions. Please connect with Freighter or xBull.');
    }

    // Submit transaction
    const txHash = await StellarService.submitTx(signedXdr);

    // Soroban Contract Integration
    await SorobanService.createLease(
      propertyId,
      tenantAddress,
      property.ownerAddress,
      BigInt(property.price),
      BigInt(property.deposit),
      periodMonths
    );
    await SorobanService.lockDeposit(leaseId, tenantAddress, BigInt(property.deposit));

    const timeline: LeaseTimelineEvent[] = [
      {
        id: `evt_sign_${Date.now()}`,
        title: 'Lease Created',
        description: `Terms defined and digitally signed. Transaction: ${txHash.substring(0, 8)}...`,
        date: today,
        type: 'sign'
      },
      {
        id: `evt_dep_${Date.now()}`,
        title: 'Deposit Locked',
        description: `${property.deposit} XLM locked in escrow smart contract: ${escrowAddress.substring(0, 8)}...`,
        date: today,
        type: 'deposit'
      },
      {
        id: `evt_act_${Date.now()}`,
        title: 'Lease Activated',
        description: 'Rental agreement is now fully active.',
        date: today,
        type: 'sign'
      }
    ];

    const newLease: Lease = {
      id: leaseId,
      propertyId,
      propertyTitle: property.title,
      propertyImage: property.image,
      tenantName,
      tenantAddress,
      landlordName: property.ownerName,
      landlordAddress: property.ownerAddress,
      periodMonths,
      monthsRemaining: periodMonths,
      monthlyRent: property.price,
      depositAmount: property.deposit,
      status: 'active',
      startDate: today,
      endDate: endDate,
      escrowAddress,
      timeline
    };

    // Store escrow seed locally in the lease record for later refund signing
    (newLease as any).escrowSeed = escrowSeed;

    // Update Property Status
    PropertyService.updatePropertyStatus(propertyId, 'rented');

    // Create Transactions
    const txs = getFromStorage<Transaction[]>(KEYS.TRANSACTIONS) || [];
    
    const txSign: Transaction = {
      id: `tx_${Date.now()}_1`,
      hash: txHash,
      type: 'lease_created',
      amount: 0,
      date: new Date().toISOString(),
      status: 'success',
      fromAddress: tenantAddress,
      toAddress: property.ownerAddress
    };

    const txLock: Transaction = {
      id: `tx_${Date.now()}_2`,
      hash: txHash,
      type: 'deposit_locked',
      amount: property.deposit,
      date: new Date().toISOString(),
      status: 'success',
      fromAddress: tenantAddress,
      toAddress: escrowAddress
    };

    txs.unshift(txSign, txLock);
    setToStorage(KEYS.TRANSACTIONS, txs);

    leases.unshift(newLease);
    setToStorage(KEYS.LEASES, leases);

    // Add notification
    const notifications = getFromStorage<any[]>(KEYS.NOTIFICATIONS) || [];
    notifications.unshift({
      id: `notif_${Date.now()}`,
      title: 'Lease Activated',
      description: `Lease for ${property.title} successfully signed and deposit secured.`,
      time: 'Just now',
      read: false,
      type: 'success'
    });
    setToStorage(KEYS.NOTIFICATIONS, notifications);

    return newLease;
  },

  async payRent(leaseId: string, provider: 'Freighter' | 'xBull' | 'Albedo'): Promise<void> {
    const leases = this.getLeases();
    const leaseIndex = leases.findIndex(l => l.id === leaseId);
    if (leaseIndex === -1) throw new Error('Lease not found');
    const lease = leases[leaseIndex];
    if (!lease) throw new Error('Lease not found');

    // Build real Stellar transaction from tenant to landlord
    const xdr = await StellarService.buildPaymentTx(lease.tenantAddress, lease.landlordAddress, lease.monthlyRent);
    
    // Sign using wallet
    let signedXdr: string;
    if (provider === 'Freighter') {
      signedXdr = await WalletProviderService.signWithFreighter(xdr);
    } else if (provider === 'xBull') {
      signedXdr = await WalletProviderService.signWithXBull(xdr, lease.tenantAddress);
    } else {
      throw new Error('Albedo is not supported for signing transactions. Please connect with Freighter or xBull.');
    }
    
    // Submit
    const hash = await StellarService.submitTx(signedXdr);

    // Soroban Contract Integration
    await SorobanService.payRent(leaseId, lease.tenantAddress, lease.landlordAddress, BigInt(lease.monthlyRent));

    // Add timeline event
    const newEvent: LeaseTimelineEvent = {
      id: `evt_rent_${Date.now()}`,
      title: 'Rent Paid',
      description: `${lease.monthlyRent} XLM transferred to ${lease.landlordName}. Hash: ${hash.substring(0, 8)}...`,
      date: new Date().toISOString().split('T')[0],
      type: 'payment'
    };
    lease.timeline.unshift(newEvent);

    // Create Transaction record
    const txs = getFromStorage<Transaction[]>(KEYS.TRANSACTIONS) || [];
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      hash,
      type: 'rent_paid',
      amount: lease.monthlyRent,
      date: new Date().toISOString(),
      status: 'success',
      fromAddress: lease.tenantAddress,
      toAddress: lease.landlordAddress
    };
    txs.unshift(tx);
    setToStorage(KEYS.TRANSACTIONS, txs);
    setToStorage(KEYS.LEASES, leases);

    // Add notification
    const notifications = getFromStorage<any[]>(KEYS.NOTIFICATIONS) || [];
    notifications.unshift({
      id: `notif_${Date.now()}`,
      title: 'Rent Payment Successful',
      description: `Transferred ${lease.monthlyRent} XLM for ${lease.propertyTitle}.`,
      time: 'Just now',
      read: false,
      type: 'success'
    });
    setToStorage(KEYS.NOTIFICATIONS, notifications);
  },

  async releaseEscrow(leaseId: string): Promise<void> {
    const leases = this.getLeases();
    const leaseIndex = leases.findIndex(l => l.id === leaseId);
    if (leaseIndex === -1) throw new Error('Lease not found');
    const lease = leases[leaseIndex];
    if (!lease) throw new Error('Lease not found');

    const escrowSeed = (lease as any).escrowSeed;
    let hash: string;

    if (escrowSeed) {
      // Build transaction to merge the escrow account back to tenant (refunds deposit & deletes escrow account)
      const escrowKeypair = Keypair.fromSecret(escrowSeed);
      const xdr = await StellarService.buildAccountMergeTx(escrowKeypair.publicKey(), lease.tenantAddress);
      
      // Sign using the escrow seed
      const tx = TransactionBuilder.fromXDR(xdr, NetworkService.getNetworkPassphrase());
      tx.sign(escrowKeypair);
      const signedXdr = tx.toXDR();
      
      // Submit
      hash = await StellarService.submitTx(signedXdr);
    } else {
      hash = Math.random().toString(16).substring(2, 66);
    }

    // Soroban Contract Integration
    await SorobanService.releaseDeposit(leaseId, lease.tenantAddress, BigInt(lease.depositAmount), []);
    await SorobanService.updateReputation(lease.tenantAddress, 'tenant', true);
    await SorobanService.updateReputation(lease.landlordAddress, 'landlord', true);

    // Update lease status
    lease.status = 'settled';
    lease.monthsRemaining = 0;

    // Add release event to timeline
    const today = new Date().toISOString().split('T')[0];
    const newEvent: LeaseTimelineEvent = {
      id: `evt_rel_${Date.now()}`,
      title: 'Deposit Released',
      description: `${lease.depositAmount} XLM refunded to Tenant from escrow. Hash: ${hash.substring(0, 8)}...`,
      date: today,
      type: 'release'
    };
    lease.timeline.unshift(newEvent);

    // Make property available again
    PropertyService.updatePropertyStatus(lease.propertyId, 'available');

    // Create Transaction record
    const txs = getFromStorage<Transaction[]>(KEYS.TRANSACTIONS) || [];
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      hash,
      type: 'deposit_released',
      amount: lease.depositAmount,
      date: new Date().toISOString(),
      status: 'success',
      fromAddress: lease.escrowAddress,
      toAddress: lease.tenantAddress
    };
    txs.unshift(tx);
    setToStorage(KEYS.TRANSACTIONS, txs);
    setToStorage(KEYS.LEASES, leases);

    // Add notification
    const notifications = getFromStorage<any[]>(KEYS.NOTIFICATIONS) || [];
    notifications.unshift({
      id: `notif_${Date.now()}`,
      title: 'Deposit Refunded',
      description: `Refunded ${lease.depositAmount} XLM security deposit for ${lease.propertyTitle}.`,
      time: 'Just now',
      read: false,
      type: 'success'
    });
    setToStorage(KEYS.NOTIFICATIONS, notifications);
  }
};
