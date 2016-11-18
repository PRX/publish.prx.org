import { Component, Input, OnInit, Inject, ElementRef } from '@angular/core';
import { MenuBarEditorView, toggleMarkItem, icons } from 'prosemirror-menu';
import { EditorState } from 'prosemirror-state';
import { schema, defaultMarkdownParser } from 'prosemirror-markdown';
import { exampleSetup } from 'prosemirror-example-setup';
import { BaseModel } from '../model/base.model';

@Component({
  selector: 'publish-wysiwyg',
  template: ``
})

export class WysiwygComponent implements OnInit {
  @Input() model: BaseModel;
  @Input() name: string;

  el: ElementRef;
  view: MenuBarEditorView;
  state: EditorState;

  constructor(@Inject(ElementRef) elementRef: ElementRef) {
    this.el = elementRef;
  }

  ngOnInit() {
    if (this.model[this.name]) {
      this.state = EditorState.create({
        doc: defaultMarkdownParser.parse(this.model[this.name]),
        plugins: exampleSetup({schema})
      });
      this.view = new MenuBarEditorView(this.el.nativeElement, {
        state: this.state,
        onAction: (action) => {
          this.view.updateState(this.view.editor.state.applyAction(action));
        }
      });
    }
  }
}
