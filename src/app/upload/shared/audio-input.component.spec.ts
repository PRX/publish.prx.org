import { cit, create, provide } from '../../../testing';
import { of as observableOf } from 'rxjs';
import { AudioInputComponent } from './audio-input.component';
import { PlayerService } from '../../core/audio/player.service';
import { UploadService } from '../../core/upload/upload.service';

describe('AudioInputComponent', () => {

  create(AudioInputComponent);

  provide(PlayerService, {checkFile: () => observableOf({})});

  provide(UploadService, {add: () => observableOf(null)});

  const makeVersion = () => {
    let version = {
      file: null,
      addUpload: () => {
        version.file = {set: (k, v) => version.file[k] = v};
        return version.file;
      }
    };
    return version;
  };

  let durationSpy;
  const setDuration = (comp, milliseconds) => {
    if (!durationSpy) {
      comp.version = makeVersion();
      durationSpy = spyOn(comp.player, 'checkFile');
    }
    let data = {format: 'fm', duration: milliseconds, bitrate: 'br', frequency: 'fr'};
    durationSpy.and.returnValue(observableOf(data));
    comp.addFile(<any> 'some-file');
    return comp.version.file.duration;
  };

  cit('checks uploaded files', (fix, el, comp) => {
    spyOn(comp.player, 'checkFile').and.returnValue({subscribe: () => null});
    comp.addFile(<any> 'some-file');
    expect(comp.player.checkFile).toHaveBeenCalledWith('some-file');
  });

  cit('uploads files', (fix, el, comp) => {
    comp.version = makeVersion();
    spyOn(comp.uploadService, 'add').and.callThrough();
    comp.addFile(<any> 'some-file');
    expect(comp.uploadService.add).toHaveBeenCalledWith('some-file');
  });

  cit('sets audio file fields', (fix, el, comp) => {
    comp.version = makeVersion();
    let data = {format: 'fm', duration: 5501, bitrate: 'br', frequency: 'fr'};
    spyOn(comp.player, 'checkFile').and.returnValue(observableOf(data));
    comp.addFile(<any> 'some-file');
    expect(comp.version.file.format).toEqual('fm');
    expect(comp.version.file.duration).toEqual(6);
    expect(comp.version.file.bitrate).toEqual('br');
    expect(comp.version.file.frequency).toEqual('fr');
  });

  cit('rounds durations', (fix, el, comp) => {
    expect(setDuration(comp, null)).toBeNull();
    expect(setDuration(comp, undefined)).toBeNull();
    expect(setDuration(comp, 0)).toEqual(0);
    expect(setDuration(comp, 123)).toEqual(1);
    expect(setDuration(comp, 1200)).toEqual(1);
    expect(setDuration(comp, 1800)).toEqual(2);
  });

  cit('uploads single', (fix, el, comp) => {
    comp.multiple = false;
    fix.detectChanges();
    expect(el).toQueryAttr('input', 'multiple', 'false');
  });

  cit('uploads multiple', (fix, el, comp) => {
    comp.multiple = true;
    fix.detectChanges();
    expect(el).toQueryAttr('input', 'multiple', 'true');
  });

  cit('accepts different content types', (fix, el, comp) => {
    comp.accept = undefined;
    expect(comp.acceptWildcard).toEqual('*');
    comp.accept = 'audio/mpeg';
    expect(comp.acceptWildcard).toEqual('audio/*');
    comp.accept = 'audio/foobar';
    expect(comp.acceptWildcard).toEqual('audio/*');
    comp.accept = 'video/mpeg';
    expect(comp.acceptWildcard).toEqual('video/*');
    comp.accept = 'foo/bar';
    expect(comp.acceptWildcard).toEqual('*');
  });

});
