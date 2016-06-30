import {it, describe, beforeEach, expect} from '@angular/core/testing';
import {Observable} from 'rxjs';
import {BaseModel} from './base.model';

class FakeModel extends BaseModel {
  someattribute = 'somevalue';
  key() { return 'key'; }
  related() { return {}; }
  decode() { for (let k of Object.keys(this.doc)) { this[k] = this.doc[k]; } }
  encode() { return {}; }
  saveNew(data: {}) { return <any> null; }
}

describe('BaseModel', () => {

  let base: FakeModel;
  beforeEach(() => {
    base = new FakeModel();
    if (window && window.localStorage) {
      window.localStorage.clear();
    }
  });

  describe('init', () => {

    it('sets the parent-self relationship', () => {
      spyOn(base, 'decode').and.stub();
      base.init(<any> 'parent', <any> 'self');
      expect(base.isNew).toEqual(false);
      expect(base.parent).toEqual('parent');
      expect(base.doc).toEqual('self');
      expect(base.decode).toHaveBeenCalled();
    });

    it('only decodes existing documents', () => {
      spyOn(base, 'decode').and.stub();
      base.init();
      expect(base.isNew).toEqual(true);
      expect(base.decode).not.toHaveBeenCalled();
    });

    it('records original values', () => {
      base.SETABLE = ['foo', 'bar'];
      base.init(null, <any> {foo: 'fooval', hello: 'world'});
      expect(base.original).toEqual({foo: 'fooval', bar: undefined});
    });

    it('runs validations on default + original + stored values', () => {
      base.SETABLE = ['someattribute'];

      let expected = 'somevalue';
      spyOn(base, 'revalidate').and.callFake(() => {
        expect(base.someattribute).toEqual(expected);
      });
      base.init(null);

      expected = 'originalvalue';
      base.init(null, <any> {someattribute: 'originalvalue'});

      expected = 'override';
      spyOn(base, 'restore').and.callFake(function() { this.someattribute = 'override'; });
      base.init(null, <any> {someattribute: 'originalvalue'});
      expect(base.revalidate).toHaveBeenCalledTimes(3);
    });

    it('subscribes to related models', () => {
      spyOn(base, 'related').and.callFake(() => {
        return {foo: Observable.of('bar')};
      });
      base.init(null, null, false);
      expect(base.related).not.toHaveBeenCalled();

      base.init();
      expect(base.related).toHaveBeenCalled();
      expect(base['foo']).toEqual('bar');
      expect(base.RELATIONS).toEqual(['foo']);
    });

  });

  describe('set', () => {

    it('sets and stores the value', () => {
      spyOn(base, 'store').and.stub();
      spyOn(base, 'invalidate').and.stub();
      spyOn(base, 'checkChanged').and.stub();
      base.set('foo', 'bar');
      expect(base.store).toHaveBeenCalled();
    });

    it('only validates setable fields', () => {
      spyOn(base, 'invalidate').and.returnValue('did-invalidate');
      spyOn(base, 'checkChanged').and.stub();
      base.set('foo', 'bar');
      expect(base.invalidFields['foo']).toBeUndefined();
      base.SETABLE = ['foo'];
      base.set('foo', 'bar');
      expect(base.invalidFields['foo']).toEqual('did-invalidate');
    });

    it('only tracks changes for setable fields', () => {
      spyOn(base, 'checkChanged').and.returnValue('did-checkChanged');
      spyOn(base, 'invalidate').and.stub();
      base.set('foo', 'bar');
      expect(base.changedFields['foo']).toBeUndefined();
      base.SETABLE = ['foo'];
      base.set('foo', 'bar');
      expect(base.changedFields['foo']).toEqual('did-checkChanged');
    });

  });

  describe('save', () => {

    it('ignores the call for new-but-deleted docs', () => {
      let called = false;
      base.isDestroy = true;
      base.save().subscribe((done) => {
        called = true;
        expect(base.isSaving).toBeFalsy();
        expect(done).toEqual(false);
      });
      expect(called).toBeTruthy();
    });

    it('calls to the child class for new docs', () => {
      spyOn(base, 'saveNew').and.returnValue(Observable.empty());
      base.isNew = true;
      base.save();
      expect(base.saveNew).toHaveBeenCalled();
    });

    it('updates existing docs', () => {
      base.doc = <any> {update: null};
      spyOn(base.doc, 'update').and.returnValue(Observable.empty());
      base.save();
      expect(base.doc.update).toHaveBeenCalled();
    });

    it('deletes destroyed docs', () => {
      base.doc = <any> {destroy: null};
      spyOn(base.doc, 'destroy').and.returnValue(Observable.empty());
      base.isDestroy = true;
      base.save();
      expect(base.doc.destroy).toHaveBeenCalled();
    });

    it('re-inits after saving', () => {
      base.doc = <any> {update: null};
      spyOn(base.doc, 'update').and.returnValue(Observable.of({foo: 'bar'}));
      spyOn(base, 'unstore').and.stub();
      spyOn(base, 'init').and.callFake((parent: any, doc: any) => {
        expect(doc.foo).toEqual('bar');
      });
      base.save().subscribe();
      expect(base.doc.update).toHaveBeenCalled();
      expect(base.unstore).toHaveBeenCalled();
      expect(base.init).toHaveBeenCalled();
    });

    it('cascades saving to changed child models', () => {
      base.doc = <any> {update: null};
      spyOn(base.doc, 'update').and.returnValue(Observable.of({foo: 'bar'}));
      spyOn(base, 'init').and.stub();

      let firstSaved = false, secondSaved = false;
      base.RELATIONS = ['foo'];
      base['foo'] = [
        {changed: () => true, save: () => { firstSaved = true; return Observable.of(true); }},
        {changed: () => false, save: () => { secondSaved = true; return Observable.of(true); }}
      ];
      base.save().subscribe();
      expect(firstSaved).toEqual(true);
      expect(secondSaved).toEqual(false);
    });

  });

  describe('changed', () => {

    it('checks specific or all fields', () => {
      base.SETABLE = ['one', 'two', 'four'];
      base.original = {one: '1', three: '3', four: '4'};
      base.set('one', 'new');
      base.set('two', 'new');
      base.set('three', 'new');
      base.set('four', '4');
      expect(base.changed('one')).toBeTruthy();
      expect(base.changed('two')).toBeTruthy();
      expect(base.changed('three')).toBeFalsy();
      expect(base.changed('four')).toBeFalsy();
      expect(base.changed()).toBeTruthy();
    });

    it('cascades to child relations', () => {
      base.RELATIONS = ['foo'];
      expect(base.changed('foo')).toBeFalsy();
      expect(base.changed()).toBeFalsy();
      base['foo'] = [
        {changed: () => true},
        {changed: () => false}
      ];
      expect(base.changed('foo')).toBeTruthy();
      expect(base.changed()).toBeTruthy();
    });

  });

  describe('invalid', () => {

    it('checks specific or all fields', () => {
      base.SETABLE = ['one', 'two', 'four'];
      base.VALIDATORS = {
        one: [() => null, () => 'bad', () => 'worst' ],
        two: [],
        three: [() => 'bad'],
        four: [() => null, () => null]
      };
      base.set('one', 'anything');
      base.set('two', 'anything');
      base.set('three', 'anything');
      base.set('four', 'anything');
      expect(base.invalid('one')).toEqual('bad');
      expect(base.invalid('two')).toBeNull();
      expect(base.invalid('three')).toBeNull();
      expect(base.invalid('four')).toBeNull();
      expect(base.invalid()).toEqual('bad');
    });

    it('cascades to child relations', () => {
      base.RELATIONS = ['foo'];
      expect(base.invalid('foo')).toBeNull();
      expect(base.invalid()).toBeNull();
      base['foo'] = [
        {invalid: () => 'yeah sure'},
        {invalid: () => <any> null}
      ];
      expect(base.invalid('foo')).toEqual('yeah sure');
      expect(base.invalid()).toEqual('yeah sure');
    });

  });

  describe('storage', () => {

    it('round trips changed model data', () => {
      let theKey = 'some-storage-key';
      spyOn(base, 'key').and.callFake(() => theKey);

      // no changes
      base.store();
      base.someattribute = 'new';
      base.unstore();
      expect(base.someattribute).toEqual('new');

      // overwrite when settable
      base.changedFields['someattribute'] = true;
      base.store();
      base.someattribute = 'newer yet';
      base.restore();
      expect(base.someattribute).toEqual('newer yet');
      base.SETABLE = ['someattribute'];
      base.restore();
      expect(base.someattribute).toEqual('new');

      // clear
      base.someattribute = 'newest of all';
      base.unstore();
      base.restore();
      expect(base.someattribute).toEqual('newest of all');
    });

  });

});
