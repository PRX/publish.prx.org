import { ElementRef } from '@angular/core';
import { wrapIn, setBlockType, chainCommands, newlineInCode, toggleMark, baseKeymap } from 'prosemirror-commands';
import { blockQuoteRule, orderedListRule, bulletListRule, codeBlockRule, headingRule,
  inputRules, allInputRules } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { schema, defaultMarkdownParser, defaultMarkdownSerializer } from 'prosemirror-markdown';
import { MenuBarEditorView, icons, MenuItem, Dropdown, DropdownSubmenu,
  wrapItem, blockTypeItem, joinUpItem, liftItem} from 'prosemirror-menu';
import { wrapInList, splitListItem, liftListItem, sinkListItem } from 'prosemirror-schema-list';
import { EditorState, Plugin, Selection } from 'prosemirror-state';
import { Mark, MarkType, Node } from 'prosemirror-model';

export class ProseMirrorImage {
  constructor(public name: string,
              public src: string,
              public title: string,
              public alt: string) {}
}

export class ProseMirrorMarkdownEditor {

  view: MenuBarEditorView;
  savedState: EditorState;

  constructor(private el: ElementRef,
              private value: string,
              private images: ProseMirrorImage[],
              private setModel: Function,
              private promptForLink: Function) {
    this.savedState = EditorState.create(this.stateConfig());
    this.view = new MenuBarEditorView(el.nativeElement, this.viewProps(this.savedState));
  }

  update(images: ProseMirrorImage[]) {
    this.images = images;
    let state = this.view.editor.state.reconfigure(this.stateConfig());
    this.view.update(this.viewProps(state));
  }

  resetEditor() {
    this.view.updateState(this.savedState);
  }

  setSavedState() {
    this.savedState = this.view.editor.state;
  }

  destroy() {
    this.view.editor.destroy();
  }

  isSelectionEmpty() {
    return this.view.editor.state.selection.empty;
  }

  viewProps(state: any) {
    return {
      state,
      onAction: (action) => {
        this.view.updateState(this.view.editor.state.applyAction(action));
        this.setModel(defaultMarkdownSerializer.serialize(this.view.editor.state.doc));
      }
    };
  }

  stateConfig() {
    return {
      doc: defaultMarkdownParser.parse(this.value ? this.value : ''),
      plugins: this.buildMenuItemsPlugin()
    };
  }

  createLinkItem(url, title) {
    if (this.markActive(this.view.editor.state, schema.marks.link)) {
      // can't see how to edit mark, only toggle. So toggle off to toggle back on with new attrs
      toggleMark(schema.marks.link)(this.view.editor.state, this.view.props.onAction);
    }
    toggleMark(schema.marks.link, {
      href: url,
      title
    })(this.view.editor.state, this.view.props.onAction);
  }

  linkItem(markType) {
    return this.markItem(markType, {
      title: 'Add or remove link',
      icon: icons.link,
      run: (state, onAction, view) => {
        if (this.markActive(state, markType)) {
          let linkMark = this.selectAroundMark(markType, state.doc, state.selection.anchor, onAction);
          if (linkMark) {
            this.promptForLink(linkMark.attrs.href, linkMark.attrs.title);
            return true;
          }
        } else {
          this.promptForLink();
        }
      }
    });
  }

  selectAroundMark(markType: MarkType, doc: Node, pos: number, onAction): Mark {
    let $pos = doc.resolve(pos),
      parent = $pos.parent;

    let start = parent.childAfter($pos.parentOffset);
    if (!start.node || start.node.marks.length === 0) {
      // happens if the cursor is at the end of the line or the end of the node, use nodeAt pos - 1 to find node marks
      start.node = parent.nodeAt($pos.parentOffset - 1);
      if (!start.node) {
        return null;
      }
    }

    let targetMark = start.node.marks.find(mark => mark.type.name === markType.name);
    if (!targetMark) {
      return null;
    }

    let startIndex = $pos.index(),
      startPos = $pos.start() + start.offset;
    while (startIndex > 0 && targetMark.isInSet(parent.child(startIndex - 1).marks)) {
      startPos -= parent.child(--startIndex).nodeSize;
    }
    let endIndex = $pos.indexAfter(),
      endPos = startPos + start.node.nodeSize;
    while (endPos < parent.childCount && targetMark.isInSet(parent.child(endIndex).marks)) {
      endPos += parent.child(endIndex++).nodeSize;
    }

    let selection = Selection.between(doc.resolve(startPos), doc.resolve(endPos));
    onAction(selection.action());

    return targetMark;
  }

  insertImageItem(image: ProseMirrorImage, label: string) {
    return new MenuItem({
      title: 'Insert image',
      label,
      select: (state) => {
        return this.canInsert(state, schema.nodes.image);
      },
      run: (state, _, view) => {
        view.props.onAction(view.state.tr.replaceSelectionWith(schema.nodes.image.createAndFill(image)).action());
      }
    });
  }

