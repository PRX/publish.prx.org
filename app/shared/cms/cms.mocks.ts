import {Observable} from 'rxjs';
import {CmsService} from './cms.service';
import {HalDoc, HalObservable} from './haldoc';
import {HalRemote} from './halremote';

// Re-export for convenience
export { CmsService };

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
    return this.mock(rel, {}).mockList('prx:items', datas).map(doc => {
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

  private nonLoggingError(msg: string): any {
    return Observable.throw(new Error(msg));
  }

}

export class MockCmsService {

  private mockRoot: MockHalDoc;

  constructor() {
    this.mockRoot = new MockHalDoc({});
  }

  mock(rel: string, data: {}): MockHalDoc {
    return this.mockRoot.mock(rel, data);
  }

  mockList(rel: string, datas: {}[]): MockHalDoc[] {
    return this.mockRoot.mockList(rel, datas);
  }

  mockItems(rel: string, datas: {}[]): MockHalDoc[] {
    return this.mockRoot.mockItems(rel, datas);
  }

  /*
   * Implement enough of cms.service to make auth'd requests happen
   */

  get root(): HalObservable<MockHalDoc> {
    return <HalObservable<MockHalDoc>> Observable.of(this.mockRoot);
  }

  get account(): HalObservable<HalDoc> {
    return this.follow('prx:authorization').follow('prx:default-account');
  }

  follow(rel: string, params: {} = null): HalObservable<HalDoc> {
    return this.mockRoot.follow(rel, params);
  }

  followList(rel: string, params: {} = null): HalObservable<HalDoc[]> {
    return this.mockRoot.followList(rel, params);
  }

  followItems(rel: string, params: {} = null): HalObservable<HalDoc[]> {
    return this.mockRoot.followItems(rel, params);
  }

}
