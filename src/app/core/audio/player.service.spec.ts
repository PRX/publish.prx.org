import { Observable } from 'rxjs';
import { PlayerService } from './player.service';
import { UnsupportedFileError } from './playback';

class FakePlayback {
  playing = false;
  playingErr = null;
  progress = 0;
  play(): any {
    this.playing = true;
    return this.playingErr ? Observable.throw(this.playingErr) : Observable.of(true);
  }
  seek(p: number) { this.progress = p; }
  stop() { this.playing = false; }
}

class FakeValidation {
  validate(): any {
    return Observable.of('the-validation');
  }
}

describe('PlayerService', () => {

  let service = new PlayerService();

  let aurora: FakePlayback, native: FakePlayback, valid: FakeValidation;
  beforeEach(() => {
    aurora = new FakePlayback();
    native = new FakePlayback();
    valid = new FakeValidation();
    spyOn(service, 'auroraPlayback').and.callFake(function() { return this.playback = aurora; });
    spyOn(service, 'nativePlayback').and.callFake(function() { return this.playback = native; });
    spyOn(service, 'auroraValidation').and.returnValue(valid);
  });

  it('plays and stops the native player', () => {
    service.play('some-href').subscribe();
    expect(native.playing).toBeTruthy();
    expect(aurora.playing).toBeFalsy();
    service.stop();
    expect(native.playing).toBeFalsy();
    expect(aurora.playing).toBeFalsy();
  });

  it('falls back to the aurora player', () => {
    native.playingErr = new UnsupportedFileError('bad file!');
    service.play('some-href').subscribe();
    expect(native.playing).toBeTruthy();
    expect(aurora.playing).toBeTruthy();
    service.stop();
    expect(native.playing).toBeTruthy();
    expect(aurora.playing).toBeFalsy();
  });

  it('throws non playback errors from the native player', () => {
    native.playingErr = new Error('something else went wrong');
    let err: any;
    service.play('some-href').subscribe(
      () => { throw new Error('expected an error'); },
      e => err = e
    );
    expect(native.playing).toBeTruthy();
    expect(aurora.playing).toBeFalsy();
    expect(err.message).toEqual('something else went wrong');
  });

  it('seeks the player', () => {
    service.seek(0.5);
    expect(native.progress).toEqual(0);
    service.play('some-href').subscribe();
    service.seek(0.5);
    expect(native.progress).toEqual(0.5);
  });

  it('checks file format', () => {
    let validation = null;
    service.checkFile(<any> 'the-file').subscribe(v => validation = v);
    expect(validation).toEqual('the-validation');
  });

});
