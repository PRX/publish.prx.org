import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';

export interface AudioMetadata {
  duration: number;
  format: string;
  bitrate: number;
  frequency: number;
}

export interface PlaybackMetadata {
  duration: number;
  progress: number;
}

@Injectable()
export class PlayerService {

  private playing: Subscriber<PlaybackMetadata>;
  private playingPlayer: AV.Player;
  private playingData: PlaybackMetadata;

  play(fileOrUrl: File | string): Observable<PlaybackMetadata> {
    this.stop();
    return Observable.create((sub: Subscriber<PlaybackMetadata>) => {
      this.playing = sub;

      let player: AV.Player;
      if (fileOrUrl instanceof File) {
        player = AV.Player.fromFile(fileOrUrl);
      } else {
        player = AV.Player.fromURL(fileOrUrl);
      }

      let data = <PlaybackMetadata> {progress: 0};
      player.on('duration', d => {
        data.duration = d;
        sub.next(data);
      });
      player.on('progress', p => {
        data.progress = p;
        sub.next(data);
      });
      player.on('end', () => sub.complete());
      player.on('error', err => sub.error(err));
      player.play();

      this.playingPlayer = player;
      this.playingData = data;

      return () => player.stop();
    });
  }

  seek(percent: number) {
    if (this.playingData && this.playingData.duration) {
      this.playingPlayer.seek(this.playingData.duration * percent);
    }
  }

  stop() {
    if (this.playing) this.playing.complete();
  }

  checkFile(file: File): Observable<AudioMetadata> {
    return Observable.create((sub: Subscriber<AudioMetadata>) => {
      let data = <AudioMetadata> {};
      let asset = AV.Asset.fromFile(file);
      let update = () => {
        if (asset.duration) {
          data.duration = asset.duration;
        }
        if (asset.format) {
          data.format = asset.format.formatID;
          // TODO: format doesn't actually include data, so this never works
          if (data.format === 'mp3' && asset.format.layer === 2) {
            data.format = 'mp2';
          }
          if (data.format === 'mp3' && file.name.match(/\.mp2$/)) {
            data.format = 'mp2'; // temporary hack
          }
          data.bitrate = asset.format.bitrate;
          data.frequency = asset.format.sampleRate;
        }
        if (data.duration && data.format) {
          sub.next(data);
          sub.complete();
        }
      };

      // file MUST have format and duration - metadata is optional
      asset.get('format', f => update());
      asset.get('duration', d => update());
      asset.get('metadata', m => update());
      asset.get('error', err => sub.error(err));
    });
  }

}
