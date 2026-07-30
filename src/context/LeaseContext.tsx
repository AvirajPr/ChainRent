import React, { createContext, useContext, useState } from 'react';
import type { Lease } from '../types';
import { LeaseService } from '../services/leaseService';
import { useWallet } from './WalletContext';
import { useProperty } from './PropertyContext';

interface LeaseContextType {
  leases: Lease[];
  createLease: (propertyId: string, tenantName: string, tenantAddress: string, periodMonths: number) => Promise<Lease>;
  payRent: (leaseId: string) => Promise<void>;
  releaseEscrow: (leaseId: string) => Promise<void>;
  refreshLeases: () => void;
}

const LeaseContext = createContext<LeaseContextType | undefined>(undefined);

export const LeaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leases, setLeases] = useState<Lease[]>(() => LeaseService.getLeases());
  const { wallet, refreshWallet } = useWallet();
  const { refreshProperties } = useProperty();

  const refreshLeases = () => {
    setLeases(LeaseService.getLeases());
  };

  const createLease = async (propertyId: string, tenantName: string, tenantAddress: string, periodMonths: number) => {
    if (!wallet.provider) throw new Error('No wallet connected');
    const newLease = await LeaseService.createLease(propertyId, tenantName, tenantAddress, periodMonths, wallet.provider);
    refreshLeases();
    await refreshWallet();
    refreshProperties();
    return newLease;
  };

  const payRent = async (leaseId: string) => {
    if (!wallet.provider) throw new Error('No wallet connected');
    await LeaseService.payRent(leaseId, wallet.provider);
    refreshLeases();
    await refreshWallet();
  };

  const releaseEscrow = async (leaseId: string) => {
    await LeaseService.releaseEscrow(leaseId);
    refreshLeases();
    await refreshWallet();
    refreshProperties();
  };

  return (
    <LeaseContext.Provider value={{ leases, createLease, payRent, releaseEscrow, refreshLeases }}>
      {children}
    </LeaseContext.Provider>
  );
};

export const useLease = () => {
  const context = useContext(LeaseContext);
  if (!context) throw new Error('useLease must be used within a LeaseProvider');
  return context;
};
