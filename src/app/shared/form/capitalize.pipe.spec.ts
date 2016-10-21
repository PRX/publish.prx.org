import { CapitalizePipe } from './capitalize.pipe';

describe('CapitalizePipe', () => {

  let pipe = new CapitalizePipe();

  it('capitalizes strings', () => {
    expect(pipe.transform('hello world')).toMatch('Hello world');
    expect(pipe.transform('.hi')).toMatch('.hi');
    expect(pipe.transform('HEllo World')).toMatch('HEllo World');
  });

  it('ignores falsey values', () => {
    expect(pipe.transform('')).toEqual('');
    expect(pipe.transform(null)).toEqual(null);
    expect(pipe.transform(undefined)).toEqual(undefined);
  });

});
