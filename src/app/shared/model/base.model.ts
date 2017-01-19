import { Observable, ReplaySubject } from 'rxjs';
import { HalDoc } from '../../core';
import { BaseInvalid } from './invalid';

interface ValidatorMap  { [key: string]: BaseInvalid[]; }
interface RelatedMap    { [key: string]: Observable<any>; }
interface RelatedLoader { [key: string]: Observable<BaseModel | BaseModel[]>; }

/**
 * Base class for modeling/validating haldocs
 */
export abstract class BaseModel {

  public isSaving: boolean = false;
  public isNew: boolean = false;
  public isDestroy: boolean = false;

  public doc: HalDoc;
  public parent: HalDoc;
  public original: {} = {};
  public lastStored: Date;

  public SETABLE: string[] = [];
  public VALIDATORS: ValidatorMap = {};

  public RELATIONS: string[] = [];
  private relatedReplays: RelatedLoader = {};
  private relatedLoaders: RelatedLoader = {};

  abstract key(): string;
  abstract related(): RelatedMap;
  abstract decode(): void;
  abstract encode(): {};
  abstract saveNew(data: {}): Observable<HalDoc>;

  init(parent?: HalDoc, self?: HalDoc, loadRelated = true) {
    this.parent = parent;
    this.doc = self;
    this.isNew = self ? false : true;
    if (self) {
      this.decode();
    }

    // get remote values, before overlaying localstorage
    this.original = {};
    for (let f of this.SETABLE) {
      this.original[f] = this[f];
    }
    this.restore();

    // setup cold observables for related models, and optionally preload them
    this.relatedLoaders = this.related();
    this.RELATIONS = Object.keys(this.relatedLoaders);
    if (loadRelated) {
      this.loadRelated();
    }
  }

  set(field: string, value: any, forceOriginal = false) {
    this[field] = value;
    if (this.SETABLE.indexOf(field) > -1) {
      if (forceOriginal) { this.original[field] = value; }
      this.store();
    }
  }

  save(): Observable<boolean> {
    if (!this.doc && this.isDestroy) {
      this.unstore();
      this.lastStored = null;
      return Observable.of(false);
    }
    this.isSaving = true;

    let saveMe: Observable<HalDoc>;
    if (this.isNew) {
      saveMe = this.saveNew(this.encode());
    } else if (this.isDestroy) {
      saveMe = this.doc.destroy();
    } else if (this.changed(null, false)) {
      saveMe = this.doc.update(this.encode());
    } else {
      saveMe = Observable.of(this.doc);
    }

    return saveMe.flatMap((doc?) => {
      this.unstore();
      this.lastStored = null;
      if (doc) {
        this.init(this.parent, doc, false);
      }

      // save related docs in parallel
      return this.swapRelated().flatMap(() => {
        return this.saveRelated().map(() => {
          this.isNew = false;
          this.isSaving = false;
          this.resetRelated();
          return true;
        });
      });
    });
  }

  loadRelated(relName?: string, force = false): Observable<BaseModel | BaseModel[]> {
    if (relName && !this.relatedLoaders[relName]) {
      return Observable.throw(new Error(`Unknown model related: ${relName}`));
    } else if (relName) {
      if (force || !this.relatedReplays[relName]) {
        let relValue = new ReplaySubject<any>(1);
        this.relatedLoaders[relName].subscribe(v => {
          this[relName] = v;
          relValue.next(v);
        });
        this.relatedReplays[relName] = relValue;
      }
      return this.relatedReplays[relName].first();
    } else {
      let allRelated = this.RELATIONS.map(r => this.loadRelated(r, force));
      return Observable.forkJoin(allRelated).map(relateds => null);
    }
  }

  swapRelated(): Observable<boolean[]> {
    let relatedSwappers = this.RELATIONS.map(rel => {
      let models = this.getRelated(rel);
      if (models.some(m => (m.isNew && m['swapNew']))) {
        return this.loadRelated(rel, true).map(() => {
          let newModels = this.getRelated(rel);
          models.forEach((model, idx) => {
            if (model.isNew && model['swapNew'] && newModels[idx]) {
              model['swapNew'](newModels[idx]);
            }
            model.unstore();
          });
          return true;
        });
      } else {
        return Observable.of(false);
      }
    });
    return Observable.from(relatedSwappers).concatAll().toArray();
  }

  saveRelated(): Observable<boolean[]> {
    let relatedSavers: Observable<boolean>[] = this.getRelated().filter(model => {
      return model.changed();
    }).map(model => {
      if (model.isNew) {
        model.unstore(); // delete old storage key
        model.parent = this.doc;
        model.store(); // save key w/new parent
      } else {
        model.parent = this.doc;
      }
      let wasDestroy = model.isDestroy;
      return model.save().map(saved => {
        if (saved && wasDestroy) {
          this.removeRelated(model);
        }
        return saved;
      });
    });
    return Observable.from(relatedSavers).concatAll().toArray();
  }

