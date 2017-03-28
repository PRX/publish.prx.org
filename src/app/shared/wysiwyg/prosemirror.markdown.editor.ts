import { ElementRef } from '@angular/core';
import { wrapIn, setBlockType, chainCommands, newlineInCode, toggleMark, baseKeymap } from 'prosemirror-commands';
import { blockQuoteRule, orderedListRule, bulletListRule, codeBlockRule, headingRule,
  inputRules, allInputRules } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { schema as markdownSchema, defaultMarkdownParser, defaultMarkdownSerializer } from 'prosemirror-markdown';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { MenuBarEditorView, icons, MenuItem, Dropdown, DropdownSubmenu,
  wrapItem, blockTypeItem, joinUpItem, liftItem } from 'prosemirror-menu';
import { wrapInList, splitListItem, liftListItem, sinkListItem } from 'prosemirror-schema-list';
import { EditorState, Plugin, Selection } from 'prosemirror-state';
import { DOMParser, Mark, MarkType, Node, ResolvedPos, Schema } from 'prosemirror-model';

export class ProseMirrorImage {
  constructor(public name: string,
              public src: string,
              public title: string,
              public alt: string) {}
}

export const ProseMirrorFormatTypes = {
  HTML: 'HTML',
  MARKDOWN: 'MARKDOWN'
};

export class ProseMirrorMarkdownEditor {

  view: MenuBarEditorView;
  outputSchema: Schema;

  constructor(private el: ElementRef,
              private content: string,
              private inputFormat: string,
              private outputFormat: string,
              private images: ProseMirrorImage[],
              private setModel: Function,
              private promptForLink: Function) {
    this.outputSchema = this.outputFormat === ProseMirrorFormatTypes.HTML ? basicSchema : markdownSchema;
    let state = EditorState.create(this.stateConfig());
    this.view = new MenuBarEditorView(el.nativeElement, this.viewProps(state));
    if (this.inputFormat === ProseMirrorFormatTypes.MARKDOWN && this.outputFormat === ProseMirrorFormatTypes.HTML) {
      this.plainTextPlusLinks();
    }
  }

