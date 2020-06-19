declare module 'prosemirror-markdown' {
  export { schema } from 'prosemirror-markdown/schema';
  export { defaultMarkdownParser, MarkdownParser } from 'prosemirror-markdown/from_markdown';
  export { MarkdownSerializer, defaultMarkdownSerializer, MarkdownSerializerState } from 'prosemirror-markdown/to_markdown';
}

declare module 'prosemirror-markdown/schema' {
  import { Schema } from 'prosemirror-model';
  const schema: Schema;
  export { schema };
}

declare module 'prosemirror-markdown/from_markdown' {
  class MarkdownParser {
    constructor(schema: any, tokenizer: any, tokens: any);
    parse(text: any): any;
  }
  export { MarkdownParser };
  const defaultMarkdownParser: MarkdownParser;
  export { defaultMarkdownParser };
}

declare module 'prosemirror-markdown/to_markdown' {
  class MarkdownSerializer {
    constructor(nodes: any, marks: any);
    serialize(content: any, options?: any): string;
  }
  export { MarkdownSerializer };
  const defaultMarkdownSerializer: MarkdownSerializer;
  export { defaultMarkdownSerializer };
  class MarkdownSerializerState {
    constructor(nodes: any, marks: any, options: any);
    flushClose(size: any): void;
    wrapBlock(delim: any, firstDelim: any, node: any, f: any): void;
    atBlank(): boolean;
    ensureNewLine(): void;
    write(content?: any): void;
    closeBlock(node: any): void;
    text(text: any, escape?: boolean): void;
    render(node: any): void;
    renderContent(parent: any): void;
    renderInline(parent: any): void;
    renderList(node: any, delim: any, firstDelim: any): void;
    esc(str: string, startOfLine?: boolean): string;
    quote(str: string): string;
    repeat(str: string, n: number): string;
    markString(mark: any, open: any): string;
  }
  export { MarkdownSerializerState };
}
