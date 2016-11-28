import { Component, Input, OnInit, OnChanges, SimpleChanges, Inject, ElementRef } from '@angular/core';
import { wrapIn, setBlockType, chainCommands, newlineInCode, toggleMark, baseKeymap } from 'prosemirror-commands';
import { blockQuoteRule, orderedListRule, bulletListRule, codeBlockRule, headingRule,
  inputRules,allInputRules } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { schema, defaultMarkdownParser, defaultMarkdownSerializer } from 'prosemirror-markdown';
import { MenuBarEditorView, toggleMarkItem, icons,
  MenuItem, Dropdown, DropdownSubmenu,
  wrapItem, blockTypeItem, joinUpItem, liftItem,
  selectParentNodeItem} from 'prosemirror-menu';
import { wrapInList, splitListItem, liftListItem, sinkListItem } from 'prosemirror-schema-list';
import { EditorState, Plugin } from 'prosemirror-state';
import { BaseModel } from '../model/base.model';
import { ImageModel } from '../model/image.model';

class Field {
  options: any;
  constructor(options) { this.options = options }

  read(dom) { return dom.value }

  validateType(_value) {}

  validate(value) {
    if (!value && this.options.required)
      return 'Required field';
    return this.validateType(value) || (this.options.validate && this.options.validate(value))
  }

  clean(value) {
    return this.options.clean ? this.options.clean(value) : value;
  }
}

class TextField extends Field {
  render() {
    let input = document.createElement('input');
    input.type = 'text';
    input.placeholder = this.options.label;
    input.value = this.options.value || '';
    input.autocomplete = 'off';
    return input;
  }
}

@Component({
  selector: 'publish-wysiwyg',
  template: ``
})

export class WysiwygComponent implements OnInit, OnChanges {
  @Input() model: BaseModel;
  @Input() name: string;
  @Input() images: ImageModel[];

  el: ElementRef;
  view: MenuBarEditorView;
  state: EditorState;

  constructor(@Inject(ElementRef) elementRef: ElementRef) {
    this.el = elementRef;
  }

