import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperty } from '../context/PropertyContext';
import type { Property } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { PropertyCardSkeleton, EmptyState } from '../components/FeedbackStates';
import { useToast } from '../context/ToastContext';
import { useWallet } from '../context/WalletContext';
import { AnalyticsService } from '../services/analyticsService';

export const PropertiesPage: React.FC = () => {
  const { properties, addProperty } = useProperty();
  const { showToast } = useToast();
  const { wallet } = useWallet();
  const navigate = useNavigate();

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priceMax, setPriceMax] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Add Listing Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newType, setNewType] = useState<Property['type']>('Apartment');
  const [newPrice, setNewPrice] = useState(1500);
  const [newDeposit, setNewDeposit] = useState(3000);
  const [newBedrooms, setNewBedrooms] = useState(2);
  const [newBathrooms, setNewBathrooms] = useState(2);
  const [newSqft, setNewSqft] = useState(1000);
  const [newDescription, setNewDescription] = useState('');
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3');

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

  const handleTypeFilterChange = (val: string) => {
    setTypeFilter(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handlePriceMaxChange = (val: number) => {
    setPriceMax(val);
    setCurrentPage(1);
  };

  const handleSortByChange = (val: string) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  const filteredProperties = properties.filter((prop) => {
    const matchesSearch = 
      prop.title.toLowerCase().includes(search.toLowerCase()) || 
      prop.location.toLowerCase().includes(search.toLowerCase()) ||
      prop.description.toLowerCase().includes(search.toLowerCase()) ||
      prop.amenities.some(a => a.toLowerCase().includes(search.toLowerCase()));
    
    const matchesType = typeFilter === 'All' || prop.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || prop.status === statusFilter;
    const matchesPrice = prop.price <= priceMax;
    return matchesSearch && matchesType && matchesStatus && matchesPrice;
  });

  // Sorting
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === 'newest') {
      // Assuming higher id or reverse position is newer
      return b.id.localeCompare(a.id);
    }
    if (sortBy === 'oldest') {
      return a.id.localeCompare(b.id);
    }
    if (sortBy === 'rent_high') {
      return b.price - a.price;
    }
    if (sortBy === 'rent_low') {
      return a.price - b.price;
    }
    if (sortBy === 'deposit_high') {
      return b.deposit - a.deposit;
    }
    if (sortBy === 'deposit_low') {
      return a.deposit - b.deposit;
    }
    return 0;
  });

  // Pagination calculation
  const totalItems = sortedProperties.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProperties = sortedProperties.slice(startIndex, startIndex + itemsPerPage);

  const handleAddListing = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!newTitle.trim() || newTitle.length < 3) {
      showToast('Validation Error', 'error', 'Property title must be at least 3 characters long.');
      return;
    }
    if (!newLocation.trim() || newLocation.length < 5) {
      showToast('Validation Error', 'error', 'Property location must be at least 5 characters long.');
      return;
    }
    if (newPrice <= 0) {
      showToast('Validation Error', 'error', 'Monthly rent must be a positive number.');
      return;
    }
    if (newDeposit <= 0) {
      showToast('Validation Error', 'error', 'Security deposit must be a positive number.');
      return;
    }
    if (newBedrooms < 0 || newBathrooms < 0 || newSqft <= 0) {
      showToast('Validation Error', 'error', 'Please provide valid property size specifications.');
      return;
    }
    if (!newDescription.trim() || newDescription.length < 15) {
      showToast('Validation Error', 'error', 'Description must be at least 15 characters long.');
      return;
    }

    try {
      const createdProp = addProperty({
        title: newTitle.trim(),
        location: newLocation.trim(),
        type: newType,
        price: newPrice,
        deposit: newDeposit,
        status: 'available',
        description: newDescription.trim(),
        image: newImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        bedrooms: newBedrooms,
        bathrooms: newBathrooms,
        sqft: newSqft,
        amenities: ['Verified Lock', 'On-Chain Agreement', 'High-Speed Wifi']
      });

      showToast(
        'Property Listed', 
        'success', 
        `"${newTitle}" has been successfully added to the Stellar ledger.`
      );
      
      const mockTxHash = `c58a69e38e68407481ba82de292b23412574d6d67b2ff92e105e4c688ea5${createdProp.id.replace('p_', '')}`.substring(0, 64);
      AnalyticsService.trackWalletInteraction(
        wallet.address || 'GDWPNBABP2XCEA5X6W76YOBXHIQ2M5DY2WATOIK3F24UCNHN5MQN3RU3',
        'Create Property',
        mockTxHash
      );
      
      // Reset Form & Close
      setNewTitle('');
      setNewLocation('');
      setNewType('Apartment');
      setNewPrice(1500);
      setNewDeposit(3000);
      setNewBedrooms(2);
      setNewBathrooms(2);
      setNewSqft(1000);
      setNewDescription('');
      setIsAddModalOpen(false);
    } catch (err) {
      showToast(
        'Listing Failed', 
        'error', 
        'Unable to initialize smart escrow for listing. Please try again.'
      );
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setTypeFilter('All');
    setStatusFilter('All');
    setPriceMax(10000);
    setSortBy('newest');
    showToast('Filters Cleared', 'info', 'Search filters reset to default parameters.');
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg text-left fade-in">
      
      {/* Top Banner Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-on-surface">Browse Rentals</h2>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant mt-1">
            Explore verified real estate properties secured by neutral escrow deposits.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-sm focus:ring-2 focus:ring-primary focus:ring-offset-2 outline-none dark:focus:ring-offset-background"
          aria-label="List a new property on-chain"
        >
          <span className="material-symbols-outlined">add</span>
          List Property
        </button>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-surface-container-low dark:bg-surface-container border border-outline-variant dark:border-outline p-6 rounded-2xl mb-8 space-y-6">
        
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-4 top-3.5 text-on-surface-variant dark:text-on-surface-variant" aria-hidden="true">search</span>
            <input
              type="text"
              placeholder="Search by title, location, description, amenity..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-body-md text-on-surface"
              aria-label="Search properties"
            />
          </div>
          <div className="w-full sm:w-64">
            <select
              value={sortBy}
              onChange={(e) => handleSortByChange(e.target.value)}
              className="w-full px-4 py-3 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-on-surface"
              aria-label="Sort properties"
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

        {/* Multi-Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Type Filter */}
          <div>
            <label id="type-filter-label" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-2">Property Type</label>
            <select
              value={typeFilter}
              onChange={(e) => handleTypeFilterChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-on-surface"
              aria-labelledby="type-filter-label"
            >
              <option value="All">All Types</option>
              <option value="Apartment">Apartments</option>
              <option value="Villa">Villas</option>
              <option value="Office">Offices</option>
              <option value="Studio">Studios</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label id="status-filter-label" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-2">Lease Status</label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-on-surface"
              aria-labelledby="status-filter-label"
            >
              <option value="All">All Statuses</option>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="processing">Processing</option>
            </select>
          </div>

          {/* Max Price Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="price-range-slider" className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant">Max Monthly Rent</label>
              <span className="font-label-sm text-label-sm font-bold text-primary dark:text-primary-fixed">{priceMax.toLocaleString()} XLM</span>
            </div>
            <input
              id="price-range-slider"
              type="range"
              min="500"
              max="10000"
              step="100"
              value={priceMax}
              onChange={(e) => handlePriceMaxChange(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            />
          </div>
        </div>
      </div>

      {/* Grid List or loading loaders */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <PropertyCardSkeleton key={idx} />
          ))}
        </div>
      ) : paginatedProperties.length === 0 ? (
        <EmptyState
          icon="home_work"
          title="No Properties Found"
          description="We couldn't find any rentals matching your criteria. Try adjusting your filters or clearing them to start over."
          actionLabel="Clear Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProperties.map((prop) => (
              <div
                key={prop.id}
                onClick={() => navigate(`/property/${prop.id}`)}
                className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer flex flex-col justify-between focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 outline-none dark:focus-within:ring-offset-background"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/property/${prop.id}`);
                  }
                }}
                role="button"
                aria-label={`View details of property ${prop.title}`}
              >
                <div>
                  <div className="h-48 relative overflow-hidden">
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

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-primary/10 text-primary dark:text-primary-fixed text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                        Verifiable
                      </span>
                      {prop.verified && (
                        <span className="flex items-center gap-1 text-green-500 text-[10px] font-bold">
                          <span className="material-symbols-outlined text-[12px]">verified</span>
                          Landlord Verified
                        </span>
                      )}
                    </div>
                    <h3 className="font-headline-md text-[18px] font-bold text-on-surface dark:text-on-surface line-clamp-1">{prop.title}</h3>
                    <p className="text-body-sm text-on-surface-variant dark:text-on-surface-variant flex items-center mt-1">
                      <span className="material-symbols-outlined text-[16px] mr-1 text-primary" aria-hidden="true">location_on</span>
                      {prop.location}
                    </p>

                    <div className="flex gap-4 mt-4 text-on-surface-variant dark:text-on-surface-variant text-xs">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">bed</span>
                        {prop.bedrooms > 0 ? `${prop.bedrooms} Bed` : 'Studio'}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">bathtub</span>
                        {prop.bathrooms} Bath
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">square_foot</span>
                        {prop.sqft} Sq Ft
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4 border-t border-outline-variant dark:border-outline flex justify-between items-center">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant dark:text-on-surface-variant font-bold">Rent</p>
                    <p className="font-label-md text-label-md font-bold text-primary dark:text-primary-fixed">{prop.price.toLocaleString()} XLM/mo</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant dark:text-on-surface-variant font-bold">Deposit Escrow</p>
                    <p className="font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">{prop.deposit.toLocaleString()} XLM</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-outline-variant dark:border-outline">
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant">
                Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} properties
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-2 border border-outline-variant dark:border-outline hover:bg-surface-variant/50 rounded-lg text-on-surface transition-colors disabled:opacity-50 disabled:pointer-events-none focus:ring-2 focus:ring-primary outline-none"
                  aria-label="Previous Page"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="font-label-sm text-label-sm text-on-surface font-bold px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-2 border border-outline-variant dark:border-outline hover:bg-surface-variant/50 rounded-lg text-on-surface transition-colors disabled:opacity-50 disabled:pointer-events-none focus:ring-2 focus:ring-primary outline-none"
                  aria-label="Next Page"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Listing Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest dark:bg-surface-container-lowest w-full max-w-[500px] rounded-2xl shadow-2xl border border-outline-variant dark:border-outline p-6 my-8 text-left"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 id="modal-title" className="font-headline-md text-headline-md text-on-surface dark:text-on-surface font-bold">List a New Property</h2>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-surface-variant rounded-full text-on-surface focus:ring-2 focus:ring-primary outline-none"
                  aria-label="Close dialog"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleAddListing} className="space-y-4">
                <div>
                  <label htmlFor="new-title" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-1">Title</label>
                  <input
                    id="new-title"
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Modern Sunset Condo"
                    className="w-full px-4 py-2 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-on-surface"
                  />
                </div>

                <div>
                  <label htmlFor="new-location" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-1">Location</label>
                  <input
                    id="new-location"
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full px-4 py-2 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-on-surface"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="new-type" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-1">Type</label>
                    <select
                      id="new-type"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as Property['type'])}
                      className="w-full px-4 py-2 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-on-surface"
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="Villa">Villa</option>
                      <option value="Office">Office</option>
                      <option value="Studio">Studio</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="new-sqft" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-1">Sq Footage</label>
                    <input
                      id="new-sqft"
                      type="number"
                      required
                      value={newSqft}
                      onChange={(e) => setNewSqft(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-on-surface"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="new-price" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-1">Rent (XLM/mo)</label>
                    <input
                      id="new-price"
                      type="number"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-on-surface"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-deposit" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-1">Escrow Deposit (XLM)</label>
                    <input
                      id="new-deposit"
                      type="number"
                      required
                      value={newDeposit}
                      onChange={(e) => setNewDeposit(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-on-surface"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="new-bedrooms" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-1">Bedrooms</label>
                    <input
                      id="new-bedrooms"
                      type="number"
                      required
                      value={newBedrooms}
                      onChange={(e) => setNewBedrooms(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-on-surface"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-bathrooms" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-1">Bathrooms</label>
                    <input
                      id="new-bathrooms"
                      type="number"
                      required
                      value={newBathrooms}
                      onChange={(e) => setNewBathrooms(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-on-surface"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="new-image" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-1">Image URL</label>
                  <input
                    id="new-image"
                    type="url"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="https://example.com/property.jpg"
                    className="w-full px-4 py-2 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-on-surface text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="new-description" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-1">Description</label>
                  <textarea
                    id="new-description"
                    required
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Provide details about the space..."
                    className="w-full px-4 py-2 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-on-surface"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 border border-outline px-4 py-3 rounded-lg font-label-md text-label-md hover:bg-surface-variant/20 transition-all text-on-surface text-center outline-none focus:ring-2 focus:ring-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-on-primary font-label-md text-label-md px-4 py-3 rounded-lg hover:opacity-90 transition-all text-center outline-none focus:ring-2 focus:ring-primary"
                  >
                    Submit Listing
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
