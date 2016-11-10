import { Component, Input, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UUID, UploadService, HalDoc } from '../../core';
import { AudioVersionModel } from '../../shared';
import { CheckedFile, FileChecker } from './audio-checker';

@Component({
  selector: 'publish-audio-input',
  styleUrls: ['audio-input.component.css'],
  template: `
    <div *ngFor="let f of newFiles">
      <audio *ngIf="!f.checked" #audio [src]="f.src"
        (canplaythrough)="canPlay(audio,f)" (error)="cannotPlay($event,f)"></audio>
    </div>
    <input type="file" accept="audio/mpeg" publishFileSelect [id]="uuid"
      [attr.multiple]="multiple" (file)="addFile($event)"/>
    <label *ngIf="multiple" class="button" [htmlFor]="uuid">Upload Files</label>
    <label *ngIf="!multiple" class="button" [htmlFor]="uuid">Upload File</label>
  `
})

export class AudioInputComponent {

  @Input() multiple = null;

  @Input() version: AudioVersionModel;

  @Input() position: number;

  uuid: string;

  newFiles: FileChecker[] = [];

  constructor(
    private el: ElementRef,
    private sanitizer: DomSanitizer,
    private uploadService: UploadService
  ) {
    this.uuid = UUID.UUID();
  }

  click() {
    this.el.nativeElement.getElementsByTagName('input')[0].click();
  }

  addFile(file: File) {
    this.newFiles.push(new FileChecker(file, this.sanitizer));
  }

  canPlay(el: HTMLAudioElement, checker: FileChecker) {
    checker.check(el.duration);
    this.uploadFile(checker.file);
  }

  cannotPlay(err: Error, checker: FileChecker) {
    checker.check(null);
    this.uploadFile(checker.file);
  }

  uploadFile(file: CheckedFile) {
    let upload = this.uploadService.add(file);
    this.version.addUpload(upload, this.position);
  }

}
