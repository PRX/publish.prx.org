import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { AudioVersionModel } from '../../model';
import { UploadService } from '../../../core';

@Component({
  selector: 'publish-audio-version',
  styleUrls: ['audio-version.component.css'],
  template: `
    <template [ngIf]="DESCRIPTIONS[version.label]">
      <header>
        <strong>{{version.label}}</strong>
        <span>{{DESCRIPTIONS[version.label]}}</span>
      </header>
      <section [dragula]="id" [dragulaModel]="version.files">
        <publish-audio-file *ngFor="let file of version.files"
          [audio]="file" (cancel)="onCancel($event)"></publish-audio-file>
        <div *ngIf="version.noAudioFiles" class="empty">
          <h4>Upload a file to get started</h4>
        </div>
      </section>
      <footer>
        <input type="file" id="audio-file" multiple publishFileSelect (file)="addUpload($event)"/>
        <label class="button" for="audio-file">Upload Files</label>
      </footer>
    </template>
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

  constructor(
    private uploadService: UploadService,
    private dragulaService: DragulaService
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

  addUpload(file: File) {
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
