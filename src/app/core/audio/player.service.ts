import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AudioPlayback, AuroraPlayback, NativePlayback, PlaybackMetadata,
  UnsupportedFileError } from './playback';
import { AuroraValidation, ValidationMetadata } from './validation';

@Injectable()
export class PlayerService {

  private playback: AudioPlayback;

  play(fileOrUrl: File | string): Observable<PlaybackMetadata> {
    this.stop();

    // play natively, or fallback to aurora
    this.playback = new NativePlayback(fileOrUrl);
    return this.playback.play().catch(err => {
      if (err instanceof UnsupportedFileError) {
        this.playback = new AuroraPlayback(fileOrUrl);
        return this.playback.play();
      } else {
        return Observable.throw(err);
      }
    });
  }

  seek(percent: number) {
    if (this.playback) {
      this.playback.seek(percent);
    }
  }

  stop() {
    if (this.playback) {
      this.playback.stop();
    }
  }

  checkFile(file: File): Observable<ValidationMetadata> {
    let valid = new AuroraValidation(file);
    return valid.validate();
  }

}
