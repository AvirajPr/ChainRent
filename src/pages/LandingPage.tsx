import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useTheme } from '../context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  const { wallet, connectWallet, disconnectWallet } = useWallet();
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  useEffect(() => {
    if (wallet.connected) {
      const state = location.state as { from?: string };
      const destination = state?.from || '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [wallet.connected, navigate, location.state]);

  const handleWalletSelect = (provider: 'Freighter' | 'xBull' | 'Albedo') => {
    connectWallet(provider);
    setIsWalletModalOpen(false);
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  return (
    <div className="bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col transition-colors duration-200">
      
      {/* TopNavBar Navigation */}
      <nav className="bg-surface/85 dark:bg-surface-container-low/85 sticky top-0 backdrop-blur-md border-b border-outline-variant dark:border-outline z-50 transition-colors duration-200">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
          <div className="flex items-center gap-stack-md">
            <span className="text-headline-md font-headline-md font-bold text-primary dark:text-primary-fixed">ChainRent</span>
            <div className="hidden md:flex gap-6 ml-8">
              <Link className="text-primary dark:text-primary-fixed font-bold border-b-2 border-primary dark:border-primary-fixed pb-1 font-label-md text-label-md" to="/dashboard/properties">Properties</Link>
              <Link className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors font-label-md text-label-md" to="/dashboard/escrow">Escrow</Link>
              <Link className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors font-label-md text-label-md" to="/dashboard/reputation">Reputation</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-surface-variant/50 dark:hover:bg-surface-container-high/50 rounded-full transition-colors text-on-surface-variant dark:text-on-surface-variant"
            >
              <span className="material-symbols-outlined">contrast</span>
            </button>
            {wallet.connected ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard" className="bg-primary-container text-on-primary-container dark:bg-secondary dark:text-on-secondary px-4 py-2 rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all">
                  Dashboard
                </Link>
                <button onClick={handleDisconnect} className="border border-outline px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-surface-variant/20 active:scale-95 transition-all text-on-surface">
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsWalletModalOpen(true)}
                className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all duration-150 ease-out shadow-sm"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full text-left">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 blur-[100px] rounded-full"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary rounded-full mb-6 font-label-sm text-label-sm">
            <span className="w-2 h-2 bg-primary dark:bg-primary-fixed rounded-full animate-pulse"></span>
            Powered by Stellar Smart Contracts (Soroban)
          </div>
          <h1 className="font-display text-[40px] md:text-display leading-tight mb-6 max-w-3xl font-bold dark:text-on-surface">
            Rent Smarter. <br className="hidden md:block"/> <span className="text-primary dark:text-primary-fixed">Deposit Safer.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-on-surface-variant mb-10 max-w-2xl">
            The first decentralized rental marketplace that uses Stellar smart contracts to lock security deposits in a neutral escrow, ensuring fair refunds and absolute transparency for both parties.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <button 
              onClick={() => navigate('/dashboard/properties')}
              className="bg-primary text-on-primary dark:bg-primary-fixed dark:text-on-primary-fixed px-10 py-4 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95"
            >
              Browse Properties
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            {wallet.connected ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-surface-container-high text-on-surface dark:bg-surface-container dark:text-on-surface px-10 py-4 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-variant/50 transition-all active:scale-95 border border-outline-variant dark:border-outline"
              >
                Go to Dashboard
              </button>
            ) : (
              <button 
                onClick={() => setIsWalletModalOpen(true)}
                className="bg-surface-container-high text-on-surface dark:bg-surface-container dark:text-on-surface px-10 py-4 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-variant/50 transition-all active:scale-95 border border-outline-variant dark:border-outline"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Bento Preview */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-12 gap-gutter w-full text-left">
            <div className="md:col-span-8 h-[400px] rounded-2xl overflow-hidden relative border border-outline-variant dark:border-outline shadow-sm group">
              <img 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                alt="Horizon Peak Penthouse" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsrAkT2yhKRMxhxo4bSDHV7Opd7m1amQ9MaUB5qV0RMgoSbxycR2FEYiakPadTQZSFUVD16YWxkLXL-bP_3OPvTRI2s1m_cEsrWAoErTA2YeYmjteM1l8dyyIqOv4NQomDK76dNPhQ_c3PWvzSOz_uV0hGZzxeWDJUafr5DPnQJzL2cHPO8p312nMsMkxh_7B6O8no3XPAxHPbxoGTajk5GTu7H8h71bJYuqmMw1oJ3Xo8AzMBztD5TJMICuCPjLKbcJBQV2SZo2k"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="font-label-md text-label-md opacity-80">Featured Listing</p>
                    <h3 className="font-headline-md text-headline-md font-bold">Horizon Peak Penthouse</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-label-sm text-label-sm opacity-80">Security Deposit</p>
                    <p className="font-headline-md text-headline-md font-bold text-primary-fixed">1,200 XLM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 grid grid-rows-2 gap-gutter">
              <div className="bg-surface-container-lowest dark:bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant dark:border-outline shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-primary/10 dark:bg-primary-fixed/20 rounded-lg">
                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed">verified_user</span>
                  </div>
                  <span className="text-on-surface-variant dark:text-on-surface-variant font-label-sm text-label-sm">Active Contracts</span>
                </div>
                <div>
                  <p className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-on-surface">4,821</p>
                  <p className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm mt-1">Legally binding on-chain leases</p>
                </div>
              </div>
              <div className="bg-primary dark:bg-primary-container p-6 rounded-2xl shadow-lg flex flex-col justify-between text-on-primary">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                  </div>
                  <span className="text-on-primary/80 dark:text-on-primary-container/80 font-label-sm text-label-sm">Total Value Locked</span>
                </div>
                <div>
                  <p className="font-headline-lg text-headline-lg font-bold">8.4M XLM</p>
                  <p className="text-on-primary/80 dark:text-on-primary-container/80 font-body-sm text-body-sm mt-1">Secured in Stellar Escrows</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Problems Section */}
      <section className="py-24 bg-surface-container-low dark:bg-surface-container-lowest px-margin-mobile md:px-margin-desktop w-full border-y border-outline-variant dark:border-outline text-left">
        <div className="max-w-container-max mx-auto">
          <div className="mb-16">
            <h2 className="font-headline-lg text-headline-lg mb-4 text-on-surface dark:text-on-surface font-bold">Old Rentals are Broken.</h2>
            <p className="text-on-surface-variant dark:text-on-surface-variant font-body-md text-body-md max-w-xl">Traditional rental markets suffer from trust issues that cost tenants and landlords millions in legal fees and lost deposits.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="glass-card p-8 rounded-2xl group hover:border-primary/30 transition-all">
              <div className="w-12 h-12 bg-error/10 text-error rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined">gavel</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-3 text-on-surface dark:text-on-surface font-bold">Deposit Disputes</h3>
              <p className="text-on-surface-variant dark:text-on-surface-variant font-body-md text-body-md">Landlords often withhold deposits without valid evidence, leaving tenants with few options but expensive litigation.</p>
            </div>
            <div className="glass-card p-8 rounded-2xl group hover:border-primary/30 transition-all">
              <div className="w-12 h-12 bg-error/10 text-error rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-3 text-on-surface dark:text-on-surface font-bold">Delayed Refunds</h3>
              <p className="text-on-surface-variant dark:text-on-surface-variant font-body-md text-body-md">Wait weeks or months for your money to be returned while bank transfers crawl through legacy financial systems.</p>
            </div>
            <div className="glass-card p-8 rounded-2xl group hover:border-primary/30 transition-all">
              <div className="w-12 h-12 bg-error/10 text-error rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined">visibility_off</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-3 text-on-surface dark:text-on-surface font-bold">Zero Transparency</h3>
              <p className="text-on-surface-variant dark:text-on-surface-variant font-body-md text-body-md">Paper contracts are easily lost or altered. There is no immutable record of property condition or payment history.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Timeline) */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full overflow-hidden text-center">
        <div className="mb-20">
          <h2 className="font-headline-lg text-headline-lg mb-4 text-on-surface dark:text-on-surface font-bold">A Frictionless Lifecycle</h2>
          <p className="text-on-surface-variant dark:text-on-surface-variant font-body-md text-body-md">Four simple steps to secure your next home on the blockchain.</p>
        </div>
        <div className="relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-outline-variant dark:bg-outline hidden md:block"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter relative z-10">
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 bg-surface-container-highest dark:bg-surface-container rounded-full border-4 border-background flex items-center justify-center mb-6 group-hover:bg-primary dark:group-hover:bg-primary-fixed group-hover:text-on-primary transition-all duration-300">
                <span className="material-symbols-outlined text-2xl">contract</span>
              </div>
              <h4 className="font-label-md text-label-md font-bold mb-2 text-on-surface dark:text-on-surface">1. Create Lease</h4>
              <p className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm px-4">Generate an immutable agreement with custom terms and conditions.</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 bg-surface-container-highest dark:bg-surface-container rounded-full border-4 border-background flex items-center justify-center mb-6 group-hover:bg-primary dark:group-hover:bg-primary-fixed group-hover:text-on-primary transition-all duration-300">
                <span className="material-symbols-outlined text-2xl">lock</span>
              </div>
              <h4 className="font-label-md text-label-md font-bold mb-2 text-on-surface dark:text-on-surface">2. Lock Deposit</h4>
              <p className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm px-4">Assets are sent to a neutral Soroban smart contract escrow.</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 bg-surface-container-highest dark:bg-surface-container rounded-full border-4 border-background flex items-center justify-center mb-6 group-hover:bg-primary dark:group-hover:bg-primary-fixed group-hover:text-on-primary transition-all duration-300">
                <span className="material-symbols-outlined text-2xl">payments</span>
              </div>
              <h4 className="font-label-md text-label-md font-bold mb-2 text-on-surface dark:text-on-surface">3. Manage Rent</h4>
              <p className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm px-4">Automate monthly payments and track maintenance on-chain.</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 bg-surface-container-highest dark:bg-surface-container rounded-full border-4 border-background flex items-center justify-center mb-6 group-hover:bg-primary dark:group-hover:bg-primary-fixed group-hover:text-on-primary transition-all duration-300">
                <span className="material-symbols-outlined text-2xl">lock_open</span>
              </div>
              <h4 className="font-label-md text-label-md font-bold mb-2 text-on-surface dark:text-on-surface">4. Release Funds</h4>
              <p className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm px-4">Refund deposit immediately on verified digital release sign-off.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 bg-surface dark:bg-surface-container-low/40 px-margin-mobile md:px-margin-desktop w-full border-t border-outline-variant dark:border-outline text-left">
        <div className="max-w-container-max mx-auto">
          <h2 className="font-headline-lg text-headline-lg mb-16 text-center text-on-surface dark:text-on-surface font-bold">Institutional Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest dark:bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant dark:border-outline hover:shadow-lg transition-all md:row-span-2 flex flex-col">
              <div className="p-4 bg-primary/10 dark:bg-primary-fixed/20 w-fit rounded-2xl mb-8">
                <span className="material-symbols-outlined text-3xl text-primary dark:text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              </div>
              <h3 className="font-headline-md text-headline-md font-bold mb-4 text-on-surface dark:text-on-surface">Smart Deposit Escrow</h3>
              <p className="text-on-surface-variant dark:text-on-surface-variant font-body-md text-body-md flex-grow">Our proprietary Soroban contracts hold deposits in a trustless environment. Funds can only be released via multi-signature approval or predefined arbitration rules.</p>
              <div className="mt-8 pt-8 border-t border-outline-variant dark:border-outline">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-label-sm text-label-sm text-on-surface dark:text-on-surface-variant">Audited by Stellar Security</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest dark:bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant dark:border-outline hover:shadow-lg transition-all flex items-start gap-6">
              <div className="p-3 bg-secondary-container dark:bg-secondary rounded-xl text-on-secondary-container dark:text-on-secondary flex-shrink-0">
                <span className="material-symbols-outlined">description</span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md font-bold mb-2 text-on-surface dark:text-on-surface">Transparent Agreements</h3>
                <p className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm">Every clause is timestamped and hashed on the ledger, making it impossible to dispute original terms.</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest dark:bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant dark:border-outline hover:shadow-lg transition-all flex items-start gap-6">
              <div className="p-3 bg-secondary-container dark:bg-secondary rounded-xl text-on-secondary-container dark:text-on-secondary flex-shrink-0">
                <span className="material-symbols-outlined">analytics</span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md font-bold mb-2 text-on-surface dark:text-on-surface">Real-Time Tracking</h3>
                <p className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm">Live dashboard showing payment status, escrow balances, and legal deadlines for all properties.</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest dark:bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant dark:border-outline hover:shadow-lg transition-all flex items-start gap-6">
              <div className="p-3 bg-secondary-container dark:bg-secondary rounded-xl text-on-secondary-container dark:text-on-secondary flex-shrink-0">
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md font-bold mb-2 text-on-surface dark:text-on-surface">Multi-Wallet Support</h3>
                <p className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm">Seamlessly connect with Freighter, Albedo, or xBull. Hardware wallet support included.</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest dark:bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant dark:border-outline hover:shadow-lg transition-all flex items-start gap-6">
              <div className="p-3 bg-secondary-container dark:bg-secondary rounded-xl text-on-secondary-container dark:text-on-secondary flex-shrink-0">
                <span className="material-symbols-outlined">star</span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md font-bold mb-2 text-on-surface dark:text-on-surface">Reputation System</h3>
                <p className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm">Build your tenant or landlord score based on successful on-chain settlements and clean histories.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Stellar */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-on-background dark:bg-surface-container-lowest text-white dark:text-on-background relative overflow-hidden w-full text-left">
        <div className="max-w-container-max mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-headline-lg md:text-[48px] leading-tight mb-8 font-bold text-white dark:text-on-surface">Built on Stellar. <br/>Refined for Real Estate.</h2>
              <p className="font-body-lg text-body-lg text-white/70 dark:text-on-surface-variant/80 mb-12">We chose the Stellar network for its focus on real-world asset tokenization and high-speed settlement.</p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-primary-fixed dark:text-primary font-headline-md text-headline-md font-bold">5s</p>
                  <p className="text-white/60 dark:text-on-surface-variant font-label-md text-label-md">Settlement Time</p>
                </div>
                <div>
                  <p className="text-primary-fixed dark:text-primary font-headline-md text-headline-md font-bold">&lt;$0.01</p>
                  <p className="text-white/60 dark:text-on-surface-variant font-label-md text-label-md">Average Fee</p>
                </div>
                <div>
                  <p className="text-primary-fixed dark:text-primary font-headline-md text-headline-md font-bold">Soroban</p>
                  <p className="text-white/60 dark:text-on-surface-variant font-label-md text-label-md">Native Smart Contracts</p>
                </div>
                <div>
                  <p className="text-primary-fixed dark:text-primary font-headline-md text-headline-md font-bold">Global</p>
                  <p className="text-white/60 dark:text-on-surface-variant font-label-md text-label-md">Compliance Ready</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary to-primary-container rounded-[40px] flex items-center justify-center shadow-2xl rotate-3">
                <div className="text-center p-12 -rotate-3 text-white">
                  <span className="material-symbols-outlined text-[80px] mb-6">rocket_launch</span>
                  <h3 className="font-headline-md text-headline-md font-bold mb-4">Enterprise Scaling</h3>
                  <p className="text-white/80 font-body-md text-body-md">Handling thousands of concurrent lease operations without network congestion or fee spikes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto w-full text-left">
        <h2 className="font-headline-lg text-headline-lg text-center mb-16 text-on-surface dark:text-on-surface font-bold">Common Questions</h2>
        <div className="space-y-4">
          <details className="group bg-surface-container-low dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl overflow-hidden" open>
            <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-surface-variant/30 transition-all list-none outline-none">
              <span className="font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">What happens if there is a dispute?</span>
              <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
            </summary>
            <div className="p-6 pt-0 text-on-surface-variant dark:text-on-surface-variant font-body-md text-body-md">
              ChainRent features a community-driven arbitration layer and an integration with professional legal mediators. If a dispute occurs, evidence is submitted on-chain and the escrow remains locked until a resolution is reached.
            </div>
          </details>
          <details className="group bg-surface-container-low dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl overflow-hidden">
            <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-surface-variant/30 transition-all list-none outline-none">
              <span className="font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">Do I need to own XLM to use ChainRent?</span>
              <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
            </summary>
            <div className="p-6 pt-0 text-on-surface-variant dark:text-on-surface-variant font-body-md text-body-md">
              While the network uses XLM for gas fees, our platform supports Stellar asset anchors, allowing you to pay rent and hold deposits in USDC or other local currency stablecoins.
            </div>
          </details>
          <details className="group bg-surface-container-low dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl overflow-hidden">
            <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-surface-variant/30 transition-all list-none outline-none">
              <span className="font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">Is my personal data stored on the blockchain?</span>
              <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
            </summary>
            <div className="p-6 pt-0 text-on-surface-variant dark:text-on-surface-variant font-body-md text-body-md">
              No. We follow a privacy-first approach. Only agreement hashes and financial transaction IDs are stored on-chain. Sensitive documents are encrypted and stored via IPFS or secure off-chain storage with your private keys.
            </div>
          </details>
        </div>
      </section>

      {/* Footer Navigation */}
      <footer className="bg-surface-container-highest dark:bg-surface-container-lowest w-full py-12 border-t border-outline-variant dark:border-outline mt-auto text-left">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
          <div>
            <span className="font-headline-md text-headline-md text-on-background dark:text-on-surface font-bold">ChainRent</span>
            <p className="mt-4 text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm max-w-xs">
              Building the future of residential real estate on the Stellar network. Secure, transparent, and fair for everyone.
            </p>
            <p className="mt-8 text-on-surface-variant dark:text-on-surface-variant font-label-sm text-label-sm">© 2026 ChainRent. Secured by Stellar.</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-3">
              <h5 className="font-label-md text-label-md font-bold text-primary dark:text-primary-fixed">Platform</h5>
              <Link className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors font-label-sm text-label-sm" to="/dashboard/properties">Browse Properties</Link>
              <Link className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors font-label-sm text-label-sm" to="/dashboard/escrow">Escrow Dashboard</Link>
              <Link className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors font-label-sm text-label-sm" to="/dashboard/reputation">Reputation Score</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h5 className="font-label-md text-label-md font-bold text-primary dark:text-primary-fixed">Resources</h5>
              <a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors font-label-sm text-label-sm" href="#">Terms of Service</a>
              <a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors font-label-sm text-label-sm" href="#">Privacy Policy</a>
              <a className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors font-label-sm text-label-sm" href="https://stellar.org" target="_blank" rel="noreferrer">Stellar Website</a>
            </div>
          </div>
        </div>
      </footer>

      {/* BottomNavBar for Mobile (landing specific or redirects to dashboards) */}
      <nav className="fixed bottom-0 w-full lg:hidden z-50 border-t border-outline-variant dark:border-outline shadow-lg flex justify-around items-center h-16 bg-surface dark:bg-surface-container-high px-4 pb-safe transition-colors duration-200">
        <Link className="flex flex-col items-center justify-center text-primary dark:text-primary-fixed bg-primary-container/20 rounded-xl px-3 py-1 scale-90 transition-transform duration-200" to="/">
          <span className="material-symbols-outlined">home</span>
          <span className="font-label-sm text-label-sm">Home</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant dark:text-on-surface-variant active:bg-surface-variant" to="/dashboard/properties">
          <span className="material-symbols-outlined">home_work</span>
          <span className="font-label-sm text-label-sm">Properties</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant dark:text-on-surface-variant active:bg-surface-variant" to="/dashboard/leases">
          <span className="material-symbols-outlined">description</span>
          <span className="font-label-sm text-label-sm">Leases</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant dark:text-on-surface-variant active:bg-surface-variant" to="/dashboard/wallet">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="font-label-sm text-label-sm">Wallet</span>
        </Link>
      </nav>

      {/* Wallet Connection Modal */}
      <AnimatePresence>
        {isWalletModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest dark:bg-surface-container-lowest w-full max-w-[420px] rounded-2xl shadow-2xl overflow-hidden border border-outline-variant dark:border-outline p-6"
            >
              <div className="flex justify-between items-center mb-6 text-left">
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface dark:text-on-surface font-bold">Connect Wallet</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-surface-variant mt-1">Choose your preferred Stellar provider</p>
                </div>
                <button
                  onClick={() => setIsWalletModalOpen(false)}
                  className="p-2 hover:bg-surface-variant rounded-full text-on-surface"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleWalletSelect('Freighter')}
                  className="w-full flex items-center justify-between p-4 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline hover:border-primary dark:hover:border-primary-fixed hover:bg-primary/5 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-high dark:bg-surface-container-highest flex items-center justify-center text-primary dark:text-primary-fixed group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface dark:text-on-surface font-bold">Freighter</p>
                      <p className="text-body-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant">Browser Extension</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-primary dark:group-hover:text-primary-fixed">chevron_right</span>
                </button>

                <button
                  onClick={() => handleWalletSelect('xBull')}
                  className="w-full flex items-center justify-between p-4 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline hover:border-primary dark:hover:border-primary-fixed hover:bg-primary/5 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-high dark:bg-surface-container-highest flex items-center justify-center text-primary dark:text-primary-fixed group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">balance</span>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface dark:text-on-surface font-bold">xBull</p>
                      <p className="text-body-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant">Browser / Mobile</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-primary dark:group-hover:text-primary-fixed">chevron_right</span>
                </button>

                <button
                  onClick={() => handleWalletSelect('Albedo')}
                  className="w-full flex items-center justify-between p-4 bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline hover:border-primary dark:hover:border-primary-fixed hover:bg-primary/5 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-high dark:bg-surface-container-highest flex items-center justify-center text-primary dark:text-primary-fixed group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">token</span>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface dark:text-on-surface font-bold">Albedo</p>
                      <p className="text-body-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant">Browser-based signing</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-primary dark:group-hover:text-primary-fixed">chevron_right</span>
                </button>
              </div>

              <div className="mt-8 pt-4 border-t border-outline-variant dark:border-outline flex items-center gap-2 text-on-surface-variant dark:text-on-surface-variant justify-center">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <p className="font-label-sm text-label-sm">Secured by AES-256 and Stellar Network</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
