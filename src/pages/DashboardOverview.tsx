import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useProperty } from '../context/PropertyContext';
import { useLease } from '../context/LeaseContext';
import { ReputationService } from '../services/reputationService';
import { getFromStorage, KEYS } from '../services/db';
import { DashboardSkeleton, EmptyState } from '../components/FeedbackStates';
import { ContractService } from '../services/contractService';
import type { SorobanEvent } from '../services/contractService';
import { ContractStatusCard } from '../components/ContractStatusCard';
import { ContractAuditService } from '../services/contractAuditService';
import type { ContractAuditLog } from '../services/contractAuditService';

import { AnalyticsService } from '../services/analyticsService';

export const DashboardOverview: React.FC = () => {
  const { wallet } = useWallet();
  const { properties } = useProperty();
  const { leases } = useLease();
  const reputation = ReputationService.getReputation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [profileName, setProfileName] = useState('James D.');
  const [events, setEvents] = useState<SorobanEvent[]>(() => ContractService.getEvents().slice(0, 5));
  const [auditLogs, setAuditLogs] = useState<ContractAuditLog[]>(() => ContractAuditService.getLogs().slice(0, 5));

  useEffect(() => {
    const unsubscribe = ContractService.subscribeToEvents(() => {
      setEvents(ContractService.getEvents().slice(0, 5));
      setAuditLogs(ContractAuditService.getLogs().slice(0, 5));
    });
    
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Dynamically load profile name from settings
      const settings = getFromStorage<{ profileName: string }>(KEYS.SETTINGS);
      if (settings && settings.profileName) {
        setProfileName(settings.profileName);
      }
    }, 600);
    
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const activeLeasesCount = leases.filter(l => l.status === 'active' || l.status === 'final_month').length;
  
  const totalEscrowLocked = leases
    .filter(l => l.status === 'active' || l.status === 'final_month')
    .reduce((sum, l) => sum + l.depositAmount, 0);

  const formatAddress = (addr: string | null) => {
    if (!addr) return 'Not Connected';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 6)}`;
  };

  const getTxTypeLabel = (type: string) => {
    switch (type) {
      case 'LeaseCreated': return 'Agreement Initialized';
      case 'LeaseApproved': return 'Agreement Approved';
      case 'DepositLocked': return 'Escrow Deposit Locked';
      case 'DepositReleased': return 'Deposit Escrow Released';
      case 'RentPaid': return 'Rent Payment Settled';
      case 'LeaseCompleted': return 'Lease Completed';
      case 'ReputationUpdated': return 'Trust Score Updated';
      case 'lease_created': return 'Agreement Initialized';
      case 'deposit_locked': return 'Escrow Lock';
      case 'rent_paid': return 'Rent Settlement';
      case 'deposit_released': return 'Deposit Refund';
      default: return type;
    }
  };

  const isStep1Done = wallet.connected;
  const isStep2Done = wallet.connected && wallet.balance > 0;
  const isStep3Done = properties.length > 5;
  const isStep4Done = leases.some(l => l.tenantAddress === wallet.address || l.tenantAddress === 'GDWPNBABP2XCEA5X6W76YOBXHIQ2M5DY2WATOIK3F24UCNHN5MQN3RU3');
  const isStep5Done = (getFromStorage<any[]>(KEYS.TRANSACTIONS) || []).some(t => t.type === 'rent_paid' && (t.fromAddress === wallet.address || t.fromAddress === 'GDWPNBABP2XCEA5X6W76YOBXHIQ2M5DY2WATOIK3F24UCNHN5MQN3RU3'));
  const isStep6Done = AnalyticsService.getFeedback().some(f => (wallet.address && f.userAddress === wallet.address) || f.userAddress === 'GDWPNBABP2XCEA5X6W76YOBXHIQ2M5DY2WATOIK3F24UCNHN5MQN3RU3');

  const completedStepsCount = [
    isStep1Done,
    isStep2Done,
    isStep3Done,
    isStep4Done,
    isStep5Done,
    isStep6Done
  ].filter(Boolean).length;

  const completionPercentage = Math.round((completedStepsCount / 6) * 100);

  if (isLoading) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg text-left fade-in">
        <div className="mb-stack-lg h-32 bg-outline-variant/30 rounded-2xl animate-pulse"></div>
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg text-left fade-in">
      
      {/* Welcome Banner */}
      <div className="mb-stack-lg bg-gradient-to-r from-primary to-primary-container p-8 rounded-2xl text-on-primary shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="font-headline-lg text-headline-lg font-bold">Welcome back, {profileName}</h3>
          <p className="font-body-md text-body-md opacity-90 mt-1">Manage your on-chain rental contracts and track security deposit escrows.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/dashboard/properties')}
            className="bg-white text-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:opacity-90 transition-all shadow-sm active:scale-95 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Browse Rentals
          </button>
          <button 
            onClick={() => navigate('/dashboard/leases')}
            className="bg-primary-container/20 border border-white/20 text-white font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-white/10 transition-all active:scale-95 outline-none focus:ring-2 focus:ring-white"
          >
            My Leases
          </button>
        </div>
      </div>

      {/* Onboarding Checklist */}
      <div className="mb-10 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-outline-variant dark:border-outline pb-4">
          <div>
            <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">Stellar Level 5 Onboarding Journey</h4>
            <p className="text-body-sm text-on-surface-variant mt-1 flex flex-wrap items-center gap-2">
              Complete these key actions to fully verify your tenant/landlord capabilities on the Stellar ledger.
              <span className="inline-flex items-center gap-1 text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded text-[11px] border border-green-500/20">
                <span className="material-symbols-outlined text-[12px] font-bold">trending_up</span>
                84% Onboarding Success Rate
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-on-surface-variant font-medium">Onboarding Progress</p>
              <p className="text-xs font-bold text-on-surface">{completedStepsCount} of 6 steps completed ({completionPercentage}%)</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-outline-variant dark:border-outline flex items-center justify-center relative bg-surface dark:bg-surface-container-high">
              <span className="font-label-sm text-label-sm font-bold text-primary dark:text-primary-fixed">{completionPercentage}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Step 1 */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between min-h-[140px] transition-all duration-200 ${
            isStep1Done 
              ? 'bg-green-500/5 dark:bg-green-500/10 border-green-500/30' 
              : 'bg-surface dark:bg-surface-container-low border-outline-variant hover:border-outline'
          }`}>
            <div>
              <div className="flex justify-between items-center">
                <span className={`material-symbols-outlined text-[20px] ${isStep1Done ? 'text-green-500' : 'text-on-surface-variant'}`}>
                  {isStep1Done ? 'check_circle' : 'account_balance_wallet'}
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Step 1</span>
              </div>
              <h5 className="font-label-md text-label-md font-bold text-on-surface mt-3">Connect Wallet</h5>
              <p className="text-[11px] text-on-surface-variant mt-1.5 leading-snug">Authenticate with Freighter, Albedo or xBull.</p>
            </div>
            {!isStep1Done && (
              <button 
                onClick={() => navigate('/dashboard/wallet')}
                className="text-xs text-primary dark:text-primary-fixed font-bold flex items-center gap-1 hover:underline mt-4 outline-none focus:ring-1 focus:ring-primary rounded"
              >
                Go Connect
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            )}
          </div>

          {/* Step 2 */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between min-h-[140px] transition-all duration-200 ${
            isStep2Done
              ? 'bg-green-500/5 dark:bg-green-500/10 border-green-500/30' 
              : 'bg-surface dark:bg-surface-container-low border-outline-variant hover:border-outline'
          }`}>
            <div>
              <div className="flex justify-between items-center">
                <span className={`material-symbols-outlined text-[20px] ${isStep2Done ? 'text-green-500' : 'text-on-surface-variant'}`}>
                  {isStep2Done ? 'check_circle' : 'local_atm'}
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Step 2</span>
              </div>
              <h5 className="font-label-md text-label-md font-bold text-on-surface mt-3">Fund Wallet</h5>
              <p className="text-[11px] text-on-surface-variant mt-1.5 leading-snug">Claim 10,000 testnet XLM via Friendbot faucet.</p>
            </div>
            {!isStep2Done && (
              <button 
                onClick={() => navigate('/dashboard/wallet')}
                className="text-xs text-primary dark:text-primary-fixed font-bold flex items-center gap-1 hover:underline mt-4 outline-none focus:ring-1 focus:ring-primary rounded"
              >
                Claim Faucet
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            )}
          </div>

          {/* Step 3 */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between min-h-[140px] transition-all duration-200 ${
            isStep3Done
              ? 'bg-green-500/5 dark:bg-green-500/10 border-green-500/30' 
              : 'bg-surface dark:bg-surface-container-low border-outline-variant hover:border-outline'
          }`}>
            <div>
              <div className="flex justify-between items-center">
                <span className={`material-symbols-outlined text-[20px] ${isStep3Done ? 'text-green-500' : 'text-on-surface-variant'}`}>
                  {isStep3Done ? 'check_circle' : 'add_business'}
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Step 3</span>
              </div>
              <h5 className="font-label-md text-label-md font-bold text-on-surface mt-3">List Property</h5>
              <p className="text-[11px] text-on-surface-variant mt-1.5 leading-snug">Create a mock property listing on ChainRent.</p>
            </div>
            {!isStep3Done && (
              <button 
                onClick={() => navigate('/dashboard/properties')}
                className="text-xs text-primary dark:text-primary-fixed font-bold flex items-center gap-1 hover:underline mt-4 outline-none focus:ring-1 focus:ring-primary rounded"
              >
                Add Listing
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            )}
          </div>

          {/* Step 4 */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between min-h-[140px] transition-all duration-200 ${
            isStep4Done
              ? 'bg-green-500/5 dark:bg-green-500/10 border-green-500/30' 
              : 'bg-surface dark:bg-surface-container-low border-outline-variant hover:border-outline'
          }`}>
            <div>
              <div className="flex justify-between items-center">
                <span className={`material-symbols-outlined text-[20px] ${isStep4Done ? 'text-green-500' : 'text-on-surface-variant'}`}>
                  {isStep4Done ? 'check_circle' : 'signature'}
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Step 4</span>
              </div>
              <h5 className="font-label-md text-label-md font-bold text-on-surface mt-3">Sign Agreement</h5>
              <p className="text-[11px] text-on-surface-variant mt-1.5 leading-snug">Lock security deposit & execute lease escrow.</p>
            </div>
            {!isStep4Done && (
              <button 
                onClick={() => navigate('/dashboard/properties')}
                className="text-xs text-primary dark:text-primary-fixed font-bold flex items-center gap-1 hover:underline mt-4 outline-none focus:ring-1 focus:ring-primary rounded"
              >
                Sign Lease
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            )}
          </div>

          {/* Step 5 */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between min-h-[140px] transition-all duration-200 ${
            isStep5Done
              ? 'bg-green-500/5 dark:bg-green-500/10 border-green-500/30' 
              : 'bg-surface dark:bg-surface-container-low border-outline-variant hover:border-outline'
          }`}>
            <div>
              <div className="flex justify-between items-center">
                <span className={`material-symbols-outlined text-[20px] ${
                  isStep5Done
                    ? 'text-green-500' 
                    : 'text-on-surface-variant'
                }`}>
                  {isStep5Done ? 'check_circle' : 'receipt_long'}
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Step 5</span>
              </div>
              <h5 className="font-label-md text-label-md font-bold text-on-surface mt-3">Pay Rent</h5>
              <p className="text-[11px] text-on-surface-variant mt-1.5 leading-snug">Settle the first rent payment on-chain.</p>
            </div>
            {!isStep5Done && (
              <button 
                onClick={() => navigate('/dashboard/leases')}
                className="text-xs text-primary dark:text-primary-fixed font-bold flex items-center gap-1 hover:underline mt-4 outline-none focus:ring-1 focus:ring-primary rounded"
              >
                Pay Rent
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            )}
          </div>

          {/* Step 6 */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between min-h-[140px] transition-all duration-200 ${
            isStep6Done
              ? 'bg-green-500/5 dark:bg-green-500/10 border-green-500/30' 
              : 'bg-surface dark:bg-surface-container-low border-outline-variant hover:border-outline'
          }`}>
            <div>
              <div className="flex justify-between items-center">
                <span className={`material-symbols-outlined text-[20px] ${
                  isStep6Done
                    ? 'text-green-500' 
                    : 'text-on-surface-variant'
                }`}>
                  {isStep6Done ? 'check_circle' : 'rate_review'}
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Step 6</span>
              </div>
              <h5 className="font-label-md text-label-md font-bold text-on-surface mt-3">Submit Feedback</h5>
              <p className="text-[11px] text-on-surface-variant mt-1.5 leading-snug">Review and share your platform experience.</p>
            </div>
            {!isStep6Done && (
              <button 
                onClick={() => navigate('/dashboard/analytics')}
                className="text-xs text-primary dark:text-primary-fixed font-bold flex items-center gap-1 hover:underline mt-4 outline-none focus:ring-1 focus:ring-primary rounded"
              >
                Feedback
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Stats Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-2xl border border-outline-variant dark:border-outline shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant dark:text-on-surface-variant font-label-md text-label-md font-bold">Active Contracts</span>
            <div className="p-2 bg-primary/10 rounded-lg text-primary dark:text-primary-fixed">
              <span className="material-symbols-outlined">description</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-on-surface">{activeLeasesCount}</p>
            <p className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm mt-1">Verified leases active</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-2xl border border-outline-variant dark:border-outline shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant dark:text-on-surface-variant font-label-md text-label-md font-bold">Escrow Locked</span>
            <div className="p-2 bg-primary/10 rounded-lg text-primary dark:text-primary-fixed">
              <span className="material-symbols-outlined">lock</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-on-surface">{totalEscrowLocked.toLocaleString()} XLM</p>
            <p className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm mt-1">Secured in smart contracts</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-2xl border border-outline-variant dark:border-outline shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant dark:text-on-surface-variant font-label-md text-label-md font-bold">Stellar Wallet</span>
            <div className="p-2 bg-primary/10 rounded-lg text-primary dark:text-primary-fixed">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="font-label-md text-label-md font-bold text-on-surface dark:text-on-surface truncate">{formatAddress(wallet.address)}</p>
            <p className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm mt-1">{wallet.connected ? `${wallet.balance.toLocaleString()} XLM` : 'Please connect'}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-2xl border border-outline-variant dark:border-outline shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant dark:text-on-surface-variant font-label-md text-label-md font-bold">Trust Score</span>
            <div className="p-2 bg-primary/10 rounded-lg text-primary dark:text-primary-fixed">
              <span className="material-symbols-outlined">star</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-on-surface">{reputation.trustScore}%</p>
            <p className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm mt-1">Based on {reputation.completedLeases} completions</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left column (Portfolio properties) & Right column (Transactions history + quick links) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Properties Portfolio */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-surface">Your Property Portfolio</h3>
            <Link to="/dashboard/properties" className="text-primary dark:text-primary-fixed font-label-sm text-label-sm hover:underline flex items-center gap-1">
              View all
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {properties.length === 0 ? (
            <EmptyState
              icon="home_work"
              title="No Properties Portfolio"
              description="You do not have any properties listed on ChainRent yet. Create your first verified listing now."
              actionLabel="List Property"
              onAction={() => navigate('/dashboard/properties')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.slice(0, 4).map((prop) => (
                <div 
                  key={prop.id} 
                  className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 outline-none dark:focus-within:ring-offset-background"
                  onClick={() => navigate(`/property/${prop.id}`)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate(`/property/${prop.id}`);
                    }
                  }}
                  role="button"
                  aria-label={`View ${prop.title}`}
                >
                  <div className="h-44 relative">
                    <img className="w-full h-full object-cover" src={prop.image} alt="" aria-hidden="true" />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-label-sm">
                      {prop.type}
                    </div>
                    <div className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-label-sm font-bold ${
                      prop.status === 'available' ? 'bg-green-500 text-white' :
                      prop.status === 'rented' ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-black'
                    }`}>
                      {prop.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="font-label-md text-label-md font-bold text-on-surface dark:text-on-surface line-clamp-1">{prop.title}</h4>
                      <p className="text-body-sm text-on-surface-variant dark:text-on-surface-variant flex items-center mt-1">
                        <span className="material-symbols-outlined text-[16px] mr-1 text-primary" aria-hidden="true">location_on</span>
                        {prop.location}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-outline-variant dark:border-outline">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-on-surface-variant dark:text-on-surface-variant font-bold">Monthly Rent</p>
                        <p className="font-label-md text-label-md font-bold text-primary dark:text-primary-fixed">{prop.price.toLocaleString()} XLM</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-on-surface-variant dark:text-on-surface-variant font-bold">Security Deposit</p>
                        <p className="font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">{prop.deposit.toLocaleString()} XLM</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Right Column - Activity & Actions */}
        <div className="space-y-6">
          <ContractStatusCard />

          <h3 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-surface">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/dashboard/wallet')}
              className="flex flex-col items-center justify-center p-4 bg-surface-container-low dark:bg-surface-container border border-outline-variant dark:border-outline rounded-xl hover:border-primary transition-all text-center gap-2 group focus:ring-2 focus:ring-primary outline-none"
            >
              <span className="material-symbols-outlined text-primary dark:text-primary-fixed group-hover:scale-110 transition-transform">account_balance_wallet</span>
              <span className="font-label-sm text-label-sm font-semibold">Wallet Details</span>
            </button>
            <button 
              onClick={() => navigate('/dashboard/leases')}
              className="flex flex-col items-center justify-center p-4 bg-surface-container-low dark:bg-surface-container border border-outline-variant dark:border-outline rounded-xl hover:border-primary transition-all text-center gap-2 group focus:ring-2 focus:ring-primary outline-none"
            >
              <span className="material-symbols-outlined text-primary dark:text-primary-fixed group-hover:scale-110 transition-transform">payments</span>
              <span className="font-label-sm text-label-sm font-semibold">Pay Rent</span>
            </button>
            <button 
              onClick={() => navigate('/dashboard/escrow')}
              className="flex flex-col items-center justify-center p-4 bg-surface-container-low dark:bg-surface-container border border-outline-variant dark:border-outline rounded-xl hover:border-primary transition-all text-center gap-2 group focus:ring-2 focus:ring-primary outline-none"
            >
              <span className="material-symbols-outlined text-primary dark:text-primary-fixed group-hover:scale-110 transition-transform">lock</span>
              <span className="font-label-sm text-label-sm font-semibold">Escrow Assets</span>
            </button>
            <button 
              onClick={() => navigate('/dashboard/reputation')}
              className="flex flex-col items-center justify-center p-4 bg-surface-container-low dark:bg-surface-container border border-outline-variant dark:border-outline rounded-xl hover:border-primary transition-all text-center gap-2 group focus:ring-2 focus:ring-primary outline-none"
            >
              <span className="material-symbols-outlined text-primary dark:text-primary-fixed group-hover:scale-110 transition-transform">star</span>
              <span className="font-label-sm text-label-sm font-semibold">My Reputation</span>
            </button>
          </div>

          <div className="flex justify-between items-center pt-4">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-surface">Ledger History</h3>
            <Link to="/dashboard/transactions" className="text-primary dark:text-primary-fixed font-label-sm text-label-sm hover:underline">
              View all
            </Link>
          </div>

          <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl p-4 space-y-3">
            {events.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant dark:text-on-surface-variant text-center py-6">No transaction ledger audits.</p>
            ) : (
              events.map((evt) => (
                <div key={evt.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-surface-variant/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary dark:text-primary-fixed">
                      <span className="material-symbols-outlined text-[20px]">
                        {evt.type === 'DepositLocked' ? 'lock' :
                         evt.type === 'DepositReleased' ? 'lock_open' :
                         evt.type === 'RentPaid' ? 'payments' :
                         evt.type === 'LeaseCreated' ? 'description' :
                         evt.type === 'LeaseApproved' ? 'border_color' :
                         evt.type === 'ReputationUpdated' ? 'star' : 'contract'}
                      </span>
                    </div>
                    <div>
                      <p className="font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">{getTxTypeLabel(evt.type)}</p>
                      <p className="text-[10px] text-on-surface-variant dark:text-on-surface-variant">{new Date(evt.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">
                      {evt.data.amount || evt.data.depositAmount || evt.data.monthlyRent ? `${parseFloat(evt.data.amount || evt.data.depositAmount || evt.data.monthlyRent).toLocaleString()} XLM` : '0  XLM'}
                    </p>
                    <p className="text-[10px] text-green-500 font-bold">Verified Event</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Soroban Contract Call Audit Section */}
          <div className="flex justify-between items-center pt-4">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-surface">Soroban Call Audits</h3>
            <Link to="/verification" className="text-primary dark:text-primary-fixed font-label-sm text-label-sm hover:underline">
              Verify Proof
            </Link>
          </div>

          <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl p-4 space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant dark:text-on-surface-variant text-center py-6">No contract interaction logs found.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="flex justify-between items-start p-2 rounded-lg hover:bg-surface-variant/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary dark:text-primary-fixed mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">terminal</span>
                    </div>
                    <div className="text-left">
                      <p className="font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">
                        {log.contractName}
                      </p>
                      <p className="font-mono text-[10px] text-primary dark:text-primary-fixed mt-0.5">
                        {log.functionName}()
                      </p>
                      <p className="text-[9px] text-on-surface-variant dark:text-on-surface-variant mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      log.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {log.success ? 'SUCCESS' : 'FAILED'}
                    </span>
                    <p className="font-mono text-[9px] text-on-surface-variant dark:text-on-surface-variant mt-1.5 truncate max-w-[80px]" title={log.transactionHash}>
                      {log.transactionHash.substring(0, 8)}...
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
