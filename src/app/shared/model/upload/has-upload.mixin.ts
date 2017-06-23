import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import { HalDoc } from '../../../core';

/**
 * Define an uploadable field on a model
 *
 * (1) add "implements HasUpload" to the model
 * (2) add "hasUploadMap" to SETABLE
 * (3) add these mixin defs near the top of your class def:
 *       // HasUpload (and also in SETABLE)
 *       hasUploadMap: string;
 *       getUploads: (rel: string) => Observable<(HalDoc|string)[]>;
 *       setUploads: (rel: string, uuids?: string[]) => void;
 * (4) apply the mixins after your class:
 *       applyMixins(YourModel, [HasUpload]);
 */
export abstract class HasUpload {

  // re-define BaseModel accessors this class needs
  abstract doc: HalDoc;
  abstract SETABLE: string[];
  abstract hasUploadMap: string;
  abstract set: (field: string, value: any) => void;

  getUploads(rel: string): Observable<(HalDoc|string)[]> {
    if (this.SETABLE.indexOf('hasUploadMap') < 0) {
      this.SETABLE.push('hasUploadMap');
    }

    // parse the current uuids
    let uuidMap = this.hasUploadMap ? JSON.parse(this.hasUploadMap) : {};
    let uuids = <any[]> (uuidMap[rel] || []);

    // concat to stored docs
    if (this.doc && this.doc.has(rel)) {
      if (this.doc.has(rel, true)) {
        return this.doc.followList(rel).map(docs => docs.concat(uuids));
      } else {
        return this.doc.followItems(rel).map(docs => docs.concat(uuids));
      }
    } else {
      return Observable.of(uuids);
    }
  }

  setUploads(rel: string, uuids?: string[]) {
    if (this.SETABLE.indexOf('hasUploadMap') < 0) {
      this.SETABLE.push('hasUploadMap');
    }

    // parse current uuids and sort additions
    let uuidMap = this.hasUploadMap ? JSON.parse(this.hasUploadMap) : {};
    let ordered = (uuids || []).filter(u => u).sort();

    // unset 0-length uuids
    if (ordered && ordered.length) {
      uuidMap[rel] = ordered;
    } else {
      delete uuidMap[rel];
    }

    // unset empty maps
    if (Object.keys(uuidMap).length) {
      this.set('hasUploadMap', JSON.stringify(uuidMap));
    } else {
      this.set('hasUploadMap', undefined);
    }
  }

}

// mixin magic
export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
