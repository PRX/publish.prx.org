import { Component, Input, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Http } from '@angular/http';
import { Subscription } from 'rxjs';
import { PlayerService, PlaybackMetadata } from '../../core';
import { AudioFileModel } from '../../shared';

@Component({
  selector: 'publish-audio-player',
  styleUrls: ['audio-player.component.css'],
  template: `
    <p *ngIf="error" class="error">{{error}}</p>

    <button *ngIf="!playing" class="play" (click)="play()"></button>

    <div #scrubber *ngIf="playing" class="scrubber"
      (mousedown)="scrub('down', $event)"
      (mouseup)="scrub('up', $event)"
      (mousemove)="scrub('move', $event)">
      <div class="meter" [style.width.%]="progress * 100"></div>
      <div *ngIf="!dragging" class="position" [style.left.%]="progress * 100"></div>
    </div>
    <button *ngIf="playing" class="pause" (click)="stop()"></button>
  `
})

export class AudioPlayerComponent implements OnDestroy {

  playing = false;
  dragging = false;
  progress = 0.0;
  error: string = null;
  private sub: Subscription;

  @Input() file: AudioFileModel;

  @ViewChild('scrubber') scrubber;

  constructor(
    private http: Http,
    private player: PlayerService,
    private ref: ChangeDetectorRef
  ) {}

  get scrubberWidth() {
    return this.scrubber.nativeElement.offsetWidth;
  }

  get playable(): File | string {
    if (this.file.upload && this.file.upload.file) {
      return this.file.upload.file;
    } else if (this.file.enclosureHref && this.file.enclosureHref.match('/pub/')) {
      // TODO http://stackoverflow.com/questions/40580913/fetch-api-custom-request-headers-cors-and-cross-origin-redirects
      return this.file.enclosureHref.replace(/^.+\/pub\//, `${window.location.origin}/pub/`);
    } else {
      return this.file.enclosureHref;
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  play() {
    if (this.playable) {
      this.error = null;
      this.playing = true;
      this.sub = this.player.play(this.playable).subscribe(
        data => this.updateProgress(data),
        err => this.showError(err),
        () => this.stop()
      );
    } else {
      this.showError('File is not playable');
    }
  }

  stop() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    this.playing = false;
    this.progress = 0;
    this.ref.detectChanges(); // playback 'done' doesn't fire by default
  }

  scrub(dir, ev: MouseEvent) {
    let pct = Math.max((ev.offsetX - 2) / this.scrubberWidth, 0);
    if (dir === 'down') {
      this.dragging = true;
    } else if (dir === 'up') {
      this.dragging = false;
      this.progress = pct;
      this.player.seek(pct);
    } else if (this.dragging && dir === 'move') {
      this.progress = pct;
    }
  }

  private updateProgress(data: PlaybackMetadata) {
    if (!this.dragging) {
      if (data.duration && data.progress) {
        this.progress = data.progress / data.duration;
      } else if (this.file.duration && data.progress) {
        this.progress = data.progress / this.file.duration;
      } else {
        this.progress = 0;
      }
    }
  }

  private showError(err: any) {
    this.playing = false;
    this.dragging = false;
    this.error = err.message || `${err}`;
  }

}
