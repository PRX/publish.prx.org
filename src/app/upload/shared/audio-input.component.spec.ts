import { cit, create, provide } from '../../../testing';
import { Observable } from 'rxjs';
import { AudioInputComponent } from './audio-input.component';
import { PlayerService } from '../../core/audio/player.service';
import { UploadService } from '../../core/upload/upload.service';

describe('AudioInputComponent', () => {

  create(AudioInputComponent);

  provide(PlayerService, {checkFile: () => Observable.of({})});

  provide(UploadService, {add: () => null});

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

  cit('checks uploaded files', (fix, el, comp) => {
    spyOn(comp.player, 'checkFile').and.returnValue({subscribe: () => null});
    comp.addFile(<any> 'some-file');
    expect(comp.player.checkFile).toHaveBeenCalledWith('some-file');
  });

  cit('uploads files', (fix, el, comp) => {
    comp.version = makeVersion();
    spyOn(comp.uploadService, 'add').and.stub();
    comp.addFile(<any> 'some-file');
    expect(comp.uploadService.add).toHaveBeenCalledWith('some-file');
  });

  cit('sets audio file fields', (fix, el, comp) => {
    comp.version = makeVersion();
    let data = {format: 'fm', duration: 5501, bitrate: 'br', frequency: 'fr'};
    spyOn(comp.player, 'checkFile').and.returnValue(Observable.of(data));
    comp.addFile(<any> 'some-file');
    expect(comp.version.file.format).toEqual('fm');
    expect(comp.version.file.duration).toEqual(6);
    expect(comp.version.file.bitrate).toEqual('br');
    expect(comp.version.file.frequency).toEqual('fr');
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

});
