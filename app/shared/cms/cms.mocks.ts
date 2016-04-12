import {Observable} from 'rxjs';
import {CmsService} from './cms.service';
import {HalDoc, HalObservable} from './haldoc';

// Re-export for convenience
export { CmsService };

export class MockHalDoc extends HalDoc {

  MOCKS = {};

  constructor(data: any = {}) {
    super(data, null);
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

  follow(rel: string, params: {} = null): HalObservable<MockHalDoc> {
    if (this.MOCKS[rel]) {
      if (this.MOCKS[rel] instanceof Array) {
        return this.error(`Expected mocked object at ${rel} - got array`);
      } else {
        return <HalObservable<MockHalDoc>> Observable.of(this.MOCKS[rel]);
      }
    } else {
      return this.error(`Un-mocked request for rel ${rel}`);
    }
  }

  followList(rel: string, params: {} = null): HalObservable<MockHalDoc[]> {
    if (this.MOCKS[rel]) {
      if (!this.MOCKS[rel] instanceof Array) {
        return this.error(`Expected mocked array at ${rel} - got object`);
      } else {
        return <HalObservable<MockHalDoc[]>> Observable.of(this.MOCKS[rel]);
      }
    } else {
      return this.error(`Un-mocked request for rel ${rel}`);
    }
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
    return Observable.of(this.mockRoot);
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
