import { getFromStorage, setToStorage } from './db';

export interface ContractAuditLog {
  id: string;
  contractName: 'Lease Contract' | 'Escrow Contract' | 'Reputation Contract' | 'Transaction Contract';
  contractId: string;
  functionName: string;
  timestamp: number;
  transactionHash: string;
  success: boolean;
  error?: string;
  params?: any;
}

const AUDIT_LOGS_KEY = 'chainrent_contract_audit_logs';

export const ContractAuditService = {
  getLogs(): ContractAuditLog[] {
    return getFromStorage<ContractAuditLog[]>(AUDIT_LOGS_KEY) || [];
  },

  addLog(logData: {
    contractName: ContractAuditLog['contractName'];
    contractId: string;
    functionName: string;
    transactionHash: string;
    success: boolean;
    error?: string;
    params?: any;
  }): ContractAuditLog {
    const logs = this.getLogs();
    const newLog: ContractAuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      ...logData
    };
    logs.unshift(newLog);
    setToStorage(AUDIT_LOGS_KEY, logs);
    return newLog;
  },

  clearLogs(): void {
    setToStorage(AUDIT_LOGS_KEY, []);
  }
};