  update(content: string, images?: ProseMirrorImage[]) {
    if (content !== this.content || images) {
      this.content = content;
      this.images = images || this.images;
      let state = EditorState.create(this.stateConfig());
      this.view.update(this.viewProps(state));
    }
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
      dispatchTransaction: (transaction) => {
        this.view.updateState(this.view.editor.state.apply(transaction));
        if (this.outputFormat === ProseMirrorFormatTypes.HTML) {
          this.setModel(this.view.editor.docView.dom.innerHTML);
        } else {
          this.setModel(defaultMarkdownSerializer.serialize(this.view.editor.state.doc));
        }
      }
    };
  }

  stateConfig() {
    let config = {plugins: this.buildMenuItemsPlugin()};
    if (this.inputFormat === ProseMirrorFormatTypes.HTML) {
      let domNode = document.createElement('div');
      domNode.innerHTML = this.content;
      config['doc'] = DOMParser.fromSchema(basicSchema).parse(domNode);
    } else {
      config['doc'] = defaultMarkdownParser.parse(this.content ? this.content : '');
    }
    return config;
  }

  plainTextPlusLinks() {
    // remove unsupported marks
    let transaction = this.view.editor.state.tr
      .removeMark(0, this.view.editor.state.doc.nodeSize - 2, markdownSchema.marks.strong)
      .removeMark(0, this.view.editor.state.doc.nodeSize - 2, markdownSchema.marks.em)
      .removeMark(0, this.view.editor.state.doc.nodeSize - 2, markdownSchema.marks.code);

    this.view.updateState(this.view.editor.state.apply(transaction));

    /* This removes images but also removes links too :( don't use this
    this.view.updateState(this.view.editor.state.apply(this.view.editor.state.tr.clearMarkup(0, this.view.editor.state.doc.nodeSize - 2)));
    */

    // get the plain text plus links content
    let content = [];
    const getContent = (node) => {
      console.log(node.textContent);

      if (node.type.name === 'text') {
        if (markdownSchema.marks.link.isInSet(node.marks)) {
          console.log('link node', node);
          content.push(node);
        } else {
          if (content.length > 0 && typeof content[content.length - 1] === 'string') {
            content[content.length - 1] += ' ' + node.textContent;
          } else {
            content.push(node.textContent);
          }
        }
      }
      node.forEach((child, offset, index) => getContent(child));
    };
    getContent(this.view.editor.state.doc);

    // clear the content
    transaction = this.view.editor.state.tr.delete(0, this.view.editor.state.doc.nodeSize - 2);
    this.view.updateState(this.view.editor.state.apply(transaction));

    // build the content back up
    transaction = this.view.editor.state.tr;
    content.forEach(node => {
      if (typeof node === 'string') {
        transaction = transaction.insertText(node, transaction.doc.nodeSize - 2);
      } else {
        transaction = transaction.insert(transaction.doc.nodeSize - 2, node);
      }
    });
    this.view.updateState(this.view.editor.state.apply(transaction));

    // join nodes, needs work
    /*transaction = this.view.editor.state.tr;
    this.view.editor.state.doc.forEach((child, offset, index) => {
      transaction = transaction.join(child.nodeSize);
    });
    this.view.updateState(this.view.editor.state.apply(transaction));*/
  }

  createLinkItem(url, title) {
    if (this.markActive(this.view.editor.state, this.outputSchema.marks.link)) {
      // can't see how to edit mark, only toggle. So toggle off to toggle back on with new attrs
      toggleMark(this.outputSchema.marks.link)(this.view.editor.state, this.view.props.dispatchTransaction);
    }
    toggleMark(this.outputSchema.marks.link, {
      href: url,
      title
    })(this.view.editor.state, this.view.props.dispatchTransaction);
  }

  linkItem(markType) {
    return this.markItem(markType, {
      title: 'Add or remove link',
      icon: icons.link,
      run: (state, dispatchTransaction, view) => {
        if (this.markActive(state, markType)) {
          let linkMark = this.selectAroundMark(markType, state.doc, state.selection.anchor, dispatchTransaction);
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

  selectAroundMark(markType: MarkType, doc: Node, pos: number, dispatchTransaction): Mark {
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
    dispatchTransaction(this.view.editor.state.tr.setSelection(selection));

    return targetMark;
  }

  insertImageItem(image: ProseMirrorImage, label: string) {
    return new MenuItem({
      title: 'Insert image',
      label,
      select: (state) => {
        return this.canInsert(state, this.outputSchema.nodes.image);
      },
      run: (state, _, view) => {
        view.props.dispatchTransaction(view.state.tr.replaceSelectionWith(this.outputSchema.nodes.image.createAndFill(image)));
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
      let pos = state.doc.resolve(from);
      let activeMark = type.isInSet(state.storedMarks || pos.marks(true));
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

  buildKeymap(mapKeys = undefined) {
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

    if (this.outputSchema.marks.strong) {
      bind('Mod-b', toggleMark(this.outputSchema.marks.strong));
    }
    if (this.outputSchema.marks.em) {
      bind('Mod-i', toggleMark(this.outputSchema.marks.em));
    }
    if (this.outputSchema.marks.code) {
      bind('Mod-`', toggleMark(this.outputSchema.marks.code));
    }
    if (this.outputSchema.nodes.bullet_list) {
      bind('Shift-Ctrl-8', wrapInList(this.outputSchema.nodes.bullet_list));
    }
    if (this.outputSchema.nodes.ordered_list) {
      bind('Shift-Ctrl-9', wrapInList(this.outputSchema.nodes.ordered_list));
    }
    if (this.outputSchema.nodes.blockquote) {
      bind('Ctrl->', wrapIn(this.outputSchema.nodes.blockquote));
    }
    if (this.outputSchema.nodes.hard_break) {
      let cmd = chainCommands(newlineInCode, (state, dispatchTransaction) => {
        dispatchTransaction(state.tr.replaceSelectionWith(this.outputSchema.nodes.hard_break.create()).scrollIntoView());
        return true;
      });
      bind('Mod-Enter', cmd);
      bind('Shift-Enter', cmd);
      if (mac) {
        bind('Ctrl-Enter', cmd);
      }
    }
    if (this.outputSchema.nodes.list_item) {
      bind('Enter', splitListItem(this.outputSchema.nodes.list_item));
      bind('Mod-[', liftListItem(this.outputSchema.nodes.list_item));
      bind('Mod-]', sinkListItem(this.outputSchema.nodes.list_item));
    }
    if (this.outputSchema.nodes.paragraph) {
      bind('Shift-Ctrl-0', setBlockType(this.outputSchema.nodes.paragraph));
    }
    if (this.outputSchema.nodes.code_block) {
      bind('Shift-Ctrl-\\', setBlockType(this.outputSchema.nodes.code_block));
    }
    if (this.outputSchema.nodes.heading) {
      for (let i = 1; i <= 6; i++) {
        bind('Shift-Ctrl-' + i, setBlockType(this.outputSchema.nodes.heading, {level: i}));
      }
    }
    if (this.outputSchema.nodes.horizontal_rule) {
      bind('Mod-_', (state, dispatchTransaction) => {
        dispatchTransaction(state.tr.replaceSelectionWith(this.outputSchema.nodes.horizontal_rule.create()).scrollIntoView());
        return true;
      });
    }

    return keys;
  }

  buildInputRules() {
    let result = [];
    if (this.outputSchema.nodes.blockquote) {
      result.push(blockQuoteRule(this.outputSchema.nodes.blockquote));
    }
    if (this.outputSchema.nodes.ordered_list) {
      result.push(orderedListRule(this.outputSchema.nodes.ordered_list));
    }
    if (this.outputSchema.nodes.bullet_list) {
      result.push(bulletListRule(this.outputSchema.nodes.bullet_list));
    }
    if (this.outputSchema.nodes.code_block) {
      result.push(codeBlockRule(this.outputSchema.nodes.code_block));
    }
    if (this.outputSchema.nodes.heading) {
      result.push(headingRule(this.outputSchema.nodes.heading, 6));
    }
    return result;
  }

  buildMenuItemsPlugin() {
    let r = {};

    if (this.outputFormat === ProseMirrorFormatTypes.MARKDOWN &&
      this.outputSchema.marks.strong) {
      r['toggleStrong'] = this.markItem(this.outputSchema.marks.strong, {title: 'Toggle strong style', icon: icons.strong});
    }
    if (this.outputFormat === ProseMirrorFormatTypes.MARKDOWN &&
      this.outputSchema.marks.em) {
      r['toggleEm'] = this.markItem(this.outputSchema.marks.em, {title: 'Toggle emphasis', icon: icons.em});
    }
    if (this.outputFormat === ProseMirrorFormatTypes.MARKDOWN &&
      this.outputSchema.marks.code) { // this one is bonus
      r['toggleCode'] = this.markItem(this.outputSchema.marks.code, {title: 'Toggle code font', icon: icons.code});
    }
    if (this.outputSchema.marks.link) {
      r['toggleLink'] = this.linkItem(this.outputSchema.marks.link);
    }
    if (this.outputFormat === ProseMirrorFormatTypes.MARKDOWN &&
      this.outputSchema.nodes.image && this.images && this.images.length > 0) {
      if (this.images.length === 1) {
        r['insertImage'] = this.insertImageItem(this.images[0], 'Image: ' + this.images[0].name);
      } else {
        for (let i = 0; i < this.images.length; i++) {
          r['insertImage' + i] = this.insertImageItem(this.images[i], this.images[i].name);
        }
      }
    }
    if (this.outputFormat === ProseMirrorFormatTypes.MARKDOWN &&
      this.outputSchema.nodes.bullet_list) { // lists are bonus
      r['wrapBulletList'] = this.wrapListItem(this.outputSchema.nodes.bullet_list, {
        title: 'Wrap in bullet list',
        icon: icons.bulletList
      });
    }
    if (this.outputFormat === ProseMirrorFormatTypes.MARKDOWN &&
      this.outputSchema.nodes.ordered_list) { // bonus
      r['wrapOrderedList'] = this.wrapListItem(this.outputSchema.nodes.ordered_list, {
        title: 'Wrap in ordered list',
        icon: icons.orderedList
      });
    }
    if (this.outputFormat === ProseMirrorFormatTypes.MARKDOWN &&
      this.outputSchema.nodes.blockquote) { // bonus
      r['wrapBlockQuote'] = wrapItem(this.outputSchema.nodes.blockquote, {
        title: 'Wrap in block quote',
        icon: icons.blockquote
      });
    }
    if (this.outputFormat === ProseMirrorFormatTypes.MARKDOWN &&
      this.outputSchema.nodes.paragraph) {
      r['makeParagraph'] = blockTypeItem(this.outputSchema.nodes.paragraph, {
        title: 'Change to paragraph',
        label: 'Plain'
      });
    }
    if (this.outputFormat === ProseMirrorFormatTypes.MARKDOWN &&
      this.outputSchema.nodes.code_block) {// bonus
      r['makeCodeBlock'] = blockTypeItem(this.outputSchema.nodes.code_block, {
        title: 'Change to code block',
        label: 'Code'
      });
    }
    if (this.outputFormat === ProseMirrorFormatTypes.MARKDOWN &&
      this.outputSchema.nodes.heading) {
      for (let i = 1; i <= 6; i++) {
        r['makeHead' + i] = blockTypeItem(this.outputSchema.nodes.heading, {
          title: 'Change to heading ' + i,
          label: 'Level ' + i,
          attrs: {level: i}
        });
      }
    }
    if (this.outputFormat === ProseMirrorFormatTypes.MARKDOWN &&
      this.outputSchema.nodes.horizontal_rule) {// bonus
      r['insertHorizontalRule'] = new MenuItem({
        title: 'Insert horizontal rule',
        label: 'Horizontal rule',
        select: (state) => {
          return this.canInsert(state, this.outputSchema.nodes.horizontal_rule);
        },
        run: (state, dispatchTransaction) => {
          dispatchTransaction(state.tr.replaceSelectionWith(this.outputSchema.nodes.horizontal_rule.create()));
        }
      });
    }

    let deps;
    let cut = arr => arr.filter(x => x);
    if (this.outputFormat === ProseMirrorFormatTypes.MARKDOWN) {
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

      deps = [
        inputRules({rules: allInputRules.concat(this.buildInputRules())}),
        keymap(this.buildKeymap()),
        keymap(baseKeymap)
      ];
      // seems odd but testing throws this error: RangeError: Adding different instances of a keyed plugin (plugin$)
      deps[0].key = 'inputRules';
      deps[1].key = 'mdKeymap';
    } else {
      r['fullMenu'] = [[r['toggleLink']]];
      deps = [];
    }

    return deps.concat(new Plugin({
      props: {
        class: () => 'ProseMirror-example-setup-style',
        menuContent: r['fullMenu'],
        floatingMenu: true
      }
    }));
  }
}
