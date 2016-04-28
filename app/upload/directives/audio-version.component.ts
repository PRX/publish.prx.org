import {Component, Input, OnInit, OnDestroy} from 'angular2/core';
import {Subscription} from 'rxjs';
import {UploadService} from '../services/upload.service';
import {UploadFileSelect} from './upload-file-select.directive';
import {AudioFileComponent} from './audio-file.component';
import {HalDoc} from '../../shared/cms/haldoc';
import {AudioModel} from '../models/audio.model';

// TODO: why can't atom find this? jspm bundles it just fine
import {Dragula, DragulaService} from 'ng2-dragula';

@Component({
  directives: [UploadFileSelect, AudioFileComponent, Dragula],
  viewProviders: [DragulaService],
  selector: 'audio-version',
  styleUrls: ['app/upload/directives/audio-version.component.css'],
  template: `
    <header>
      <strong>{{version.label}}</strong>
      <span>{{DESCRIPTIONS[version.label]}}</span>
    </header>
    <section *ngIf="audios" [dragula]="version.label" [dragulaModel]="audios">
      <audio-file *ngFor="#audio of audios"
        [audio]="audio"
        (remove)="removeUpload(audio)"></audio-file>
      <div *ngIf="!audios.length" class="empty">
        <h4>Upload a file to get started</h4>
      </div>
    </section>
    <footer>
      <input type="file" id="file" upload-file (file)="addUpload($event)"/>
      <label class="button" for="file">Upload Files</label>
    </footer>
  `
})

export class AudioVersionComponent implements OnInit, OnDestroy {

  DESCRIPTIONS = {
    'Piece Audio': 'The standard version of your story you would most like people to hear and buy'
  };

  @Input() version: HalDoc;

  audios: AudioModel[];
  private dragSubscription: Subscription;

  constructor(
    private uploadService: UploadService,
    private dragulaService: DragulaService
  ) {}

  ngOnInit() {
    this.version.followList('prx:audio').subscribe((docs) => {
      this.audios = docs.map((doc) => {
        return AudioModel.fromDoc(doc);
      });
      this.uploadService.uploadsForVersion(this.version['id']).forEach((upload) => {
        this.audios.push(AudioModel.fromUpload(upload, this.version));
      });
    });
    this.dragulaService.setOptions(this.version['label'], {
      moves: function (el: Element, source: Element, handle: Element) {
        return handle.classList.contains('drag-handle');
      }
    });
    this.dragSubscription = this.dragulaService.dropModel.subscribe((args: any[]) => {
      let i = 0, el = args[1];
      while (el.previousElementSibling) { i++; el = el.previousElementSibling; }
      this.audios[i].changePosition(i + 1);
    });
  }

  ngOnDestroy() {
    this.dragSubscription.unsubscribe();
    for (let audio of this.audios) {
      audio.unsubscribe();
    }
  }

  addUpload(file: File) {
    let upload = this.uploadService.addFile(this.version['id'], file);
    this.audios.push(AudioModel.fromUpload(upload, this.version));
  }

  removeUpload(audio: AudioModel) {
    if (audio.upload) {
      this.uploadService.remove(audio.upload);
    }
    let i = this.audios.indexOf(audio);
    if (i > -1) {
      this.audios.splice(i, 1);
    }
  }

}
