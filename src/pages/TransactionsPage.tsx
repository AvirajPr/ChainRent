import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionService } from '../services/transactionService';
import { TableSkeleton, EmptyState } from '../components/FeedbackStates';
import { useToast } from '../context/ToastContext';
import { ExplorerService } from '../services/explorerService';
import { CONTRACT_IDS } from '../services/sorobanService';

export const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [transactions] = useState(() => TransactionService.getTransactions());
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  const handleFilterTypeChange = (val: string) => {
    setFilterType(val);
    setCurrentPage(1);
  };

  const handleSortByChange = (val: string) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  const handleCopy = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedTxId(id);
    showToast('Address Copied', 'success', 'Transaction ledger hash copied to clipboard.');
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  const getTxIcon = (type: string) => {
    switch (type) {
      case 'deposit_locked': return 'lock';
      case 'deposit_released': return 'lock_open';
      case 'rent_paid': return 'payments';
      default: return 'contract';
    }
  };

  const getTxTypeLabel = (type: string) => {
    switch (type) {
      case 'lease_created': return 'Lease Agreement Signed';
      case 'deposit_locked': return 'Deposit Locked in Escrow';
      case 'rent_paid': return 'Rent Payment Settled';
      case 'deposit_released': return 'Deposit Escrow Refunded';
      default: return type;
    }
  };

  // Search & Filter
  const filteredTxs = transactions.filter(tx => {
    const label = getTxTypeLabel(tx.type);
    const matchesSearch = 
      tx.hash.toLowerCase().includes(search.toLowerCase()) ||
      tx.fromAddress.toLowerCase().includes(search.toLowerCase()) ||
      tx.toAddress.toLowerCase().includes(search.toLowerCase()) ||
      label.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filterType === 'All' || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  // Sorting
  const sortedTxs = [...filteredTxs].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sortBy === 'amount_high') {
      return b.amount - a.amount;
    }
    if (sortBy === 'amount_low') {
      return a.amount - b.amount;
    }
    return 0;
  });

  // Pagination calculations
  const totalItems = sortedTxs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTxs = sortedTxs.slice(startIndex, startIndex + itemsPerPage);

  const handleClearFilters = () => {
    setSearch('');
    setFilterType('All');
    setSortBy('newest');
    showToast('Filters Cleared', 'info', 'Ledger audit search parameters reset.');
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg text-left fade-in">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-on-surface">Ledger Transaction History</h2>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant mt-1">
            Immutable Stellar network transaction history audit trail.
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-surface-container-low dark:bg-surface-container border border-outline-variant dark:border-outline p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <span className="material-symbols-outlined absolute left-4 top-2.5 text-on-surface-variant dark:text-on-surface-variant" aria-hidden="true">search</span>
          <input
            type="text"
            placeholder="Search by hash, addresses, or ledger operation type..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-2 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md text-on-surface"
            aria-label="Search ledger transactions"
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => handleFilterTypeChange(e.target.value)}
            className="flex-1 md:w-44 px-3 py-2 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl outline-none focus:border-primary text-body-sm text-on-surface"
            aria-label="Filter ledger operations"
          >
            <option value="All">All Operations</option>
            <option value="lease_created">Lease Signings</option>
            <option value="deposit_locked">Deposits Locked</option>
            <option value="rent_paid">Rent Payments</option>
            <option value="deposit_released">Deposits Released</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => handleSortByChange(e.target.value)}
            className="flex-1 md:w-44 px-3 py-2 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl outline-none focus:border-primary text-body-sm text-on-surface"
            aria-label="Sort transactions"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount_high">Highest Amount</option>
            <option value="amount_low">Lowest Amount</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon="receipt_long"
          title="No Transactions Found"
          description="We couldn't find any audited operations on the ledger."
          actionLabel="Browse Properties"
          onAction={() => navigate('/dashboard/properties')}
        />
      ) : filteredTxs.length === 0 ? (
        <EmptyState
          icon="search"
          title="No Matching Operations"
          description="No ledger transactions match your current search and filter criteria."
          actionLabel="Clear Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <>
          {/* Ledger History List */}
          <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant dark:border-outline bg-surface-container-low dark:bg-surface-container-high">
                    <th className="p-4 font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">Operation Type</th>
                    <th className="p-4 font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">Contract Invoked</th>
                    <th className="p-4 font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">Contract ID</th>
                    <th className="p-4 font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">Transaction Hash</th>
                    <th className="p-4 font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">Network</th>
                    <th className="p-4 font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">Amount</th>
                    <th className="p-4 font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">Status</th>
                    <th className="p-4 font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTxs.map((tx) => {
                    const isEscrowTx = tx.type === 'deposit_locked' || tx.type === 'deposit_released';
                    const contractInvoked = isEscrowTx ? 'Escrow Contract' : 'Lease Contract';
                    const contractId = isEscrowTx ? CONTRACT_IDS.ESCROW : CONTRACT_IDS.LEASE;
                    const network = 'Testnet';
                    
                    return (
                      <tr key={tx.id} className="border-b border-outline-variant dark:border-outline hover:bg-surface-variant/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary dark:text-primary-fixed">
                              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">{getTxIcon(tx.type)}</span>
                            </div>
                            <span className="font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">
                              {getTxTypeLabel(tx.type)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-xs font-semibold text-on-surface">
                          {contractInvoked}
                        </td>
                        <td className="p-4 font-mono text-xs text-on-surface-variant dark:text-on-surface-variant truncate max-w-[120px]" title={contractId}>
                          {contractId}
                        </td>
                        <td className="p-4 font-mono text-xs text-on-surface-variant dark:text-on-surface-variant truncate max-w-[120px]" title={tx.hash}>
                          {tx.hash}
                        </td>
                        <td className="p-4 text-xs font-semibold text-primary dark:text-primary-fixed">
                          {network}
                        </td>
                        <td className="p-4 font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">
                          {tx.amount > 0 ? `${tx.amount.toLocaleString()} XLM` : '0 XLM'}
                        </td>
                        <td className="p-4 text-xs font-bold text-green-500">
                          SUCCESS
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(tx.id, tx.hash)}
                              className="p-1 border border-outline-variant dark:border-outline hover:bg-surface-variant/50 rounded text-on-surface transition-colors flex items-center"
                              title="Copy Hash"
                              aria-label={`Copy transaction hash ${tx.hash}`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {copiedTxId === tx.id ? 'check' : 'content_copy'}
                              </span>
                            </button>
                            <a
                              href={ExplorerService.getTransactionUrl(tx.hash)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 border border-outline-variant dark:border-outline hover:bg-surface-variant/50 rounded text-on-surface transition-colors flex items-center"
                              title="Open Explorer"
                            >
                              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-outline-variant dark:border-outline">
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant">
                Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} transactions
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
