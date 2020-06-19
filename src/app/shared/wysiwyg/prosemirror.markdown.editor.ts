import { ElementRef } from '@angular/core';
import { wrapIn, setBlockType, chainCommands, newlineInCode, toggleMark, baseKeymap } from 'prosemirror-commands';
import { undo, redo, history } from 'prosemirror-history';
import {
  inputRules,
  wrappingInputRule,
  textblockTypeInputRule,
  smartQuotes,
  emDash,
  ellipsis,
  undoInputRule
} from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { schema as markdownSchema, defaultMarkdownParser, defaultMarkdownSerializer } from 'prosemirror-markdown';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { menuBar, icons, MenuItem, Dropdown, DropdownSubmenu, wrapItem, blockTypeItem, joinUpItem, liftItem } from 'prosemirror-menu';
import { wrapInList, splitListItem, liftListItem, sinkListItem } from 'prosemirror-schema-list';
import { EditorState, Plugin, TextSelection } from 'prosemirror-state';
import { DOMParser, Mark, MarkType, Node, Schema } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';

export class ProseMirrorImage {
  constructor(public name: string, public src: string, public title: string, public alt: string) {}
}

export const ProseMirrorFormatTypes = {
  HTML: 'HTML',
  MARKDOWN: 'MARKDOWN'
};

export class ProseMirrorMarkdownEditor {
  view: any;
  outputSchema: Schema;

  constructor(
    private el: ElementRef,
    private content: string,
    private inputFormat: string,
    private outputFormat: string,
    private editable: boolean,
    private images: ProseMirrorImage[],
    private setModel: Function,
    private promptForLink: Function
  ) {
    this.outputSchema = this.outputFormat === ProseMirrorFormatTypes.HTML ? basicSchema : markdownSchema;
    this.view = new EditorView(el.nativeElement, this.viewProps(EditorState.create(this.stateConfig())));
    if (this.inputFormat === ProseMirrorFormatTypes.MARKDOWN && this.outputFormat === ProseMirrorFormatTypes.HTML) {
      this.plainTextWithLinks();
      this.content = this.removeHTML(this.view.dom.innerHTML);
    } else if (this.inputFormat === this.outputFormat) {
      if (this.outputFormat === ProseMirrorFormatTypes.MARKDOWN) {
        this.content = defaultMarkdownSerializer.serialize(this.view.state.doc);
      } else {
        this.content = this.removeHTML(this.view.dom.innerHTML);
      }
    }
  }

  update(content: string, images?: ProseMirrorImage[]) {
    if (content !== this.content || images) {
      this.content = content;
      this.images = images || this.images;
      this.view.update(this.viewProps(EditorState.create(this.stateConfig())));
    }
  }

  getContent() {
    if (this.outputFormat === ProseMirrorFormatTypes.HTML) {
      return this.removeHTML(this.view.dom.innerHTML);
    } else {
      return defaultMarkdownSerializer.serialize(this.view.state.doc);
    }
  }

  destroy() {
    this.view.destroy();
  }

  viewProps(state: any) {
    return {
      state,
      ...(!this.editable && { editable: () => false }),
      dispatchTransaction: (transaction) => {
        this.view.updateState(this.view.state.apply(transaction));
        if (this.outputFormat === ProseMirrorFormatTypes.HTML) {
          const newContent = this.removeHTML(this.view.dom.innerHTML);
          if (this.content !== newContent) {
            this.content = newContent;
            this.setModel(this.content);
          }
        } else {
          this.content = defaultMarkdownSerializer.serialize(this.view.state.doc);
          this.setModel(this.content);
        }
      }
    };
  }

  isSelectionEmpty() {
    return this.view.state.selection.empty;
  }

  stateConfig() {
    let doc: Node;
    if (this.inputFormat === ProseMirrorFormatTypes.HTML) {
      // use browser to create element for parsing HTML content
      const domNode = document.createElement('div');
      domNode.innerHTML = this.content;
      doc = DOMParser.fromSchema(basicSchema).parse(domNode);
    } else {
      doc = defaultMarkdownParser.parse(this.content ? this.content : '');
    }
    return {
      doc,
      plugins: [
        inputRules({ rules: this.buildInputRules(this.outputSchema) }),
        keymap(this.buildKeymap(this.outputSchema)),
        keymap(baseKeymap),
        menuBar({ floating: true, content: this.buildMenuItems(this.outputFormat, this.outputSchema, this.images) }),
        history(),
        new Plugin({ props: { attributes: { class: 'ProseMirror-example-setup-style' } } })
      ]
    };
  }

