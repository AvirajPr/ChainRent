import { getFromStorage, setToStorage, KEYS } from './db';
import type { Wallet } from '../types';
import { WalletProviderService } from './walletProviderService';
import { StellarService } from './stellarService';
import { NetworkService } from './networkService';

export const WalletService = {
  getWallet(): Wallet {
    return getFromStorage<Wallet>(KEYS.WALLET);
  },

  async connect(provider: 'Freighter' | 'xBull' | 'Albedo'): Promise<Wallet> {
    let publicKey: string;
    if (provider === 'Freighter') {
      publicKey = await WalletProviderService.connectFreighter();
    } else if (provider === 'xBull') {
      publicKey = await WalletProviderService.connectXBull();
    } else {
      throw new Error('Albedo is not supported in this version. Please connect with Freighter or xBull.');
    }

    const { balance } = await StellarService.fetchBalance(publicKey);

    const wallet: Wallet = {
      connected: true,
      provider,
      address: publicKey,
      network: NetworkService.getNetworkName(),
      balance
    };
    setToStorage(KEYS.WALLET, wallet);
    return wallet;
  },

  disconnect(): Wallet {
    const wallet = this.getWallet();
    wallet.connected = false;
    wallet.provider = null;
    wallet.address = null;
    wallet.network = null;
    wallet.balance = 0;
    setToStorage(KEYS.WALLET, wallet);
    return wallet;
  },

  async refreshBalance(): Promise<Wallet> {
    const wallet = this.getWallet();
    if (!wallet.connected || !wallet.address) {
      return wallet;
    }
    const { balance } = await StellarService.fetchBalance(wallet.address);
    wallet.balance = balance;
    setToStorage(KEYS.WALLET, wallet);
    return wallet;
  },

  async fundAccount(): Promise<{ wallet: Wallet; hash: string }> {
    const wallet = this.getWallet();
    if (!wallet.connected || !wallet.address) {
      throw new Error('No wallet connected.');
    }

    const hash = await StellarService.fundWithFriendbot(wallet.address);
    const updated = await this.refreshBalance();
    return { wallet: updated, hash };
  }
};
