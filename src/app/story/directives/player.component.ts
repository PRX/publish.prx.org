import { Component, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoryModel, TabService } from '../../shared';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  styleUrls: ['player.component.css'],
  template: `
    <div *ngIf="story">
      <p>
        You can include this embeddable player on your website to play the audio for this clip directly.
        Here's a preview of what the player will look like for this story. Note that the image and audio
        are placeholders until this story has been published.
      </p>
        <iframe
                [src]='this.safeUrl'
                frameborder="0"
                height="200"
                width ="100%">
        </iframe>

        <p>You can embed this player on your own site by including the following <code>iframe</code> tag.</p>

        <div class="embed-code">
          <input type="text" [value]="iframeHtml(200, 650)" #shareEmbedSmall readonly>
          <button (click)="copy(small)" data-copytarget="#shareEmbedSmall" #small>Copy</button>
        </div>

    </div>
  `
})

export class PlayerComponent implements OnDestroy {
  @ViewChild('shareEmbedSmall') private inputEl: ElementRef;
  private title: string;
  private subtitle: string;
  private audioUrl: string;
  private imageUrl: string;
  private subscriptionUrl: string;
  private host: string = 'http://staging.play.prx.tech';

  story: StoryModel;
  tabSub: Subscription;

  constructor(
    tab: TabService,
    private sanitizer: DomSanitizer
  ) {
    this.tabSub = tab.model.subscribe((s: StoryModel) => {
      this.setFields(s);
    });
  }

  setFields(story: StoryModel) {
    this.story = story;
    this.title = story.title || 'Placeholder title';
    this.subtitle = story.shortDescription || 'Placeholder subtitle';
    this.subscriptionUrl = ''; // currently not in place

    if (this.story.images.length > 0) {
      let img = this.story.images.find(img => !img.isDestroy);
      if (img) { this.imageUrl = img.enclosureHref; }
    }

    if (this.story.versions.length > 0) {
      let firstAudio = this.story.versions[0].files.find(file => !file.isDestroy);
      if (firstAudio) { this.audioUrl = firstAudio.enclosureHref; }
    }

    if (this.story.doc && this.story.doc['_links']['prx:series']) {
      this.subscriptionUrl = this.story.doc['_links']['prx:series'].href;
    }
  }

  get paramString() {
    let str: string[] = [];

    str.push(`tt=${this.encode(this.title)}`);
    str.push(`ts=${this.encode(this.subtitle)}`);
    str.push(`ua=${this.encode(this.audioUrl)}`);
    str.push(`ui=${this.encode(this.imageUrl)}`);
    str.push(`us=${this.encode(this.subscriptionUrl)}`);
    return str.join('&');
  }

  get embeddableUrl() {
    return `${this.host}/e?${this.paramString}`;
  }

  get safeUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.embeddableUrl);
  }

  iframeHtml(width: string, height: string) {
    const url = this.embeddableUrl;
    return `<iframe frameborder="0" height="${height}" width="${width}" src="${url}"></iframe>`;
  }

  copy(el: any) {
    const inp = this.inputEl.nativeElement;
    if (inp && inp.select) {
      inp.select();

      try {
        document.execCommand('copy');
        inp.blur();
        el.innerHTML = 'Copied';
      } catch (err) {
        /// alert('please press Ctrl/Cmd+C to copy');
      }
    }
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  private encode (str: string) {
    return encodeURIComponent(str)
      .replace(/[!'()*]/g, (c) => (`%${c.charCodeAt(0).toString(16)}`));
  }
}