  removeHTML(content) {
    // prosemirror wraps the single node in a paragraph, when empty prosemirror inserts a <br> into the <p></p>
    return content.replace('<p>', '').replace('</p>', '').replace('<br>', '');
  }

  plainTextWithLinks() {
    let translatedContent = '';
    const getContent = (node: Node) => {
      if (node.type.name === 'text') {
        if (
          translatedContent.length > 0 &&
          node.textContent.length > 0 &&
          !node.textContent.match(/^\s+/) &&
          !translatedContent.match(/^.+\s$/)
        ) {
          translatedContent += ' ';
        }
        let linkMark: Mark;
        node.marks.forEach((mark) => {
          if (markdownSchema.marks.link.isInSet([mark])) {
            linkMark = mark;
          }
        });
        if (linkMark) {
          translatedContent += `[${node.textContent}](${linkMark.attrs.href}`;
          if (node.marks[0].attrs.title) {
            translatedContent += ` "${linkMark.attrs.title}")`;
          } else {
            translatedContent += ')';
          }
        } else {
          translatedContent += node.textContent;
        }
      }
      // traverse the node tree and pull out the textContent and links via markdown input schema
      node.forEach((child, offset, index) => getContent(child));
    };
    getContent(this.view.state.doc);

    this.update(translatedContent);
  }

  createLinkItem(url, title) {
    if (this.markActive(this.view.state, this.outputSchema.marks.link)) {
      // can't see how to edit mark, only toggle. So toggle off to toggle back on with new attrs
      toggleMark(this.outputSchema.marks.link)(this.view.state, this.view.props.dispatchTransaction);
    }
    toggleMark(this.outputSchema.marks.link, {
      href: url,
      title
    })(this.view.state, this.view.props.dispatchTransaction);
  }

