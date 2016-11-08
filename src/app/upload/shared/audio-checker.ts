import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface CheckedFile extends File {
  playable: boolean;
  duration: number;
  name: string;
  size: number;
  type: string;
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
