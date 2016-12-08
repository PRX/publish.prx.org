import { Component, Input, OnInit, OnChanges, OnDestroy, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { NgModel } from '@angular/forms';
import { BaseModel } from '../model/base.model';
import { ImageModel } from '../model/image.model';
import { ProseMirrorMarkdownEditor, ProseMirrorImage } from './prosemirror.markdown.editor';
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
  setModelValue: string;

  @ViewChild('contentEditable') private el: ElementRef;
  editor: ProseMirrorMarkdownEditor;

  @ViewChild('prompt') prompt: PromptComponent;
  @ViewChild('url') private url: NgModel;
  linkURL: string;
  linkTitle: string;

  ngOnInit() {
    if (this.model) {
      this.editor = new ProseMirrorMarkdownEditor(this.el,
                                                  this.model[this.name],
                                                  this.mapImages(),
                                                  this.setModel.bind(this),
                                                  this.promptForLink.bind(this));
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    let changed = changes['images'].currentValue.length !== changes['images'].previousValue.length;
    if (this.editor && changed) {
      this.editor.update(this.mapImages());
    }
    if (this.editor && this.setModelValue !== this.model[this.name]) {
      this.editor.resetEditor();
    }
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  mapImages(): ProseMirrorImage[] {
    return this.images.filter(img => !img.isDestroy)
      .map((img) => new ProseMirrorImage(img.filename, img.enclosureHref, img.caption, img.credit));
  }

  setModel(value: string) {
    this.setModelValue = value.slice(0);
    this.model.set(this.name, value);
  }

  get changed(): boolean {
    return this.model.changed(this.name, false);
  }

  get invalid(): string {
    return this.model.invalid(this.name);
  }

  isURLInvalid() {
    return this.url.invalid && this.url.dirty;
  }

  promptForLink() {
    this.prompt.show();
  }

  createLink() {
    if (!this.isURLInvalid() && this.linkURL && this.linkURL.length > 0) {
      let url = this.linkURL;
      if (!/^https?:\/\//i.test(url)) {
        url = 'http://' + url;
      }

      this.editor.createLinkItem(url, this.linkTitle);

      this.prompt.hide();
      this.linkURL = this.linkTitle = '';
    }
  }
}
