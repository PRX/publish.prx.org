import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AudioPlayback, AuroraPlayback, NativePlayback, PlaybackMetadata,
  UnsupportedFileError } from './playback';
import { AudioValidation, AuroraValidation, ValidationMetadata } from './validation';

@Injectable()
export class PlayerService {

  private playback: AudioPlayback;

  play(fileOrUrl: File | string): Observable<PlaybackMetadata> {
    this.stop();

    // play natively, or fallback to aurora
    return this.nativePlayback(fileOrUrl).play().catch(err => {
      if (err instanceof UnsupportedFileError) {
        return this.auroraPlayback(fileOrUrl).play();
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
    return this.auroraValidation(file).validate();
  }

  private nativePlayback(fileOrUrl: File | string): AudioPlayback {
    return this.playback = new NativePlayback(fileOrUrl);
  }

  private auroraPlayback(fileOrUrl: File | string): AudioPlayback {
    return this.playback = new AuroraPlayback(fileOrUrl);
  }

  private auroraValidation(fileOrUrl: File | string): AudioValidation {
    return new AuroraValidation(fileOrUrl);
  }

}