  cmdItem(cmd, options) {
    let passedOptions = {
      label: options.title,
      run: cmd,
      select: (state) => {
        return cmd(state);
      }
    };
    for (let prop in options) {
      if (options.hasOwnProperty(prop)) {
        passedOptions[prop] = options[prop];
      }
    }
    return new MenuItem(passedOptions);
  }

  markActive(state, type) {
    let {from, to, empty} = state.selection;
    if (empty) {
      let activeMark = type.isInSet(state.storedMarks || state.doc.marksAt(from));
      // trick prosemirror into checking from + 1 in case the cursor is at the beginning of a mark
      if (!activeMark || activeMark.length === 0) {
        activeMark = type.isInSet(state.doc.marksAt(from + 1));
      }
      return activeMark;
    } else {
      return state.doc.rangeHasMark(from, to, type);
    }
  }

  markItem(markType, options) {
    let passedOptions = {
      active: (state) => {
        return this.markActive(state, markType);
      }
    };
    for (let prop in options) {
      if (options.hasOwnProperty(prop)) {
        passedOptions[prop] = options[prop];
      }
    }
    return this.cmdItem(toggleMark(markType), passedOptions);
  }

  wrapListItem(nodeType, options) {
    return this.cmdItem(wrapInList(nodeType, options.attrs), options);
  }

  canInsert(state, nodeType, attrs = undefined) {
    let $from = state.selection.$from;
    for (let d = $from.depth; d >= 0; d--) {
      let index = $from.index(d);
      if ($from.node(d).canReplaceWith(index, index, nodeType, attrs)) {
        return true;
      }
    }
    return false;
  }

  buildKeymap(schema, mapKeys = undefined) {
    const mac = typeof navigator !== 'undefined' ? /Mac/.test(navigator.platform) : false;
    let keys = {};
    function bind(key, cmd) {
      if (mapKeys) {
        let mapped = mapKeys[key];
        if (mapped === false) {
          return;
        }
        if (mapped) {
          key = mapped;
        }
      }
      keys[key] = cmd;
    }

    if (schema.marks.strong) {
      bind('Mod-b', toggleMark(schema.marks.strong));
    }
    if (schema.marks.em) {
      bind('Mod-i', toggleMark(schema.marks.em));
    }
    if (schema.marks.code) {
      bind('Mod-`', toggleMark(schema.marks.code));
    }
    if (schema.nodes.bullet_list) {
      bind('Shift-Ctrl-8', wrapInList(schema.nodes.bullet_list));
    }
    if (schema.nodes.ordered_list) {
      bind('Shift-Ctrl-9', wrapInList(schema.nodes.ordered_list));
    }
    if (schema.nodes.blockquote) {
      bind('Ctrl->', wrapIn(schema.nodes.blockquote));
    }
    if (schema.nodes.hard_break) {
      let cmd = chainCommands(newlineInCode, (state, onAction) => {
        onAction(state.tr.replaceSelectionWith(schema.nodes.hard_break.create()).scrollAction());
        return true;
      });
      bind('Mod-Enter', cmd);
      bind('Shift-Enter', cmd);
      if (mac) {
        bind('Ctrl-Enter', cmd);
      }
    }
    if (schema.nodes.list_item) {
      bind('Enter', splitListItem(schema.nodes.list_item));
      bind('Mod-[', liftListItem(schema.nodes.list_item));
      bind('Mod-]', sinkListItem(schema.nodes.list_item));
    }
    if (schema.nodes.paragraph) {
      bind('Shift-Ctrl-0', setBlockType(schema.nodes.paragraph));
    }
    if (schema.nodes.code_block) {
      bind('Shift-Ctrl-\\', setBlockType(schema.nodes.code_block));
    }
    if (schema.nodes.heading) {
      for (let i = 1; i <= 6; i++) {
        bind('Shift-Ctrl-' + i, setBlockType(schema.nodes.heading, {level: i}));
      }
    }
    if (schema.nodes.horizontal_rule) {
      bind('Mod-_', (state, onAction) => {
        onAction(state.tr.replaceSelectionWith(schema.nodes.horizontal_rule.create()).scrollAction());
        return true;
      });
    }

    return keys;
  }

  buildInputRules(schema) {
    let result = [];
    if (schema.nodes.blockquote) {
      result.push(blockQuoteRule(schema.nodes.blockquote));
    }
    if (schema.nodes.ordered_list) {
      result.push(orderedListRule(schema.nodes.ordered_list));
    }
    if (schema.nodes.bullet_list) {
      result.push(bulletListRule(schema.nodes.bullet_list));
    }
    if (schema.nodes.code_block) {
      result.push(codeBlockRule(schema.nodes.code_block));
    }
    if (schema.nodes.heading) {
      result.push(headingRule(schema.nodes.heading, 6));
    }
    return result;
  }

