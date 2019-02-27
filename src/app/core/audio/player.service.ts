
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {timeoutWith, catchError} from 'rxjs/operators';
import { Injectable } from '@angular/core';



import { AudioPlayback, AuroraPlayback, NativePlayback, PlaybackMetadata,
  UnsupportedFileError } from './playback';
import { AudioValidation, AuroraValidation, NativeValidation, ValidationMetadata } from './validation';

@Injectable()
export class PlayerService {

  private playback: AudioPlayback;

  play(fileOrUrl: File | string): Observable<PlaybackMetadata> {
    this.stop();

    // play natively, or fallback to aurora
    return this.nativePlayback(fileOrUrl).play().pipe(catchError(err => {
      if (err instanceof UnsupportedFileError) {
        return this.auroraPlayback(fileOrUrl).play();
      } else {
        return observableThrowError(err);
      }
    }));
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
    return this.auroraValidation(file)
      .validate().pipe(
      timeoutWith(500, this.nativeValidation(file).validate()));
  }

  private nativePlayback(fileOrUrl: File | string): AudioPlayback {
    return this.playback = new NativePlayback(fileOrUrl);
  }

  private auroraPlayback(fileOrUrl: File | string): AudioPlayback {
    return this.playback = new AuroraPlayback(fileOrUrl);
  }

  private nativeValidation(fileOrUrl: File | string): AudioValidation {
    return new NativeValidation(fileOrUrl);
  }

  private auroraValidation(fileOrUrl: File | string): AudioValidation {
    return new AuroraValidation(fileOrUrl);
  }

}
