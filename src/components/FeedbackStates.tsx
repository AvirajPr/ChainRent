import React from 'react';

// ==========================================
// 1. SKELETON LOADERS
// ==========================================

export const CardSkeleton: React.FC = () => (
  <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl p-6 space-y-4 animate-pulse">
    <div className="h-4 bg-outline-variant/30 rounded w-1/3"></div>
    <div className="h-8 bg-outline-variant/40 rounded w-1/2"></div>
    <div className="h-3 bg-outline-variant/20 rounded w-5/6"></div>
  </div>
);

export const PropertyCardSkeleton: React.FC = () => (
  <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl overflow-hidden animate-pulse flex flex-col justify-between h-[420px]">
    <div>
      <div className="h-48 bg-outline-variant/30 w-full"></div>
      <div className="p-6 space-y-3">
        <div className="flex gap-2">
          <div className="h-4 bg-outline-variant/40 rounded w-1/4"></div>
          <div className="h-4 bg-outline-variant/30 rounded w-1/3"></div>
        </div>
        <div className="h-6 bg-outline-variant/40 rounded w-3/4"></div>
        <div className="h-4 bg-outline-variant/20 rounded w-1/2"></div>
        <div className="flex gap-3 pt-3">
          <div className="h-4 bg-outline-variant/30 rounded w-1/5"></div>
          <div className="h-4 bg-outline-variant/30 rounded w-1/5"></div>
          <div className="h-4 bg-outline-variant/30 rounded w-1/5"></div>
        </div>
      </div>
    </div>
    <div className="p-6 border-t border-outline-variant dark:border-outline flex justify-between">
      <div className="h-8 bg-outline-variant/30 rounded w-1/3"></div>
      <div className="h-8 bg-outline-variant/30 rounded w-1/3"></div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl overflow-hidden animate-pulse">
    <div className="h-12 bg-surface-container-low dark:bg-surface-container-high border-b border-outline-variant dark:border-outline w-full"></div>
    <div className="p-4 space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex justify-between items-center gap-4 py-2">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-outline-variant/30 rounded-lg"></div>
            <div className="space-y-2 flex-grow">
              <div className="h-4 bg-outline-variant/40 rounded w-1/3"></div>
              <div className="h-3 bg-outline-variant/25 rounded w-1/5"></div>
            </div>
          </div>
          <div className="h-4 bg-outline-variant/30 rounded w-20"></div>
          <div className="h-4 bg-outline-variant/30 rounded w-24"></div>
          <div className="h-6 bg-outline-variant/40 rounded-full w-16"></div>
          <div className="h-8 bg-outline-variant/35 rounded w-24"></div>
        </div>
      ))}
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8 fade-in">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <TableSkeleton rows={4} />
      </div>
      <div>
        <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl p-6 h-[300px] animate-pulse space-y-4">
          <div className="h-6 bg-outline-variant/40 rounded w-1/3"></div>
          <div className="h-[180px] bg-outline-variant/20 rounded w-full"></div>
        </div>
      </div>
    </div>
  </div>
);

export const ReputationSkeleton: React.FC = () => (
  <div className="space-y-8 fade-in animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant p-6 rounded-2xl h-32 flex flex-col justify-between">
          <div className="h-4 bg-outline-variant/30 rounded w-1/2"></div>
          <div className="h-8 bg-outline-variant/45 rounded w-1/3"></div>
          <div className="h-3 bg-outline-variant/20 rounded w-2/3"></div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-6 bg-outline-variant/35 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant p-6 rounded-2xl space-y-3">
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <div className="w-10 h-10 bg-outline-variant/35 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-outline-variant/40 rounded w-24"></div>
                    <div className="h-3 bg-outline-variant/25 rounded w-12"></div>
                  </div>
                </div>
                <div className="h-4 bg-outline-variant/30 rounded w-16"></div>
              </div>
              <div className="h-4 bg-outline-variant/20 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant p-6 rounded-2xl h-[400px]">
        <div className="h-6 bg-outline-variant/35 rounded w-1/2 mb-6"></div>
        <div className="space-y-4">
          <div className="h-10 bg-outline-variant/20 rounded"></div>
          <div className="h-10 bg-outline-variant/20 rounded"></div>
          <div className="h-10 bg-outline-variant/20 rounded"></div>
          <div className="h-24 bg-outline-variant/15 rounded"></div>
          <div className="h-10 bg-outline-variant/35 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// 2. ERROR STATES
// ==========================================

interface ErrorCardProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({ 
  title = "Stellar Ledger Error", 
  message, 
  onRetry 
}) => (
  <div className="max-w-md mx-auto my-12 bg-surface-container-lowest dark:bg-surface-container border border-error/30 dark:border-error/50 p-8 rounded-3xl shadow-lg text-center space-y-6 fade-in">
    <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto">
      <span className="material-symbols-outlined text-[36px]">error</span>
    </div>
    
    <div className="space-y-2">
      <h3 className="font-headline-md text-[20px] font-bold text-on-surface dark:text-on-surface">
        {title}
      </h3>
      <p className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant leading-relaxed">
        {message}
      </p>
    </div>

    {onRetry && (
      <button 
        onClick={onRetry} 
        className="bg-error text-on-error font-label-md text-label-md px-6 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 mx-auto"
      >
        <span className="material-symbols-outlined text-[16px]">refresh</span>
        Retry Connection
      </button>
    )}
  </div>
);

// ==========================================
// 3. EMPTY STATES
// ==========================================

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction
}) => (
  <div className="text-center py-16 px-6 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline rounded-3xl max-w-xl mx-auto space-y-6 fade-in shadow-sm">
    <div className="w-16 h-16 bg-primary/10 dark:bg-primary-fixed/20 text-primary dark:text-primary-fixed rounded-full flex items-center justify-center mx-auto">
      <span className="material-symbols-outlined text-[36px]">{icon}</span>
    </div>
    
    <div className="space-y-2">
      <h3 className="font-headline-md text-[20px] font-bold text-on-surface dark:text-on-surface">
        {title}
      </h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-surface-variant max-w-md mx-auto leading-relaxed">
        {description}
      </p>
    </div>

    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 mx-auto"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
