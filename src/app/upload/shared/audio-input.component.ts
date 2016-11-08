import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UUID } from '../../core';
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
    <label class="button" [htmlFor]="uuid">Upload Files</label>
  `
})

export class AudioInputComponent {

  @Input() multiple = null;

  @Output() file = new EventEmitter<CheckedFile>();

  uuid: string;

  newFiles: FileChecker[] = [];

  constructor(private el: ElementRef, private sanitizer: DomSanitizer) {
    this.uuid = UUID.UUID();
  }

  click() {
    this.el.nativeElement.getElementById(this.uuid).click();
  }

  addFile(file: File) {
    this.newFiles.push(new FileChecker(file, this.sanitizer));
  }

  canPlay(el: HTMLAudioElement, checker: FileChecker) {
    checker.check(el.duration);
    this.file.emit(checker.file);
  }

  cannotPlay(err: Error, checker: FileChecker) {
    checker.check(null);
    this.file.emit(checker.file);
  }

}