  ngOnInit() {
    if (this.model) {
      this.state = EditorState.create(this.stateConfig());
      this.view = new MenuBarEditorView(this.el.nativeElement, this.viewProps());
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    let changed = changes['images'].currentValue.length !== changes['images'].previousValue.length;
    if (this.state && this.view && changed) {
      this.state = this.state.reconfigure(this.stateConfig());
      this.view.update(this.viewProps());
    }
  }

  viewProps() {
    return {
      state: this.state,
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

  cmdItem(cmd, options) {
    let passedOptions = {
      label: options.title,
      run: cmd,
      select(state) {
        return cmd(state)
      }
    };
    for (let prop in options) passedOptions[prop] = options[prop]
    return new MenuItem(passedOptions);
  }

  markActive(state, type) {
    let {from, to, empty} = state.selection;
    if (empty) return type.isInSet(state.storedMarks || state.doc.marksAt(from))
    else return state.doc.rangeHasMark(from, to, type)
  }

  markItem(markType, options) {
    let passedOptions = {
      active: (state) => {
        return this.markActive(state, markType)
      }
    };
    for (let prop in options) passedOptions[prop] = options[prop]
    return this.cmdItem(toggleMark(markType), passedOptions)
  }

  wrapListItem(nodeType, options) {
    return this.cmdItem(wrapInList(nodeType, options.attrs), options)
  }

  linkItem(markType) {
    return this.markItem(markType, {
      title: 'Add or remove link',
      icon: icons.link,
      run: (state, onAction, view) => {
        if (this.markActive(state, markType)) {
          toggleMark(markType)(state, onAction)
          return true
        }
        this.openPrompt({
          title: 'Create a link',
          fields: {
            href: new TextField({
              label: 'Link target',
              required: true,
              clean: (val) => {
                if (!/^https?:\/\//i.test(val))
                  val = 'http://' + val
                return val
              }
            }),
            title: new TextField({label: 'Title'})
          },
          callback: (attrs) => {
            toggleMark(markType, attrs)(view.state, view.props.onAction)
          }
        })
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
    let $from = state.selection.$from
    for (let d = $from.depth; d >= 0; d--) {
      let index = $from.index(d)
      if ($from.node(d).canReplaceWith(index, index, nodeType, attrs)) return true
    }
    return false
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
    })
  }

  /////////
  // TODO: needs to go
  openPrompt(options) {// errors use a modal, maybe can re-use instead of this prompt
    const prefix = 'ProseMirror-prompt';

    let wrapper = document.body.appendChild(document.createElement('div'));
    wrapper['className'] = prefix;

    let mouseOutside = e => {
      if (!wrapper.contains(e.target)) close()
    };
    setTimeout(() => window.addEventListener('mousedown', mouseOutside), 50);
    let close = () => {
      window.removeEventListener('mousedown', mouseOutside)
      if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper)
    };

    let domFields = [];
    for (let name in options.fields) domFields.push(options.fields[name].render())

    let submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = prefix + '-submit';
    submitButton.textContent = 'OK';
    let cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = prefix + '-cancel';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', close);

    let form = wrapper.appendChild(document.createElement('form'));
    if (options.title) form.appendChild(document.createElement('h5')).textContent = options.title;
    domFields.forEach(field => {
      form.appendChild(document.createElement('div')).appendChild(field);
    })
    let buttons = form.appendChild(document.createElement('div'));
    buttons['className'] = prefix + '-buttons';
    buttons.appendChild(submitButton);
    buttons.appendChild(document.createTextNode(' '));
    buttons.appendChild(cancelButton);

    let box = wrapper['getBoundingClientRect']();
    wrapper['style']['top'] = ((window.innerHeight - box.height) / 2) + 'px';
    wrapper['style']['left'] = ((window.innerWidth - box.width) / 2) + 'px';

    let submit = () => {
      let params = this.getValues(options.fields, domFields);
      if (params) {
        close()
        options.callback(params)
      }
    }

    form.addEventListener('submit', e => {
      e.preventDefault()
      submit()
    })

    form.addEventListener('keydown', e => {
      if (e['keyCode'] == 27) {
        e.preventDefault()
        close()
      } else if (e['keyCode'] == 13 && !(e['ctrlKey'] || e['metaKey'] || e['shiftKey'])) {
        e.preventDefault()
        submit()
      } else if (e['keyCode'] == 9) {
        window.setTimeout(() => {
          if (!wrapper.contains(document.activeElement)) close()
        }, 500)
      }
    })

    let input = form['elements'][0]
    if (input) input.focus()
  }

  getValues(fields, domFields) {
    let result = Object.create(null), i = 0
    for (let name in fields) {
      let field = fields[name], dom = domFields[i++]
      let value = field.read(dom), bad = field.validate(value)
      if (bad) {
        this.reportInvalid(dom, bad)
        return null
      }
      result[name] = field.clean(value)
    }
    return result
  }

  reportInvalid(dom, message) {
    // FIXME this is awful and needs a lot more work
    let parent = dom.parentNode
    let msg = parent.appendChild(document.createElement('div'))
    msg.style.left = (dom.offsetLeft + dom.offsetWidth + 2) + 'px'
    msg.style.top = (dom.offsetTop - 5) + 'px'
    msg.className = 'ProseMirror-invalid'
    msg.textContent = message
    setTimeout(() => parent.removeChild(msg), 1500)
  }
  //////////////////

  buildKeymap(schema, mapKeys = undefined) {
    const mac = typeof navigator != 'undefined' ? /Mac/.test(navigator.platform) : false;
    let keys = {}, type
    function bind(key, cmd) {
      if (mapKeys) {
        let mapped = mapKeys[key]
        if (mapped === false) return
        if (mapped) key = mapped
      }
      keys[key] = cmd
    }

    if (type = schema.marks.strong)
      bind('Mod-b', toggleMark(type))
    if (type = schema.marks.em)
      bind('Mod-i', toggleMark(type))
    if (type = schema.marks.code)
      bind('Mod-`', toggleMark(type))

    if (type = schema.nodes.bullet_list)
      bind('Shift-Ctrl-8', wrapInList(type))
    if (type = schema.nodes.ordered_list)
      bind('Shift-Ctrl-9', wrapInList(type))
    if (type = schema.nodes.blockquote)
      bind('Ctrl->', wrapIn(type))
    if (type = schema.nodes.hard_break) {
      let br = type, cmd = chainCommands(newlineInCode, (state, onAction) => {
        onAction(state.tr.replaceSelectionWith(br.create()).scrollAction())
        return true
      })
      bind('Mod-Enter', cmd)
      bind('Shift-Enter', cmd)
      if (mac) bind('Ctrl-Enter', cmd)
    }
    if (type = schema.nodes.list_item) {
      bind('Enter', splitListItem(type))
      bind('Mod-[', liftListItem(type))
      bind('Mod-]', sinkListItem(type))
    }
    if (type = schema.nodes.paragraph)
      bind('Shift-Ctrl-0', setBlockType(type))
    if (type = schema.nodes.code_block)
      bind('Shift-Ctrl-\\', setBlockType(type))
    if (type = schema.nodes.heading)
      for (let i = 1; i <= 6; i++) bind('Shift-Ctrl-' + i, setBlockType(type, {level: i}))
    if (type = schema.nodes.horizontal_rule) {
      let hr = type
      bind('Mod-_', (state, onAction) => {
        onAction(state.tr.replaceSelectionWith(hr.create()).scrollAction())
        return true
      })
    }

    return keys;
  }

  buildInputRules(schema) {
    let result = [], type;
    if (type = schema.nodes.blockquote) result.push(blockQuoteRule(type))
    if (type = schema.nodes.ordered_list) result.push(orderedListRule(type))
    if (type = schema.nodes.bullet_list) result.push(bulletListRule(type))
    if (type = schema.nodes.code_block) result.push(codeBlockRule(type))
    if (type = schema.nodes.heading) result.push(headingRule(type, 6))
    return result
  }

  buildMenuItemsPlugin() {
    let r = {};

    if (schema.marks.strong)
      r['toggleStrong'] = this.markItem(schema.marks.strong, {title: 'Toggle strong style', icon: icons.strong});
    if (schema.marks.em)
      r['toggleEm'] = this.markItem(schema.marks.em, {title: 'Toggle emphasis', icon: icons.em});
    if (schema.marks.code) // this one is bonus
      r['toggleCode'] = this.markItem(schema.marks.code, {title: 'Toggle code font', icon: icons.code});
    if (schema.marks.link)
      r['toggleLink'] = this.linkItem(schema.marks.link);
    if (schema.nodes.image && !this.noImages) {
      r['insertImage'] = this.insertImageItem(schema.nodes.image, this.images[0], 'Image: ' + this.images[0].filename);
      for (let i = 0; i < this.images.length; i++) {
        r['insertImage' + i] = this.insertImageItem(schema.nodes.image, this.images[i], this.images[i].filename);
      }
    }
    if (schema.nodes.bullet_list)// lists are bonus
      r['wrapBulletList'] = this.wrapListItem(schema.nodes.bullet_list, {
        title: 'Wrap in bullet list',
        icon: icons.bulletList
      });
    if (schema.nodes.ordered_list)// bonus
      r['wrapOrderedList'] = this.wrapListItem(schema.nodes.ordered_list, {
        title: 'Wrap in ordered list',
        icon: icons.orderedList
      });
    if (schema.nodes.blockquote)// bonus
      r['wrapBlockQuote'] = wrapItem(schema.nodes.blockquote, {
        title: 'Wrap in block quote',
        icon: icons.blockquote
      });
    if (schema.nodes.paragraph)
      r['makeParagraph'] = blockTypeItem(schema.nodes.paragraph, {
        title: 'Change to paragraph',
        label: 'Plain'
      });
    if (schema.nodes.code_block)// bonus
      r['makeCodeBlock'] = blockTypeItem(schema.nodes.code_block, {
        title: 'Change to code block',
        label: 'Code'
      });
    if (schema.nodes.heading)
      for (let i = 1; i <= 6; i++)
        r['makeHead' + i] = blockTypeItem(schema.nodes.heading, {
          title: 'Change to heading ' + i,
          label: 'Level ' + i,
          attrs: {level: i}
        })
    if (schema.nodes.horizontal_rule) {// bonus
      r['insertHorizontalRule'] = new MenuItem({
        title: 'Insert horizontal rule',
        label: 'Horizontal rule',
        select: (state) => {
          return this.canInsert(state, schema.nodes.horizontal_rule)
        },
        run(state, onAction) { onAction(state.tr.replaceSelectionWith(schema.nodes.horizontal_rule.create()).action()) }
      })
    }

    let cut = arr => arr.filter(x => x);
    if (this.images && this.images.length > 1) {
      let imageSubs = Object.keys(r).filter(key => key.match(/insertImage+/)).map(key => r[key]);
      let imageSubMenu = new DropdownSubmenu(imageSubs, {label: 'Image'});
      r['insertMenu'] = new Dropdown(cut([imageSubMenu, r['insertHorizontalRule']]), {label: 'Insert'})
    } else {
      r['insertMenu'] = new Dropdown(cut([r['insertImage'], r['insertHorizontalRule']]), {label: 'Insert'})
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

    return deps.concat(new Plugin({
      props: {
        class: () => 'ProseMirror-example-setup-style',
        menuContent: r['fullMenu'],
        floatingMenu: true
      }
    }));
  }
}
