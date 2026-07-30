import { rpc } from '@stellar/stellar-sdk';
import { CONTRACT_IDS } from './sorobanService';

export interface SorobanContractEvent {
  id: string;
  contractId: string;
  topic: string[];
  ledger: number;
  createdAt: string;
  data: any;
}

export class SorobanEventService {
  private static rpcServer: rpc.Server | null = null;

  private static getRpcServer(): rpc.Server {
    if (!this.rpcServer) {
      const rpcUrl = import.meta.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
      this.rpcServer = new rpc.Server(rpcUrl);
    }
    return this.rpcServer;
  }

  /**
   * Fetches recent contract events for specified Soroban contract IDs.
   */
  public static async fetchContractEvents(
    contractIds: string[] = [CONTRACT_IDS.LEASE, CONTRACT_IDS.ESCROW, CONTRACT_IDS.REPUTATION],
    startLedger?: number
  ): Promise<SorobanContractEvent[]> {
    try {
      const server = this.getRpcServer();
      const response = await server.getEvents({
        filters: contractIds.map(id => ({
          type: 'contract',
          contractIds: [id],
        })),
        startLedger,
        limit: 20,
      } as any);

      return (response.events || []).map((ev: any) => ({
        id: ev.id,
        contractId: ev.contractId,
        topic: ev.topic || [],
        ledger: ev.ledger,
        createdAt: ev.ledgerClosedAt || new Date().toISOString(),
        data: ev.value,
      }));
    } catch (err) {
      console.warn('Soroban RPC getEvents query fallback:', err);
      return [];
    }
  }

  /**
   * Subscribes to contract event polling stream.
   */
  public static subscribeToEvents(
    callback: (events: SorobanContractEvent[]) => void,
    intervalMs = 10000
  ): () => void {
    let active = true;

    const poll = async () => {
      if (!active) return;
      const events = await this.fetchContractEvents();
      if (events.length > 0 && active) {
        callback(events);
      }
    };

    poll();
    const timer = setInterval(poll, intervalMs);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }
}
