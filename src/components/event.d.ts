import { Chat } from './chat';

export declare class Event {
  constructor(chatEngine: any, chat: Chat, event: string);
  onMessage(m: any): void;
  publish(m: any): void;
}
