import { isConnected, requestAccess, signTransaction } from '@stellar/freighter-api';
import { xBullWalletConnect } from '@creit.tech/xbull-wallet-connect';
import { NetworkService } from './networkService';

export const WalletProviderService = {
  async isFreighterInstalled(): Promise<boolean> {
    try {
      const status = await isConnected();
      return !!status.isConnected;
    } catch {
      return false;
    }
  },

  async isXBullInstalled(): Promise<boolean> {
    return typeof (window as any).xBullSDK !== 'undefined' || typeof (window as any).xBullWebView !== 'undefined';
  },

  async connectFreighter(): Promise<string> {
    const installed = await this.isFreighterInstalled();
    if (!installed) {
      throw new Error('Freighter wallet extension is not installed.');
    }

    const res = await requestAccess();
    if (res.error) {
      throw new Error(res.error || 'Access to Freighter wallet was denied.');
    }
    return res.address;
  },

  async connectXBull(): Promise<string> {
    const bridge = new xBullWalletConnect();
    try {
      const publicKey = await bridge.connect();
      bridge.closeConnections();
      if (!publicKey) {
        throw new Error('Could not retrieve public key from xBull.');
      }
      return publicKey;
    } catch (err: any) {
      bridge.closeConnections();
      throw new Error(err.message || 'xBull connection was rejected or failed.', { cause: err });
    }
  },

  async signWithFreighter(xdr: string): Promise<string> {
    try {
      const res = await signTransaction(xdr, {
        networkPassphrase: NetworkService.getNetworkPassphrase()
      });
      if (res.error) {
        throw new Error(res.error || 'Freighter transaction signing failed.');
      }
      return res.signedTxXdr;
    } catch (err: any) {
      throw new Error(err.message || 'Freighter transaction signing failed.', { cause: err });
    }
  },

  async signWithXBull(xdr: string, publicKey: string): Promise<string> {
    const bridge = new xBullWalletConnect();
    const networkName = NetworkService.getNetworkName().toLowerCase();
    const network = networkName === 'mainnet' ? 'public' : 'testnet';
    try {
      const signedXdr = await bridge.sign({
        xdr,
        publicKey,
        network
      });
      bridge.closeConnections();
      return signedXdr;
    } catch (err: any) {
      bridge.closeConnections();
      throw new Error(err.message || 'xBull transaction signing failed.', { cause: err });
    }
  }
};
