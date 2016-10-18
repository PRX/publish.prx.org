import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { AudioVersionModel } from '../../model';
import { UploadService } from '../../../core';

class TempUpload {
  public checked = false;
  public src: string;
  public safeSrc: SafeResourceUrl;

  constructor(public file: File, sanitizer: DomSanitizer) {
    this.src = URL.createObjectURL(file);
    this.safeSrc = sanitizer.bypassSecurityTrustResourceUrl(this.src);
  }

  duration(duration: number = null) {
    this.checked = true;
    this.file['duration'] = Math.round(duration);
    URL.revokeObjectURL(this.src);
  }
}

@Component({
  selector: 'publish-audio-version',
  styleUrls: ['audio-version.component.css'],
  template: `
    <header>
      <strong>{{version.label}}</strong>
      <span *ngIf="DESCRIPTIONS[version.label]">{{DESCRIPTIONS[version.label]}}</span>
    </header>
    <section [dragula]="id" [dragulaModel]="version.files">
      <publish-audio-file *ngFor="let file of version.files"
        [audio]="file" (cancel)="onCancel($event)"></publish-audio-file>
      <div *ngIf="version.noAudioFiles" class="empty">
        <h4>Upload a file to get started</h4>
      </div>
    </section>
    <footer>
      <div *ngFor="let f of newFiles">
        <audio *ngIf="!f.checked" #audio [src]="f.safeSrc"
          (canplaythrough)="canPlay(audio,f)" (error)="cannotPlay($event,f)"></audio>
      </div>
      <input type="file" [id]="id" multiple publishFileSelect (file)="addFile($event)"/>
      <label class="button" [htmlFor]="id">Upload Files</label>
    </footer>
  `,
  viewProviders: [DragulaService]
})

export class AudioVersionComponent implements OnInit, OnDestroy {

  DESCRIPTIONS = {
    'Main Audio': 'The primary mp3 version of your story',
    'Piece Audio': 'The standard version of your story you would most like people to hear and buy',
    'Promos': 'The promotional version of your audio'
  };

  @Input() version: AudioVersionModel;

  private dragSubscription: Subscription;
  private newFiles: TempUpload[] = [];

  constructor(
    private uploadService: UploadService,
    private dragulaService: DragulaService,
    private sanitizer: DomSanitizer
  ) {}

  get id(): any {
    return this.version.key();
  }

  ngOnInit() {
    this.initDragula();
  }

  ngOnDestroy() {
    this.dragSubscription.unsubscribe();
  }

  addFile(file: File) {
    this.newFiles.push(new TempUpload(file, this.sanitizer));
  }

  canPlay(el: HTMLAudioElement, up: TempUpload) {
    up.duration(el.duration);
    this.uploadFile(up.file);
  }

  cannotPlay(err: Error, up: TempUpload) {
    up.duration(null); // TODO: should we mark this as non-audio?
    this.uploadFile(up.file);
  }

  uploadFile(file: File) {
    let upload = this.uploadService.add(file);
    this.version.addUpload(upload);
  }

  onCancel(uuid) {
    this.version.removeUpload(uuid);
  }

  private initDragula() {
    this.dragulaService.setOptions(this.id, {
      moves: function (el: Element, source: Element, handle: Element) {
        return handle.classList.contains('drag-handle');
      }
    });

    // update positions for visible (non-canceled) audio-files
    this.dragSubscription = this.dragulaService.dropModel.subscribe((args: any[]) => {
      let position = 1;
      for (let file of this.version.files) {
        if (!file.isDestroy) {
          file.set('position', position++);
        }
      }
    });
  }

}
