import { Observable } from 'rxjs';

export interface PlaybackMetadata {
  duration: number;
  progress: number;
}

export class UnsupportedFileError extends Error {
}

export interface AudioPlayback {
  play(): Observable<PlaybackMetadata>;
  seek(percent: number);
  stop();
}
