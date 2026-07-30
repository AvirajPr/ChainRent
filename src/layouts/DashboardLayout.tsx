import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { AnimatePresence, motion } from 'framer-motion';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { wallet, connectWallet, disconnectWallet } = useWallet();
  const { toggleTheme } = useTheme();
  const { notifications, markAsRead, markAllAsRead } = useNotification();

  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Properties', path: '/dashboard/properties', icon: 'home_work' },
    { name: 'Leases', path: '/dashboard/leases', icon: 'description' },
    { name: 'Escrow', path: '/dashboard/escrow', icon: 'lock' },
    { name: 'Transactions', path: '/dashboard/transactions', icon: 'payments' },
    { name: 'Reputation', path: '/dashboard/reputation', icon: 'star' },
    { name: 'Wallet', path: '/dashboard/wallet', icon: 'account_balance_wallet' },
    { name: 'Verification Audit', path: '/verification', icon: 'verified_user' },
    { name: 'Analytics & Feedback', path: '/dashboard/analytics', icon: 'monitoring' },
  ];

  const unreadNotifs = notifications.filter(n => !n.read).length;

  const handleWalletSelect = (provider: 'Freighter' | 'xBull' | 'Albedo') => {
    connectWallet(provider);
    setIsWalletModalOpen(false);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const formatAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex overflow-x-hidden transition-colors duration-200">

      {/* Sidebar Navigation */}
      <aside className="bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant dark:border-outline fixed left-0 top-0 h-screen w-[260px] hidden lg:flex flex-col py-stack-lg px-4 gap-stack-md z-40">
        <div className="flex items-center px-4 mb-stack-lg">
          <div>
            <h1 className="font-headline-md text-headline-md text-primary dark:text-primary-fixed font-bold leading-none">ChainRent</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Stellar Network</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-stack-md px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary font-semibold scale-[0.98]'
                    : 'text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-variant/50'
                  }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-label-md text-label-md">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-stack-md border-t border-outline-variant dark:border-outline space-y-1">
          <Link
            to="/dashboard/settings"
            className={`flex items-center gap-stack-md px-4 py-3 rounded-lg transition-all ${location.pathname === '/dashboard/settings'
                ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary font-semibold'
                : 'text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-variant/50'
              }`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </Link>
          <button
            onClick={() => window.open('https://stellar.org', '_blank')}
            className="w-full flex items-center gap-stack-md text-on-surface-variant dark:text-on-surface-variant px-4 py-3 hover:bg-surface-variant/50 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined">help</span>
            <span className="font-label-md text-label-md text-left">Support Docs</span>
          </button>
          {wallet.connected ? (
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-stack-md text-error px-4 py-3 hover:bg-error-container/20 rounded-lg transition-all"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-label-md text-label-md text-left">Disconnect</span>
            </button>
          ) : (
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="w-full flex items-center gap-stack-md text-primary dark:text-primary-fixed px-4 py-3 hover:bg-primary/10 rounded-lg transition-all"
            >
              <span className="material-symbols-outlined">account_balance_wallet</span>
              <span className="font-label-md text-label-md text-left">Connect Wallet</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Canvas */}
      <div className="flex-grow lg:pl-[260px] flex flex-col min-w-0">

        {/* Header */}
        <header className="bg-surface/85 dark:bg-surface-container-lowest/85 border-b border-outline-variant dark:border-outline backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-4 flex justify-between items-center">

            <div className="flex items-center gap-stack-md">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-surface-variant rounded-full text-on-surface"
                aria-label="Open navigation drawer"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h2 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed hidden md:block">
                {menuItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
              </h2>
              <h2 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed md:hidden">
                ChainRent
              </h2>
            </div>

            <div className="flex items-center gap-stack-md">
              {wallet.connected && (
                <div className="hidden sm:flex items-center bg-surface-container dark:bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant dark:border-outline">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                  <span className="font-label-sm text-label-sm text-on-surface dark:text-on-surface-variant">
                    {formatAddress(wallet.address)} ({wallet.balance.toLocaleString()} XLM)
                  </span>
                </div>
              )}

              <div className="flex gap-1 relative">

                {/* Notification Bell */}
                <button
                  onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                  className="p-2 text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors relative"
                  aria-label="Notifications"
                >
                  <span className="material-symbols-outlined">notifications</span>
                  {unreadNotifs > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
                  )}
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors"
                  aria-label="Toggle dark mode"
                >
                  <span className="material-symbols-outlined">contrast</span>
                </button>

                {/* Notification Dropdown Panel */}
                <AnimatePresence>
                  {isNotifDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsNotifDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-12 w-80 bg-surface-container-lowest dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-xl shadow-xl z-50 p-4 max-h-96 overflow-y-auto custom-scrollbar"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-label-md text-label-md font-bold">Notifications</span>
                          {unreadNotifs > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-primary dark:text-primary-fixed font-label-sm text-label-sm hover:underline"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {notifications.length === 0 ? (
                            <p className="text-center text-body-sm text-on-surface-variant py-4">No notifications yet.</p>
                          ) : (
                            notifications.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => markAsRead(notif.id)}
                                className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${notif.read
                                    ? 'bg-transparent border-transparent text-on-surface-variant'
                                    : 'bg-primary-container/10 border-primary-container/20 text-on-surface'
                                  }`}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <p className="font-label-md text-label-md font-bold leading-tight">{notif.title}</p>
                                  <span className="text-[10px] text-on-surface-variant flex-shrink-0">{notif.time}</span>
                                </div>
                                <p className="font-body-sm text-body-sm mt-1">{notif.description}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {wallet.connected ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="w-9 h-9 rounded-full bg-primary flex items-center justify-center font-bold text-on-primary text-sm hover:opacity-90 transition-opacity"
                  >
                    JD
                  </button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-48 bg-surface-container-lowest dark:bg-surface-container-lowest border border-outline-variant dark:border-outline rounded-lg shadow-xl z-50 py-1"
                        >
                          <div className="px-4 py-2 border-b border-outline-variant dark:border-outline">
                            <p className="font-label-md text-label-md font-bold text-on-surface truncate">James D.</p>
                            <p className="text-body-sm text-label-sm text-on-surface-variant truncate">{formatAddress(wallet.address)}</p>
                          </div>
                          <Link
                            to="/dashboard/settings"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-body-sm text-on-surface hover:bg-surface-variant/50 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">settings</span>
                            Settings
                          </Link>
                          <button
                            onClick={handleDisconnect}
                            className="w-full flex items-center gap-2 px-4 py-2 text-body-sm text-error hover:bg-error-container/20 transition-colors text-left"
                          >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            Disconnect
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-sm"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Panel */}
        <div className="flex-1">
          {children}
        </div>

        {/* Footer */}
        <footer className="bg-surface-container-highest dark:bg-surface-container-low w-full py-8 mt-auto border-t border-outline-variant dark:border-outline">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-stack-lg items-center text-left">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-background dark:text-on-surface font-bold mb-2">ChainRent</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-surface-variant">
                © 2026 ChainRent. Secured by Stellar. Institutional-grade rental management.
              </p>
            </div>
            <div className="flex gap-stack-md md:justify-end flex-wrap">
              <a className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors" href="#">Developer Docs</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant hover:text-primary transition-colors" href="#">Status</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-surface-container-low dark:bg-surface-container-lowest fixed left-0 top-0 h-screen w-[280px] z-50 flex flex-col py-stack-lg px-4 gap-stack-md shadow-2xl lg:hidden"
            >
              <div className="flex justify-between items-center px-4 mb-stack-lg">
                <div className="flex items-center">
                  <h1 className="font-headline-md text-headline-md text-primary dark:text-primary-fixed font-bold leading-none">ChainRent</h1>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 hover:bg-surface-variant rounded-full text-on-surface"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-stack-md px-4 py-3 rounded-lg transition-all ${isActive
                          ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary font-semibold'
                          : 'text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-variant/50'
                        }`}
                    >
                      <span className="material-symbols-outlined">{item.icon}</span>
                      <span className="font-label-md text-label-md">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-stack-md border-t border-outline-variant dark:border-outline space-y-1">
                <Link
                  to="/dashboard/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-stack-md px-4 py-3 rounded-lg transition-all ${location.pathname === '/dashboard/settings'
                      ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary font-semibold'
                      : 'text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-variant/50'
                    }`}
                >
                  <span className="material-symbols-outlined">settings</span>
                  <span className="font-label-md text-label-md">Settings</span>
                </Link>
                {wallet.connected ? (
                  <button
                    onClick={() => {
                      handleDisconnect();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-stack-md text-error px-4 py-3 hover:bg-error-container/20 rounded-lg transition-all"
                  >
                    <span className="material-symbols-outlined">logout</span>
                    <span className="font-label-md text-label-md text-left">Disconnect</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsWalletModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-stack-md text-primary dark:text-primary-fixed px-4 py-3 hover:bg-primary/10 rounded-lg transition-all"
                  >
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                    <span className="font-label-md text-label-md text-left">Connect Wallet</span>
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

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
