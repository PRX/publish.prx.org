
import {throwError as observableThrowError,  Observable ,  Subscriber } from 'rxjs';

import { PlaybackMetadata, AudioPlayback, UnsupportedFileError } from './playback';

/*
 * Native <audio> playback
 */
export class NativePlayback implements AudioPlayback {

  private el: HTMLAudioElement;
  private data: PlaybackMetadata;
  private sub: Subscriber<PlaybackMetadata>;
  private playable = false;

  constructor(src: File | string) {
    this.el = this.build(src);
    this.data = <PlaybackMetadata> {progress: 0};
  }

  play(): Observable<PlaybackMetadata> {
    if (!this.el) {
      return observableThrowError(new UnsupportedFileError('Only remote playback supported'));
    }
    return Observable.create(sub => {
      this.sub = sub;

      this.el.addEventListener('durationchange', () => {
        this.data.duration = this.el.duration;
        sub.next(this.data);
      });
      this.el.addEventListener('timeupdate', () => {
        this.data.progress = this.el.currentTime;
        sub.next(this.data);
      });
      this.el.addEventListener('ended', () => sub.complete());
      this.el.addEventListener('error', err => {
        if (this.playable) {
          sub.error(new Error('Unknown native playback error'));
        } else {
          sub.error(new UnsupportedFileError('Playback of this filetype not supported'));
        }
      });

      // some browsers return a promise that can throw errors (can't cast this)
      let promise = this.el.play();
      if (promise && promise['catch']) {
        promise['catch'](err => null); // error event already covers this
      }

      return () => this.el && this.el.pause();
    });
  }

  seek(percent: number) {
    if (this.data && this.data.duration) {
      this.el.currentTime = this.data.duration * percent;
    }
  }

  stop() {
    if (this.sub) {
      this.sub.complete();
    }
  }

  private build(src: File | string): HTMLAudioElement {
    if (typeof(src) === 'string') {
      let el = document.createElement('audio');
      el.setAttribute('src', src);
      el.addEventListener('playable', () => this.playable = true);
      return el;
    } else {
      return null;
    }
  }

}
