import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '@/stores/auth.store';

export class SignalRConnection {
  private connection: signalR.HubConnection | null = null;
  private reconnectRetries = 0;
  private maxReconnectRetries = 5;

  constructor(private hubUrl: string) {}

  async start(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const { accessToken } = useAuthStore.getState();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => accessToken,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount >= this.maxReconnectRetries) {
            return null; // Stop retrying
          }
          return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.onreconnecting((error) => {
      console.warn('SignalR reconnecting:', error);
      this.reconnectRetries++;
    });

    this.connection.onreconnected(() => {
      console.log('SignalR reconnected');
      this.reconnectRetries = 0;
    });

    this.connection.onclose((error) => {
      console.error('SignalR connection closed:', error);
    });

    try {
      await this.connection.start();
      console.log('SignalR connected to', this.hubUrl);
    } catch (error) {
      console.error('SignalR connection failed:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  on(eventName: string, callback: (...args: any[]) => void): void {
    if (!this.connection) {
      throw new Error('Connection not started');
    }
    this.connection.on(eventName, callback);
  }

  off(eventName: string, callback: (...args: any[]) => void): void {
    if (!this.connection) return;
    this.connection.off(eventName, callback);
  }

  async invoke(methodName: string, ...args: any[]): Promise<any> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR not connected');
    }
    return await this.connection.invoke(methodName, ...args);
  }

  get state(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }
}
