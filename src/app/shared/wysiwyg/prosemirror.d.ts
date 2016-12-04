declare module 'prosemirror-commands/char' {
  function isWordChar(ch: any): boolean;
  export { isWordChar }
  function charCategory(ch: any): string;
  export { charCategory }
}

declare module 'prosemirror-commands/commands' {
  function deleteSelection(state: any, onAction?: any): boolean;
  export { deleteSelection }
  function joinBackward(state: any, onAction?: any): boolean;
  export { joinBackward }
  function joinForward(state: any, onAction?: any): boolean;
  export { joinForward }
  function deleteCharBefore(state: any, onAction?: any): boolean;
  export { deleteCharBefore }
  function deleteWordBefore(state: any, onAction?: any): boolean;
  export { deleteWordBefore }
  function deleteCharAfter(state: any, onAction?: any): boolean;
  export { deleteCharAfter }
  function deleteWordAfter(state: any, onAction?: any): boolean;
  export { deleteWordAfter }
  function joinUp(state: any, onAction?: any): boolean;
  export { joinUp }
  function joinDown(state: any, onAction?: any): boolean;
  export { joinDown }
  function lift(state: any, onAction?: any): boolean;
  export { lift }
  function newlineInCode(state: any, onAction?: any): boolean;
  export { newlineInCode }
  function createParagraphNear(state: any, onAction?: any): boolean;
  export { createParagraphNear }
  function liftEmptyBlock(state: any, onAction?: any): boolean;
  export { liftEmptyBlock }
  function splitBlock(state: any, onAction?: any): boolean;
  export { splitBlock }
  function selectParentNode(state: any, onAction?: any): boolean;
  export { selectParentNode }
  function moveBackward($pos: any, by: string): number;
  export { moveBackward }
  function moveForward($pos: any, by: string): number;
  export { moveForward }
  function wrapIn(nodeType: any, attrs?: any): (state: any, onAction?: any) => boolean;
  export { wrapIn }
  function setBlockType(nodeType: any, attrs?: any): (state: any, onAction?: any) => boolean;
  export { setBlockType }
  function toggleMark(markType: any, attrs?: any): (state: any, onAction?: any) => boolean;
  export { toggleMark }
  function autoJoin(command: (state: any, onAction?: any) => boolean, isJoinable: any): (state: any, onAction?: any) => boolean;
  export { autoJoin }
  function chainCommands(...commands: any[]): (state: any, onAction?: any) => boolean;
  export { chainCommands }
  const baseKeymap: any;
  export { baseKeymap }
}

declare module 'prosemirror-commands/platform' {
  const mac: boolean;
  export { mac }
  const ios: boolean;
  export { ios }
}

declare module 'prosemirror-keymap/keymap' {
  const keymap: any;
  export { keymap }
}

// incomplete
declare module 'prosemirror-history/history' {
  class HistoryState {
    constructor(done: any, undone: any, prevMap: any, prevTime: any);
  }
  export { HistoryState }
  const history: any;
  export { history }
}

declare module 'prosemirror-inputrules' {
  export { InputRule, inputRules } from 'prosemirror-inputrules/inputrules';
  export { emDash, ellipsis, openDoubleQuote, closeDoubleQuote, openSingleQuote, closeSingleQuote, smartQuotes, allInputRules } from 'prosemirror-inputrules/rules';
  export { wrappingInputRule, textblockTypeInputRule, blockQuoteRule, orderedListRule, bulletListRule, codeBlockRule, headingRule } from 'prosemirror-inputrules/util';
}

declare module 'prosemirror-inputrules/inputrules' {
  class InputRule {
    constructor(match: any, handler: any);
  }
  export { InputRule };
  function inputRules(ref: any): any;
  export { inputRules };
}

