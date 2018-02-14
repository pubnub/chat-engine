import { Emitter } from '../modules/emitter';
import { Chat } from './chat';

export declare class Search extends Emitter {
  constructor(chatEngine: any, chat: Chat, config: any);
  sortHistory(messages: any, desc: any): void;
  page(pageDone: (args: any) => void): void;
  triggerHistory(message: any, cb: () => void): void;
  find(): void;
}
