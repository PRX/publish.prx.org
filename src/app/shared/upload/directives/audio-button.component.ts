import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface CheckedFile extends File {
  playable: boolean;
  duration: number;
}

export class FileChecker {
  public checked = false;
  public src: SafeResourceUrl;
  public raw: string;
  public file: CheckedFile;

  constructor(file: File, sanitizer: DomSanitizer) {
    this.file = <CheckedFile> file;
    this.raw = URL.createObjectURL(file);
    this.src = sanitizer.bypassSecurityTrustResourceUrl(this.raw);
  }

  check(duration: number = null) {
    this.checked = true;
    this.file.playable = duration ? true : false;
    this.file.duration = Math.ceil(duration);
    URL.revokeObjectURL(this.raw);
  }
}

@Component({
  selector: 'publish-audio-button',
  styleUrls: ['audio-button.component.css'],
  template: `
    <div *ngFor="let f of newFiles">
      <audio *ngIf="!f.checked" #audio [src]="f.src"
        (canplaythrough)="canPlay(audio,f)" (error)="cannotPlay($event,f)"></audio>
    </div>
    <input type="file" [id]="id" multiple publishFileSelect (file)="addFile($event)"/>
    <label class="button" [htmlFor]="id">Upload Files</label>
  `
})

export class AudioButtonComponent {

  @Input() id: string;
  @Output() file = new EventEmitter<CheckedFile>();

  private newFiles: FileChecker[] = [];

  constructor(private sanitizer: DomSanitizer) {}

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
