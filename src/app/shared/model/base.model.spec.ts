import { Observable } from 'rxjs';
import { BaseModel } from './base.model';

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
      expect(base.RELATIONS).toEqual(['foo']);
      expect(base['foo']).toBeUndefined();

      base.init();
      expect(base.RELATIONS).toEqual(['foo']);
      expect(base['foo']).toEqual('bar');
    });

  });

  describe('set', () => {

    it('sets and stores the value', () => {
      base.SETABLE = ['foo'];
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

    it('force updates the original value', () => {
      base.SETABLE = ['someattribute'];
      expect(base.changed('someattribute')).toEqual(false);

      base.set('someattribute', 'foo');
      expect(base.someattribute).toEqual('foo');
      expect(base.changed('someattribute')).toEqual(true);

      base.set('someattribute', 'bar', true);
      expect(base.someattribute).toEqual('bar');
      expect(base.changed('someattribute')).toEqual(false);
    });

  });

  describe('loadRelated', () => {

    beforeEach(() => {
      let fooCount = 1, barCount = 1;
      let foo = Observable.create(sub => sub.next(fooCount++));
      let bar = Observable.create(sub => sub.next(barCount++));
      spyOn(base, 'related').and.callFake(() => { return {foo: foo, bar: bar}; });
      base.init(null, null, false);
    });

    it('loads all relations', () => {
      let done = false;
      base.loadRelated().subscribe(() => done = true);
      expect(done).toEqual(true);
      expect(base['foo']).toEqual(1);
      expect(base['bar']).toEqual(1);
    });

    it('loads a single relation', () => {
      let val = null;
      base.loadRelated('foo').subscribe(v => val = v);
      expect(val).toEqual(1);
      expect(base['foo']).toEqual(1);
      expect(base['bar']).toBeUndefined();
    });

    it('replays relations', () => {
      base.loadRelated('foo').subscribe(() => null);
      base.loadRelated('foo').subscribe(() => null);
      base.loadRelated('foo').subscribe(() => null);
      expect(base['foo']).toEqual(1);
    });

    it('forces reloading a relation', () => {
      base.loadRelated('foo').subscribe(() => null);
      base.loadRelated('foo', true).subscribe(() => null);
      expect(base['foo']).toEqual(2);
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
      base.changed = () => false;
      spyOn(base.doc, 'update').and.returnValue(Observable.empty());
      base.save();
      expect(base.doc.update).not.toHaveBeenCalled();
      base.changed = () => true;
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
      base.changed = () => true;
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

    it('removeds destroyed child models', () => {
      base.doc = <any> {update: null};
      spyOn(base.doc, 'update').and.returnValue(Observable.of({foo: 'bar'}));
      spyOn(base, 'init').and.stub();
      base.RELATIONS = ['foo'];
      base['foo'] = [{changed: () => true, save: () => Observable.of(true), isDestroy: true}];
      base.save().subscribe();
      expect(base['foo'].length).toEqual(0);
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

    it('optionally ignores relations', () => {
      base.RELATIONS = ['foo'];
      base['foo'] = [{changed: () => true}];
      expect(base.changed()).toBeTruthy();
      expect(base.changed(null, false)).toBeFalsy();
    });

    it('counts existing destroys as changed', () => {
      expect(base.changed()).toBeFalsy();
      base.isDestroy = true;
      expect(base.changed()).toBeTruthy();
      expect(base.changed('foo')).toBeTruthy();
    });

    it('counts new destroys as unchanged', () => {
      expect(base.changed()).toBeFalsy();
      base.isDestroy = true;
      base.isNew = true;
      expect(base.changed()).toBeFalsy();
      expect(base.changed('foo')).toBeFalsy();
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

    it('doesnt care about invalid for destroyed models', () => {
      base.SETABLE = ['one'];
      base.VALIDATORS = {one: [() => 'bad']};
      base.set('one', 'anything');
      expect(base.invalid('one')).toEqual('bad');
      expect(base.invalid()).toBeTruthy();
      base.isDestroy = true;
      expect(base.invalid('one')).toBeNull();
      expect(base.invalid()).toBeNull();
    });

  });

  describe('storage', () => {

    it('round trips changed model data', () => {
      let theKey = 'some-storage-key';
      spyOn(base, 'key').and.callFake(() => theKey);

      // not persisted
      base.SETABLE = ['someattribute'];
      base.someattribute = 'new';
      base.store();
      expect(Object.keys(localStorage).length).toEqual(0);

      // changed fields persisted
      base.changedFields['someattribute'] = true;
      base.store();
      expect(Object.keys(localStorage).length).toEqual(1);

      // overwrites
      base.someattribute = 'newer yet';
      base.restore();
      expect(base.someattribute).toEqual('new');

      // clears when not changed
      base.changedFields['someattribute'] = false;
      base.store();
      expect(Object.keys(localStorage).length).toEqual(0);
    });

  });

  describe('discard', () => {

    it('discards changes and re-inits', () => {
      base.SETABLE = ['someattribute'];
      base.init();
      base.isDestroy = true;
      base.lastStored = new Date();
      base.someattribute = 'different value';
      base.discard();
      expect(base.isDestroy).toEqual(false);
      expect(base.lastStored).toBeNull();
      expect(base.someattribute).toEqual('somevalue');
    });

    it('discards child models and removes new records', () => {
      spyOn(base, 'related').and.callFake(() => {
        return {foo: Observable.of('bar')};
      });
      base['foo'] = [
        {id: 1, isNew: true, discard: () => true},
        {id: 2, isNew: true, discard: () => false},
        {id: 3, isNew: false, discard: () => true}
      ];
      base.discard();
      expect(base['foo'].length).toEqual(2);
      expect(base['foo'][0].id).toEqual(2);
      expect(base['foo'][1].id).toEqual(3);
    });

  });

});
