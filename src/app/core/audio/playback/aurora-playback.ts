import { Observable ,  Subscriber } from 'rxjs';
import { PlaybackMetadata, AudioPlayback } from './playback';

/*
 * Native <audio> playback
 */
export class AuroraPlayback implements AudioPlayback {

  private player: AV.Player;
  private data: PlaybackMetadata;
  private sub: Subscriber<PlaybackMetadata>;

  constructor(src: File | string) {
    if (src instanceof File) {
      this.player = AV.Player.fromFile(src);
    } else {
      this.player = AV.Player.fromURL(src);
    }
    this.data = <PlaybackMetadata> {progress: 0};
  }

  play(): Observable<PlaybackMetadata> {
    return Observable.create(sub => {
      this.sub = sub;
      this.player.on('duration', d => {
        this.data.duration = d;
        sub.next(this.data);
        this.player.play();
      });
      this.player.on('progress', p => {
        this.data.progress = p;
        sub.next(this.data);
      });
      this.player.on('end', () => sub.complete());
      this.player.on('error', err => sub.error(err));
      this.player.preload();
      return () => this.player.stop();
    });
  }

  seek(percent: number) {
    if (this.data && this.data.duration) {
      this.player.seek(this.data.duration * percent);
    }
  }

  stop() {
    if (this.sub) {
      this.sub.complete();
    }
  }

}
