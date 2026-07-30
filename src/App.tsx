import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { WalletProvider } from './context/WalletContext';
import { PropertyProvider } from './context/PropertyContext';
import { LeaseProvider } from './context/LeaseContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy Loaded Pages
const LandingPage = React.lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const DashboardOverview = React.lazy(() => import('./pages/DashboardOverview').then(m => ({ default: m.DashboardOverview })));
const PropertiesPage = React.lazy(() => import('./pages/PropertiesPage').then(m => ({ default: m.PropertiesPage })));
const PropertyDetailsPage = React.lazy(() => import('./pages/PropertyDetailsPage').then(m => ({ default: m.PropertyDetailsPage })));
const LeasesPage = React.lazy(() => import('./pages/LeasesPage').then(m => ({ default: m.LeasesPage })));
const EscrowPage = React.lazy(() => import('./pages/EscrowPage').then(m => ({ default: m.EscrowPage })));
const TransactionsPage = React.lazy(() => import('./pages/TransactionsPage').then(m => ({ default: m.TransactionsPage })));
const ReputationPage = React.lazy(() => import('./pages/ReputationPage').then(m => ({ default: m.ReputationPage })));
const WalletPage = React.lazy(() => import('./pages/WalletPage').then(m => ({ default: m.WalletPage })));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const VerificationPage = React.lazy(() => import('./pages/VerificationPage').then(m => ({ default: m.VerificationPage })));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Premium loading fallback for lazy loaded routes
const PageLoader: React.FC = () => (
  <div className="flex-grow w-full flex flex-col items-center justify-center min-h-[60vh] fade-in">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary dark:border-primary-fixed border-t-transparent dark:border-t-transparent rounded-full animate-spin"></div>
      <p className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant animate-pulse tracking-widest uppercase">
        Loading Ledger...
      </p>
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <ToastProvider>
          <ThemeProvider>
            <WalletProvider>
              <PropertyProvider>
                <LeaseProvider>
                  <NotificationProvider>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* Public Landing Page */}
                        <Route path="/" element={<LandingPage />} />

                        {/* Dashboard Routes wrapped in DashboardLayout and ProtectedRoute */}
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <DashboardLayout>
                                <DashboardOverview />
                              </DashboardLayout>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/dashboard/properties"
                          element={
                            <ProtectedRoute>
                              <DashboardLayout>
                                <PropertiesPage />
                              </DashboardLayout>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/dashboard/leases"
                          element={
                            <ProtectedRoute>
                              <DashboardLayout>
                                <LeasesPage />
                              </DashboardLayout>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/dashboard/escrow"
                          element={
                            <ProtectedRoute>
                              <DashboardLayout>
                                <EscrowPage />
                              </DashboardLayout>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/dashboard/transactions"
                          element={
                            <ProtectedRoute>
                              <DashboardLayout>
                                <TransactionsPage />
                              </DashboardLayout>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/dashboard/reputation"
                          element={
                            <ProtectedRoute>
                              <DashboardLayout>
                                <ReputationPage />
                              </DashboardLayout>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/dashboard/wallet"
                          element={
                            <ProtectedRoute>
                              <DashboardLayout>
                                <WalletPage />
                              </DashboardLayout>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/dashboard/settings"
                          element={
                            <ProtectedRoute>
                              <DashboardLayout>
                                <SettingsPage />
                              </DashboardLayout>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/dashboard/analytics"
                          element={
                            <ProtectedRoute>
                              <DashboardLayout>
                                <AnalyticsPage />
                              </DashboardLayout>
                            </ProtectedRoute>
                          }
                        />

                        {/* Property Details */}
                        <Route
                          path="/property/:id"
                          element={
                            <ProtectedRoute>
                              <DashboardLayout>
                                <PropertyDetailsPage />
                              </DashboardLayout>
                            </ProtectedRoute>
                          }
                        />

                        {/* Reviewer Verification Page */}
                        <Route
                          path="/verification"
                          element={
                            <DashboardLayout>
                              <VerificationPage />
                            </DashboardLayout>
                          }
                        />

                        {/* 404 Route */}
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </Suspense>
                  </NotificationProvider>
                </LeaseProvider>
              </PropertyProvider>
            </WalletProvider>
          </ThemeProvider>
        </ToastProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
