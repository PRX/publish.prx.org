import {it, describe, expect} from '@angular/core/testing';
import {FileSizePipe} from './filesize.pipe';

describe('FileSizePipe', () => {

  let pipe = new FileSizePipe();

  it('returns regular ol bytes', () => {
    expect(pipe.transform(0)).toMatch('0 B');
    expect(pipe.transform(3)).toMatch('3 B');
    expect(pipe.transform(1023)).toMatch('1023 B');
    expect(pipe.transform(null)).toMatch('0 B');
    expect(pipe.transform(-10)).toMatch('0 B');
  });

  it('returns kilobytes', () => {
    expect(pipe.transform(1024)).toMatch('1.00 KB');
    expect(pipe.transform(6000)).toMatch('5.86 KB');
  });

  it('returns megabytes', () => {
    expect(pipe.transform(1048576)).toMatch('1.00 MB');
    expect(pipe.transform(105214116)).toMatch('100.34 MB');
    expect(pipe.transform(1073730800)).toMatch('1023.99 MB');
  });

  it('returns gigabytes', () => {
    expect(pipe.transform(1384850420)).toMatch('1.29 GB');
  });

});
