import { Observable } from 'rxjs/Observable';
import { Env } from '../..';

/**
 * Generic cache for json
 */
export class HalRemoteCache {

  // in-flight requests
  static OBSERVABLES = {};

  // cached requests
  static VALUES = {};
  static EXPIRES = {};

  static get(key: string): Observable<any> {
    if (this.OBSERVABLES[key]) {
      return this.OBSERVABLES[key]; // in-flight
    }

    let val = this.VALUES[key], expires = this.EXPIRES[key];
    if (Env.CMS_USE_LOCALSTORAGE && window && window.localStorage) {
      let localVal = window.localStorage.getItem(key);
      let localExp = window.localStorage.getItem(`expires.${key}`);
      val = localVal ? JSON.parse(localVal) : null;
      expires = localExp ? JSON.parse(localExp) : null;
    }

    // expired items
    let ttl = Env.CMS_TTL * 1000;
    if (key.indexOf('/api/v1', key.length - '/api/v1'.length) !== -1) {
      ttl = Env.CMS_ROOT_TTL * 1000;
    }
    if (val) {
      if (new Date().getTime() - expires < ttl) {
        return Observable.of(val);
      } else {
        this.del(key);
        return null;
      }
    } else {
      return null;
    }
  }

  static set(key: string, valObservable: Observable<any>): any {
    if (Env.CMS_TTL === 0) {
      return valObservable;
    }
    this.OBSERVABLES[key] = valObservable.share();
    this.OBSERVABLES[key].subscribe(
      (val: any) => {
        if (Env.CMS_USE_LOCALSTORAGE && window && window.localStorage) {
          window.localStorage.setItem(key, JSON.stringify(val));
          window.localStorage.setItem(`expires.${key}`, JSON.stringify(new Date().getTime()));
        } else {
          this.VALUES[key] = val;
          this.EXPIRES[key] = new Date().getTime();
        }
        setTimeout(() => { delete this.OBSERVABLES[key]; }, 0);
      },
      (err: any) => {
        setTimeout(() => { this.del(key); }, 0);
      }
    );
    return this.OBSERVABLES[key];
  }

  static del(key: string): void {
    delete this.OBSERVABLES[key];
    delete this.VALUES[key];
    delete this.EXPIRES[key];
    if (Env.CMS_USE_LOCALSTORAGE && window && window.localStorage) {
      window.localStorage.removeItem(key);
      window.localStorage.removeItem(`expires.${key}`);
    }
  }

  static clear(): void {
    this.OBSERVABLES = {};
    this.VALUES = {};
    this.EXPIRES = {};
    if (Env.CMS_USE_LOCALSTORAGE && window && window.localStorage) {
      window.localStorage.clear();
    }
  }

}
