import { cit, create, provide, By } from '../../../../testing';
import { AudioVersionComponent } from './audio-version.component';
import { UploadService } from '../../../core/upload/upload.service';

describe('AudioVersionComponent', () => {

  create(AudioVersionComponent, false);

  let uploadFiles = {};
  provide(UploadService, {
    add: (file: any): any => {
      uploadFiles[file] = file;
      return file;
    },
    find: (uuid: any): any => {
      if (uuid === 'testuuid') {
        return 'foobar';
      }
    }
  });

  const mockVersion = (data = {}): {} => {
    let version = <any> {};
    version.label = 'Main Audio';
    version.uploadUuids = [];
    version.files = [];
    version.watchUpload = () => { return; };
    version.addUpload = (upload: any) => { version.files.push(upload); };
    for (let key of Object.keys(data)) { version[key] = data[key]; }
    return version;
  };

  cit('only shows known versions', (fix, el, comp) => {
    comp.version = mockVersion({label: 'foobar'});
    fix.detectChanges();
    expect(el).not.toQuery('header strong');
    comp.version = mockVersion({label: 'Main Audio'});
    fix.detectChanges();
    expect(el).toQueryText('header strong', 'Main Audio');
    expect(el).toContainText('The primary mp3 version');
  });

  cit('shows an indicator when there are no audio files', (fix, el, comp) => {
    comp.version = mockVersion({noAudioFiles: true});
    fix.detectChanges();
    expect(el).toContainText('Upload a file to get started');
  });

  cit('renders upload files', (fix, el, comp) => {
    comp.version = mockVersion({files: ['one', 'two', 'three']});
    fix.detectChanges();
    expect(el.queryAll(By.css('publish-audio-file')).length).toEqual(3);
  });

  cit('adds uploads', (fix, el, comp) => {
    comp.version = mockVersion({files: ['one']});
    fix.detectChanges();
    expect(el.queryAll(By.css('publish-audio-file')).length).toEqual(1);

    spyOn(comp.version, 'addUpload').and.callThrough();
    comp.addUpload('two');
    expect(uploadFiles['two']).toEqual('two');
    fix.detectChanges();
    expect(el.queryAll(By.css('publish-audio-file')).length).toEqual(2);
    expect(comp.version.addUpload).toHaveBeenCalledWith('two');
  });

});
