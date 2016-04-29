import {it, describe, expect} from 'angular2/testing';
import {setupComponent, buildComponent, mockDirective, mockService}
  from '../../../util/test-helper';
import {AudioVersionComponent} from './audio-version.component';
import {UploadService} from '../services/upload.service';
import {AudioFileComponent} from './audio-file.component';
import {MockHalDoc} from '../../shared/cms/cms.mocks';
import {AudioModel} from '../models/audio.model';

describe('AudioVersionComponent', () => {

  setupComponent(AudioVersionComponent);

  let addedFile = {};
  mockService(UploadService, {
    addFile: (id: any, file: any): any => {
      addedFile[id] = file;
    },
    uploadsForVersion: (versionId: any): any => {
      if (versionId === 'test-in-progress') {
        return ['three', 'four'];
      } else {
        return [];
      }
    }
  });

  mockDirective(AudioFileComponent, {
    selector: 'audio-file',
    template: '<i>nothing</i>'
  });

  beforeEach(() => {
    spyOn(AudioModel, 'fromDoc').and.callFake((doc: any) => {
      return doc.title;
    });
    spyOn(AudioModel, 'fromUpload').and.callFake((upload: any, version: any) => {
      return upload;
    });
  });

  it('shows the version labels', buildComponent((fix, el, aversion) => {
    expect(el.querySelector('header strong')).toHaveText('');
    expect(el.querySelector('header span')).toHaveText('');
    aversion.version = new MockHalDoc({label: 'Foobar'});
    aversion.version.mockList('prx:audio', []);
    aversion.DESCRIPTIONS['Foobar'] = 'Some description';
    fix.detectChanges();
    expect(el.querySelector('header strong')).toHaveText('Foobar');
    expect(el.querySelector('header span')).toHaveText('Some description');
  }));

  it('shows an indicator when there are no audio files', buildComponent((fix, el, aversion) => {
    aversion.version = new MockHalDoc();
    aversion.version.mockList('prx:audio', []);
    fix.detectChanges();
    expect(el.querySelector('.empty').textContent).toMatch('Upload a file to get started');
  }));

  it('renders saved audio files', buildComponent((fix, el, aversion) => {
    aversion.version = new MockHalDoc();
    aversion.version.mockList('prx:audio', [{title: 'one'}, {title: 'two'}, {title: 'three'}]);
    fix.detectChanges();
    expect(el.querySelectorAll('audio-file').length).toEqual(3);
  }));

  it('renders in-progress uploads', buildComponent((fix, el, aversion) => {
    aversion.version = new MockHalDoc({id: 'test-in-progress'});
    aversion.version.mockList('prx:audio', [{title: 'one'}]);
    fix.detectChanges();
    expect(el.querySelectorAll('audio-file').length).toEqual(3);
  }));

  it('adds uploads', buildComponent((fix, el, aversion) => {
    aversion.version = new MockHalDoc({id: 'my-id'});
    aversion.version.mockList('prx:audio', [{title: 'one'}]);
    fix.detectChanges();
    expect(el.querySelectorAll('audio-file').length).toEqual(1);

    aversion.addUpload('two');
    expect(addedFile['my-id']).toEqual('two');
    fix.detectChanges();
    expect(el.querySelectorAll('audio-file').length).toEqual(2);
  }));

  it('removes uploads', buildComponent((fix, el, aversion) => {
    aversion.version = new MockHalDoc({id: 'test-in-progress'});
    aversion.version.mockList('prx:audio', [{title: 'one'}, {title: 'two'}]);
    fix.detectChanges();
    expect(el.querySelectorAll('audio-file').length).toEqual(4);

    aversion.removeUpload('two');
    aversion.removeUpload('three');
    fix.detectChanges();
    expect(el.querySelectorAll('audio-file').length).toEqual(2);
  }));

});
