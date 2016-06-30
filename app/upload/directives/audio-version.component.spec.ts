import {it, describe, expect} from '@angular/core/testing';
import {setupComponent, buildComponent, mockDirective, mockService}
  from '../../../util/test-helper';
import {AudioVersionComponent} from './audio-version.component';
import {UploadService} from '../services/upload.service';
import {AudioFileComponent} from './audio-file.component';

describe('AudioVersionComponent', () => {

  setupComponent(AudioVersionComponent);

  let uploadFiles = {};
  mockService(UploadService, {
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

  mockDirective(AudioFileComponent, {
    selector: 'audio-file',
    template: '<i>nothing</i>'
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

  it('only shows known versions', buildComponent((fix, el, aversion) => {
    aversion.version = mockVersion({label: 'foobar'});
    fix.detectChanges();
    expect(el.querySelector('header strong')).toBeNull();
    aversion.version = mockVersion({label: 'Main Audio'});
    fix.detectChanges();
    expect(el.querySelector('header strong')).toHaveText('Main Audio');
    expect(el.querySelector('header span').textContent).toMatch('The primary version');
  }));

  it('shows an indicator when there are no audio files', buildComponent((fix, el, aversion) => {
    aversion.version = mockVersion();
    fix.detectChanges();
    expect(el.querySelector('.empty').textContent).toMatch('Upload a file to get started');
  }));

  it('renders upload files', buildComponent((fix, el, aversion) => {
    aversion.version = mockVersion({files: ['one', 'two', 'three']});
    fix.detectChanges();
    expect(el.querySelectorAll('audio-file').length).toEqual(3);
  }));

  it('finds in-progress uploads', buildComponent((fix, el, aversion) => {
    aversion.version = mockVersion({uploadUuids: ['testuuid']});
    spyOn(aversion.version, 'watchUpload').and.stub;
    fix.detectChanges();
    expect(aversion.version.watchUpload).toHaveBeenCalledWith('foobar');
  }));

  it('adds uploads', buildComponent((fix, el, aversion) => {
    aversion.version = mockVersion({files: ['one']});
    fix.detectChanges();
    expect(el.querySelectorAll('audio-file').length).toEqual(1);

    spyOn(aversion.version, 'addUpload').and.callThrough();
    aversion.addUpload('two');
    expect(uploadFiles['two']).toEqual('two');
    fix.detectChanges();
    expect(el.querySelectorAll('audio-file').length).toEqual(2);
    expect(aversion.version.addUpload).toHaveBeenCalledWith('two');
  }));

});
