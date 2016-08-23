// Typings reference file, see links for more information
// https://github.com/typings/typings
// https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html

declare var System: any;
declare var module: { id: string };
declare var require: any;

// TODO: npm @types/evaporate has no default export
declare class Evaporate {
  cancel(id: string): boolean;
  constructor(config: any);
  add(config: any): string;
}
declare module 'evaporate' {
  export default Evaporate;
}
