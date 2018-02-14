import { RootEmitter } from './root_emitter';

export declare class Emitter extends RootEmitter {
  constructor(any);
  addChild(childName: any, childOb: any): void;
  get(key: string): void;
  set(key: string, value: any): void;
  plugin(module: any): void;
  bindProtoPlugins(): void;
  trigger(event: string, payload: any, done: any): void;
  runPluginQueue(location: any, event: any, first: any, last: any): void;
  onConstructed(): void;
}