declare module 'prosemirror-inputrules/rules' {
  import { InputRule } from 'prosemirror-inputrules';
  const emDash: InputRule;
  export { emDash };
  const ellipsis: InputRule;
  export { ellipsis };
  const openDoubleQuote: InputRule;
  export { openDoubleQuote };
  const closeDoubleQuote: InputRule;
  export { closeDoubleQuote };
  const openSingleQuote: InputRule;
  export { openSingleQuote };
  const closeSingleQuote: InputRule;
  export { closeSingleQuote };
  const smartQuotes: InputRule[];
  export { smartQuotes };
  const allInputRules: InputRule[];
  export { allInputRules };
}

declare module 'prosemirror-inputrules/util' {
  import { InputRule } from 'prosemirror-inputrules';
  function wrappingInputRule(regexp: any, nodeType: any, getAttrs?: any, joinPredicate?: any): InputRule;
  export { wrappingInputRule };
  function textblockTypeInputRule(regexp: any, nodeType: any, getAttrs?: any): InputRule;
  export { textblockTypeInputRule };
  function blockQuoteRule(nodeType: any): InputRule;
  export { blockQuoteRule };
  function orderedListRule(nodeType: any): InputRule;
  export { orderedListRule };
  function bulletListRule(nodeType: any): InputRule;
  export { bulletListRule };
  function codeBlockRule(nodeType: any): InputRule;
  export { codeBlockRule };
  function headingRule(nodeType: any, maxLevel: any): InputRule;
  export { headingRule };
}

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

declare module 'prosemirror-menu' {
  export { MenuItem, Dropdown, DropdownSubmenu, renderGrouped, icons, joinUpItem, liftItem, selectParentNodeItem, undoItem, redoItem, wrapItem, blockTypeItem }  from 'prosemirror-menu/menu';
  export { MenuBarEditorView } from 'prosemirror-menu/menubar';
}

declare module 'prosemirror-menu/icons' {
  function getIcon(icon: any): HTMLDivElement;
  export { getIcon };
}

declare module 'prosemirror-menu/menu' {
  class MenuItem {
    constructor(spec: any);
    render(view: any): any;
  }
  export { MenuItem };
  class Dropdown {
    constructor(content: any, options?: any);
    render(view: any): any;
    expand(dom: any, items: any): { close: any, node: any };
  }
  export { Dropdown };
  class DropdownSubmenu {
    constructor(content: any, options?: any);
    render(view: any): any;
  }
  export { DropdownSubmenu };
  function renderGrouped(view: any, content: any): DocumentFragment;
  export { renderGrouped };
  const icons: {
    join: {
      width: number;
      height: number;
      path: string;
    };
    lift: {
      width: number;
      height: number;
      path: string;
    };
    selectParentNode: {
      text: string;
      css: string;
    };
    undo: {
      width: number;
      height: number;
      path: string;
    };
    redo: {
      width: number;
      height: number;
      path: string;
    };
    strong: {
      width: number;
      height: number;
      path: string;
    };
    em: {
      width: number;
      height: number;
      path: string;
    };
    code: {
      width: number;
      height: number;
      path: string;
    };
    link: {
      width: number;
      height: number;
      path: string;
    };
    bulletList: {
      width: number;
      height: number;
      path: string;
    };
    orderedList: {
      width: number;
      height: number;
      path: string;
    };
    blockquote: {
      width: number;
      height: number;
      path: string;
    };
  };
  export { icons };
  const joinUpItem: MenuItem;
  export { joinUpItem };
  const liftItem: MenuItem;
  export { liftItem };
  const selectParentNodeItem: MenuItem;
  export { selectParentNodeItem };
  const undoItem: MenuItem;
  export { undoItem };
  const redoItem: MenuItem;
  export { redoItem };
  function wrapItem(nodeType: any, options: any): MenuItem;
  export { wrapItem };
  function blockTypeItem(nodeType: any, options: any): MenuItem;
  export { blockTypeItem };
}

