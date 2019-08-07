// Typings reference file, you can add your own global typings here
// https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html

declare var System: any;

declare module 'langmap' {
  export namespace languageMappingList {
  }
}

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

// TODO: shouldn't need this, but the getter in testing/index.ts warns without
interface NodeModule {
  exports: any;
}
declare var module: NodeModule;