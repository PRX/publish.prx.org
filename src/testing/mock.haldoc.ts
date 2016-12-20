import { Observable } from 'rxjs';
import { HalDoc, HalObservable, HalRemote } from '../app/core/cms';

/*
 * Mock version of a haldoc
 */
export class MockHalDoc extends HalDoc {

  MOCKS = {};
  ERRORS = {};
  profile: string;

  static guessProfile(relString?: string, isCollection = false): string {
    if (relString && relString.match(/prx:/)) {
      if (isCollection) {
        if (relString === 'prx:stories') { relString = 'prx:story'; }
        if (relString === 'prx:images') { relString = 'prx:image'; }
        if (relString === 'prx:accounts') { relString = 'prx:account'; }
        if (relString === 'prx:audio-versions') { relString = 'prx:audio-version'; }
        return 'collection/' + relString.split(':')[1];
      } else {
        return 'model/' + relString.split (':')[1];
      }
    }
    return null;
  }

  constructor(data: any = {}, profile?: string) {
    super(data, new HalRemote(null, 'http://cms.mock/v1', null));
    this.profile = profile;
  }

  mock(rel: string, data: {}): MockHalDoc {
    return this.MOCKS[rel] = new MockHalDoc(data, MockHalDoc.guessProfile(rel));
  }

  mockList(rel: string, datas: {}[]): MockHalDoc[] {
    return this.MOCKS[rel] = datas.map((data) => {
      return new MockHalDoc(data, MockHalDoc.guessProfile(rel, true));
    });
  }

  mockItems(rel: string, datas: {}[]): MockHalDoc[] {
    return this.mock(rel, {total: datas.length}).mockList('prx:items', datas).map(doc => {
      doc.profile = MockHalDoc.guessProfile(rel, true);
      return doc;
    });
  }

  mockError(rel: string, msg: string) {
    this.ERRORS[rel] = msg;
  }

  update(data: any): HalObservable<MockHalDoc> {
    for (let key of Object.keys(data)) {
      this[key] = data[key];
    }
    return <HalObservable<MockHalDoc>> Observable.of(<MockHalDoc> this);
  }

  create(rel: string, params: any = {}, data: any): HalObservable<MockHalDoc> {
    let doc = this.mock(rel, data); // TODO: params?
    return <HalObservable<MockHalDoc>> Observable.of(doc);
  }

  destroy(): HalObservable<HalDoc> {
    this['_destroyed'] = true; // TODO: something better
    return <HalObservable<MockHalDoc>> Observable.of(<MockHalDoc> this);
  }

  count(rel?: string): number {
    if (rel && this.MOCKS[rel] && this.MOCKS[rel] instanceof Array) {
      return this.MOCKS[rel].length;
    } else if (rel && this.MOCKS[rel] && this.MOCKS[rel].has('prx:items')) {
      return this.MOCKS[rel].count('prx:items');
    } else {
      return super.count(rel);
    }
  }

  total(): number {
    if (super.total() > 0) {
      return super.total();
    } else {
      return this.count();
    }
  }

  has(rel: string): boolean {
    return this.MOCKS[rel] ? true : false;
  }

  isa(type: string, includeCollections = true): boolean {
    if (this.profile === `model/${type}`) {
      return true;
    } else if (includeCollections && this.profile === `collection/${type}`) {
      return true;
    } else {
      return false;
    }
  }

  follow(rel: string, params: {} = null): HalObservable<MockHalDoc> {
    if (this.ERRORS[rel]) {
      return <HalObservable<MockHalDoc>> this.nonLoggingError(this.ERRORS[rel]);
    } else if (this.MOCKS[rel]) {
      if (this.MOCKS[rel] instanceof Array) {
        return <HalObservable<MockHalDoc>>
          this.error(`Expected mocked object at ${rel} - got array`);
      } else {
        return <HalObservable<MockHalDoc>> Observable.of(this.MOCKS[rel]);
      }
    } else {
      return <HalObservable<MockHalDoc>> this.error(`Un-mocked request for rel ${rel}`);
    }
  }

  followList(rel: string, params: {} = null): HalObservable<MockHalDoc[]> {
    if (this.ERRORS[rel]) {
      return <HalObservable<MockHalDoc[]>> this.nonLoggingError(this.ERRORS[rel]);
    } else if (this.MOCKS[rel]) {
      if (!(this.MOCKS[rel] instanceof Array)) {
        return <HalObservable<MockHalDoc[]>>
          this.error(`Expected mocked array at ${rel} - got object`);
      } else {
        return <HalObservable<MockHalDoc[]>> Observable.of(this.MOCKS[rel]);
      }
    } else {
      return <HalObservable<MockHalDoc[]>> this.error(`Un-mocked request for rel ${rel}`);
    }
  }

  followLink(linkObj: any, params: any = {}): HalObservable<HalDoc> {
    return this.follow(linkObj.href, params);
  }

  private nonLoggingError(msg: string): any {
    return Observable.throw(new Error(msg));
  }

}
