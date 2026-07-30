import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperty } from '../context/PropertyContext';
import { useWallet } from '../context/WalletContext';
import { useLease } from '../context/LeaseContext';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/FeedbackStates';
import { AnimatePresence, motion } from 'framer-motion';
import { AnalyticsService } from '../services/analyticsService';

export const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { properties } = useProperty();
  const { wallet, connectWallet } = useWallet();
  const { leases, createLease } = useLease();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const property = properties.find((p) => p.id === id);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [tenantName, setTenantName] = useState('James D.');
  const [duration, setDuration] = useState(12);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedTxHash, setGeneratedTxHash] = useState('');
  const [generatedEscrowAddress, setGeneratedEscrowAddress] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (isPageLoading) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg text-left fade-in">
        <div className="mb-6 h-6 w-32 bg-outline-variant/30 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[450px] bg-outline-variant/30 rounded-2xl animate-pulse"></div>
            <CardSkeleton />
          </div>
          <div className="space-y-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-20 text-center">
        <span className="material-symbols-outlined text-5xl text-outline" aria-hidden="true">error</span>
        <h3 className="font-headline-md text-headline-md font-bold mt-4 text-on-surface dark:text-on-surface">Property Not Found</h3>
        <button 
          onClick={() => navigate('/dashboard/properties')} 
          className="mt-6 bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-primary"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  // Find if there is an active lease for this property
  const activeLease = leases.find(l => l.propertyId === property.id && l.status !== 'settled');

  // Calculates end date based on startDate and duration
  const getEndDate = () => {
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + duration);
    return start.toISOString().split('T')[0];
  };

  const handleOpenWizard = () => {
    if (!wallet.connected) {
      showToast('Authentication Required', 'warning', 'Please connect your Stellar wallet first.');
      return;
    }
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleNextStep = () => {
    if (wizardStep === 2) {
      if (!tenantName.trim() || tenantName.length < 2) {
        showToast('Validation Error', 'error', 'Tenant name must be at least 2 characters.');
        return;
      }
      if (!wallet.address) {
        showToast('Validation Error', 'error', 'Stellar wallet address is missing. Please reconnect.');
        return;
      }
    }

    if (wizardStep === 3) {
      const today = new Date().toISOString().split('T')[0];
      if (startDate < today) {
        showToast('Validation Error', 'error', 'Lease start date cannot be in the past.');
        return;
      }
      if (wallet.balance < property.deposit) {
        showToast(
          'Insufficient Balance', 
          'error', 
          `You need at least ${property.deposit} XLM to cover the escrow deposit.`
        );
        return;
      }
    }

    setWizardStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setWizardStep(prev => prev - 1);
  };

  const handleExecuteLease = async () => {
    setIsSubmitting(true);
    showToast('Executing smart contract', 'info', 'Broadcasting lock transactions to Stellar ledger...');

    try {
      const lease = await createLease(property.id, tenantName, wallet.address || '', duration);
      
      // Extract transaction hash from timeline description
      const txMatch = lease.timeline[0]?.description.match(/Transaction:\s*([a-fA-F0-9]+)/) || [];
      const txHash = txMatch[1] || 'PENDING';
      
      setGeneratedTxHash(txHash);
      setGeneratedEscrowAddress(lease.escrowAddress);
      setIsSubmitting(false);
      setWizardStep(5);
      showToast(
        'Lease Initialized', 
        'success', 
        `Agreement signed for "${property.title}". Deposit locked in smart contract.`
      );
      AnalyticsService.trackWalletInteraction(wallet.address || '', 'Create Lease', txHash);
    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
      showToast('Agreement Failed', 'error', err.message || 'Smart contract execution on Stellar network rejected.');
    }
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg text-left fade-in">
      
      {/* Back button */}
      <button 
        onClick={() => navigate('/dashboard/properties')}
        className="flex items-center gap-1 text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed mb-6 font-label-sm text-label-sm focus:outline-none focus:ring-2 focus:ring-primary p-1 rounded"
        aria-label="Back to listings page"
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>
        Back to Listings
      </button>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Listing photos & descriptions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[300px] sm:h-[450px] w-full rounded-2xl overflow-hidden border border-outline-variant dark:border-outline shadow-sm bg-surface-container">
            <img className="w-full h-full object-cover" src={property.image} alt={property.title} />
          </div>

          <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline p-6 rounded-2xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-primary/10 text-primary dark:text-primary-fixed text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
                    {property.type}
                  </span>
                  <span className="bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    Title Deed Anchored
                  </span>
                </div>
                <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-on-surface mt-2">{property.title}</h1>
                <p className="text-body-md text-on-surface-variant dark:text-on-surface-variant flex items-center mt-2">
                  <span className="material-symbols-outlined text-[18px] mr-1 text-primary" aria-hidden="true">location_on</span>
                  {property.location}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs uppercase tracking-wider text-on-surface-variant dark:text-on-surface-variant font-bold">Monthly Rent</p>
                <p className="font-headline-lg text-headline-lg font-bold text-primary dark:text-primary-fixed mt-1">{property.price.toLocaleString()} XLM</p>
              </div>
            </div>

            {/* Room Features */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-outline-variant dark:border-outline text-center text-on-surface-variant dark:text-on-surface-variant">
              <div>
                <span className="material-symbols-outlined text-2xl mb-1 text-primary" aria-hidden="true">bed</span>
                <p className="font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">{property.bedrooms > 0 ? `${property.bedrooms} Bedrooms` : 'Studio'}</p>
              </div>
              <div>
                <span className="material-symbols-outlined text-2xl mb-1 text-primary" aria-hidden="true">bathtub</span>
                <p className="font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">{property.bathrooms} Bathrooms</p>
              </div>
              <div>
                <span className="material-symbols-outlined text-2xl mb-1 text-primary" aria-hidden="true">square_foot</span>
                <p className="font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">{property.sqft} Sq Ft</p>
              </div>
            </div>

            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-surface mb-3">About the Space</h3>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant leading-relaxed">
                {property.description}
              </p>
            </div>

            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-surface mb-3 font-semibold">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-surface dark:bg-surface-container-high rounded-xl border border-outline-variant dark:border-outline animate-fade-in">
                    <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">check_circle</span>
                    <span className="font-body-sm text-body-sm text-on-surface">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Escrow contract sign form */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-surface border-b border-outline-variant dark:border-outline pb-3">
              Lease Agreement
            </h3>

            {property.status === 'available' ? (
              <div className="space-y-4">
                <p className="text-body-sm text-on-surface-variant dark:text-on-surface-variant leading-relaxed">
                  This property is currently available for rent. You can sign an on-chain lease contract and secure it with a neutral escrow deposit.
                </p>
                <div className="bg-surface dark:bg-surface-container-high p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant dark:text-on-surface-variant">Security Deposit (Escrow)</span>
                    <span className="font-bold">{property.deposit.toLocaleString()} XLM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant dark:text-on-surface-variant">Monthly Rent</span>
                    <span className="font-bold">{property.price.toLocaleString()} XLM</span>
                  </div>
                </div>

                {wallet.connected ? (
                  <button
                    onClick={handleOpenWizard}
                    className="w-full bg-primary text-on-primary font-label-md text-label-md py-3.5 rounded-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary outline-none"
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">gavel</span>
                    Create & Sign Lease
                  </button>
                ) : (
                  <button
                    onClick={() => connectWallet('Freighter')}
                    className="w-full bg-primary text-on-primary font-label-md text-label-md py-3.5 rounded-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary outline-none"
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">account_balance_wallet</span>
                    Connect Wallet to Rent
                  </button>
                )}
              </div>
            ) : property.status === 'rented' ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined" aria-hidden="true">verified_user</span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">Lease is Active</h4>
                  <p className="text-body-sm text-on-surface-variant dark:text-on-surface-variant mt-1">This property is currently rented.</p>
                </div>
                {activeLease && (
                  <button
                    onClick={() => navigate('/dashboard/leases')}
                    className="w-full bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary font-label-md text-label-md py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all focus:ring-2 focus:ring-secondary outline-none"
                  >
                    Manage Active Lease
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <span className="material-symbols-outlined" aria-hidden="true">hourglass_empty</span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">Agreement Processing</h4>
                  <p className="text-body-sm text-on-surface-variant dark:text-on-surface-variant mt-1">Waiting for ledger validation on the Stellar network.</p>
                </div>
              </div>
            )}
          </div>

          {/* Landlord Card Info */}
          <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant pb-2">
              <h3 className="font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">Verified Landlord</h3>
              <span className="bg-green-500/10 text-green-500 border border-green-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[10px]">verified</span>
                ON-CHAIN VERIFIED
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary dark:text-primary-fixed rounded-full flex items-center justify-center font-bold">
                {property.ownerName.split(' ')[0][0]}
              </div>
              <div>
                <p className="font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">{property.ownerName}</p>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-yellow-500">
                  <span className="material-symbols-outlined text-[14px]" aria-hidden="true">star</span>
                  <span className="font-bold">{property.ownerRating} Rating</span>
                </div>
              </div>
            </div>
            
            {/* Reputation Highlights */}
            <div className="p-3 bg-surface dark:bg-surface-container-high rounded-xl border border-outline-variant/60 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">Stellar Trust Score:</span>
                <span className="font-bold text-green-500">98% (High)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">Completed Escrows:</span>
                <span className="font-bold text-on-surface">12 Successful</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">Resolution History:</span>
                <span className="font-bold text-on-surface">No Disputes</span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-on-surface-variant">Stellar Account</p>
              <div className="flex items-center gap-1.5 mt-1">
                <p className="text-[11px] font-mono bg-surface dark:bg-surface-container-high p-2 rounded border border-outline-variant dark:border-outline truncate flex-grow text-on-surface text-left" title={property.ownerAddress}>
                  {property.ownerAddress}
                </p>
                <a
                  href={`https://stellar.expert/explorer/testnet/account/${property.ownerAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 border border-outline-variant hover:bg-surface-variant/30 rounded text-on-surface-variant"
                  title="View on Stellar Expert"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>
            </div>
          </div>

          {/* Tenant Verification Card if wallet is connected */}
          {wallet.connected && (
            <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant pb-2">
                <h3 className="font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">Verified Tenant (You)</h3>
                <span className="bg-green-500/10 text-green-500 border border-green-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[10px]">verified</span>
                  ACTIVE WALLET
                </span>
              </div>
              
              <div className="p-3 bg-surface dark:bg-surface-container-high rounded-xl border border-outline-variant/60 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">Stellar Trust Score:</span>
                  <span className="font-bold text-green-500">95% (High)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">Payment History:</span>
                  <span className="font-bold text-green-500">100% On-Time</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* CREATE LEASE WIZARD MODAL */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="wizard-title">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest dark:bg-surface-container-lowest w-full max-w-[560px] rounded-2xl shadow-2xl border border-outline-variant dark:border-outline overflow-hidden text-left flex flex-col justify-between"
            >
              
              {/* Wizard Header */}
              <div className="p-6 border-b border-outline-variant dark:border-outline flex justify-between items-center bg-surface-container-low dark:bg-surface-container-high">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-primary dark:text-primary-fixed">Step {wizardStep} of 5</span>
                  <h2 id="wizard-title" className="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-surface mt-0.5">
                    {wizardStep === 1 && '1. Escrow Agreement Overview'}
                    {wizardStep === 2 && '2. Tenant Credentials'}
                    {wizardStep === 3 && '3. Start Date & Timeline'}
                    {wizardStep === 4 && '4. Review & Sign terms'}
                    {wizardStep === 5 && '5. Confirmation Receipt'}
                  </h2>
                </div>
                {wizardStep < 5 && (
                  <button
                    onClick={() => setIsWizardOpen(false)}
                    className="p-1.5 hover:bg-surface-variant rounded-full text-on-surface focus:ring-2 focus:ring-primary outline-none"
                    aria-label="Cancel Lease Wizard"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
              </div>

              {/* Wizard Content Body */}
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                
                {/* STEP 1: Property and Escrow Review */}
                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex gap-4 p-3 bg-surface dark:bg-surface-container-high rounded-xl border border-outline-variant dark:border-outline">
                      <img className="w-20 h-20 object-cover rounded-lg" src={property.image} alt="" />
                      <div>
                        <h4 className="font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">{property.title}</h4>
                        <p className="text-body-sm text-on-surface-variant dark:text-on-surface-variant mt-0.5">{property.location}</p>
                        <p className="text-xs font-bold text-primary mt-1">{property.price.toLocaleString()} XLM / month</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-2">
                      <h4 className="font-label-sm text-label-sm font-bold text-primary flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                        Stellar Neutral Escrow
                      </h4>
                      <p className="text-body-sm text-on-surface-variant dark:text-on-surface-variant leading-relaxed">
                        To lock this lease, a security deposit of <strong className="text-on-surface dark:text-on-surface">{property.deposit.toLocaleString()} XLM</strong> will be transferred into a secure, neutral Stellar escrow smart contract.
                      </p>
                      <p className="text-[11px] text-on-surface-variant dark:text-on-surface-variant italic">
                        The landlord cannot withdraw these funds without your mutual consent or contract termination parameters.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 2: Tenant details */}
                {wizardStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="wizard-tenant-name" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-1.5">Tenant Legal Name</label>
                      <input
                        id="wizard-tenant-name"
                        type="text"
                        required
                        value={tenantName}
                        onChange={(e) => setTenantName(e.target.value)}
                        placeholder="e.g. Emily Watson"
                        className="w-full px-4 py-2.5 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary text-body-md text-on-surface"
                      />
                    </div>
                    <div>
                      <label htmlFor="wizard-tenant-address" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-1.5">Connected Public Address</label>
                      <input
                        id="wizard-tenant-address"
                        type="text"
                        readOnly
                        value={wallet.address || ''}
                        className="w-full px-4 py-2.5 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-lg font-mono text-xs text-on-surface-variant outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="wizard-lease-duration" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-1.5">Lease Term Period</label>
                      <select
                        id="wizard-lease-duration"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary text-body-md text-on-surface"
                      >
                        <option value={3}>3 Months Term</option>
                        <option value={6}>6 Months Term</option>
                        <option value={12}>12 Months Term</option>
                        <option value={24}>24 Months Term</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* STEP 3: Timeline & dates */}
                {wizardStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="wizard-start-date" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-1.5">Lease Start Date</label>
                      <input
                        id="wizard-start-date"
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary text-body-md text-on-surface"
                      />
                    </div>

                    <div className="p-4 bg-surface dark:bg-surface-container-high rounded-xl border border-outline-variant dark:border-outline space-y-3">
                      <h4 className="font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">Timeline Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-on-surface-variant dark:text-on-surface-variant uppercase font-bold">Start Date</p>
                          <p className="font-bold mt-0.5 text-on-surface dark:text-on-surface">{startDate}</p>
                        </div>
                        <div>
                          <p className="text-on-surface-variant dark:text-on-surface-variant uppercase font-bold">Derived End Date</p>
                          <p className="font-bold mt-0.5 text-on-surface dark:text-on-surface">{getEndDate()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-surface dark:bg-surface-container-high rounded-xl border border-outline-variant dark:border-outline space-y-2 text-xs">
                      <h4 className="font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">Deposit Calculations</h4>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant dark:text-on-surface-variant">Security Escrow Deposit</span>
                        <span className="font-bold">{property.deposit.toLocaleString()} XLM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant dark:text-on-surface-variant">Stellar Transaction Fee</span>
                        <span className="text-green-500 font-bold">&lt; 0.01 XLM</span>
                      </div>
                      <div className="flex justify-between border-t border-outline-variant dark:border-outline pt-2 font-bold text-on-surface dark:text-on-surface">
                        <span>Total to Secure</span>
                        <span className="text-primary dark:text-primary-fixed">{property.deposit.toLocaleString()} XLM</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Review and smart Signature */}
                {wizardStep === 4 && (
                  <div className="space-y-4 text-xs">
                    <h4 className="font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">Verify Agreement Details</h4>
                    <div className="p-4 bg-surface dark:bg-surface-container-high rounded-xl border border-outline-variant dark:border-outline space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant dark:text-on-surface-variant">Property</span>
                        <span className="font-bold text-on-surface dark:text-on-surface">{property.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant dark:text-on-surface-variant">Tenant Name</span>
                        <span className="font-bold text-on-surface dark:text-on-surface">{tenantName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant dark:text-on-surface-variant">Lease Term</span>
                        <span className="font-bold text-on-surface dark:text-on-surface">{duration} Months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant dark:text-on-surface-variant">Start Date</span>
                        <span className="font-bold text-on-surface dark:text-on-surface">{startDate}</span>
                      </div>
                      <div className="flex justify-between border-t border-outline-variant dark:border-outline pt-2 font-label-md text-label-md">
                        <span className="font-bold text-on-surface dark:text-on-surface">Escrow Lock Amount</span>
                        <span className="font-bold text-primary dark:text-primary-fixed">{property.deposit.toLocaleString()} XLM</span>
                      </div>
                    </div>

                    <div className="p-3 bg-mono dark:bg-black/40 rounded-lg border border-outline font-mono text-[10px] text-on-surface-variant dark:text-on-surface-variant leading-relaxed">
                      {`// Stellar smart contract execution terms\n`}
                      {`const escrow = new EscrowContract({\n`}
                      {`  tenant: "${wallet.address?.substring(0, 12)}...",\n`}
                      {`  landlord: "${property.ownerAddress.substring(0, 12)}...",\n`}
                      {`  rentPrice: ${property.price},\n`}
                      {`  deposit: ${property.deposit},\n`}
                      {`  periodMonths: ${duration}\n`}
                      {`});\n`}
                      {`await escrow.lockDeposit();`}
                    </div>
                  </div>
                )}

                {/* STEP 5: Confirmation */}
                {wizardStep === 5 && (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-4xl" aria-hidden="true">check_circle</span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-surface">Lease successfully signed!</h3>
                      <p className="text-body-sm text-on-surface-variant dark:text-on-surface-variant mt-1.5">
                        Your deposit is now secured inside Stellar smart contract.
                      </p>
                    </div>

                    <div className="p-4 bg-surface dark:bg-surface-container-high rounded-xl border border-outline-variant dark:border-outline space-y-2.5 text-left text-xs font-mono">
                      <div>
                        <p className="text-[10px] uppercase font-bold font-sans text-on-surface-variant dark:text-on-surface-variant">Smart Escrow Address</p>
                        <p className="mt-0.5 text-on-surface dark:text-on-surface truncate" title={generatedEscrowAddress}>{generatedEscrowAddress}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold font-sans text-on-surface-variant dark:text-on-surface-variant">Stellar Transaction Hash</p>
                        <p className="mt-0.5 text-on-surface dark:text-on-surface truncate" title={generatedTxHash}>{generatedTxHash}</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Wizard Footer Controls */}
              <div className="p-6 border-t border-outline-variant dark:border-outline flex justify-end gap-3 bg-surface-container-low dark:bg-surface-container-high">
                {wizardStep > 1 && wizardStep < 5 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="border border-outline px-5 py-2.5 rounded-lg font-label-md text-label-md hover:bg-surface-variant/20 transition-all text-on-surface outline-none focus:ring-2 focus:ring-primary"
                  >
                    Back
                  </button>
                )}
                
                {wizardStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-lg hover:opacity-90 transition-all outline-none focus:ring-2 focus:ring-primary"
                  >
                    Continue
                  </button>
                ) : wizardStep === 4 ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleExecuteLease}
                    className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-lg hover:opacity-90 transition-all flex items-center gap-2 outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" aria-hidden="true"></span>
                        Executing...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined" aria-hidden="true">gavel</span>
                        Sign & Execute Agreement
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsWizardOpen(false);
                      navigate('/dashboard/leases');
                    }}
                    className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-lg hover:opacity-90 transition-all outline-none focus:ring-2 focus:ring-primary"
                  >
                    Go to My Leases
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
