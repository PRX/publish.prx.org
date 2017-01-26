import { PadZeroPipe } from './padzero.pipe';

describe('PadZeroPipe', () => {

  let pipe = new PadZeroPipe();

  it('pads a zero to numbers', () => {
    expect(pipe.transform(0)).toMatch('00');
    expect(pipe.transform(9)).toMatch('09');
    expect(pipe.transform(10)).toMatch('10');
    expect(pipe.transform(86739)).toMatch('86739');
  });

  it('stringifies non numbers', () => {
    expect(pipe.transform(<any> 'foobar')).toMatch('NaN');
  });

});