  buildMenuItemsPlugin() {
    let r = {};

    if (schema.marks.strong) {
      r['toggleStrong'] = this.markItem(schema.marks.strong, {title: 'Toggle strong style', icon: icons.strong});
    }
    if (schema.marks.em) {
      r['toggleEm'] = this.markItem(schema.marks.em, {title: 'Toggle emphasis', icon: icons.em});
    }
    if (schema.marks.code) { // this one is bonus
      r['toggleCode'] = this.markItem(schema.marks.code, {title: 'Toggle code font', icon: icons.code});
    }
    if (schema.marks.link) {
      r['toggleLink'] = this.linkItem(schema.marks.link);
    }
    if (schema.nodes.image && this.images && this.images.length > 0) {
      r['insertImage'] = this.insertImageItem(this.images[0], 'Image: ' + this.images[0].name);
      for (let i = 0; i < this.images.length; i++) {
        r['insertImage' + i] = this.insertImageItem(this.images[i], this.images[i].name);
      }
    }
    if (schema.nodes.bullet_list) { // lists are bonus
      r['wrapBulletList'] = this.wrapListItem(schema.nodes.bullet_list, {
        title: 'Wrap in bullet list',
        icon: icons.bulletList
      });
    }
    if (schema.nodes.ordered_list) { // bonus
      r['wrapOrderedList'] = this.wrapListItem(schema.nodes.ordered_list, {
        title: 'Wrap in ordered list',
        icon: icons.orderedList
      });
    }
    if (schema.nodes.blockquote) { // bonus
      r['wrapBlockQuote'] = wrapItem(schema.nodes.blockquote, {
        title: 'Wrap in block quote',
        icon: icons.blockquote
      });
    }
    if (schema.nodes.paragraph) {
      r['makeParagraph'] = blockTypeItem(schema.nodes.paragraph, {
        title: 'Change to paragraph',
        label: 'Plain'
      });
    }
    if (schema.nodes.code_block) {// bonus
      r['makeCodeBlock'] = blockTypeItem(schema.nodes.code_block, {
        title: 'Change to code block',
        label: 'Code'
      });
    }
    if (schema.nodes.heading) {
      for (let i = 1; i <= 6; i++) {
        r['makeHead' + i] = blockTypeItem(schema.nodes.heading, {
          title: 'Change to heading ' + i,
          label: 'Level ' + i,
          attrs: {level: i}
        });
      }
    }
    if (schema.nodes.horizontal_rule) {// bonus
      r['insertHorizontalRule'] = new MenuItem({
        title: 'Insert horizontal rule',
        label: 'Horizontal rule',
        select: (state) => {
          return this.canInsert(state, schema.nodes.horizontal_rule);
        },
        run: (state, onAction) => {
          onAction(state.tr.replaceSelectionWith(schema.nodes.horizontal_rule.create()).action());
        }
      });
    }

    let cut = arr => arr.filter(x => x);
    if (this.images && this.images.length > 1) {
      let imageSubs = Object.keys(r).filter(key => key.match(/insertImage+/)).map(key => r[key]);
      let imageSubMenu = new DropdownSubmenu(imageSubs, {label: 'Image'});
      r['insertMenu'] = new Dropdown(cut([imageSubMenu, r['insertHorizontalRule']]), {label: 'Insert'});
    } else {
      r['insertMenu'] = new Dropdown(cut([r['insertImage'], r['insertHorizontalRule']]), {label: 'Insert'});
    }
    r['typeMenu'] = new Dropdown(cut([r['makeParagraph'], r['makeCodeBlock'], r['makeHead1'] && new DropdownSubmenu(cut([
      r['makeHead1'], r['makeHead2'], r['makeHead3'], r['makeHead4'], r['makeHead5'], r['makeHead6']
    ]), {label: 'Heading'})]), {label: 'Type...'});

    r['inlineMenu'] = [cut([r['toggleStrong'], r['toggleEm'], r['toggleCode'], r['toggleLink']]), [r['insertMenu']]];
    r['blockMenu'] = [cut([r['typeMenu'], r['wrapBulletList'], r['wrapOrderedList'], r['wrapBlockQuote'], joinUpItem,
      liftItem])];
    r['fullMenu'] = r['inlineMenu'].concat(r['blockMenu']);

    let deps = [
      inputRules({rules: allInputRules.concat(this.buildInputRules(schema))}),
      keymap(this.buildKeymap(schema)),
      keymap(baseKeymap)
    ];
    // seems odd but testing throws this error: RangeError: Adding different instances of a keyed plugin (plugin$)
    deps[0].key = 'inputRules';
    deps[1].key = 'mdKeymap';

    return deps.concat(new Plugin({
      props: {
        class: () => 'ProseMirror-example-setup-style',
        menuContent: r['fullMenu'],
        floatingMenu: true
      }
    }));
  }
}
