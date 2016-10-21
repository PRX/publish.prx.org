import { REQUIRED, LENGTH, IN, FALSEY } from './base.invalid';

describe('BaseInvalid', () => {

  describe('REQUIRED', () => {

    it('checks for existence', () => {
      expect(REQUIRED()('fldname', null)).toMatch('is required');
      expect(REQUIRED()('fldname', false)).toMatch('is required');
      expect(REQUIRED()('fldname', true)).toBeNull();
    });

    it('checks for length', () => {
      expect(REQUIRED()('fldname', [])).toMatch('is required');
      expect(REQUIRED()('fldname', '')).toMatch('is required');
      expect(REQUIRED()('fldname', [true])).toBeNull();
    });

  });

  describe('LENGTH', () => {

    it('checks the lowerbound', () => {
      expect(LENGTH(3)('fldname', '')).toBeNull();
      expect(LENGTH(3)('fldname', '12')).toMatch('is too short');
      expect(LENGTH(3)('fldname', '123')).toBeNull();
    });

    it('optionally checks the upperbound', () => {
      expect(LENGTH(2, 4)('fldname', '1')).toMatch('is too short');
      expect(LENGTH(2, 4)('fldname', '12345')).toMatch('is too long');
      expect(LENGTH(2, 4)('fldname', '1234')).toBeNull();
    });

  });

  describe('IN', () => {

    it('makes sure the value is in an array', () => {
      expect(IN([3, 6])('fldname', 2)).toMatch('is not a valid value');
      expect(IN([3, 6])('fldname', 5)).toMatch('is not a valid value');
      expect(IN([3, 6])('fldname', 6)).toBeNull();
    });

  });

  describe('FALSEY', () => {

    it('just checks for falsey-ness', () => {
      expect(FALSEY('hello there')('fldname', true)).toMatch('hello there');
      expect(FALSEY('hello there')('fldname', 'h')).toMatch('hello there');
      expect(FALSEY('hello there')('fldname', '')).toBeNull();
      expect(FALSEY('hello there')('fldname', null)).toBeNull();
    });

  });

});
