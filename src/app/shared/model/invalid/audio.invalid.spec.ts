import { VERSION_TEMPLATED, FILE_TEMPLATED } from './audio.invalid';

describe('AudioInvalid', () => {

  describe('VERSION_TEMPLATED', () => {

    it('defaults to at least one segment', () => {
      let invalid = VERSION_TEMPLATED();
      expect(invalid('', {files: []})).toMatch('upload at least 1 segment');
      expect(invalid('', {files: [1]})).toBeNull();
    });

    it('checks segment count', () => {
      let invalid = VERSION_TEMPLATED(<any> {segmentCount: 3});
      expect(invalid('', {files: [1, 2]})).toMatch('upload 3 segment');
      expect(invalid('', {files: [1, 2, 3]})).toBeNull();
    });

    it('checks min duration', () => {
      let invalid = VERSION_TEMPLATED(<any> {lengthMinimum: 10});
      expect(invalid('', {files: [{duration: 3}, {duration: 2}]})).toMatch('must be greater than 0:00:10');
      expect(invalid('', {files: [{duration: 3}, {duration: 8}]})).toBeNull();
    });

    it('checks max duration', () => {
      let invalid = VERSION_TEMPLATED(<any> {lengthMaximum: 10});
      expect(invalid('', {files: [{duration: 3}, {duration: 8}]})).toMatch('must be less than 0:00:10');
      expect(invalid('', {files: [{duration: 3}, {duration: 2}]})).toBeNull();
    });

  });

  describe('FILE_TEMPLATED', () => {

    it('requires a duration', () => {
      let invalid = FILE_TEMPLATED();
      expect(invalid('', {})).toMatch('not an audio file');
      expect(invalid('', {duration: null})).toMatch('not an audio file');
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