  linkItem(markType) {
    return this.markItem(markType, {
      title: 'Add or remove link',
      icon: icons.link,
      run: (state, dispatchTransaction, view) => {
        if (this.markActive(state, markType)) {
          const linkMark = this.selectAroundMark(markType, state.doc, state.selection.anchor, dispatchTransaction);
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
    const $pos = doc.resolve(pos),
      parent = $pos.parent;

    const start = parent.childAfter($pos.parentOffset);
    if (!start.node || start.node.marks.length === 0) {
      // happens if the cursor is at the end of the line or the end of the node, use nodeAt pos - 1 to find node marks
      start.node = parent.nodeAt($pos.parentOffset - 1);
      if (!start.node) {
        return null;
      }
    }

    const targetMark = start.node.marks.find((mark) => mark.type.name === markType.name);
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

    const selection = TextSelection.between(doc.resolve(startPos), doc.resolve(endPos));
    dispatchTransaction(this.view.state.tr.setSelection(selection));

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
    const passedOptions = {
      label: options.title,
      run: cmd,
      select: (state) => {
        return cmd(state);
      }
    };
    for (const prop in options) {
      if (options.hasOwnProperty(prop)) {
        passedOptions[prop] = options[prop];
      }
    }
    return new MenuItem(passedOptions);
  }

  markActive(state, type) {
    const { from, to, empty } = state.selection;
    if (empty) {
      const pos = state.doc.resolve(from);
      const activeMark = type.isInSet(state.storedMarks || pos.marks(true));
      return activeMark;
    } else {
      return state.doc.rangeHasMark(from, to, type);
    }
  }

  markItem(markType, options) {
    const passedOptions = {
      active: (state) => {
        return this.markActive(state, markType);
      }
    };
    for (const prop in options) {
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
    const $from = state.selection.$from;
    for (let d = $from.depth; d >= 0; d--) {
      const index = $from.index(d);
      if ($from.node(d).canReplaceWith(index, index, nodeType, attrs)) {
        return true;
      }
    }
    return false;
  }

  buildKeymap(schema: Schema, mapKeys = undefined) {
    const { strong, em, code } = schema.marks;
    const { bullet_list, ordered_list, blockquote, hard_break, list_item, paragraph, code_block, heading, horizontal_rule } = schema.nodes;
    const mac = typeof navigator !== 'undefined' ? /Mac/.test(navigator.platform) : false;
    const keys = {};
    function bind(key, cmd) {
      if (mapKeys) {
        const mapped = mapKeys[key];
        if (mapped === false) {
          return;
        }
        if (mapped) {
          key = mapped;
        }
      }
      keys[key] = cmd;
    }

    bind('Mod-z', undo);
    bind('Shift-Mod-z', redo);
    bind('Backspace', undoInputRule);
    if (!mac) {
      bind('Mod-y', redo);
    }

    if (strong) {
      bind('Mod-b', toggleMark(strong));
    }
    if (em) {
      bind('Mod-i', toggleMark(em));
    }
    if (code) {
      bind('Mod-`', toggleMark(code));
    }
    if (bullet_list) {
      bind('Shift-Ctrl-8', wrapInList(bullet_list));
    }
    if (ordered_list) {
      bind('Shift-Ctrl-9', wrapInList(ordered_list));
    }
    if (blockquote) {
      bind('Ctrl->', wrapIn(blockquote));
    }
    if (hard_break) {
      const cmd = chainCommands(newlineInCode, (state, dispatchTransaction) => {
        dispatchTransaction(state.tr.replaceSelectionWith(hard_break.create()).scrollIntoView());
        return true;
      });
      bind('Mod-Enter', cmd);
      bind('Shift-Enter', cmd);
      if (mac) {
        bind('Ctrl-Enter', cmd);
      }
    }
    if (list_item) {
      bind('Enter', splitListItem(list_item));
      bind('Mod-[', liftListItem(list_item));
      bind('Mod-]', sinkListItem(list_item));
    }
    if (paragraph) {
      bind('Shift-Ctrl-0', setBlockType(paragraph));
    }
    if (code_block) {
      bind('Shift-Ctrl-\\', setBlockType(code_block));
    }
    if (heading) {
      for (let i = 1; i <= 6; i++) {
        bind('Shift-Ctrl-' + i, setBlockType(heading, { level: i }));
      }
    }
    if (horizontal_rule) {
      bind('Mod-_', (state, dispatchTransaction) => {
        dispatchTransaction(state.tr.replaceSelectionWith(horizontal_rule.create()).scrollIntoView());
        return true;
      });
    }

    return keys;
  }

  buildInputRules(schema: Schema) {
    const { blockquote, ordered_list, bullet_list, code_block, heading } = schema.nodes;
    return [
      ...smartQuotes,
      ellipsis,
      emDash,
      // turns `"> "` at the start of a textblock into a blockquote
      blockquote && wrappingInputRule(/^\s*>\s$/, blockquote),
      // turns a number followed by a dot at the start of a textblock into an ordered list
      ordered_list &&
        wrappingInputRule(
          /^(\d+)\.\s$/,
          ordered_list,
          (match) => ({ order: +match[1] }),
          (match, node) => node.childCount + node.attrs.order === +match[1]
        ),
      // turns a bullet (dash, plush, or asterisk) at the start of a textblock into a bullet list
      bullet_list && wrappingInputRule(/^\s*([-+*])\s$/, bullet_list),
      // turns a textblock starting with three backticks into a code block
      code_block && textblockTypeInputRule(/^```$/, code_block),
      // turns a series of #'s at the start of a text block into a heading at that level
      heading && textblockTypeInputRule(/^(#{1,6})\\s$/, heading, (match) => ({ level: match[1].length }))
    ].filter((rule) => !!rule);
  }

  buildMenuItems(outputFormat: string, schema: Schema, images?: ProseMirrorImage[]) {
    if (outputFormat === ProseMirrorFormatTypes.HTML && schema.marks.link) {
      return [[this.linkItem(schema.marks.link)]];
    } else if (outputFormat === ProseMirrorFormatTypes.MARKDOWN) {
      const { strong, em, code, link } = schema.marks;
      const { image, bullet_list, ordered_list, blockquote, paragraph, code_block, heading, horizontal_rule } = schema.nodes;
      const r: any = {
        ...(strong && {
          toggleStrong: this.markItem(strong, {
            title: 'Toggle strong style',
            icon: icons.strong
          })
        }),
        ...(em && {
          toggleEm: this.markItem(em, { title: 'Toggle emphasis', icon: icons.em })
        }),
        // this one is bonus
        ...(code && {
          toggleCode: this.markItem(code, { title: 'Toggle code font', icon: icons.code })
        }),
        ...(link && {
          toggleLink: this.linkItem(link)
        }),
        // lists are bonus
        ...(bullet_list && {
          wrapBulletList: this.wrapListItem(bullet_list, {
            title: 'Wrap in bullet list',
            icon: icons.bulletList
          })
        }),
        // bonus
        ...(ordered_list && {
          wrapOrderedList: this.wrapListItem(ordered_list, {
            title: 'Wrap in ordered list',
            icon: icons.orderedList
          })
        }),
        // bonus
        ...(blockquote && {
          wrapBlockQuote: wrapItem(blockquote, {
            title: 'Wrap in block quote',
            icon: icons.blockquote
          })
        }),
        ...(paragraph && {
          makeParagraph: blockTypeItem(paragraph, {
            title: 'Change to paragraph',
            label: 'Plain'
          })
        }),
        // bonus
        ...(code_block && {
          makeCodeBlock: blockTypeItem(code_block, {
            title: 'Change to code block',
            label: 'Code'
          })
        }),

        ...(heading &&
          [1, 2, 3, 4, 5, 6].reduce(
            (acc, level) => ({
              ...acc,
              [`makeHead${level}`]: blockTypeItem(heading, {
                title: `Change to heading ${level}`,
                label: `Level ${level}`,
                attrs: { level }
              })
            }),
            {}
          )),
        // bonus
        ...(horizontal_rule && {
          insertHorizontalRule: new MenuItem({
            title: 'Insert horizontal rule',
            label: 'Horizontal rule',
            select: (state) => {
              return this.canInsert(state, horizontal_rule);
            },
            run: (state, dispatchTransaction) => {
              dispatchTransaction(state.tr.replaceSelectionWith(horizontal_rule.create()));
            }
          })
        })
      };

      const cut = (arr) => arr.filter((x) => x);

      if (!image || !images || images.length === 0) {
        r['insertMenu'] = new Dropdown([r['insertHorizontalRule']], { label: 'Insert' });
      } else if (image && images && images.length > 1) {
        const imageSubMenu =
          image &&
          new DropdownSubmenu(
            images.map((img, i) => this.insertImageItem(img, img.name)),
            { label: 'Image' }
          );
        r['insertMenu'] = new Dropdown([imageSubMenu, r['insertHorizontalRule']], { label: 'Insert' });
      } else if (image && images && images.length === 1) {
        const imageMenuItem = this.insertImageItem(images[0], 'Image: ' + images[0].name);
        r['insertMenu'] = new Dropdown([imageMenuItem, r['insertHorizontalRule']], { label: 'Insert' });
      }

      r['typeMenu'] = new Dropdown(
        cut([
          r['makeParagraph'],
          r['makeCodeBlock'],
          r['makeHead1'] &&
            new DropdownSubmenu(cut([r['makeHead1'], r['makeHead2'], r['makeHead3'], r['makeHead4'], r['makeHead5'], r['makeHead6']]), {
              label: 'Heading'
            })
        ]),
        { label: 'Type...' }
      );

      r['inlineMenu'] = [cut([r['toggleStrong'], r['toggleEm'], r['toggleCode'], r['toggleLink']]), [r['insertMenu']]];

      r['blockMenu'] = [cut([r['typeMenu'], r['wrapBulletList'], r['wrapOrderedList'], r['wrapBlockQuote'], joinUpItem, liftItem])];

      return [...r['inlineMenu'], ...r['blockMenu']];
    }
  }
}
