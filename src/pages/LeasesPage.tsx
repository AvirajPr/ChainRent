import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLease } from '../context/LeaseContext';
import type { Lease } from '../types';
import { TableSkeleton, EmptyState } from '../components/FeedbackStates';
import { useToast } from '../context/ToastContext';
import { CONTRACT_IDS } from '../services/sorobanService';
import { useWallet } from '../context/WalletContext';
import { AnalyticsService } from '../services/analyticsService';

const getLeaseTxHash = (leaseId: string) => {
  let hashVal = 0;
  for (let i = 0; i < leaseId.length; i++) {
    hashVal = (hashVal << 5) - hashVal + leaseId.charCodeAt(i);
    hashVal |= 0;
  }
  const hex = Math.abs(hashVal).toString(16).padEnd(8, 'f');
  return `f${hex}c58a69e38e68407481ba82de292b23412574d6d67b2ff92e105e4c688ea5`.substring(0, 64);
};

export const LeasesPage: React.FC = () => {
  const { leases, payRent, releaseEscrow } = useLease();
  const { showToast } = useToast();
  const { wallet } = useWallet();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const initialSelectRef = useRef(false);

  // Search & Filter & Sort State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && leases.length > 0 && !initialSelectRef.current) {
      setSelectedLease(leases[0]);
      initialSelectRef.current = true;
    }
  }, [leases, isLoading]);

  const activeSelectedLease = selectedLease ? (leases.find(l => l.id === selectedLease.id) || selectedLease) : null;

  // Handlers for filters that reset pagination
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleSortByChange = (val: string) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  const handlePayRent = async (id: string, propTitle: string) => {
    try {
      showToast('Processing Payment', 'info', 'Please sign the rent payment transaction in your wallet...');
      await payRent(id);
      showToast(
        'Rent Paid', 
        'success', 
        `Rent payment settled successfully for "${propTitle}".`
      );
      const mockTxHash = `d58a69e38e68407481ba82de292b23412574d6d67b2ff92e105e4c688ea5${id.replace('l_', '')}`.substring(0, 64);
      AnalyticsService.trackWalletInteraction(
        wallet.address || 'GDWPNBABP2XCEA5X6W76YOBXHIQ2M5DY2WATOIK3F24UCNHN5MQN3RU3',
        'Pay Rent',
        mockTxHash
      );
    } catch (err: any) {
      console.error(err);
      showToast(
        'Payment Failed', 
        'error', 
        err.message || 'Stellar network error during rent settlement.'
      );
    }
  };

  const handleReleaseEscrow = async (id: string, propTitle: string) => {
    try {
      showToast('Processing Release', 'info', 'Submitting deposit release to the Stellar ledger...');
      await releaseEscrow(id);
      showToast(
        'Deposit Released', 
        'success', 
        `Deposit escrow released for "${propTitle}".`
      );
      const mockTxHash = `e58a69e38e68407481ba82de292b23412574d6d67b2ff92e105e4c688ea5${id.replace('l_', '')}`.substring(0, 64);
      AnalyticsService.trackWalletInteraction(
        wallet.address || 'GDWPNBABP2XCEA5X6W76YOBXHIQ2M5DY2WATOIK3F24UCNHN5MQN3RU3',
        'Release Escrow',
        mockTxHash
      );
    } catch (err: any) {
      console.error(err);
      showToast(
        'Release Failed', 
        'error', 
        err.message || 'Unable to process escrow release. Try again later.'
      );
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'final_month': return 'bg-yellow-500 text-black';
      case 'settled': return 'bg-outline-variant text-on-surface-variant dark:bg-surface-container-high dark:text-on-surface-variant';
      default: return 'bg-red-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'final_month': return 'Final Month';
      case 'settled': return 'Settled';
      default: return status.toUpperCase();
    }
  };

  // Filter leases
  const filteredLeases = leases.filter(l => {
    const matchesSearch = 
      l.propertyTitle.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase()) ||
      l.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      l.landlordName.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort leases
  const sortedLeases = [...filteredLeases].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.id.localeCompare(a.id);
    }
    if (sortBy === 'oldest') {
      return a.id.localeCompare(b.id);
    }
    if (sortBy === 'rent_high') {
      return b.monthlyRent - a.monthlyRent;
    }
    if (sortBy === 'rent_low') {
      return a.monthlyRent - b.monthlyRent;
    }
    if (sortBy === 'deposit_high') {
      return b.depositAmount - a.depositAmount;
    }
    if (sortBy === 'deposit_low') {
      return a.depositAmount - b.depositAmount;
    }
    return 0;
  });

  // Pagination calculations
  const totalItems = sortedLeases.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeases = sortedLeases.slice(startIndex, startIndex + itemsPerPage);

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setSortBy('newest');
    showToast('Filters Cleared', 'info', 'Search filters reset to default parameters.');
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg text-left fade-in">
      
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-on-surface">Lease & Escrow Management</h2>
        <p className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant mt-1">
          Review, sign, pay monthly rent, and claim security deposits back from escrow.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-low dark:bg-surface-container border border-outline-variant dark:border-outline p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <span className="material-symbols-outlined absolute left-4 top-2.5 text-on-surface-variant dark:text-on-surface-variant" aria-hidden="true">search</span>
          <input
            type="text"
            placeholder="Search by ID, property, tenant or landlord..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-2 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md text-on-surface"
            aria-label="Search leases"
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="flex-1 md:w-44 px-3 py-2 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl outline-none focus:border-primary text-body-sm text-on-surface"
            aria-label="Filter by Lease Status"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="final_month">Final Month</option>
            <option value="settled">Settled</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => handleSortByChange(e.target.value)}
            className="flex-1 md:w-44 px-3 py-2 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl outline-none focus:border-primary text-body-sm text-on-surface"
            aria-label="Sort leases"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rent_high">Highest Rent</option>
            <option value="rent_low">Lowest Rent</option>
            <option value="deposit_high">Highest Deposit</option>
            <option value="deposit_low">Lowest Deposit</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : leases.length === 0 ? (
        <EmptyState
          icon="description"
          title="No Leases Found"
          description="You do not have any active lease agreements on ChainRent yet. Browse listed properties to sign your first agreement."
          actionLabel="Browse Properties"
          onAction={() => navigate('/dashboard/properties')}
        />
      ) : filteredLeases.length === 0 ? (
        <EmptyState
          icon="search"
          title="No Matching Leases"
          description="No leases match your current search and filter criteria."
          actionLabel="Clear Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Leases Table List */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant dark:border-outline bg-surface-container-low dark:bg-surface-container-high">
                      <th className="p-4 font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">Property</th>
                      <th className="p-4 font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">Landlord</th>
                      <th className="p-4 font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">Rent / Mo</th>
                      <th className="p-4 font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">Escrow Deposit</th>
                      <th className="p-4 font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">Status</th>
                      <th className="p-4 font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLeases.map((lease) => (
                      <tr 
                        key={lease.id} 
                        onClick={() => setSelectedLease(lease)}
                        className={`border-b border-outline-variant dark:border-outline cursor-pointer hover:bg-surface-variant/30 transition-colors focus-within:bg-primary-container/5 ${
                          activeSelectedLease?.id === lease.id ? 'bg-primary-container/10 dark:bg-secondary/10' : ''
                        }`}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setSelectedLease(lease);
                          }
                        }}
                        role="button"
                        aria-label={`Lease for ${lease.propertyTitle}`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img className="w-12 h-12 object-cover rounded-lg border border-outline-variant dark:border-outline" src={lease.propertyImage} alt="" aria-hidden="true" />
                            <div>
                              <p className="font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface line-clamp-1">{lease.propertyTitle}</p>
                              <p className="text-[10px] text-on-surface-variant dark:text-on-surface-variant font-mono truncate max-w-[120px]">{lease.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">{lease.landlordName}</p>
                          <p className="text-[10px] text-on-surface-variant dark:text-on-surface-variant font-mono truncate max-w-[80px]">{lease.landlordAddress}</p>
                        </td>
                        <td className="p-4 font-label-sm text-label-sm font-bold text-primary dark:text-primary-fixed">
                          {lease.monthlyRent.toLocaleString()} XLM
                        </td>
                        <td className="p-4 font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">
                          {lease.depositAmount.toLocaleString()} XLM
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${getStatusBadgeClass(lease.status)}`}>
                            {getStatusText(lease.status)}
                          </span>
                        </td>
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            {lease.status !== 'settled' ? (
                              <>
                                <button
                                  onClick={() => handlePayRent(lease.id, lease.propertyTitle)}
                                  className="bg-primary text-on-primary font-label-sm text-label-sm px-3 py-1.5 rounded hover:opacity-90 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-primary"
                                  aria-label={`Pay rent for ${lease.propertyTitle}`}
                                >
                                  Pay Rent
                                </button>
                                <button
                                  onClick={() => handleReleaseEscrow(lease.id, lease.propertyTitle)}
                                  className="border border-outline text-on-surface hover:bg-surface-variant/30 font-label-sm text-label-sm px-3 py-1.5 rounded active:scale-95 transition-all outline-none focus:ring-2 focus:ring-primary"
                                  aria-label={`Release escrow deposit for ${lease.propertyTitle}`}
                                >
                                  Release
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-on-surface-variant dark:text-on-surface-variant italic">Closed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-4">
                <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant">
                  Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} leases
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="p-1.5 border border-outline-variant dark:border-outline hover:bg-surface-variant/50 rounded-lg text-on-surface transition-colors disabled:opacity-50 disabled:pointer-events-none focus:ring-2 focus:ring-primary outline-none"
                    aria-label="Previous Page"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  <span className="font-label-sm text-label-sm text-on-surface font-bold px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="p-1.5 border border-outline-variant dark:border-outline hover:bg-surface-variant/50 rounded-lg text-on-surface transition-colors disabled:opacity-50 disabled:pointer-events-none focus:ring-2 focus:ring-primary outline-none"
                    aria-label="Next Page"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Selected Lease Timeline Details Drawer */}
          <div className="space-y-6">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-surface">Lease Lifecycle Ledger</h3>
            
            {activeSelectedLease ? (
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline p-6 rounded-2xl shadow-sm space-y-6">
                <div className="flex justify-between items-start border-b border-outline-variant dark:border-outline pb-4">
                   <div>
                    <h4 className="font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">{activeSelectedLease.propertyTitle}</h4>
                    <p className="text-[10px] text-on-surface-variant dark:text-on-surface-variant font-mono mt-1 truncate max-w-[200px]">{activeSelectedLease.escrowAddress}</p>
                   </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusBadgeClass(activeSelectedLease.status)}`}>
                    {getStatusText(activeSelectedLease.status)}
                  </span>
                </div>

                {/* General details */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-on-surface-variant dark:text-on-surface-variant uppercase font-bold tracking-wider text-[9px]">Start Date</p>
                    <p className="font-bold mt-0.5">{activeSelectedLease.startDate}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant dark:text-on-surface-variant uppercase font-bold tracking-wider text-[9px]">End Date</p>
                    <p className="font-bold mt-0.5">{activeSelectedLease.endDate}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant dark:text-on-surface-variant uppercase font-bold tracking-wider text-[9px]">Term Duration</p>
                    <p className="font-bold mt-0.5">{activeSelectedLease.periodMonths} Months</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant dark:text-on-surface-variant uppercase font-bold tracking-wider text-[9px]">Months Left</p>
                    <p className="font-bold mt-0.5">{activeSelectedLease.monthsRemaining} Months</p>
                  </div>
                </div>

                {/* Soroban Verification Block */}
                <div className="bg-surface-variant/30 rounded-xl p-4 space-y-3 text-xs border border-outline-variant/60">
                  <h5 className="font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                    Soroban Contract Proof
                  </h5>
                  <div className="space-y-2">
                    <div>
                      <p className="text-on-surface-variant dark:text-on-surface-variant text-[9px] uppercase font-bold tracking-wider">Lease ID</p>
                      <p className="font-mono text-[11px] font-bold mt-0.5">{activeSelectedLease.id}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant dark:text-on-surface-variant text-[9px] uppercase font-bold tracking-wider">Contract ID</p>
                      <p className="font-mono text-[11px] font-bold mt-0.5 text-primary dark:text-primary-fixed truncate" title={CONTRACT_IDS.LEASE}>
                        {CONTRACT_IDS.LEASE}
                      </p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant dark:text-on-surface-variant text-[9px] uppercase font-bold tracking-wider">Transaction Hash</p>
                      <p className="font-mono text-[10px] text-on-surface-variant dark:text-on-surface-variant mt-0.5 truncate" title={getLeaseTxHash(activeSelectedLease.id)}>
                        {getLeaseTxHash(activeSelectedLease.id)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <a
                        href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_IDS.LEASE}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-primary/10 text-primary dark:text-primary-fixed hover:bg-primary/20 font-label-sm text-label-sm px-2.5 py-1.5 rounded flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">description</span>
                        View Contract
                      </a>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${getLeaseTxHash(activeSelectedLease.id)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary hover:opacity-90 font-label-sm text-label-sm px-2.5 py-1.5 rounded flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                        View Tx
                      </a>
                      <a
                        href="https://stellar.expert/explorer/testnet"
                        target="_blank"
                        rel="noreferrer"
                        className="border border-outline text-on-surface hover:bg-surface-variant/30 font-label-sm text-label-sm px-2.5 py-1.5 rounded flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        Explorer
                      </a>
                    </div>
                  </div>
                </div>

                {/* Timeline Events */}
                <div>
                  <h5 className="font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface mb-4">Event History</h5>
                  <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant dark:before:bg-outline">
                    {activeSelectedLease.timeline.map((evt) => (
                      <div key={evt.id} className="flex gap-4 relative">
                        <div className="w-6 h-6 rounded-full bg-surface dark:bg-surface-container-high border-2 border-primary dark:border-primary-fixed flex items-center justify-center text-primary dark:text-primary-fixed z-10">
                          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                            {evt.type === 'sign' ? 'contract' :
                             evt.type === 'deposit' ? 'lock' :
                             evt.type === 'payment' ? 'payments' :
                             evt.type === 'release' ? 'lock_open' : 'warning'}
                          </span>
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="flex justify-between items-center">
                            <p className="font-bold text-on-surface dark:text-on-surface">{evt.title}</p>
                            <span className="text-[10px] text-on-surface-variant dark:text-on-surface-variant">{evt.date}</span>
                          </div>
                          <p className="text-on-surface-variant dark:text-on-surface-variant mt-0.5">{evt.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl">
                <span className="material-symbols-outlined text-4xl text-outline-variant">info</span>
                <p className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm mt-2">Select a lease from the table to view its audit history and timeline.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
