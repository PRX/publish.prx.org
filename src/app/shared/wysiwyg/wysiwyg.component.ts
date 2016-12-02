/// <reference path="./prosemirror.d.ts"/>

import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { wrapIn, setBlockType, chainCommands, newlineInCode, toggleMark, baseKeymap } from 'prosemirror-commands';
import { blockQuoteRule, orderedListRule, bulletListRule, codeBlockRule, headingRule,
  inputRules,allInputRules } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { schema, defaultMarkdownParser, defaultMarkdownSerializer } from 'prosemirror-markdown';
import { MenuBarEditorView, icons, MenuItem, Dropdown, DropdownSubmenu,
  wrapItem, blockTypeItem, joinUpItem, liftItem} from 'prosemirror-menu';
import { wrapInList, splitListItem, liftListItem, sinkListItem } from 'prosemirror-schema-list';
import { EditorState, Plugin } from 'prosemirror-state';
import { BaseModel } from '../model/base.model';
import { ImageModel } from '../model/image.model';
import { PromptComponent } from './prompt.component';

@Component({
  selector: 'publish-wysiwyg',
  template: `
    <div #contentEditable [class.changed]="changed" [class.invalid]="invalid"></div>
    <p *ngIf="invalid" class="error">{{invalid | capitalize}}</p>
    <publish-prompt #prompt>
      <h1 class="modal-header">Link to</h1>
      <div class="modal-body">
        <label>URL<span class="error" [style.display]="isURLInvalid() ? 'inline' : 'none'">*</span></label>
        <input type="text" name="url" [(ngModel)]="linkURL" #url="ngModel" required/>
        <label>Title</label>
        <input type="text" name="title" [(ngModel)]="linkTitle"/>
        <p class="error" [style.display]="isURLInvalid() ? 'block' : 'none'">URL is required</p>
      </div>
      <div class="modal-footer">
        <button (click)="createLink()">Okay</button>
        <button (click)="prompt.hide()">Cancel</button>
      </div>
    </publish-prompt>
  `,
  styleUrls: ['wysiwyg.component.css']
})

export class WysiwygComponent implements OnInit, OnChanges, OnDestroy {
  @Input() model: BaseModel;
  @Input() name: string;
  @Input() images: ImageModel[];

  @ViewChild('contentEditable') private el: ElementRef;
  view: MenuBarEditorView;

  @ViewChild('prompt') private prompt: PromptComponent;
  @ViewChild('url') private url: ElementRef;
  linkURL: string;
  linkTitle: string;

  ngOnInit() {
    if (this.model) {
      let state = EditorState.create(this.stateConfig());
      this.view = new MenuBarEditorView(this.el.nativeElement, this.viewProps(state));
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // once images are loaded and if images are added/removed from story, array length should change
    let changed = changes['images'].currentValue.length !== changes['images'].previousValue.length;
    if (this.view && changed) {
      let state = this.view.editor.state.reconfigure(this.stateConfig());
      this.view.update(this.viewProps(state));
    }
  }

  ngOnDestroy() {
    if (this.view) {
      this.view.editor.destroy();
    }
  }

  viewProps(state) {
    return {
      state,
      onAction: (action) => {
        this.view.updateState(this.view.editor.state.applyAction(action));
        this.model.set(this.name, defaultMarkdownSerializer.serialize(this.view.editor.state.doc));
      }
    };
  }

  stateConfig() {
    return {
      doc: defaultMarkdownParser.parse(this.model[this.name] ? this.model[this.name] : ''),
      plugins: this.buildMenuItemsPlugin()
    };
  }

  get changed(): boolean {
    return this.model.changed(this.name, false);
  }

  get invalid(): string {
    return this.model.invalid(this.name);
  }

  cmdItem(cmd, options) {
    let passedOptions = {
      label: options.title,
      run: cmd,
      select(state) {
        return cmd(state)
      }
    };
    for (let prop in options) {
      passedOptions[prop] = options[prop];
    }
    return new MenuItem(passedOptions);
  }

  markActive(state, type) {
    let {from, to, empty} = state.selection;
    if (empty) {
      return type.isInSet(state.storedMarks || state.doc.marksAt(from));
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
      passedOptions[prop] = options[prop];
    }
    return this.cmdItem(toggleMark(markType), passedOptions);
  }

  wrapListItem(nodeType, options) {
    return this.cmdItem(wrapInList(nodeType, options.attrs), options);
  }

  isURLInvalid() {
    return this.url.invalid && this.url.dirty;
  }

  createLink() {
    if (!this.isURLInvalid() && this.linkURL && this.linkURL.length > 0) {
      let url = this.linkURL;
      if (!/^https?:\/\//i.test(url)) {
        url = 'http://' + url;
      }
      toggleMark(schema.marks.link, {
        href: url,
        title: this.linkTitle
      })(this.view.editor.state, this.view.props.onAction);
      this.prompt.hide();
      this.linkURL = this.linkTitle = '';
    }
  }

  linkItem(markType) {
    return this.markItem(markType, {
      title: 'Add or remove link',
      icon: icons.link,
      run: (state, onAction, view) => {
        if (this.markActive(state, markType)) {
          toggleMark(markType)(state, onAction);
          return true;
        }
        this.prompt.show();
      }
    })
  }

  get noImages(): boolean {
    if (this.images) {
      this.images = this.images.filter(img => !(img.isNew && img.isDestroy));
      if (this.images.length === 0) {
        return true;
      } else if (this.images.every(img => img.isDestroy)) {
        return true;
      }
    }
    return false;
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

  insertImageItem(nodeType, image: ImageModel, label: string) {
    let attrs = {src: image.enclosureHref, title: image.caption, alt: image.credit};
    return new MenuItem({
      title: 'Insert image',
      label,
      select: (state) => {return this.canInsert(state, nodeType)},
      run: (state, _, view) => {
        view.props.onAction(view.state.tr.replaceSelectionWith(nodeType.createAndFill(attrs)).action())
      }
    });
  }

  buildKeymap(schema, mapKeys = undefined) {
    const mac = typeof navigator != 'undefined' ? /Mac/.test(navigator.platform) : false;
    let keys = {};
    function bind(key, cmd) {
      if (mapKeys) {
        let mapped = mapKeys[key];
        if (mapped === false) return;
        if (mapped) key = mapped;
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
      if (mac) bind('Ctrl-Enter', cmd);
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
      })
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
      result.push(headingRule(schema.nodes.heading, 6))
    }
    return result
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
    if (schema.nodes.image && this.images && !this.noImages) {
      r['insertImage'] = this.insertImageItem(schema.nodes.image, this.images[0], 'Image: ' + this.images[0].filename);
      for (let i = 0; i < this.images.length; i++) {
        r['insertImage' + i] = this.insertImageItem(schema.nodes.image, this.images[i], this.images[i].filename);
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
          return this.canInsert(state, schema.nodes.horizontal_rule)
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