declare module 'prosemirror-menu/menubar' {
  class MenuBarEditorView {
    constructor(place: any, props: any);
    wrapper: any;
    editor: any;
    menu: any;
    spacer: any;
    maxHeight: number;
    widthForMaxHeight: number;
    floating: boolean;
    props: any;
    update(props: any): void;
    updateState(state: any): void;
    updateMenu(): void;
    updateScrollCursor(): void;
    updateFloat(): void;
  }
  export { MenuBarEditorView };
}

declare module 'prosemirror-schema-list' {
  const orderedList: { attrs: { order: any }, parseDOM: any[], toDOM: (node: any) => any[] };
  export { orderedList };
  const bulletList: { parseDOM: any[], toDOM: () => any[] };
  export { bulletList };
  const listItem: { parseDOM: any[], toDOM: () => any[], defining: boolean };
  export { listItem };
  function addListNodes(nodes: any, itemContent: string, listGroup?: string): any;
  export { addListNodes }
  function wrapInList(nodeType: any, attrs?: any): (state: any, onAction?: any) => boolean;
  export { wrapInList }
  function splitListItem(nodeType: any): (state: any) => boolean;
  export { splitListItem }
  function liftListItem(nodeType: any): (state: any, onAction?: any) => boolean;
  export { liftListItem }
  function sinkListItem(nodeType: any): (state: any, onAction?: any) => boolean;
  export { sinkListItem }
}

declare module 'prosemirror-state' {
  export { Selection, TextSelection, NodeSelection } from 'prosemirror-state/selection';
  export { EditorTransform, extendTransformAction } from 'prosemirror-state/transform';
  export { EditorState } from 'prosemirror-state/state';
  export { Plugin, PluginKey } from 'prosemirror-state/plugin';
}

declare module 'prosemirror-state/selection' {
  class Selection {
    constructor($from: any, $to: any);
    $from: any;
    $to: any;
    from: any;
    to: any;
    empty: boolean;
    static action(options?: any): any;
    static findFrom($pos: any, dir: any, textOnly?: boolean): Selection;
    static near($pos: any, bias?: number): Selection;
    static atStart(doc: any, textOnly?: boolean): Selection;
    static atEnd(doc: any, textOnly?: boolean): Selection;
    static between($anchor: any, $head: any, bias?: number): Selection;
    static mapJSON(json: any, mapping: any): any;
    static fromJSON (doc: any, json: any): Selection;
  }
  export { Selection }

  class TextSelection extends Selection {
    constructor($anchor: any, $head: any);
    $anchor: any;
    $head: any;
    anchor: any;
    head: any;
    inverted: any;
    eq(other): boolean;
    map(doc: any, mapping: any): TextSelection;
    toJSON (): { head: any, anchor: any };
    create(doc: any, anchor: any, head?: any): TextSelection;
  }
  export { TextSelection }

  class NodeSelection extends Selection {
    constructor($from: any);
    node: any;
    eq(other): boolean;
    map(doc: any, mapping: any): NodeSelection;
    toJSON (): { node: any, after: any };
    create(doc: any, from: any): NodeSelection;
    isSelectable(node: any): boolean;
  }
  export { NodeSelection }
}

declare module 'prosemirror-state/transform' {
  import { Transform } from 'prosemirror-transform';
  import { Selection } from 'prosemirror-state';
  import { Slice } from 'prosemirror-model';

  class EditorTransform extends Transform {
    constructor(state: any);
    state: any;
    curSelection: Selection;
    curSelectionAt: any;
    selectionSet: boolean;
    selection: Selection;
    setSelection(selection: Selection): EditorTransform;
    replaceSelection(slice: Slice): EditorTransform;
    replaceSelectionWith(node: any, inheritMarks?: boolean): EditorTransform;
    deleteSelection(): EditorTransform;
    insertText(text: string, from?: any, to?: any): EditorTransform;
    action(options?: any): any;
    scrollAction(): any;
  }
  export { EditorTransform }
  function extendTransformAction(action: any, f: (transform: Transform) => void): any;
  export { extendTransformAction }
}

