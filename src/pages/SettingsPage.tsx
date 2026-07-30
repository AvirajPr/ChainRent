import React, { useState, useEffect } from 'react';
import { getFromStorage, setToStorage, KEYS } from '../services/db';
import { CardSkeleton } from '../components/FeedbackStates';
import { useToast } from '../context/ToastContext';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  
  const [profileName, setProfileName] = useState(() => {
    const s = getFromStorage<any>(KEYS.SETTINGS);
    return s ? s.profileName : 'James D.';
  });
  const [email, setEmail] = useState(() => {
    const s = getFromStorage<any>(KEYS.SETTINGS);
    return s ? s.email : 'james.d@stellar.org';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const s = getFromStorage<any>(KEYS.SETTINGS);
    return s ? s.notificationsEnabled : true;
  });
  const [securityMfa, setSecurityMfa] = useState(() => {
    const s = getFromStorage<any>(KEYS.SETTINGS);
    return s ? s.securityMfa : false;
  });
  const [walletPreferences, setWalletPreferences] = useState(() => {
    const s = getFromStorage<any>(KEYS.SETTINGS);
    return s ? s.walletPreferences : 'Freighter';
  });
  const [appLanguage, setAppLanguage] = useState(() => {
    const s = getFromStorage<any>(KEYS.SETTINGS);
    return s ? s.appLanguage : 'English';
  });

  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = {
        profileName,
        email,
        notificationsEnabled,
        securityMfa,
        walletPreferences,
        appLanguage
      };
      setToStorage(KEYS.SETTINGS, updated);
      setSaveSuccess(true);
      showToast(
        'Settings Saved', 
        'success', 
        'Your profile preferences have been successfully updated.'
      );
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      showToast(
        'Save Failed', 
        'error', 
        'Unable to persist settings to localStorage.'
      );
    }
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg text-left fade-in">
      
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-on-surface">Account Settings</h2>
        <p className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant mt-1">
          Customize your profile credentials, ledger configurations, and notification alerts.
        </p>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : (
        <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline p-6 rounded-2xl shadow-sm max-w-2xl">
          <form onSubmit={handleSave} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="settings-profile-name" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-2">Full Profile Name</label>
                <input
                  id="settings-profile-name"
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary text-body-md text-on-surface focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="settings-email" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-2">Registered Email Address</label>
                <input
                  id="settings-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary text-body-md text-on-surface focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="settings-wallet" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-2">Default Wallet Preference</label>
                <select
                  id="settings-wallet"
                  value={walletPreferences}
                  onChange={(e) => setWalletPreferences(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary text-body-md text-on-surface"
                >
                  <option value="Freighter">Freighter browser plugin</option>
                  <option value="xBull">xBull browser / mobile extension</option>
                  <option value="Albedo">Albedo popup service</option>
                </select>
              </div>
              <div>
                <label htmlFor="settings-language" className="block font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant mb-2">Application Language</label>
                <select
                  id="settings-language"
                  value={appLanguage}
                  onChange={(e) => setAppLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-lg outline-none focus:border-primary text-body-md text-on-surface"
                >
                  <option value="English">English (US)</option>
                  <option value="Spanish">Spanish (ES)</option>
                  <option value="French">French (FR)</option>
                  <option value="German">German (DE)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant dark:border-outline space-y-4">
              <h4 className="font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">Preferences & Security</h4>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-4.5 h-4.5 text-primary bg-surface border-outline rounded focus:ring-primary accent-primary"
                  aria-describedby="alert-description"
                />
                <div>
                  <p className="font-label-sm text-label-sm font-semibold group-hover:text-primary transition-colors">Enable Rental Alerts</p>
                  <p id="alert-description" className="text-xs text-on-surface-variant dark:text-on-surface-variant mt-0.5">Receive browser notifications when rent payments are sent or escrow deposits release.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={securityMfa}
                  onChange={(e) => setSecurityMfa(e.target.checked)}
                  className="w-4.5 h-4.5 text-primary bg-surface border-outline rounded focus:ring-primary accent-primary"
                  aria-describedby="mfa-description"
                />
                <div>
                  <p className="font-label-sm text-label-sm font-semibold group-hover:text-primary transition-colors">Enable Multi-Sig Ledger Authorization</p>
                  <p id="mfa-description" className="text-xs text-on-surface-variant dark:text-on-surface-variant mt-0.5">Require multi-sig device approvals for any escrow fund release transactions.</p>
                </div>
              </label>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-outline-variant dark:border-outline">
              <button
                type="submit"
                className="bg-primary text-on-primary font-label-md text-label-md px-8 py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm focus:ring-2 focus:ring-primary outline-none"
              >
                Save Preferences
              </button>
              {saveSuccess && (
                <span className="text-green-500 font-label-sm text-label-sm flex items-center gap-1" role="status">
                  <span className="material-symbols-outlined">check_circle</span>
                  Preferences saved successfully!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
