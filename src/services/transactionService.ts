import { getFromStorage, setToStorage, KEYS } from './db';
import type { Transaction } from '../types';

export const TransactionService = {
  getTransactions(): Transaction[] {
    return getFromStorage<Transaction[]>(KEYS.TRANSACTIONS);
  },

  addTransaction(type: Transaction['type'], amount: number, fromAddress: string, toAddress: string, customHash?: string): Transaction {
    const txs = this.getTransactions();
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      hash: customHash || Math.random().toString(16).substring(2, 66),
      type,
      amount,
      date: new Date().toISOString(),
      status: 'success',
      fromAddress,
      toAddress
    };
    txs.unshift(newTx);
    setToStorage(KEYS.TRANSACTIONS, txs);
    return newTx;
  }
};
