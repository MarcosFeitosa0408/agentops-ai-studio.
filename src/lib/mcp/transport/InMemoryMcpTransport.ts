import { McpTransport, JSONRPCMessage } from '../types';

/**
 * InMemoryMcpTransport is a local high-fidelity transport for in-browser MCP testing
 * and simulation. It enables connecting an McpClient to an McpServer directly in memory
 * using symmetric bidirectional channels.
 */
export class InMemoryMcpTransport implements McpTransport {
  private peer?: InMemoryMcpTransport;
  private messageCallbacks: Array<(message: JSONRPCMessage) => void> = [];
  private errorCallbacks: Array<(error: Error) => void> = [];
  private closeCallbacks: Array<() => void> = [];
  private isConnected = false;

  constructor() {}

  /**
   * Connects this transport instance to another peer transport instance.
   */
  public establishConnection(peer: InMemoryMcpTransport): void {
    this.peer = peer;
    this.isConnected = true;
    peer.peer = this;
    peer.isConnected = true;
  }

  public async send(message: JSONRPCMessage): Promise<void> {
    if (!this.isConnected || !this.peer) {
      throw new Error('Transport is not connected to any peer.');
    }

    // Simulate slight asynchronous delivery delay
    setTimeout(() => {
      if (this.peer) {
        this.peer.receive(message);
      }
    }, 5);
  }

  public receive(message: JSONRPCMessage): void {
    for (const cb of this.messageCallbacks) {
      try {
        cb(message);
      } catch (err) {
        this.triggerError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  }

  public onMessage(callback: (message: JSONRPCMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  public onError(callback: (error: Error) => void): void {
    this.errorCallbacks.push(callback);
  }

  public onClose(callback: () => void): void {
    this.closeCallbacks.push(callback);
  }

  public async connect(): Promise<void> {
    // Already established by establishConnection, or ready to establish
    this.isConnected = true;
  }

  public async close(): Promise<void> {
    if (!this.isConnected) return;
    this.isConnected = false;

    // Trigger close locally
    for (const cb of this.closeCallbacks) {
      cb();
    }

    // Trigger close on peer
    if (this.peer) {
      const peerInstance = this.peer;
      this.peer = undefined;
      peerInstance.close().catch(() => {});
    }
  }

  private triggerError(error: Error): void {
    for (const cb of this.errorCallbacks) {
      cb(error);
    }
  }
}
