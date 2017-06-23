import { Observable } from 'rxjs/Observable';
import { cms } from '../../../../testing';
import { HasUpload, applyMixins } from './has-upload.mixin';

describe('HasUpload', () => {

  class ItHasAnUpload implements HasUpload {
    hasUploadMap: string;
    getUploads: (rel: string) => Observable<any[]>;
    setUploads: (rel: string, uuids?: string[]) => void;
    constructor(public doc, public SETABLE = []) {}
    set(fld, val) { this[fld] = val; }
  }
  applyMixins(ItHasAnUpload, [HasUpload]);

  let doc, has;
  beforeEach(() => {
    doc = cms.mock('prx:doc', {});
    doc.mockList('foo:bar', [{id: 888}]);
    doc.mockItems('foo:blah', [{id: 999}]);
    has = new ItHasAnUpload(doc);
  });

  it('sets upload uuids', () => {
    expect(has.hasUploadMap).toBeUndefined();
    has.setUploads('foo:bar', ['some-uuid']);
    has.setUploads('foo:blah', ['another-uuid']);
    expect(has.hasUploadMap).not.toBeUndefined();
    expect(has.hasUploadMap).toMatch('foo:bar');
    expect(has.hasUploadMap).toMatch('foo:blah');
    has.setUploads('foo:blah');
    expect(has.hasUploadMap).toMatch('foo:bar');
    expect(has.hasUploadMap).not.toMatch('foo:blah');
    has.setUploads('foo:bar');
    expect(has.hasUploadMap).toBeUndefined();
  });

  it('gets upload uuids', () => {
    let uuids = [];
    has.setUploads('whatevs', ['one', 'two', 'three']);
    has.getUploads('whatevs').subscribe(data => uuids = data);
    expect(uuids).toEqual(['one', 'three', 'two']);
  });

  it('concatenates followed lists', () => {
    let stuff = [];
    has.setUploads('foo:bar', ['one', 'two', 'three']);
    has.getUploads('foo:bar').subscribe(data => stuff = data);
    expect(stuff.length).toEqual(4);
    expect(stuff[0].id).toEqual(888);
    expect(stuff[1]).toEqual('one');
    expect(stuff[2]).toEqual('three');
    expect(stuff[3]).toEqual('two');
  });

  it('concatenates followed items', () => {
    let stuff = [];
    has.setUploads('foo:blah', ['something']);
    has.getUploads('foo:blah').subscribe(data => stuff = data);
    expect(stuff.length).toEqual(2);
    expect(stuff[0].id).toEqual(999);
    expect(stuff[1]).toEqual('something');
  });

  it('concatenates to unset uploads', () => {
    let stuff = [];
    has.getUploads('foo:bar').subscribe(data => stuff = data);
    expect(stuff.length).toEqual(1);
    expect(stuff[0].id).toEqual(888);
  });

});
