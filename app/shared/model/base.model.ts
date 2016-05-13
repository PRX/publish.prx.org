import {Observable} from 'rxjs';
import {HalDoc} from '../../shared/cms/haldoc';
import {BaseInvalid} from './base.invalid';

interface ValidatorMap { [key: string]: BaseInvalid[]; }
interface RelatedMap   { [key: string]: Observable<any>; }
interface InvalidMap   { [key: string]: string; }
interface ChangedMap   { [key: string]: boolean; }

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

  public SETABLE: string[] = [];
  public RELATIONS: string[] = [];
  public VALIDATORS: ValidatorMap = {};
  public invalidFields: InvalidMap = {};
  public changedFields: ChangedMap = {};

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
    this.revalidate();

    // optionally load related models
    if (loadRelated) {
      this.RELATIONS = [];
      let related = this.related() || {};
      for (let key of Object.keys(related)) {
        related[key].subscribe((value: any) => { this[key] = value; });
        this.RELATIONS.push(key);
      }
    }
  }

  set(field: string, value: any) {
    this[field] = value;
    if (this.SETABLE.indexOf(field) > -1) {
      this.invalidFields[field] = this.invalidate(field, value);
      this.changedFields[field] = this.changidate(field, value);
    }
    this.store();
  }

  save(): Observable<boolean> {
    if (!this.doc && this.isDestroy) { return Observable.of(false); }
    this.isSaving = true;

    let saveMe: Observable<HalDoc>;
    if (this.isNew) {
      saveMe = this.saveNew(this.encode());
    } else if (this.isDestroy) {
      saveMe = this.doc.destroy();
    } else {
      saveMe = this.doc.update(this.encode());
    }

    return saveMe.flatMap((doc?) => {
      this.unstore();

      // update haldoc reference (and mock the timestamp)
      if (doc) {
        if (doc['updatedAt']) { doc['updatedAt'] = new Date(); }
        this.init(this.parent, doc, false);
      }

      // save related docs in parallel
      let relatedSavers: Observable<boolean>[] = this.getRelated().filter((model) => {
        return model.changed();
      }).map((model) => {
        model.parent = this.doc; // update reference to haldoc
        return model.save();
      });
      return Observable.fromArray(relatedSavers).concatAll().toArray().map(() => {
        this.isNew = false;
        this.isSaving = false;
        return true;
      });
    });
  }

  changed(field?: string | string[]): boolean {
    let fields = (field instanceof Array) ? field : [field];
    if (!field || field.length < 1) {
      fields = this.SETABLE.concat(this.RELATIONS);
    }
    for (let f of fields) {
      if (this.RELATIONS.indexOf(f) > -1) {
        for (let model of this.getRelated(f)) {
          if (model.changed()) { return true; }
        }
      } else if (this.changedFields[f]) {
        return true;
      }
    }
    return false;
  }

  invalid(field?: string | string[]): string {
    let fields = (field instanceof Array) ? field : [field];
    if (!field || field.length < 1) {
      fields = this.SETABLE.concat(this.RELATIONS);
    }
    let invalids: string[] = [];
    for (let f of fields) {
      if (this.RELATIONS.indexOf(f) > -1) {
        for (let model of this.getRelated(f)) {
          if (model.invalid()) { invalids.push(model.invalid()); }
        }
      } else if (this.invalidFields[f]) {
        invalids.push(this.invalidFields[f]);
      }
    }
    return invalids.length ? invalids.join(', ') : null;
  }

  store() {
    if (window && window.localStorage && this.key()) {
      let changed = {};
      for (let f of Object.keys(this.changedFields)) {
        changed[f] = this[f];
      }
      window.localStorage.setItem(this.key(), JSON.stringify(changed));
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
        }
      }
    }
  }

  unstore() {
    if (window && window.localStorage && this.key()) {
      window.localStorage.removeItem(this.key());
    }
  }

  revalidate() {
    for (let f of this.SETABLE) {
      this.invalidFields[f] = this.invalidate(f, this[f]);
      this.changedFields[f] = this.changidate(f, this[f]);
    }
  }

  invalidate(field: string, value: any): string {
    let validators = this.VALIDATORS[field] || [];
    for (let validator of validators) {
      let invalidMsg = validator(field, value);
      if (invalidMsg) {
        return invalidMsg;
      }
    }
    return null;
  }

  changidate(field: string, value: any): boolean {
    return this.original[field] !== value;
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
