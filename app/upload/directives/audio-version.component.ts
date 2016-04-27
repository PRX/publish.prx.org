import {Component, Input, OnInit} from 'angular2/core';
import {UploadService} from '../services/upload.service';
import {UploadFileSelect} from './upload-file-select.directive';
import {AudioFileComponent} from './audio-file.component';
import {HalDoc} from '../../shared/cms/haldoc';
import {AudioModel} from '../models/audio.model';

@Component({
  directives: [UploadFileSelect, AudioFileComponent],
  selector: 'audio-version',
  styleUrls: ['app/upload/directives/audio-version.component.css'],
  template: `
    <header>
      <strong>{{version.label}}</strong>
      <span>{{DESCRIPTIONS[version.label]}}</span>
    </header>
    <section *ngIf="audios">
      <audio-file *ngFor="#audio of audios" [audio]="audio"
        (remove)="removeUpload(audio)"></audio-file>
      <div *ngIf="!audios.length" class="empty">
        <h4>Upload a file to get started</h4>
      </div>
      <div class="uploader">
        <input type="file" id="file" upload-file (file)="addUpload($event)"/>
        <label class="button" for="file">Upload Files</label>
      </div>
    </section>
  `
})

export class AudioVersionComponent implements OnInit {

  DESCRIPTIONS = {
    'Piece Audio': 'The standard version of your story you would most like people to hear and buy'
  };

  @Input() story: HalDoc;
  @Input() version: HalDoc;

  audios: AudioModel[];

  constructor(private uploadService: UploadService) {}

  ngOnInit() {
    this.version.followList('prx:audio').subscribe((docs) => {
      this.audios = docs.map((doc) => {
        return AudioModel.fromDoc(doc);
      });
      this.uploadService.uploadsForVersion(this.version['id']).forEach((upload) => {
        this.audios.push(AudioModel.fromUpload(upload, this.version));
      });
    });
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
