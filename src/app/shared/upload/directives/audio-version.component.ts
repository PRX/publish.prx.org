import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { AudioVersionModel } from '../../model';
import { UploadService } from '../../../core';

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
      <audio *ngFor="let f of newFiles" #audio [src]="f.safesrc"
        (canplaythrough)="canPlay(audio,f)" (error)="cannotPlay($event,f)"></audio>
      <input type="file" id="audio-file" multiple publishFileSelect (file)="addFile($event)"/>
      <label class="button" for="audio-file">Upload Files</label>
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
  private newFiles: File[] = [];

  constructor(
    private uploadService: UploadService,
    private dragulaService: DragulaService,
    private sanitizer: DomSanitizer
  ) {}

  get id(): any {
    return this.version.id ? ('version-' + this.version.id) : 'version-new';
  }

  ngOnInit() {
    this.initDragula();
  }

  ngOnDestroy() {
    this.dragSubscription.unsubscribe();
  }

  addFile(file: File) {
    file['tmpsrc'] = URL.createObjectURL(file);
    file['safesrc'] = this.sanitizer.bypassSecurityTrustResourceUrl(file['tmpsrc']);
    this.newFiles.push(file);
  }

  canPlay(el: HTMLAudioElement, file: File) {
    file['duration'] = Math.round(el.duration);
    this.uploadFile(file);
  }

  cannotPlay(e: Error, file: File) {
    this.uploadFile(file); // TODO: should we mark this as non-audio?
  }

  uploadFile(file: File) {
    this.newFiles = this.newFiles.splice(this.newFiles.indexOf(file), 1);
    URL.revokeObjectURL(file['safesrc']);
    delete file['tmpsrc'];
    delete file['safesrc'];
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
