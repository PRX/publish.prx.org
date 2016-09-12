import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { AudioVersionModel, UploadService } from '../../shared';
import { FileSelectDirective } from './file-select.directive';
import { AudioFileComponent } from './audio-file.component';

@Component({
  directives: [AudioFileComponent, FileSelectDirective],
  selector: 'audio-version',
  styleUrls: ['audio-version.component.css'],
  template: `
    <template [ngIf]="DESCRIPTIONS[version.label]">
      <header>
        <strong>{{version.label}}</strong>
        <span>{{DESCRIPTIONS[version.label]}}</span>
      </header>
      <section [dragula]="id" [dragulaModel]="version.files">
        <audio-file *ngFor="let file of version.files"
          [audio]="file"></audio-file>
        <div *ngIf="noAudioFiles" class="empty">
          <h4>Upload a file to get started</h4>
        </div>
      </section>
      <footer>
        <input type="file" id="file" fileSelect (file)="addUpload($event)"/>
        <label class="button" for="file">Upload Files</label>
      </footer>
    </template>
  `,
  viewProviders: [DragulaService]
})

export class AudioVersionComponent implements OnInit, OnDestroy {

  DESCRIPTIONS = {
    'Main Audio': 'The primary version of your audio that blah blah blah',
    'Piece Audio': 'The standard version of your story you would most like people to hear and buy',
    'Promos': 'The promotional version of your audio'
  };

  @Input() version: AudioVersionModel;

  private dragSubscription: Subscription;

  constructor(
    private uploadService: UploadService,
    private dragulaService: DragulaService
  ) {}

  get id(): any {
    return this.version.id ? ('version-' + this.version.id) : 'version-new';
  }

  get noAudioFiles(): boolean {
    if (this.version.files) {
      if (this.version.files.length === 0) {
        return true;
      } else {
        return this.version.files.every(f => f.isDestroy === true);
      }
    }
    return false;
  }

  ngOnInit() {
    this.initDragula();

    // in-progress uploads
    for (let uuid of this.version.uploadUuids) {
      let upload = this.uploadService.find(uuid);
      if (upload) {
        this.version.watchUpload(upload);
      }
    }
  }

  addUpload(file: File) {
    let upload = this.uploadService.add(file);
    this.version.addUpload(upload);
  }

  ngOnDestroy() {
    this.dragSubscription.unsubscribe();

    // stop watching progress
    for (let file of this.version.files) {
      file.unsubscribe();
    }
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
