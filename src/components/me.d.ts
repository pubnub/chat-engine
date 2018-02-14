import { User } from './user';
import { Chat } from './chat';

export declare class Me extends User {
  constructor(chatEngine: any, uuid: string, authData: any)
  assign(state: any): void;
  addChatToSession(chat: Chat): void;
  removeChatFromSession(chat: Chat): void;
}
