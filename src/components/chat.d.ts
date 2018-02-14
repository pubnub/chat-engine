import { RootEmitter } from '../modules/root_emitter';

export declare class Chat extends RootEmitter {
  constructor(chatEngine: any, channel: any, isPrivate: boolean, autoConnect: boolean, meta: any, group: string);

  onHereNow(status: any, response: any);
  objectify(): any;
  invite(user: any): void;
  onPresence(presenceEvent: any): void;
  update(data: any): void;
  emit(event: string, data: any): void;
  createUser(uuid: string, state: any): void;
  userUpdate(uuid: string, state: any): void;
  leave(): void;
  userLeave(uuid: string): void;
  userDisconnect(uuid: string): void;
  setState(state: any): void;
  search(config: any): void;
  onConnectionReady(): void;
  getUserUpdates(): void;
  connect(): void;
}
