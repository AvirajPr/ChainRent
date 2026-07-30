import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center p-6 text-center fade-in">
      <div className="max-w-md w-full bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline p-8 rounded-3xl shadow-xl space-y-6">
        <div className="w-20 h-20 bg-primary/10 dark:bg-primary-fixed/20 rounded-full flex items-center justify-center mx-auto text-primary dark:text-primary-fixed animate-bounce">
          <span className="material-symbols-outlined text-[44px]">broken_image</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-on-surface">
            Ledger Route Interrupted
          </h1>
          <p className="text-[12px] uppercase font-bold tracking-wider text-error">
            Error Code: 404 Not Found
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant leading-relaxed">
            The path you requested does not exist on the ChainRent registry. The contract address or route may have expired.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex-1 bg-primary text-on-primary font-label-md text-label-md px-6 py-3.5 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            Go to Dashboard
          </button>
          
          <button 
            onClick={() => navigate('/')} 
            className="flex-1 border border-outline text-on-surface dark:text-on-surface font-label-md text-label-md px-6 py-3.5 rounded-xl hover:bg-surface-variant/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
};
