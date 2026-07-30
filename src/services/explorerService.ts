import { NetworkService } from './networkService';

export const ExplorerService = {
  getBaseUrl(): string {
    const network = NetworkService.getNetworkName().toLowerCase();
    return `https://stellar.expert/explorer/${network}`;
  },

  getTransactionUrl(hash: string): string {
    return `${this.getBaseUrl()}/tx/${hash}`;
  },

  getAccountUrl(address: string): string {
    return `${this.getBaseUrl()}/account/${address}`;
  },

  getOperationUrl(opId: string): string {
    return `${this.getBaseUrl()}/op/${opId}`;
  }
};
