declare class Evaporate {
  static cancel(id:string): boolean;
  constructor(config:any);
  add(config:any): string;
}

declare module 'evaporate' {
  export = Evaporate;
}
