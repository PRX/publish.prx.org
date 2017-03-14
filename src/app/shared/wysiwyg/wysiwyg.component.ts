import { Component, Input, OnInit, DoCheck, SimpleChanges, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgModel } from '@angular/forms';
import { BaseModel } from '../model/base.model';
import { ImageModel } from '../model/image.model';
import { ProseMirrorMarkdownEditor, ProseMirrorImage } from './prosemirror.markdown.editor';

@Component({
  selector: 'publish-wysiwyg',
  template: `
    <div #contentEditable [class.changed]="changed" [class.invalid]="invalid"></div>
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

export class WysiwygComponent implements OnInit, DoCheck, OnDestroy {
  @Input() model: BaseModel;
  @Input() name: string;
  @Input() content: string;
  @Input() changed: boolean;
  @Input() images: ImageModel[];
  setModelValue = '';

  @ViewChild('contentEditable') private el: ElementRef;
  editor: ProseMirrorMarkdownEditor;

  @ViewChild('url') private url: NgModel;
  linkURL: string;
  linkTitle: string;
  hasSelection = false;
  showPrompt = false;
  lastImages: ImageModel[];

  constructor(private chgRef: ChangeDetectorRef) {}

  ngOnInit() {
    if (this.model) {
      this.lastImages = this.images;
      this.editor = new ProseMirrorMarkdownEditor(this.el,
                                                  this.content,
                                                  this.mapImages(),
                                                  this.setModel.bind(this),
                                                  this.promptForLink.bind(this));
    }
  }

  ngDoCheck() {
    if (this.editor) {
      let valChanged = this.model[this.name] !== this.editor.value;
      let imagesChanged = this.images !== this.lastImages;
      if (valChanged || imagesChanged) {
        this.lastImages = this.images;
        this.editor.update(this.model[this.name], this.mapImages());
      }
    }
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  mapImages(): ProseMirrorImage[] {
    return this.images.filter(img => !img.isDestroy).map(img => {
      let name = img.filename || '[untitled]';
      return new ProseMirrorImage(name, img.enclosureHref, img.caption, img.credit);
    });
  }

  setModel(value: string) {
    if (this.setModelValue.valueOf() !== value.valueOf()) {
      this.setModelValue = value.slice(0);
      this.model.set(this.name, value);
    }
  }

  get invalid(): string {
    return this.model.invalid(this.name);
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
