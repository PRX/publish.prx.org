import { Observable } from 'rxjs';
import { HalRemoteCache } from './halremote.cache';

describe('HalRemoteCache', () => {

  beforeEach(() => {
    HalRemoteCache.clear();
  });

  it('returns null for misses', () => {
    expect(HalRemoteCache.get('foo')).toBeNull();
  });

  it('caches observables by key', () => {
    HalRemoteCache.set('foo', Observable.of('bar'));
    expect(HalRemoteCache.get('foo') instanceof Observable).toBeTruthy();
    HalRemoteCache.get('foo').subscribe((val) => {
      expect(val).toEqual('bar');
    });
  });

  it('expires caches', (done: Function) => {
    HalRemoteCache.set('foo', Observable.of('bar')).subscribe((val: any) => {
      expect(val).toEqual('bar');
    });
    setTimeout(
      () => {
        let theFuture = new Date('2099-01-01');
        spyOn(window, 'Date').and.returnValue(theFuture);
        expect(HalRemoteCache.get('foo')).toBeNull();
        done();
      },
      1
    );
  });

  it('deletes cached values', () => {
    HalRemoteCache.set('foo', Observable.of('bar'));
    HalRemoteCache.del('foo');
    expect(HalRemoteCache.get('foo')).toBeNull();
  });

  it('clears cached values', () => {
    HalRemoteCache.set('foo', Observable.of('bar'));
    HalRemoteCache.clear();
    expect(HalRemoteCache.get('foo')).toBeNull();
  });

});
