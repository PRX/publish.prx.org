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

// TODO: npm @types/evaporate has no default export
declare class Evaporate {
  cancel(id: string): boolean;
  constructor(config: any);
  add(config: any): string;
}
declare module 'evaporate' {
  export default Evaporate;
}

// TODO: create a @type for aurora
interface AssetFormat {
  bitrate: number;
  channelsPerFrame: number;
  floatingPoint: boolean;
  formatID: string;
  layer: number;
  sampleRate: number;
}
declare namespace AV {
  class Asset {
    active: boolean;
    duration: number;
    format: AssetFormat;
    metadata: any;
    static fromURL(url: string): Asset;
    static fromFile(file: File): Asset;
    get(event: string, callback: Function);
  }
  class Player {
    duration: number;
    playing: boolean;
    currentTime: number;
    static fromURL(url: string): Player;
    static fromFile(file: File): Player;
    on(event: string, callback: Function);
    preload();
    play();
    seek(timeMs: number);
    pause();
    stop();
  }
}

declare var require: any;