declare module 'prosemirror-state/state' {
  import { EditorTransform } from 'prosemirror-state/transform';
  class ViewState {
    inDOMChange: any;
    domChangeMapping: any;
    scrollToSelection: boolean;
    constructor(inDOMChange: any, domChangeMapping: any, scrollToSelection: boolean);
    static initial: ViewState;
  }
  export { ViewState }

  class EditorState {
    config: any;
    constructor(config: any);
    schema: any;
    plugins: any;
    applyAction(action: any): EditorState;
    tr: EditorTransform;
    static create(config): EditorState;
    reconfigure(config): EditorState;
    toJSON(pluginFields?: any): any;
    static fromJSON(config: any, json: any, pluginFields?: any): EditorState;
  }
  export { EditorState }
}

declare module 'prosemirror-state/plugin' {
  class Plugin {
    constructor(options: any);
    props: any;
    options: any;
    key: any;
    getState(state: any): any;
  }
  export { Plugin };
  class PluginKey {
    constructor(name?: any);
    get(state: any): Plugin;
    getState(state: any): any;
  }
  export { PluginKey }
}

declare module 'prosemirror-transform' {
  export { Transform, TransformError } from 'prosemirror-transform/transform';
  export { Step, StepResult } from 'prosemirror-transform/step';
  export { liftTarget, findWrapping, canSplit, canJoin, joinPoint, insertPoint } from 'prosemirror-transform/structure';
  export { StepMap, MapResult, Mapping } from 'prosemirror-transform/map';
  export { AddMarkStep, RemoveMarkStep } from 'prosemirror-transform/mark_step';
  export { ReplaceStep, ReplaceAroundStep } from 'prosemirror-transform/replace_step';
}

declare module 'prosemirror-transform/transform' {
  import { Node, Mark, Slice, MarkType, NodeRange, NodeType } from 'prosemirror-model';
  import { Mapping, Step, StepResult } from 'prosemirror-transform';
  export class Transform {
    constructor(doc: Node);
    doc: Node;
    steps: Step[];
    docs: Node[];
    mapping: Mapping;
    before: Node;
    step(step: Step): this;
    maybeStep(step: Step): StepResult;
    addMark(from: number, to: number, mark: Mark|MarkType): Transform;
    removeMark(from: number, to: number, mark?: Mark|MarkType): Transform;
    clearMarkup(from: number, to: number): Transform;
    clearMarkupFor(pos: number, newType: any, newAttrs: any): Transform;
    replaceRange(from: number, to: number, slice: Slice): Transform;
    replaceRangeWith(from: number, to: number, node: Node): Transform;
    deleteRange(from: number, to: number): Transform;
    delete(from: number, to: number): Transform;
    replace(from: number, to?: number, slice?: Slice): Transform;
    replaceWith(from: number, to: number, content: any): Transform;
    insert(pos: number, content: any): Transform;
    lift(range: NodeRange, target: number): Transform;
    wrap(range: NodeRange, wrappers: any[]): Transform;
    setBlockType(from: number, to?: number, type?: NodeType, attrs?: any): Transform;
    setNodeType(pos: number, type?: NodeType, attrs?: any): Transform;
    split(pos: number, depth?: number, typesAfter?: any): Transform;
    join(pos: number, depth?: number): Transform;
  }
  export interface TransformError {}
}

declare module 'prosemirror-transform/step' {
  import { StepMap } from 'prosemirror-transform';
  class Step {
    constructor();
    apply(_doc: any): StepResult;
    getMap(): StepMap;
    invert(_doc: any): Step;
    map(_mapping: any): Step;
    merge(other: Step): Step;
    toJSON(): {
        stepType: any;
    };
    static fromJSON(schema: any, json: any): Step;
    static jsonID(id: any, stepClass: any): any;
  }
  export { Step };
  class StepResult {
    constructor(doc: any, failed: any);
    static ok(doc: any): StepResult;
    static fail(message: any): StepResult;
    static fromReplace(doc: any, from: any, to: any, slice: any): StepResult;
  }
  export { StepResult };
}

