import React, { useState, useEffect } from 'react';
import { ReputationService } from '../services/reputationService';
import { ReputationSkeleton, EmptyState } from '../components/FeedbackStates';
import { useToast } from '../context/ToastContext';

export const ReputationPage: React.FC = () => {
  const [reputation, setReputation] = useState(() => ReputationService.getReputation());
  const [newRating, setNewRating] = useState(5);
  const [newAuthor, setNewAuthor] = useState('James D.');
  const [newRole, setNewRole] = useState<'landlord' | 'tenant'>('tenant');
  const [newComment, setNewComment] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [ratingFilter, setRatingFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

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

  const handleRoleFilterChange = (val: string) => {
    setRoleFilter(val);
    setCurrentPage(1);
  };

  const handleRatingFilterChange = (val: string) => {
    setRatingFilter(val);
    setCurrentPage(1);
  };

  const handleSortByChange = (val: string) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  const handleLeaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!newAuthor.trim() || newAuthor.length < 2) {
      showToast('Validation Error', 'error', 'Author name must be at least 2 characters.');
      return;
    }
    if (newComment.trim().length < 10) {
      showToast('Validation Error', 'error', 'Review comment must be at least 10 characters.');
      return;
    }

    try {
      ReputationService.addReview(newRating, newComment.trim(), newRole, newAuthor.trim());
      
      // Refresh local state
      setReputation(ReputationService.getReputation());
      
      // Show Toast Feedback
      showToast(
        'Feedback Submitted', 
        'success', 
        `Review posted successfully. Trust rating sync complete.`
      );
      
      // Reset Form
      setNewRating(5);
      setNewComment('');
    } catch (err) {
      showToast(
        'Submission Failed', 
        'error', 
        'Unable to register review on the ledger.'
      );
    }
  };

  // Filter reviews
  const filteredReviews = reputation.reviews.filter(rev => {
    const matchesSearch = 
      rev.author.toLowerCase().includes(search.toLowerCase()) ||
      rev.role.toLowerCase().includes(search.toLowerCase()) ||
      rev.comment.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === 'All' || rev.role === roleFilter;
    const matchesRating = ratingFilter === 'All' || rev.rating === Number(ratingFilter);

    return matchesSearch && matchesRole && matchesRating;
  });

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.id.localeCompare(a.id);
    }
    if (sortBy === 'oldest') {
      return a.id.localeCompare(b.id);
    }
    if (sortBy === 'rating_high') {
      return b.rating - a.rating;
    }
    if (sortBy === 'rating_low') {
      return a.rating - b.rating;
    }
    return 0;
  });

  // Pagination calculations
  const totalItems = sortedReviews.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReviews = sortedReviews.slice(startIndex, startIndex + itemsPerPage);

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('All');
    setRatingFilter('All');
    setSortBy('newest');
    showToast('Filters Cleared', 'info', 'Reputation search parameters reset.');
  };

  if (isLoading) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg text-left fade-in">
        <div className="mb-8">
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-on-surface">Reputation Profile</h2>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant mt-1 animate-pulse">
            Syncing Stellar reputation record...
          </p>
        </div>
        <ReputationSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg text-left fade-in">
      
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-on-surface">Reputation Profile</h2>
        <p className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant mt-1">
          Track and build your Stellar on-chain tenant and landlord trust ratings.
        </p>
      </div>

      {/* Grid Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-2xl border border-outline-variant dark:border-outline shadow-sm text-center">
          <p className="text-on-surface-variant dark:text-on-surface-variant font-label-sm text-label-sm font-bold">Trust Score</p>
          <h3 className="font-headline-lg text-[40px] font-bold text-primary dark:text-primary-fixed mt-2">{reputation.trustScore}%</h3>
          <p className="text-body-sm text-on-surface-variant dark:text-on-surface-variant mt-1">Stellar network index rating</p>
        </div>
        <div className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-2xl border border-outline-variant dark:border-outline shadow-sm text-center">
          <p className="text-on-surface-variant dark:text-on-surface-variant font-label-sm text-label-sm font-bold">Tenant Rating</p>
          <h3 className="font-headline-lg text-[40px] font-bold text-on-surface dark:text-on-surface mt-2">{reputation.tenantRating} / 5</h3>
          <div className="flex justify-center gap-0.5 text-yellow-500 mt-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: i < Math.floor(reputation.tenantRating) ? "'FILL' 1" : "'FILL' 0" }} aria-hidden="true">star</span>
            ))}
          </div>
        </div>
        <div className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-2xl border border-outline-variant dark:border-outline shadow-sm text-center">
          <p className="text-on-surface-variant dark:text-on-surface-variant font-label-sm text-label-sm font-bold">Landlord Rating</p>
          <h3 className="font-headline-lg text-[40px] font-bold text-on-surface dark:text-on-surface mt-2">{reputation.landlordRating} / 5</h3>
          <div className="flex justify-center gap-0.5 text-yellow-500 mt-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: i < Math.floor(reputation.landlordRating) ? "'FILL' 1" : "'FILL' 0" }} aria-hidden="true">star</span>
            ))}
          </div>
        </div>
        <div className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-2xl border border-outline-variant dark:border-outline shadow-sm text-center">
          <p className="text-on-surface-variant dark:text-on-surface-variant font-label-sm text-label-sm font-bold">Completed Leases</p>
          <h3 className="font-headline-lg text-[40px] font-bold text-on-surface dark:text-on-surface mt-2">{reputation.completedLeases}</h3>
          <p className="text-body-sm text-on-surface-variant dark:text-on-surface-variant mt-1">Success settlements on-chain</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Reviews and Dispute History */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-surface mb-6">User Reviews</h3>

            {/* Search & Filters */}
            <div className="bg-surface-container-low dark:bg-surface-container border border-outline-variant dark:border-outline p-4 rounded-2xl mb-6 flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-grow w-full">
                <span className="material-symbols-outlined absolute left-4 top-2.5 text-on-surface-variant dark:text-on-surface-variant" aria-hidden="true">search</span>
                <input
                  type="text"
                  placeholder="Search reviews by author name, description..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md text-on-surface"
                  aria-label="Search reviews"
                />
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={roleFilter}
                  onChange={(e) => handleRoleFilterChange(e.target.value)}
                  className="flex-1 sm:w-32 px-3 py-2 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl outline-none focus:border-primary text-body-sm text-on-surface"
                  aria-label="Filter by Role"
                >
                  <option value="All">All Roles</option>
                  <option value="tenant">Tenant</option>
                  <option value="landlord">Landlord</option>
                </select>

                <select
                  value={ratingFilter}
                  onChange={(e) => handleRatingFilterChange(e.target.value)}
                  className="flex-1 sm:w-32 px-3 py-2 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl outline-none focus:border-primary text-body-sm text-on-surface"
                  aria-label="Filter by Rating"
                >
                  <option value="All">All Stars</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => handleSortByChange(e.target.value)}
                  className="flex-1 sm:w-28 px-2 py-2 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl outline-none focus:border-primary text-xs text-on-surface"
                  aria-label="Sort reviews"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="rating_high">Best Rating</option>
                  <option value="rating_low">Worst Rating</option>
                </select>
              </div>
            </div>

            {reputation.reviews.length === 0 ? (
              <EmptyState
                icon="reviews"
                title="No Reviews Found"
                description="There are no reputation reviews listed for your Stellar account address yet."
              />
            ) : filteredReviews.length === 0 ? (
              <EmptyState
                icon="search"
                title="No Matching Reviews"
                description="No reviews match your current search and filter criteria."
                actionLabel="Clear Filters"
                onAction={handleClearFilters}
              />
            ) : (
              <div className="space-y-4">
                {paginatedReviews.map((rev) => (
                  <div key={rev.id} className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary dark:text-primary-fixed rounded-full flex items-center justify-center font-bold">
                          {rev.author[0]}
                        </div>
                        <div>
                          <p className="font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">{rev.author}</p>
                          <p className="text-[10px] text-on-surface-variant dark:text-on-surface-variant uppercase font-bold tracking-wider">{rev.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex justify-end gap-0.5 text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: i < rev.rating ? "'FILL' 1" : "'FILL' 0" }} aria-hidden="true">star</span>
                          ))}
                        </div>
                        <span className="text-[10px] text-on-surface-variant dark:text-on-surface-variant mt-1 block">{rev.date}</span>
                      </div>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant italic leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center pt-4">
                    <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant">
                      Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} reviews
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
            )}
          </div>

          {/* Dispute History List */}
          <div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-surface mb-6">On-Chain Disputes</h3>
            <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant dark:border-outline bg-surface-container-low dark:bg-surface-container-high">
                    <th className="p-4 font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">Agreement Contract</th>
                    <th className="p-4 font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">Date</th>
                    <th className="p-4 font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">Escrow Dispute Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reputation.disputeHistory.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-body-md text-on-surface-variant dark:text-on-surface-variant">
                        No dispute claims associated with this profile.
                      </td>
                    </tr>
                  ) : (
                    reputation.disputeHistory.map((item) => (
                      <tr key={item.id} className="border-b border-outline-variant dark:border-outline hover:bg-surface-variant/30 transition-colors">
                        <td className="p-4 font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface">{item.title}</td>
                        <td className="p-4 text-xs text-on-surface-variant dark:text-on-surface-variant">{item.date}</td>
                        <td className="p-4">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
                            item.status === 'resolved' ? 'bg-green-500 text-white' : 'bg-outline-variant text-on-surface-variant dark:bg-surface-container-high dark:text-on-surface-variant'
                          }`}>
                            {item.status === 'resolved' ? 'Resolved' : 'No Dispute'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Form to leave a review */}
        <div>
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-surface mb-6 font-semibold">Write a Review</h3>
          <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline p-6 rounded-2xl shadow-sm">
            <form onSubmit={handleLeaveReview} className="space-y-4">
              <div>
                <label htmlFor="review-author" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-1">Author Name</label>
                <input
                  id="review-author"
                  type="text"
                  required
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary text-body-md text-on-surface"
                />
              </div>

              <div>
                <label htmlFor="review-role" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-1">Your Role</label>
                <select
                  id="review-role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'landlord' | 'tenant')}
                  className="w-full px-4 py-2.5 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary text-body-md text-on-surface"
                >
                  <option value="tenant">Tenant</option>
                  <option value="landlord">Landlord</option>
                </select>
              </div>

              <div>
                <label htmlFor="review-rating" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-1">Rating</label>
                <select
                  id="review-rating"
                  value={newRating}
                  onChange={(e) => setNewRating(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary text-body-md text-on-surface"
                >
                  <option value={5}>5 Stars - Outstanding</option>
                  <option value={4}>4 Stars - Very Good</option>
                  <option value={3}>3 Stars - Satisfactory</option>
                  <option value={2}>2 Stars - Needs Improvement</option>
                  <option value={1}>1 Star - Poor / Dispute</option>
                </select>
              </div>

              <div>
                <label htmlFor="review-comment" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-1">Review Description</label>
                <textarea
                  id="review-comment"
                  required
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share details of the lease transaction or property maintenance experience..."
                  className="w-full px-4 py-2.5 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary text-body-md text-on-surface"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all text-center focus:ring-2 focus:ring-primary outline-none"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};
