import {it, describe, beforeEach, expect} from 'angular2/testing';
import {TimeAgoPipe} from './timeago.pipe';

describe('TimeAgoPipe', () => {

  let pipe = new TimeAgoPipe();
  let baseTime = new Date('2000-01-01T12:00:00');

  const transform = (dateStr: string): string => {
    return pipe.transform(new Date(dateStr));
  };

  beforeEach(() => {
    jasmine.clock().mockDate(baseTime);
    spyOn(Date.prototype, 'getDate').and.callFake(Date.prototype.getUTCDate);
    spyOn(Date.prototype, 'getHours').and.callFake(Date.prototype.getUTCHours);
  });

  it('returns seconds for things in the past minute', () => {
    expect(transform('2000-01-01T11:59:59')).toMatch('1 second ago');
    expect(transform('2000-01-01T11:59:31')).toMatch('29 seconds ago');
    expect(transform('2000-01-01T11:59:01')).toMatch('59 seconds ago');
  });

  it('returns minutes for things in the past hour', () => {
    expect(transform('2000-01-01T11:59:00')).toMatch('1 minute ago');
    expect(transform('2000-01-01T11:31:14')).toMatch('28 minutes ago');
    expect(transform('2000-01-01T11:00:01')).toMatch('59 minutes ago');
  });

  it('returns full datetimes for things further back than an hour', () => {
    expect(transform('2000-01-01T11:00:00')).toMatch('1/1/2000, 11:00am');
    expect(transform('1999-12-28T23:59:32')).toMatch('12/28/1999, 11:59pm');
    expect(transform('1989-04-10T00:16:49')).toMatch('4/10/1989, 12:16am');
  });

});