declare module 'prosemirror-transform/map' {
  class MapResult {
    pos: any;
    deleted: boolean;
    recover: any;
    constructor(pos: any, deleted?: boolean, recover?: any);
  }
  export { MapResult };
  class StepMap {
    constructor(ranges: any, inverted?: boolean);
    ranges: any;
    inverted: boolean;
    recover(value: any): any;
    mapResult(pos: any, assoc?: any): MapResult;
    map(pos: any, assoc?: any): any;
    _map(pos: any, assoc: any, simple: boolean): any;
    touches(pos: any, recover: any): boolean;
    forEach (f: any): void;

    invert(): StepMap;
    toString(): string;
  }
  export { StepMap };
  class Mapping {
    constructor(maps?: any[], mirror?: any, from?: any, to?: any);
    slice(from?: any, to?: any): Mapping;
    copy(): Mapping;
    getMirror(n: any): any;
    setMirror (n: any, m: any): void;
    appendMap(map: StepMap, mirrors?: any): void;
    appendMapping(mapping: Mapping): void;
    map(pos: any, assoc?: any): any;
    mapResult(pos: any, assoc?: any): MapResult;
    _map(pos: any, assoc: any, simple: boolean): any;
  }
  export { Mapping };
}

declare module 'prosemirror-transform/mark_step' {
  import { Step, StepResult } from 'prosemirror-transform';
  class AddMarkStep extends Step {
    from: any;
    to: any;
    mark: any;
    constructor(from: any, to: any, mark: any);
  }
  export { AddMarkStep }
  class RemoveMarkStep extends Step {
    from: any;
    to: any;
    mark: any;
    constructor(from: any, to: any, mark: any);
  }
  export { RemoveMarkStep }
}

declare module 'prosemirror-transform/mark' {
}

declare module 'prosemirror-transform/replace_step' {
  import { Step, StepResult } from 'prosemirror-transform/step';
  class ReplaceStep extends Step {
    from: any;
    to: any;
    slice: any;
    structure: any;
    constructor(from: any, to: any, slice: any, structure: any);
  }
  export { ReplaceStep };
  class ReplaceAroundStep extends Step {
    from: any;
    to: any;
    gapFrom: any;
    gapTo: any;
    slice: any;
    insert: any;
    structure: any;
    constructor(from: any, to: any, gapFrom: any, gapTo: any, slice: any, insert: any, structure: any);
  }
  export { ReplaceAroundStep };
}

declare module 'prosemirror-transform/replace' {
  import { Node, Slice } from 'prosemirror-model';
  import { Step } from 'prosemirror-transform';

  function replaceStep(doc: Node, from: number, to?: number, slice?: Slice): Step;
  export { replaceStep };
}

declare module 'prosemirror-transform/structure' {
  import { NodeRange, NodeType } from 'prosemirror-model';
  function liftTarget(range: NodeRange): any;
  export { liftTarget };
  function findWrapping(range: NodeRange, nodeType: NodeType, attrs?: any, innerRange?: NodeRange): any;
  export { findWrapping };
  function canSplit(doc: any, pos: any, depth: number, typesAfter: any): boolean;
  export { canSplit };
  function canJoin(doc: any, pos: any): boolean;
  export { canJoin };
  function joinPoint(doc: any, pos: any, dir?: number): any;
  export { joinPoint };
  function insertPoint(doc: any, pos: any, nodeType: NodeType, attrs?: any): any;
  export { insertPoint };
}

