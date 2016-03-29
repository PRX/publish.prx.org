import {Observable} from 'rxjs';
import {CmsService} from './cms.service';
import {HalDoc} from './haldoc';

// Re-export for convenience
export { HalDoc };
export { CmsService };

export class MockHalDoc extends HalDoc {

  private cmsService: MockCmsService;
  private rels: string[];

  constructor(data: any = {}, cmsService: MockCmsService, rels: string[]) {
    super(data, null, 'http://mockhal.doc', 'faketoken');
    this.cmsService = cmsService;
    this.rels = rels;
  }

  follow(rel: string, params: Object = {}): Observable<HalDoc> {
    return this.cmsService.follow(this.rels.concat(rel).join('|'), params);
  }

  follows(...rels: string[]): Observable<HalDoc> {
    return this.cmsService.follow.apply(this.cmsService, this.rels.concat(rels));
  }

}

export class MockCmsService {

  private relMocks = {};

  mock(rels: string | string[], data: {}) {
    let relsArray = [].concat(rels);
    let key = relsArray.join('|');
    let doc = new MockHalDoc(data, this, relsArray);
    if (this.relMocks[key]) {
      this.relMocks[key].push(doc);
    } else {
      this.relMocks[key] = [doc];
    }
  }

  get root(): Observable<HalDoc> {
    return Observable.of(new MockHalDoc({}, this, []));
  }

  get authToken(): Observable<string> {
    return Observable.of('faketoken');
  }

  follow(rel: string, params: Object = {}): Observable<HalDoc> {
    if (this.relMocks[rel]) {
      return Observable.fromArray(this.relMocks[rel]);
    } else {
      let err = new Error(`Got request for unmocked rel: ${rel}`);
      console.error(err.message);
      return Observable.throw(err);
    }

  }

  follows(...rels: string[]): Observable<HalDoc> {
    if (this.relMocks[rels.join('|')]) {
      return Observable.fromArray(this.relMocks[rels.join('|')]);
    } else {
      let err = new Error(`Got request for unmocked rels: ${rels.join('|')}`);
      console.error(err.message);
      return Observable.throw(err);
    }
  }

}
