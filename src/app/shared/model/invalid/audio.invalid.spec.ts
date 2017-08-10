import { VERSION_TEMPLATED, FILE_TEMPLATED } from './audio.invalid';

describe('AudioInvalid', () => {

  describe('VERSION_TEMPLATED', () => {

    const build = (data: any, count = null): any => {
      data.count = () => count;
      return data;
    };

    it('strictly defaults to at least one segment', () => {
      let invalid = VERSION_TEMPLATED();
      expect(invalid('', {files: []}, false)).toBeNull();
      expect(invalid('', {files: []}, true)).toMatch('upload at least 1 segment');
      expect(invalid('', {files: [1]}, true)).toBeNull();
    });

    it('strictly checks segment count', () => {
      let invalid = VERSION_TEMPLATED(build({}, 3));
      expect(invalid('', {files: [1, 2]}, false)).toBeNull();
      expect(invalid('', {files: [1, 2]}, true)).toMatch('upload 3 segment');
      expect(invalid('', {files: [1, 2, 3]}, true)).toBeNull();
    });

    it('ignores destroyed segments', () => {
      let invalid = VERSION_TEMPLATED(build({}, 3));
      let f1: any = {}, f2: any = {}, f3: any = {};
      expect(invalid('', {files: [f1, f2, f3]}, true)).toBeNull();
      f2.isDestroy = true;
      expect(invalid('', {files: [f1, f2, f3]}, true)).toMatch('upload 3 segment');
    });

    it('strictly waits for processing', () => {
      let invalid = VERSION_TEMPLATED();
      expect(invalid('', {files: [{}, {isProcessing: true}]}, true)).toMatch('wait for uploads');
      expect(invalid('', {files: [{}, {isProcessing: true}]}, false)).toBeNull();
      expect(invalid('', {files: [{}, {isProcessing: false}]}, true)).toBeNull();
    });

    it('strictly checks min duration', () => {
      let invalid = VERSION_TEMPLATED(build({lengthMinimum: 10}));
      expect(invalid('', {files: [{duration: 3}, {duration: 2}]}, false)).toBeNull();
      expect(invalid('', {files: [{duration: 3}, {duration: 2}]}, true)).toMatch('must be greater than 0:00:10');
      expect(invalid('', {files: [{duration: 3}, {duration: 8}]}, true)).toBeNull();
    });

    it('strictly checks max duration', () => {
      let invalid = VERSION_TEMPLATED(build({lengthMaximum: 10}));
      expect(invalid('', {files: [{duration: 3}, {duration: 8}]}, false)).toBeNull();
      expect(invalid('', {files: [{duration: 3}, {duration: 8}]}, true)).toMatch('must be less than 0:00:10');
      expect(invalid('', {files: [{duration: 3}, {duration: 2}]}, true)).toBeNull();
    });

    it('strictly checks matching audio formats', () => {
      let invalid = VERSION_TEMPLATED();
      expect(invalid('', {files: [{bitrate: 123}, {bitrate: 456}]}, false)).toBeNull();
      expect(invalid('', {files: [{bitrate: 123}, {bitrate: 456}]}, true)).toMatch('Non-matching');
      expect(invalid('', {files: [{bitrate: 123}, {bitrate: 123}]}, true)).toBeNull();
    });

  });

  describe('FILE_TEMPLATED', () => {

    it('only accepts mp3 files', () => {
      let invalid = FILE_TEMPLATED();
      expect(invalid('', {format: 'mp2'})).toMatch('not an mp3');
      expect(invalid('', {format: 'm4a'})).toMatch('not an mp3');
      expect(invalid('', {format: 'mp3', duration: 1})).toBeNull();
    });

    it('requires a duration', () => {
      let invalid = FILE_TEMPLATED();
      expect(invalid('', {})).toMatch('not an audio file');
      expect(invalid('', {duration: null})).toMatch('not an audio file');
      expect(invalid('', {duration: 0})).toBeNull();
      expect(invalid('', {duration: 1})).toBeNull();
    });

    it('checks min duration', () => {
      let invalid = FILE_TEMPLATED(<any> {lengthMinimum: 7});
      expect(invalid('', {duration: 2})).toMatch('must be greater than 0:00:07');
      expect(invalid('', {duration: 8})).toBeNull();
    });

    it('checks max duration', () => {
      let invalid = FILE_TEMPLATED(<any> {lengthMaximum: 7});
      expect(invalid('', {duration: 8})).toMatch('must be less than 0:00:07');
      expect(invalid('', {duration: 6})).toBeNull();
    });

  });

});
