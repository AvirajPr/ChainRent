import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StellarService } from '../services/stellarService';

vi.stubGlobal('fetch', vi.fn());

describe('StellarService Balance Parser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse balances correctly from Horizon response', async () => {
    const mockAccount = {
      balances: [
        { asset_type: 'native', balance: '125.5000000' },
        { asset_type: 'credit_alphanum4', asset_code: 'USDC', asset_issuer: 'GC123', balance: '10.0', limit: '1000.0' }
      ]
    };

    vi.spyOn(StellarService, 'fetchAccount').mockResolvedValue(mockAccount as any);

    const result = await StellarService.fetchBalance('GDXYZ');
    expect(result.balance).toBe(125.5);
    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].code).toBe('USDC');
    expect(result.assets[0].balance).toBe(10.0);
  });
});
