import { Observable } from 'rxjs/Observable';

export interface PlaybackMetadata {
  duration: number;
  progress: number;
}

// NOTE: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md
//       #extending-built-ins-like-error-array-and-map-may-no-longer-work
export class UnsupportedFileError extends Error {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, UnsupportedFileError.prototype);
  }
}

export interface AudioPlayback {
  play(): Observable<PlaybackMetadata>;
  seek(percent: number);
  stop();
}
