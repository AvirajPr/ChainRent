import React, { useState, useEffect } from 'react';
import { useLease } from '../context/LeaseContext';
import { TableSkeleton, EmptyState } from '../components/FeedbackStates';
import { useToast } from '../context/ToastContext';

export const EscrowPage: React.FC = () => {
  const { leases, releaseEscrow } = useLease();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter & Sort State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

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

  const activeEscrows = leases.filter(l => l.status === 'active' || l.status === 'final_month');
  const settledEscrows = leases.filter(l => l.status === 'settled');

  const totalLocked = activeEscrows.reduce((sum, l) => sum + l.depositAmount, 0);
  const totalRefunded = settledEscrows.reduce((sum, l) => sum + l.depositAmount, 0);

  const handleReleaseEscrow = (id: string, propTitle: string) => {
    try {
      releaseEscrow(id);
      showToast(
        'Escrow Released', 
        'success', 
        `Security deposit for "${propTitle}" released back to tenant.`
      );
    } catch (err) {
      showToast(
        'Release Failed', 
        'error', 
        'Unable to process escrow release. Please try again.'
      );
    }
  };

  const handleRaiseDispute = (propTitle: string) => {
    showToast(
      'Dispute Initialized',
      'warning',
      `Arbitration process initialized for "${propTitle}" escrow contract.`
    );
  };

  // Base list depending on status filter:
  // If 'active', show only active. If 'settled', show settled. If 'All', show both.
  const displayLeases = leases.filter(l => {
    if (statusFilter === 'active') return l.status === 'active' || l.status === 'final_month';
    if (statusFilter === 'settled') return l.status === 'settled';
    return true; // All
  });

  const filteredEscrows = displayLeases.filter(l => {
    const matchesSearch = 
      l.propertyTitle.toLowerCase().includes(search.toLowerCase()) ||
      l.escrowAddress.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  // Sorting
  const sortedEscrows = [...filteredEscrows].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.id.localeCompare(a.id);
    }
    if (sortBy === 'oldest') {
      return a.id.localeCompare(b.id);
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
  const totalItems = sortedEscrows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEscrows = sortedEscrows.slice(startIndex, startIndex + itemsPerPage);

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setSortBy('newest');
    showToast('Filters Cleared', 'info', 'Search filters reset to default parameters.');
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg text-left fade-in">
      
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-on-surface">Escrow Management</h2>
        <p className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant mt-1">
          Monitor locked rental security deposits secured in Stellar smart contract accounts.
        </p>
      </div>

      {isLoading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-outline-variant/30 h-28 rounded-2xl animate-pulse"></div>
            ))}
          </div>
          <TableSkeleton rows={3} />
        </>
      ) : (
        <>
          {/* Escrow Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-2xl border border-outline-variant dark:border-outline shadow-sm">
              <p className="text-on-surface-variant dark:text-on-surface-variant font-label-sm text-label-sm font-bold">Total Locked Value</p>
              <h3 className="font-headline-lg text-headline-lg font-bold text-primary dark:text-primary-fixed mt-2">{totalLocked.toLocaleString()} XLM</h3>
              <p className="text-body-sm text-on-surface-variant dark:text-on-surface-variant mt-1">Active security deposits</p>
            </div>
            <div className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-2xl border border-outline-variant dark:border-outline shadow-sm">
              <p className="text-on-surface-variant dark:text-on-surface-variant font-label-sm text-label-sm font-bold">Total Released (Refunded)</p>
              <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-on-surface mt-2">{totalRefunded.toLocaleString()} XLM</h3>
              <p className="text-body-sm text-on-surface-variant dark:text-on-surface-variant mt-1">Returned to tenants on completion</p>
            </div>
            <div className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-2xl border border-outline-variant dark:border-outline shadow-sm">
              <p className="text-on-surface-variant dark:text-on-surface-variant font-label-sm text-label-sm font-bold">Active Escrows</p>
              <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-on-surface mt-2">{activeEscrows.length}</h3>
              <p className="text-body-sm text-on-surface-variant dark:text-on-surface-variant mt-1">Smart contracts running</p>
            </div>
            <div className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-2xl border border-outline-variant dark:border-outline shadow-sm">
              <p className="text-on-surface-variant dark:text-on-surface-variant font-label-sm text-label-sm font-bold">Escrow Disputes</p>
              <h3 className="font-headline-lg text-headline-lg font-bold text-error mt-2">0</h3>
              <p className="text-body-sm text-on-surface-variant dark:text-on-surface-variant mt-1">Currently in arbitration</p>
            </div>
          </div>

          {/* Search, Filter, Sort Row */}
          <div className="bg-surface-container-low dark:bg-surface-container border border-outline-variant dark:border-outline p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
              <span className="material-symbols-outlined absolute left-4 top-2.5 text-on-surface-variant dark:text-on-surface-variant" aria-hidden="true">search</span>
              <input
                type="text"
                placeholder="Search by escrow address, property title or ID..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-2 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md text-on-surface"
                aria-label="Search escrows"
              />
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="flex-1 md:w-44 px-3 py-2 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl outline-none focus:border-primary text-body-sm text-on-surface"
                aria-label="Filter by Escrow Status"
              >
                <option value="All">All Escrows</option>
                <option value="active">Active</option>
                <option value="settled">Settled</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => handleSortByChange(e.target.value)}
                className="flex-1 md:w-44 px-3 py-2 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl outline-none focus:border-primary text-body-sm text-on-surface"
                aria-label="Sort escrows"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="deposit_high">Highest Deposit</option>
                <option value="deposit_low">Lowest Deposit</option>
              </select>
            </div>
          </div>

          {/* Escrow Details List */}
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-surface mb-6">Smart Escrow Accounts</h3>
          
          {leases.length === 0 ? (
            <EmptyState
              icon="lock"
              title="No Active Escrows"
              description="You do not have any security deposits locked in smart contracts currently. Set up a lease to initialize."
            />
          ) : filteredEscrows.length === 0 ? (
            <EmptyState
              icon="search"
              title="No Matching Escrows"
              description="No escrow accounts match your search and filter criteria."
              actionLabel="Clear Filters"
              onAction={handleClearFilters}
            />
          ) : (
            <div className="space-y-4">
              {paginatedEscrows.map((lease) => {
                const monthsPassed = lease.periodMonths - lease.monthsRemaining;
                const progressPct = (monthsPassed / lease.periodMonths) * 100;
                
                return (
                  <div 
                    key={lease.id} 
                    className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                  >
                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${lease.status === 'settled' ? 'bg-outline-variant' : 'bg-green-500'}`} aria-hidden="true"></span>
                        <h4 className="font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">{lease.propertyTitle} Escrow</h4>
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          lease.status === 'settled' ? 'bg-outline-variant text-on-surface-variant' : 'bg-green-500/10 text-green-500'
                        }`}>
                          {lease.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-1">
                        <div>
                          <p className="text-on-surface-variant dark:text-on-surface-variant">Escrow Address</p>
                          <p className="font-mono truncate max-w-[150px] font-bold mt-0.5" title={lease.escrowAddress}>{lease.escrowAddress}</p>
                        </div>
                        <div>
                          <p className="text-on-surface-variant dark:text-on-surface-variant">Security Locked</p>
                          <p className="font-bold text-primary dark:text-primary-fixed mt-0.5">{lease.depositAmount.toLocaleString()} XLM</p>
                        </div>
                        <div>
                          <p className="text-on-surface-variant dark:text-on-surface-variant font-bold">Arbitrator</p>
                          <p className="font-bold text-on-surface mt-0.5">ChainRent Protocol</p>
                        </div>
                      </div>

                      {/* Lease Progress */}
                      <div className="pt-2">
                        <div className="flex justify-between text-[10px] text-on-surface-variant dark:text-on-surface-variant mb-1 font-bold">
                          <span>Lease Progress ({monthsPassed}/{lease.periodMonths} Mo)</span>
                          <span>{Math.round(progressPct)}%</span>
                        </div>
                        <div className="w-full h-2 bg-surface-container-highest dark:bg-surface-container-high rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                            role="progressbar"
                            aria-valuenow={Math.round(progressPct)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      {lease.status !== 'settled' ? (
                        <>
                          <button
                            onClick={() => handleReleaseEscrow(lease.id, lease.propertyTitle)}
                            className="bg-primary text-on-primary font-label-sm text-label-sm px-6 py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all text-center focus:ring-2 focus:ring-primary outline-none"
                          >
                            Release Escrow
                          </button>
                          <button
                            onClick={() => handleRaiseDispute(lease.propertyTitle)}
                            className="border border-error text-error hover:bg-error-container/20 font-label-sm text-label-sm px-6 py-3 rounded-lg active:scale-95 transition-all text-center focus:ring-2 focus:ring-error outline-none"
                          >
                            Raise Dispute
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-on-surface-variant dark:text-on-surface-variant italic py-3">Escrow Deposit Settled & Refunded</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-outline-variant dark:border-outline">
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant">
                Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} escrows
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
        </>
      )}

    </div>
  );
};
