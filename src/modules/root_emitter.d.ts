export declare class RootEmitter {
  constructor();
  events: any;
  on(event: string, callback: (payload: any) => void): void;
  off(event: string, callback: (payload: any) => void): void;
  any(callback: (event: any, payload: any) => void): void;
  one(event: string, callback: (event: string, payload: any) => void): void;
}
