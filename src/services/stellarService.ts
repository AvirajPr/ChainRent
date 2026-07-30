import { Horizon, TransactionBuilder, Operation, Asset } from '@stellar/stellar-sdk';
import { NetworkService } from './networkService';

export const StellarService = {
  getServer(): Horizon.Server {
    return new Horizon.Server(NetworkService.getHorizonUrl());
  },

  async fetchAccount(publicKey: string) {
    const server = this.getServer();
    try {
      const account = await server.loadAccount(publicKey);
      return account;
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        throw new Error('ACCOUNT_NOT_FOUND', { cause: err });
      }
      throw err;
    }
  },

  async fetchBalance(publicKey: string): Promise<{ balance: number; assets: Array<{ code: string; issuer: string; balance: number; limit: number }> }> {
    try {
      const account = await this.fetchAccount(publicKey);
      let nativeBalance = 0;
      const assets: Array<{ code: string; issuer: string; balance: number; limit: number }> = [];

      account.balances.forEach((bal: any) => {
        if (bal.asset_type === 'native') {
          nativeBalance = parseFloat(bal.balance);
        } else {
          assets.push({
            code: bal.asset_code || '',
            issuer: bal.asset_issuer || '',
            balance: parseFloat(bal.balance),
            limit: parseFloat(bal.limit)
          });
        }
      });

      return { balance: nativeBalance, assets };
    } catch (err: any) {
      if (err.message === 'ACCOUNT_NOT_FOUND') {
        return { balance: 0, assets: [] };
      }
      console.error('Error fetching balance:', err);
      return { balance: 0, assets: [] };
    }
  },

  async fundWithFriendbot(publicKey: string): Promise<string> {
    try {
      const url = `https://friendbot.stellar.org/?addr=${encodeURIComponent(publicKey)}`;
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Friendbot request failed');
      }
      const data = await res.json();
      return data.hash || '';
    } catch (err: any) {
      console.error('Friendbot funding failed:', err);
      throw err;
    }
  },

  async buildPaymentTx(fromAddress: string, toAddress: string, amount: number): Promise<string> {
    try {
      const account = await this.fetchAccount(fromAddress);
      const server = this.getServer();

      let operation;
      try {
        await server.loadAccount(toAddress);
        operation = Operation.payment({
          destination: toAddress,
          asset: Asset.native(),
          amount: amount.toFixed(7)
        });
      } catch (err: any) {
        operation = Operation.createAccount({
          destination: toAddress,
          startingBalance: amount.toFixed(7)
        });
      }

      const tx = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: NetworkService.getNetworkPassphrase(),
      })
      .addOperation(operation)
      .setTimeout(180)
      .build();

      return tx.toXDR();
    } catch (err: any) {
      if (err.message === 'ACCOUNT_NOT_FOUND') {
        throw new Error('Your connected Stellar account is not funded on the Testnet. Please fund it using the Wallet Hub.', { cause: err });
      }
      throw err;
    }
  },

  async buildAccountMergeTx(fromAddress: string, toAddress: string): Promise<string> {
    try {
      const account = await this.fetchAccount(fromAddress);

      const operation = Operation.accountMerge({
        destination: toAddress
      });

      const tx = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: NetworkService.getNetworkPassphrase(),
      })
      .addOperation(operation)
      .setTimeout(180)
      .build();

      return tx.toXDR();
    } catch (err: any) {
      if (err.message === 'ACCOUNT_NOT_FOUND') {
        throw new Error('Escrow account not found or has already been merged.', { cause: err });
      }
      throw err;
    }
  },

  async submitTx(signedXdr: string): Promise<string> {
    const server = this.getServer();
    const tx = TransactionBuilder.fromXDR(signedXdr, NetworkService.getNetworkPassphrase());
    try {
      const result = await server.submitTransaction(tx);
      return result.hash;
    } catch (err: any) {
      console.error('Submit transaction failed:', err);
      if (err.response && err.response.data && err.response.data.extras && err.response.data.extras.result_codes) {
        throw new Error(`Transaction failed: ${JSON.stringify(err.response.data.extras.result_codes)}`, { cause: err });
      }
      throw err;
    }
  }
};