declare module 'prosemirror-model' {
  export { Node } from 'prosemirror-model/node';
  export { ResolvedPos, NodeRange } from 'prosemirror-model/resolvedpos';
  export { Fragment } from 'prosemirror-model/fragment';
  export { Slice, ReplaceError } from 'prosemirror-model/replace';
  export { Mark } from 'prosemirror-model/mark';
  export { Schema, NodeType, MarkType } from 'prosemirror-model/schema';
  export { ContentMatch } from 'prosemirror-model/content';
  export { DOMParser } from 'prosemirror-model/from_dom';
  export { DOMSerializer } from 'prosemirror-model/to_dom';
}

declare module 'prosemirror-model/comparedeep' {
  function compareDeep(a: any, b: any): boolean;
  export { compareDeep };
}

declare module 'prosemirror-model/content' {
  class ContentExpr {
    constuctor(nodeType: any, elements: any, inlineContent: any);
    isLeaf: boolean;
    start(attrs: any): ContentMatch;
    atType(parentAttrs: any, type: any, attrs?: any, marks?: any): ContentMatch;
    matches(attrs: any, fragment: any, from: any, to: any): boolean;
    getMatchAt(attrs: any, fragment: any, index?: any): ContentMatch;
    checkReplace(attrs: any, content: any, from: any, to: any, replacement?: any, start?: any, end?: any): boolean;
    checkReplaceWith(attrs: any, content: any, from: any, to: any, type: any, typeAttrs: any, marks: any): boolean;
    compatible(other): boolean;
    generateContent(attrs: any): any;
    parse(nodeType, expr, specs): ContentExpr;
  }
  export { ContentExpr };
  class ContentMatch {
    constructor(expr: any, attrs: any, index: any, count: any);
    element: any;
    nextElement: any;
    move(index: any, count: any): ContentMatch;
    resolveValue(value): any;
    matchNode(node: any): ContentMatch;
    matchType(type: any, attrs: any, marks?: any[]): void;
    matchFragment(fragment: any, from?: number, to?: number): any;
    matchToEnd(fragment: any, start?: number, end?: number): boolean;
    validEnd(): boolean;
    fillBefore(after: any, toEnd: boolean, startIndex?: number): any;
    possibleContent(): any[];
    allowsMark(markType: any): boolean;
    findWrapping(target: any, targetAttrs?: any, targetMarks?: any[]): any[];
  }
  export { ContentMatch };
}

declare module 'prosemirror-model/diff' {
  function findDiffStart(a: any, b: any, pos: any): any;
  export { findDiffStart };
  function findDiffEnd(a: any, b: any, posA: any, posB: any): any;
  export { findDiffEnd };
}

declare module 'prosemirror-model/fragment' {
  class Fragment {
    constructor(content: any, size: any);
    nodesBetween(from: any, to: any, f: any, nodeStart: any, parent: any): void;
    textBetween(from: any, to: any, blockSeparator?: any, leafText?: any): string;
    append(other: Fragment): Fragment;
    cut(from: any, to?: any): Fragment;
    cutByIndex(from: any, to: any): Fragment;
    replaceChild(index: any, node: any): Fragment;
    addToStart(node: any): Fragment;
    addToEnd(node: any): Fragment;
    eq(other: any): boolean;
    firstChild: any;
    lastChild: any;
    childCount: any;
    child(index: any): any;
    offsetAt(index: any): any;
    maybeChild(index: any): any;
    forEach(f: any): void;
    findDiffStart(other: Fragment, pos?: any): any;
    findDiffEnd(other: any, pos?: any, otherPos?: any): any;
    findIndex(pos: any, round?: any): {
      index: number;
      offset: number;
    };
    toString(): string;
    toStringInner(): string;
    toJSON(): any;
    static fromJSON(schema: any, value: any): Fragment;
    static fromArray(array: any[]): Fragment;
    static from(nodes: any): Fragment;
  }
  export { Fragment };
}

