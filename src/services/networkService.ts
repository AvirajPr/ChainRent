export interface NetworkConfig {
  networkName: 'Testnet' | 'Mainnet';
  horizonUrl: string;
  networkPassphrase: string;
}

const TESTNET_CONFIG: NetworkConfig = {
  networkName: 'Testnet',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  networkPassphrase: 'Test SDF Network ; September 2015',
};

const MAINNET_CONFIG: NetworkConfig = {
  networkName: 'Mainnet',
  horizonUrl: 'https://horizon.stellar.org',
  networkPassphrase: 'Public Global Stellar Network ; October 2015',
};

export const NetworkService = {
  getNetworkConfig(): NetworkConfig {
    const isMainnet = import.meta.env.VITE_STELLAR_NETWORK === 'public';
    return isMainnet ? MAINNET_CONFIG : TESTNET_CONFIG;
  },

  getNetworkName(): 'Testnet' | 'Mainnet' {
    return this.getNetworkConfig().networkName;
  },

  getHorizonUrl(): string {
    return this.getNetworkConfig().horizonUrl;
  },

  getNetworkPassphrase(): string {
    return this.getNetworkConfig().networkPassphrase;
  },

  validateNetwork(walletNetwork: string): boolean {
    const expected = this.getNetworkName().toLowerCase();
    const current = walletNetwork.toLowerCase();
    return current.includes(expected);
  }
};
