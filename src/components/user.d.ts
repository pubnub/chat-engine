import { Emitter } from '../modules/emitter';

export declare class User extends Emitter {
  constructor(chatEngine: any, uuid: string, state: any);
  update(state: any): void;
  assign(state: any): void;
}