declare module 'prosemirror-model/from_dom' {
  import { Schema, Slice } from 'prosemirror-model';
  class DOMParser {
    constructor(schema: Schema, rules: any[]);
    parse(dom: any, options?: any): any;
    parseSlice(dom: any, options?: any): Slice;
    matchTag(dom: any): any;
    matchStyle(prop: any, value: any): any;
    static schemaRules(schema: Schema): any[];
    static fromSchema(schema: Schema): DOMParser;
  }
  export { DOMParser }
}

declare module 'prosemirror-model/mark' {
  import { MarkType } from 'prosemirror-model/schema';
  class Mark {
    constructor(type: any, attrs: any);
    type: MarkType;
    attrs: any;
    addToSet(set: [Mark]): [Mark];
    removeFromSet(set: [Mark]): [Mark];
    isInSet(set: [Mark]): boolean;
    eq(other: Mark): boolean;
    toJSON(): {
      _: any;
    };
    static fromJSON (schema, json): Mark;
    static sameSet(a: [Mark], b: [Mark]): boolean;
    static setFrom(marks: any): [Mark];
    static none: Mark;
  }
  export { Mark };
}

declare module 'prosemirror-model/node' {
  import { ResolvedPos } from 'prosemirror-model/resolvedpos';
  import { ContentMatch, Mark, MarkType, Slice } from 'prosemirror-model';
  class Node {
    type: any;
    content: any;
    attrs: any;
    marks: any;
    constructor(type: any, attrs: any, content: any, marks: any);
    nodeSize: any;
    childCount: any;
    child(index: any): Node;
    maybeChild(index: any): Node;
    forEach(f: any): void;
    nodesBetween(from?: any, to?: any, f?: any, pos?: any): void;
    descendants(f: any): void;
    textContent: string;
    textBetween(from: any, to: any, blockSeparator?: any, leafText?: any): string;
    firstChild: any;
    lastChild: any;
    eq(other: any): boolean;
    sameMarkup(other: any): boolean;
    hasMarkup(type: any, attrs?: any, marks?: any): boolean;
    copy(content?: any): Node;
    mark(marks: any[]): Node;
    cut(from: any, to?: any): Node;
    slice(from: any, to?: any, includeParents?: boolean): Slice;
    replace(from: any, to: any, slice: Slice): Node;
    nodeAt(pos: any): Node;
    childAfter(pos: any): {
      node: any;
      index: any;
      offset: any;
    };
    childBefore(pos: any): {
      node: any;
      index: any;
      offset: any;
    };
    resolve(pos: any): ResolvedPos;
    resolveNoCache(pos: any): ResolvedPos;
    marksAt(pos: any, useAfter?: boolean): [Mark];
    rangeHasMark(from?: any, to?: any, type?: MarkType): boolean;
    isBlock: boolean;
    isTextblock: boolean;
    isInline: boolean;
    isText: boolean;
    isLeaf: boolean;
    toString(): string;
    contentMatchAt(index: any): ContentMatch;
    canReplace(from: any, to: any, replacement?: any, start?: any, end?: any): boolean;
    canReplaceWith(from: any, to: any, type: any, attrs: any, marks?: any): boolean;
    canAppend(other: any): boolean;
    defaultContentType(at: any): any;
    toJSON(): {
        type: any;
    };
    static fromJSON(schema: any, json: any): any;
  }
  export { Node };

  class TextNode extends Node {
    constructor(type: any, attrs: any, content: any, marks: any);
    toString(): any;
    textBetween(from: any, to: any): string;
    mark(marks: any): TextNode;
    withText(text: any): TextNode;
    cut(from?: any, to?: any): TextNode;
    eq(other: any): boolean;
    toJSON(): {
      type: any;
    };
    textContent: any;
    nodeSize: any;
  }
  export { TextNode };
}

