import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalletService } from '../services/walletService';
import { WalletProviderService } from '../services/walletProviderService';
import { StellarService } from '../services/stellarService';

vi.mock('../services/walletProviderService', () => ({
  WalletProviderService: {
    connectFreighter: vi.fn(),
    connectXBull: vi.fn(),
  },
}));

vi.mock('../services/stellarService', () => ({
  StellarService: {
    fetchBalance: vi.fn(),
  },
}));

vi.mock('../services/db', () => ({
  getFromStorage: vi.fn(() => ({
    connected: false,
    provider: null,
    address: null,
    network: null,
    balance: 0,
  })),
  setToStorage: vi.fn(),
  KEYS: { WALLET: 'wallet' },
}));

describe('WalletService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial wallet state', () => {
    const wallet = WalletService.getWallet();
    expect(wallet.connected).toBe(false);
    expect(wallet.balance).toBe(0);
  });

  it('should connect using Freighter successfully', async () => {
    vi.mocked(WalletProviderService.connectFreighter).mockResolvedValue('GB123456');
    vi.mocked(StellarService.fetchBalance).mockResolvedValue({ balance: 50.5, assets: [] });

    const wallet = await WalletService.connect('Freighter');

    expect(WalletProviderService.connectFreighter).toHaveBeenCalledOnce();
    expect(wallet.connected).toBe(true);
    expect(wallet.address).toBe('GB123456');
    expect(wallet.balance).toBe(50.5);
  });

  it('should disconnect successfully', () => {
    const wallet = WalletService.disconnect();
    expect(wallet.connected).toBe(false);
    expect(wallet.address).toBeNull();
    expect(wallet.balance).toBe(0);
  });
});
