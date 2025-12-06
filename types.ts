export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

export enum ViewState {
  HOME = 'HOME',
  CHAT = 'CHAT',
  CALL = 'CALL'
}