  removeRelated(model: BaseModel) {
    this.RELATIONS.forEach(rel => {
      if (this[rel] === model) {
        this[rel] = null;
      } else if (this[rel] instanceof Array) {
        this[rel] = this[rel].filter(m => m !== model);
      }
    });
  }

  resetRelated() {
    this.RELATIONS.forEach(rel => {
      if (this[rel] instanceof Array) {
        this[rel] = [...this[rel]];
      }
    });
  }

  discard(): any {
    this.unstore();
    this.lastStored = null;
    this.isDestroy = false;
    if (!this.doc && this.original) {
      for (let key of Object.keys(this.original)) {
        this[key] = this.original[key];
      }
    }
    this.init(this.parent, this.doc, false);
    this.getRelated().forEach(model => {
      if (model.discard() !== false && model.isNew) {
        this.removeRelated(model);
      }
    });
    this.resetRelated();
  }

  changed(field?: string | string[], includeRelations = true): boolean {
    if (this.isDestroy) {
      return this.isNew ? false : true;
    }
    return this.setableFields(field, includeRelations).some(f => {
      if (this.RELATIONS.indexOf(f) > -1) {
        return this.getRelated(f).some(m => m.changed());
      } else {
        return this.original[f] !== this[f];
      }
    });
  }

  invalid(field?: string | string[], strict = false): string {
    if (this.isDestroy) {
      return null; // don't care if it's invalid
    }
    let fields = this.setableFields(field);
    let invalids: string[] = [];
    for (let f of fields) {
      if (f === 'self') {
        invalids.push(this.invalidate('self', this, strict));
      } else if (this.RELATIONS.indexOf(f) > -1) {
        invalids.push(this.invalidate(f, this.getRelated(f), strict));
      } else {
        invalids.push(this.invalidate(f, this[f], strict));
      }
    }
    return invalids.filter(i => i).join(', ') || null;
  }

  invalidate(field: string, value: any, strict: boolean): string {
    let validators = this.VALIDATORS[field] || [];
    for (let validator of validators) {
      let invalidMsg = validator(field, value, strict, this);
      if (invalidMsg) {
        return invalidMsg;
      }
    }
    if (this.RELATIONS.indexOf(field) > -1) {
      let models = <BaseModel[]> value;
      return models.map(m => m.invalid(null, strict)).filter(i => i).join(', ') || null;
    }
    return null;
  }

  setableFields(only?: string | string[], includeRelations = true): string[] {
    let allFields = this.SETABLE.concat('self');
    if (includeRelations) { allFields = allFields.concat(this.RELATIONS); }
    if (only && typeof only === 'string') {
      return allFields.indexOf(only) > -1 ? [only] : [];
    } else if (only && only instanceof Array) {
      return only.filter(f => allFields.indexOf(f) > -1);
    } else {
      return allFields;
    }
  }

  store() {
    this.lastStored = new Date();
    if (window && window.localStorage && this.key()) {
      let changed = {};
      this.SETABLE.filter(f => this.changed(f)).forEach(f => changed[f] = this[f]);
      if (Object.keys(changed).length > 0) {
        changed['lastStored'] = this.lastStored;
        window.localStorage.setItem(this.key(), JSON.stringify(changed));
      } else {
        window.localStorage.removeItem(this.key());
      }
    }
  }

  restore() {
    if (window && window.localStorage && this.key()) {
      let json = window.localStorage.getItem(this.key());
      if (json) {
        let data = JSON.parse(json);
        for (let key of Object.keys(data)) {
          if (this.SETABLE.indexOf(key) > -1) {
            this[key] = data[key];
          }
          if (key === 'lastStored') {
            this.lastStored = new Date(data[key]);
          }
        }
      }
    }
  }

  unstore() {
    if (window && window.localStorage && this.key()) {
      window.localStorage.removeItem(this.key());
    }
  }

  isStored(): boolean {
    if (window && window.localStorage && this.key()) {
      return window.localStorage.getItem(this.key()) ? true : false;
    } else {
      return false;
    }
  }

  getRelated(rel?: string): BaseModel[] {
    let checkRels = rel ? [rel] : this.RELATIONS;
    let models: BaseModel[] = [];
    for (let checkRel of checkRels) {
      if (this[checkRel] instanceof Array) {
        for (let model of this[checkRel]) {
          models.push(model);
        }
      } else if (this[checkRel] instanceof BaseModel) {
        models.push(this[checkRel]);
      }
    }
    return models;
  }

}
