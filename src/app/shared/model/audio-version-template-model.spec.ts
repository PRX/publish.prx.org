import { cms } from '../../../testing';
import { AudioVersionTemplateModel } from './audio-version-template.model';
import { AudioFileTemplateModel } from './audio-file-template.model';

describe('AudioVersionTemplateModel', () => {

  beforeEach(() => window.localStorage.clear());

  it('loads unsaved files', () => {
    new AudioFileTemplateModel(null, 0, 1).set('label', 'file 1');
    new AudioFileTemplateModel(null, 0, 2).set('label', 'file 2');
    new AudioFileTemplateModel(null, 0, 4).set('label', 'file 4');
    let version = new AudioVersionTemplateModel(null, 0);
    expect(version.fileTemplates.length).toEqual(2);
    expect(version.fileTemplates[0].label).toEqual('file 1');
    expect(version.fileTemplates[1].label).toEqual('file 2');
  });

  it('concats unsaved files to existing ones', () => {
    let vdoc = cms.mock('prx:vdoc', {id: 123, label: 'My Version Template'});
    vdoc.mockItems('prx:audio-file-templates', [{label: 'saved 1', position: 1}]);
    new AudioFileTemplateModel(null, vdoc, 1).set('label', 'file 1');
    new AudioFileTemplateModel(null, vdoc, 2).set('label', 'file 2');
    new AudioFileTemplateModel(null, vdoc, 4).set('label', 'file 4');

    let version = new AudioVersionTemplateModel(null, vdoc);
    expect(version.fileTemplates.length).toEqual(2);
    expect(version.fileTemplates[0].label).toEqual('saved 1');
    expect(version.fileTemplates[1].label).toEqual('file 2');
  });

  describe('addFile', () => {

    it('sets labels based on position', () => {
      let version = new AudioVersionTemplateModel();
      let file1 = version.addFile();
      let file2 = version.addFile(null, true);
      expect(file1.label).toEqual('Segment A');
      expect(file2.label).toEqual('Segment B');
      expect(file1.changed('label')).toEqual(true);
      expect(file2.changed('label')).toEqual(false);
    });

    it('sets file keys based on version index', () => {
      let version = new AudioVersionTemplateModel(null, 3);
      let file1 = version.addFile();
      let file2 = version.addFile();
      expect(file1.position).toEqual(1);
      expect(file2.position).toEqual(2);
      expect(file1.key()).toMatch(/series\.new\.3\.1/);
      expect(file2.key()).toMatch(/series\.new\.3\.2/);
    });

  });

});
