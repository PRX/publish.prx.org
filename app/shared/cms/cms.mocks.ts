import {Observable} from 'rxjs';
import {CmsService} from './cms.service';
import {HalDoc, HalObservable} from './haldoc';
import {HalRemote} from './halremote';

// Re-export for convenience
export { CmsService };

export class MockHalDoc extends HalDoc {

  MOCKS = {};
  ERRORS = {};

  constructor(data: any = {}) {
    super(data, new HalRemote(null, 'http://cms.mock/v1', null));
  }

  mock(rel: string, data: {}): MockHalDoc {
    return this.MOCKS[rel] = new MockHalDoc(data);
  }

  mockList(rel: string, datas: {}[]): MockHalDoc[] {
    return this.MOCKS[rel] = datas.map((data) => {
      return new MockHalDoc(data);
    });
  }

  mockItems(rel: string, datas: {}[]): MockHalDoc[] {
    return this.mock(rel, {}).mockList('prx:items', datas);
  }

  mockError(rel: string, msg: string) {
    this.ERRORS[rel] = msg;
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
