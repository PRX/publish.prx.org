// Typings reference file, see links for more information
// https://github.com/typings/typings
// https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html

declare var System: any;

// extend jasmine matchers
declare module jasmine {
  interface Matchers {
    toHaveText(expected: string): boolean;
    toContainText(expected: string): boolean;
    toQuery(cssQuery: string): boolean;
    toQueryAttr(cssQuery: string, attrName: string, expected: string): boolean;
    toQueryText(cssQuery: string, expected: string): boolean;
  }
}

// TODO: shouldn't need this, but the getter in test-support warns without
interface NodeModule {
  exports: any;
}
declare var module: NodeModule;

// TODO: npm @types/evaporate has no default export
declare class Evaporate {
  cancel(id: string): boolean;
  constructor(config: any);
  add(config: any): string;
}
declare module 'evaporate' {
  export default Evaporate;
}
