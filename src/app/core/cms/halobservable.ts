import { Observable } from 'rxjs/Observable';
import { HalDoc } from './haldoc';

// Bring observables up to snuff
export interface HalObservable<T> extends Observable<T> {
  follow(rel: string, params?: {}): HalObservable<T>;
  followList(rel: string, params?: {}): HalObservable<T[]>;
  followItems(rel: string, params?: {}): HalObservable<T[]>;
}
Observable.prototype['follow'] = function(rel: string, params: {} = null) {
  return this.flatMap((doc: HalDoc) => {
    return doc.follow(rel, params);
  });
};
Observable.prototype['followList'] = function(rel: string, params: {} = null) {
  return this.flatMap((doc: HalDoc) => {
    return doc.followList(rel, params);
  });
};
Observable.prototype['followItems'] = function(rel: string, params: {} = null) {
  return this.flatMap((doc: HalDoc) => {
    return doc.followItems(rel, params);
  });
};
