import {Observable} from 'rxjs';
import {HalDoc} from '../../shared/cms/haldoc';
import {BaseInvalid} from './base.invalid';

interface ValidatorMap {
  [key: string]: BaseInvalid[];
}

interface RelatedMap {
  [key: string]: Observable<any>;
}

interface InvalidMap {
  [key: string]: string;
}

interface ChangedMap {
  [key: string]: boolean;
}

export abstract class BaseModel {

  public isSaving: boolean = false;
  public isNew: boolean = false;
  public isDestroy: boolean = false;

  public doc: HalDoc;
  public original: {};

  public SETABLE: string[] = [];
  public RELATIONS: string[] = [];
  public VALIDATORS: ValidatorMap = {};
  public invalidFields: InvalidMap = {};
  public changedFields: ChangedMap = {};

  abstract key(doc: HalDoc): string;
  abstract related(doc: HalDoc): RelatedMap;
  abstract decode(doc: HalDoc): void;
  abstract encode(): {};
  abstract saveNew(data: {}): Observable<HalDoc>;

  constructor(doc?: HalDoc) {
    this.doc = doc;
    this.isNew = doc ? false : true;
    if (doc) {
      this.decode(doc);
    }

    // wait for child-constructor, so we have any default attribute values
    // assigned by the child class
    setTimeout(() => { this.init(doc); }, 0);
  }

  init(doc?: HalDoc) {
    this.doc = doc;
    if (doc) {
      this.decode(doc);
    }

    // original remote values
    this.original = {};
    for (let f of this.SETABLE) {
      this.original[f] = this[f];
    }
    this.unstore();
    this.revalidate();

    // load related models
    this.RELATIONS = [];
    if (this.doc) {
      let related = this.related(this.doc) || {};
      for (let key of Object.keys(related)) {
        related[key].subscribe((value: any) => { this[key] = value; });
        this.RELATIONS.push(key);
      }
    }
  }

  set(field: string, value: any) {
    this[field] = value;
    this.invalidFields[field] = this.invalidate(field, value);
    this.changedFields[field] = this.changidate(field, value);
    this.store();
  }

  save(): Observable<boolean> {
    this.isSaving = true;
    if (this.isNew) {
      this.saveNew(this.encode()).map((doc) => {
        this.init(doc);
        this.isSaving = false;
        this.isNew = false;
        return true;
      });
    } else if (this.isDestroy) {
      return this.doc.destroy().map(() => {
        this.isSaving = false;
        return true;
      });
    } else {
      return this.doc.update(this.encode()).map((doc) => {
        doc['updatedAt'] = new Date(); // Mock-update the timestamp
        this.init(doc);
        this.isSaving = false;
        return true;
      });
    }
  }

  changed(field?: string | string[]): boolean {
    let fields = (field instanceof Array) ? field : [field];
    if (!field || field.length < 1) {
      fields = this.SETABLE.concat(this.RELATIONS);
    }
    for (let f of fields) {
      if (this.RELATIONS.indexOf(f) > -1) {
        if (this[f] && this[f] instanceof Array) {
          for (let model of this[f]) {
            if (model.changed()) { return true; }
          }
        } else if (this[f] && this[f].changed()) {
          return true;
        }
      } else if (this.changedFields[f]) {
        return true;
      }
    }
    return false;
  }

  invalid(field: string | string[]): string {
    let fields = (field instanceof Array) ? field : [field];
    if (!field || field.length < 1) {
      fields = this.SETABLE.concat(this.RELATIONS);
    }
    let invalids: string[] = [];
    for (let f of fields) {
      if (this.RELATIONS.indexOf(f) > -1) {
        if (this[f] && this[f] instanceof Array) {
          for (let model of this[f]) {
            if (model.invalid()) {
              invalids.push(this[f].invalid());
            }
          }
        } else if (this[f] && this[f].invalid()) {
          invalids.push(this[f].invalid());
        }
      } else if (this.invalidFields[f]) {
        invalids.push(this.invalidFields[f]);
      }
    }
    return invalids ? invalids.join(', ') : null;
  }

  unstore() {
    if (window && window.localStorage && this.key(this.doc)) {
      let json = window.localStorage.getItem(this.key(this.doc));
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

  store() {
    if (window && window.localStorage && this.key(this.doc)) {
      let changed = {};
      for (let f of Object.keys(this.changedFields)) {
        changed[f] = this[f];
      }
      window.localStorage.setItem(this.key(this.doc), JSON.stringify(changed));
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

  revalidate() {
    for (let f of this.SETABLE) {
      this.invalidFields[f] = this.invalidate(f, this[f]);
      this.changedFields[f] = this.changidate(f, this[f]);
    }
  }

}
