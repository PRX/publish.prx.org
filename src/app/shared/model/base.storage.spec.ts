import { BaseStorage } from './base.storage';

describe('BaseStorage', () => {

  beforeEach(() => BaseStorage.clear());

  it('uses localstorage by default', () => {
    expect(localStorage.length).toEqual(0);
    expect(BaseStorage.getItem('foo')).toBeNull();

    BaseStorage.setItem('foo', {id: 'foo'});
    expect(localStorage.length).toEqual(1);
    expect(BaseStorage.getItem('foo')).toEqual({id: 'foo'});

    BaseStorage.removeItem('foo');
    expect(localStorage.length).toEqual(0);
    expect(BaseStorage.getItem('foo')).toBeNull();
  });

  it('falls back to in-memory storage', () => {
    spyOn(localStorage, 'setItem').and.throwError('no localstorage');
    BaseStorage.setItem('foo', {id: 'foo'});
    expect(localStorage.length).toEqual(0);
    expect(BaseStorage.getItem('foo')).toEqual({id: 'foo'});

    BaseStorage.removeItem('foo');
    expect(localStorage.length).toEqual(0);
    expect(BaseStorage.getItem('foo')).toBeNull();
  });

  it('falls back at any time', () => {
    let originalSetItem = localStorage.setItem.bind(localStorage);
    spyOn(localStorage, 'setItem').and.callFake((key, val) => {
      if (key === 'foo') {
        originalSetItem('foo', val);
      } else {
        throw new Error('bad stuff happens');
      }
    });

    BaseStorage.setItem('foo', {id: 'foo'});
    BaseStorage.setItem('bar', {id: 'bar'});
    expect(localStorage.length).toEqual(1);
    expect(BaseStorage.getItem('foo')).toEqual({id: 'foo'});
    expect(BaseStorage.getItem('bar')).toEqual({id: 'bar'});

    BaseStorage.removeItem('bar');
    expect(localStorage.length).toEqual(1);
    BaseStorage.removeItem('foo');
    expect(localStorage.length).toEqual(0);
    expect(BaseStorage.getItem('foo')).toBeNull();
    expect(BaseStorage.getItem('bar')).toBeNull();
  });

});
