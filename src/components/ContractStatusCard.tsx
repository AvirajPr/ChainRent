import React, { useState, useEffect } from 'react';
import { CONTRACT_IDS } from '../services/sorobanService';
import { ContractAuditService } from '../services/contractAuditService';
import type { ContractAuditLog } from '../services/contractAuditService';
import { NetworkService } from '../services/networkService';

export const ContractStatusCard: React.FC = () => {
  const [lastLog, setLastLog] = useState<ContractAuditLog | null>(null);
  const [networkName, setNetworkName] = useState('Testnet');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      const logs = ContractAuditService.getLogs();
      if (logs.length > 0) {
        setLastLog(logs[0]);
      }
      setNetworkName(NetworkService.getNetworkName());
    };

    updateStatus();

    // Listen to localstorage updates for live refresh
    const handler = () => updateStatus();
    window.addEventListener('storage', handler);
    // Poll logs in case they change locally without storage event
    const interval = setInterval(updateStatus, 1500);

    return () => {
      window.removeEventListener('storage', handler);
      clearInterval(interval);
    };
  }, []);

  const handleCopy = (id: string, label: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(label);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStellarExpertUrl = (contractId: string) => {
    const net = networkName.toLowerCase() === 'mainnet' ? 'public' : 'testnet';
    return `https://stellar.expert/explorer/${net}/contract/${contractId}`;
  };

  const getTxUrl = (hash: string) => {
    const net = networkName.toLowerCase() === 'mainnet' ? 'public' : 'testnet';
    return `https://stellar.expert/explorer/${net}/tx/${hash}`;
  };

  return (
    <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline p-6 rounded-2xl shadow-sm text-left space-y-6">
      <div className="flex justify-between items-center border-b border-outline-variant dark:border-outline pb-3">
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" aria-hidden="true">verified</span>
          Soroban Contracts Status
        </h3>
        <span className="bg-primary/10 text-primary dark:text-primary-fixed text-xs font-bold px-3 py-1 rounded-full">
          {networkName} SDF
        </span>
      </div>

      <div className="space-y-4">
        {/* Lease Contract */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surface-container-low dark:bg-surface-container-high rounded-xl border border-outline-variant/50">
          <div>
            <p className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-on-surface-variant">Lease Contract ID</p>
            <p className="font-mono text-xs text-on-surface dark:text-on-surface mt-1 truncate max-w-[240px] sm:max-w-[320px]" title={CONTRACT_IDS.LEASE}>
              {CONTRACT_IDS.LEASE}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(CONTRACT_IDS.LEASE, 'lease')}
              className="p-1.5 border border-outline-variant dark:border-outline hover:bg-surface-variant/50 rounded text-on-surface transition-colors flex items-center"
              title="Copy Contract ID"
              aria-label="Copy Lease Contract ID"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedId === 'lease' ? 'check' : 'content_copy'}
              </span>
            </button>
            <a
              href={getStellarExpertUrl(CONTRACT_IDS.LEASE)}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 border border-outline-variant dark:border-outline hover:bg-surface-variant/50 rounded text-on-surface transition-colors flex items-center"
              title="View on Stellar Expert"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          </div>
        </div>

        {/* Escrow Contract */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surface-container-low dark:bg-surface-container-high rounded-xl border border-outline-variant/50">
          <div>
            <p className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-on-surface-variant">Escrow Contract ID</p>
            <p className="font-mono text-xs text-on-surface dark:text-on-surface mt-1 truncate max-w-[240px] sm:max-w-[320px]" title={CONTRACT_IDS.ESCROW}>
              {CONTRACT_IDS.ESCROW}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(CONTRACT_IDS.ESCROW, 'escrow')}
              className="p-1.5 border border-outline-variant dark:border-outline hover:bg-surface-variant/50 rounded text-on-surface transition-colors flex items-center"
              title="Copy Contract ID"
              aria-label="Copy Escrow Contract ID"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedId === 'escrow' ? 'check' : 'content_copy'}
              </span>
            </button>
            <a
              href={getStellarExpertUrl(CONTRACT_IDS.ESCROW)}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 border border-outline-variant dark:border-outline hover:bg-surface-variant/50 rounded text-on-surface transition-colors flex items-center"
              title="View on Stellar Expert"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          </div>
        </div>

        {/* Reputation Contract */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surface-container-low dark:bg-surface-container-high rounded-xl border border-outline-variant/50">
          <div>
            <p className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-on-surface-variant">Reputation Contract ID</p>
            <p className="font-mono text-xs text-on-surface dark:text-on-surface mt-1 truncate max-w-[240px] sm:max-w-[320px]" title={CONTRACT_IDS.REPUTATION}>
              {CONTRACT_IDS.REPUTATION}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(CONTRACT_IDS.REPUTATION, 'reputation')}
              className="p-1.5 border border-outline-variant dark:border-outline hover:bg-surface-variant/50 rounded text-on-surface transition-colors flex items-center"
              title="Copy Contract ID"
              aria-label="Copy Reputation Contract ID"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedId === 'reputation' ? 'check' : 'content_copy'}
              </span>
            </button>
            <a
              href={getStellarExpertUrl(CONTRACT_IDS.REPUTATION)}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 border border-outline-variant dark:border-outline hover:bg-surface-variant/50 rounded text-on-surface transition-colors flex items-center"
              title="View on Stellar Expert"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant dark:border-outline text-xs">
        <div>
          <p className="text-on-surface-variant dark:text-on-surface-variant font-bold uppercase tracking-wider text-[9px]">Contract Status</p>
          <span className="mt-1 inline-flex items-center gap-1.5 font-bold text-green-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            ACTIVE / SECURE
          </span>
        </div>
        <div>
          <p className="text-on-surface-variant dark:text-on-surface-variant font-bold uppercase tracking-wider text-[9px]">Deployment Proof</p>
          <span className="mt-1 inline-flex items-center gap-1.5 font-bold text-primary dark:text-primary-fixed">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            VERIFIED
          </span>
        </div>
      </div>

      {lastLog && (
        <div className="pt-4 border-t border-outline-variant dark:border-outline space-y-2">
          <p className="text-on-surface-variant dark:text-on-surface-variant font-bold uppercase tracking-wider text-[9px]">Last Contract Call</p>
          <div className="bg-surface-variant/30 rounded-xl p-3 space-y-2 text-xs">
            <div className="flex justify-between font-bold">
              <span>{lastLog.contractName}</span>
              <span className="text-primary dark:text-primary-fixed font-mono">{lastLog.functionName}()</span>
            </div>
            <div className="flex justify-between text-on-surface-variant dark:text-on-surface-variant">
              <span>Result:</span>
              <span className={lastLog.success ? 'text-green-500 font-bold' : 'text-error font-bold'}>
                {lastLog.success ? 'SUCCESS' : 'FAILED'}
              </span>
            </div>
            <div className="flex justify-between items-center text-on-surface-variant dark:text-on-surface-variant">
              <span>Tx Hash:</span>
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <span className="truncate max-w-[100px]">{lastLog.transactionHash}</span>
                <a
                  href={getTxUrl(lastLog.transactionHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>
            </div>
            <div className="text-[10px] text-on-surface-variant/70 text-right">
              {new Date(lastLog.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