declare module 'prosemirror-model/replace' {
  export const { ReplaceError }: any;
  export class Slice {
    constructor(content: any, openLeft: number, openRight: number);
    content: any;
    openLeft: number;
    openRight: number;
    size: any;
    insertAt(pos: any, fragment: any): boolean;
    removeBetween(from: any, to: any): Slice;
    eq(other: any): boolean;
    toString(): string;
    toJSON(): any;
    static fromJSON(schema: any, json: any): any;
    static maxOpen(fragment: any): Slice;
    static empty: Slice;
  }
  function replace($from: any, $to: any, slice: Slice): any;
  export { replace }
}

declare module 'prosemirror-model/resolvedpos' {
  class ResolvedPos {
    constructor(pos: any, path: any, parentOffset: any);
    pos: any;
    path: any;
    depth: number;
    parentOffset: number;
    parent: any;
    atNodeBoundary: boolean;
    nodeAfter: any;
    nodeBefore: any;
    resolveDepth(val: any): any;
    node(depth: any): any;
    index(depth: any): any;
    indexAfter(depth: any): any;
    start(depth: any): any;
    end(depth: any): any;
    before(depth: any): any;
    after(depth: any): any;
    sameDepth(other: any): number;
    blockRange(other: this, pred: any): any;
    sameParent(other: any): boolean;
    toString(): string;
    plusOne(): ResolvedPos;
    static resolve(doc: any, pos: any): ResolvedPos;
    static resolveCached(doc: any, pos: any): ResolvedPos;
  }
  export { ResolvedPos };
  class NodeRange {
    constructor($from: any, $to: any, depth: any);
    start: any;
    end: any;
    parent: any;
    startIndex: any;
    endIndex: any;
  }
  export { NodeRange };
}

declare module 'prosemirror-model/schema' {
  import { Node, Mark } from 'prosemirror-model';
  class NodeType {
    constructor(name: any, schema: any, spec: any);
    isInline: boolean;
    isTextblock: boolean;
    isLeaf: any;
    hasRequiredAttrs(ignore: any): boolean;
    compatibleContent(other: any): boolean;
    computeAttrs(attrs: any): any;
    create(attrs: any, content: any, marks: any): Node;
    createChecked(attrs: any, content: any, marks: any): Node;
    createAndFill(attrs: any, content: any, marks: any): Node;
    validContent(content: any, attrs: any): any;
    static compile(nodes: any, schema: any): any;
  }
  export { NodeType };
  class MarkType {
    constructor(name: any, rank: any, schema: any, spec: any);
    name: string;
    schema: Schema;
    spec: any;
    attrs: any;
    rank: any;
    instance: any;
    create(attrs: any): Mark;
    static compile(marks: any, schema: any): any;
    removeFromSet(set: [Mark]): [Mark];
    isInSet(set: [Mark]): Mark;
  }
  export { MarkType };
  class Schema {
    constructor(spec: any);
    nodeSpec: any;
    markSpec: any;
    nodes: any;
    marks: any;
    cached: any;
    node(type: any, attrs?: any, content?: any, marks?: any): Node;
    text(text: string, marks?: any): Node;
    mark(type: any, attrs?: any): Mark;
    nodeFromJSON(json: any): Node;
    markFromJSON(json: any): Mark;
    nodeType(name: any): any;
  }
  export { Schema };
}

declare module 'prosemirror-model/to_dom' {
  import { Fragment, Node, Mark, Schema } from 'prosemirror-model';
  class DOMSerializer {
    constructor(nodes: any, marks: any);
    serializeFragment(fragment: Fragment, options?: any, target?: DocumentFragment): DocumentFragment;
    serializeNode(node: Node, options?: any): any;
    serializeNodeAndMarks(node: Node, options?: any): any;
    serializeMark(mark: Mark, options?: any): any;
    renderStructure(structure: any, node: any, options?: any): any;
    static fromSchema (schema: Schema ): DOMSerializer;
    static nodesFromSchema(schema: Schema): any;
    static marksFromSchema(schema: Schema): any;
  }
  export { DOMSerializer }
}
