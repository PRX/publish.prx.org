import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { AudioVersionModel } from '../../model';
import { UploadService } from '../../../core';
import { CheckedFile } from './audio-button.component';

@Component({
  selector: 'publish-audio-version',
  styleUrls: ['audio-version.component.css'],
  template: `
    <header>
      <strong>{{version.label}}</strong>
      <span *ngIf="DESCRIPTIONS[version.label]">{{DESCRIPTIONS[version.label]}}</span>
    </header>
    <section>
      <div [dragula]="id" [dragulaModel]="version.files" class="uploads">
        <publish-audio-file *ngFor="let file of version.files" [audio]="file"
          (cancel)="onCancel($event)">
        </publish-audio-file>
      </div>
      <div class="placeholder" *ngFor="let tpl of version.fileTemplates; let i = index">
        <publish-audio-file *ngIf="i >= version.audioCount" [placeholder]="tpl">
        </publish-audio-file>
      </div>
      <div *ngIf="version.noAudioFiles" class="empty">
        <h4>Upload a file to get started</h4>
      </div>
    </section>
    <footer>
      <publish-audio-button [id]="id" (file)="uploadFile($event)"></publish-audio-button>
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

  private dragSub: Subscription;

  constructor(
    private uploadService: UploadService,
    private dragulaService: DragulaService
  ) {}

  get id(): any {
    return this.version.key();
  }

  ngOnInit() {
    this.initDragula();
  }

  ngOnDestroy() {
    if (this.dragSub) {
      this.dragSub.unsubscribe();
    }
  }

  uploadFile(file: CheckedFile) {
    let upload = this.uploadService.add(file);
    this.version.addUpload(upload);
    this.updateFiles();
  }

  onCancel(uuid) {
    this.version.removeUpload(uuid);
    this.updateFiles();
  }

  updateFiles() {
    let tidx = 0, position = 1;
    this.version.files.forEach(file => {
      if (file.isDestroy) {
        file.setTemplate(null);
      } else {
        file.set('position', position++);
        file.setTemplate(this.version.fileTemplates[tidx++]);
      }
    });
  }

  private initDragula() {
    this.dragulaService.setOptions(this.id, {
      moves: (el: Element, source: Element, handle: Element) => {
        return handle.classList.contains('drag-handle');
      }
    });
    this.dragSub = this.dragulaService.dropModel.subscribe(() => this.updateFiles());
  }

}
