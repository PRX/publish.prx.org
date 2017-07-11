import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy, ElementRef, ViewChild,
  ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { NgModel } from '@angular/forms';
import { BaseModel } from 'ngx-prx-styleguide';
import { ImageModel } from '../model/image.model';
import { ProseMirrorMarkdownEditor, ProseMirrorImage, ProseMirrorFormatTypes } from './prosemirror.markdown.editor';

@Component({
  selector: 'publish-wysiwyg',
  template: `
    <div #contentEditable [class.changed]="changed" [class.invalid]="invalid" [class.readonly]="!editable"></div>
    <p *ngIf="invalid" class="error">{{invalid | capitalize}}</p>

    <div class="overlay" *ngIf="showPrompt"></div>
    <div class="modal" *ngIf="hasSelection && showPrompt" tabindex="-1">
      <header><h1>Link to</h1></header>
      <section>
          <label>URL<span class="error" [style.display]="isURLInvalid() ? 'inline' : 'none'">*</span></label>
          <input publishFocus type="text" name="url" [(ngModel)]="linkURL" #url="ngModel" required/>
          <label>Title</label>
          <input type="text" name="title" [(ngModel)]="linkTitle"/>
          <p class="error" [style.display]="isURLInvalid() ? 'block' : 'none'">URL is required</p>
      </section>
      <footer>
          <button (click)="createLink()">Okay</button>
          <button (click)="hidePrompt()">Cancel</button>
      </footer>
    </div>

    <div class="modal" *ngIf="!hasSelection && showPrompt" tabindex="-1">
      <header><h1>Warning</h1></header>
      <section>
        <p class="error">Please select text to create link or existing link to edit</p>
      </section>
      <footer>
        <button (click)="hidePrompt()">Okay</button>
      </footer>
    </div>
  `,
  styleUrls: ['wysiwyg.component.css']
})

export class WysiwygComponent implements OnInit, OnChanges, OnDestroy {
  @Input() model: BaseModel;
  @Input() name: string;
  @Input() content: string;
  @Input() inputFormat = ProseMirrorFormatTypes.MARKDOWN;
  @Input() outputFormat = ProseMirrorFormatTypes.MARKDOWN;
  @Input() editable = true;
  @Input() changed: boolean;
  @Input() images: ImageModel[];
  setModelValue = '';

  @ViewChild('contentEditable') el: ElementRef;
  editor: ProseMirrorMarkdownEditor;

  @ViewChild('url') url: NgModel;
  linkURL: string;
  linkTitle: string;
  hasSelection = false;
  showPrompt = false;

  constructor(private chgRef: ChangeDetectorRef) {}

  ngOnInit() {
    if (this.model || (this.content || this.content === '')) {
      this.setModelValue = this.content;
      this.editor = new ProseMirrorMarkdownEditor(this.el,
                                                  this.content,
                                                  this.inputFormat,
                                                  this.outputFormat,
                                                  this.editable,
                                                  this.mapImages(),
                                                  this.setModel.bind(this),
                                                  this.promptForLink.bind(this));
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.editor) {
      if (changes['images']) {
        this.editor.update(this.content, this.mapImages());
      } else if (changes['content']) {
        this.editor.update(this.content);
      }
    }
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  mapImages(): ProseMirrorImage[] {
    return this.images && this.images.filter(img => !img.isDestroy).map(img => {
      let name = img.filename || '[untitled]';
      return new ProseMirrorImage(name, img.enclosureHref, img.caption, img.credit);
    });
  }

  setModel(value: string) {
    if (this.setModelValue.valueOf() !== value.valueOf()) {
      this.setModelValue = value.slice(0);
      if (this.model && this.name) {
        this.model.set(this.name, value);
      }
    }
  }

  getContent(): string {
    return this.editor.getContent();
  }

  get invalid(): string {
    return this.model && this.name ? this.model.invalid(this.name) : '';
  }

  isURLInvalid() {
    return this.url && this.url.invalid && this.url.dirty;
  }

  promptForLink(url?: string, title?: string) {
    this.linkURL = url;
    this.linkTitle = title;
    this.hasSelection = !this.editor.isSelectionEmpty();
    this.chgRef.detectChanges();
    this.showPrompt = true;
  }

  createLink() {
    if (!this.isURLInvalid() && this.linkURL && this.linkURL.length > 0) {
      let url = this.model.createLink(this.linkURL);
      this.editor.createLinkItem(url, this.linkTitle);

      this.showPrompt = false;
    }
  }

  hidePrompt() {
    this.showPrompt = false;
  }
}
