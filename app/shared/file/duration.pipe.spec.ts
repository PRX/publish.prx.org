import {it, describe, expect} from '@angular/core/testing';
import {DurationPipe} from './duration.pipe';

describe('DurationPipe', () => {

  let pipe = new DurationPipe();

  it('returns seconds', () => {
    expect(pipe.transform(0)).toMatch('0:00:00');
    expect(pipe.transform(30)).toMatch('0:00:30');
    expect(pipe.transform(59)).toMatch('0:00:59');
  });

  it('returns minutes', () => {
    expect(pipe.transform(60)).toMatch('0:01:00');
    expect(pipe.transform(204)).toMatch('0:03:24');
    expect(pipe.transform(3599)).toMatch('0:59:59');
  });

  it('returns hours', () => {
    expect(pipe.transform(3600)).toMatch('1:00:00');
    expect(pipe.transform(7587)).toMatch('2:06:27');
    expect(pipe.transform(995783)).toMatch('276:36:23');
  });

});
