import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HalObservable, HalDoc } from '../app/core/cms';
import { MockHalDoc } from './mock.haldoc';

/*
 * Mock implementation of CMS that throws errors for un-mocked requests
 */
@Injectable()
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

  get auth(): HalObservable<MockHalDoc> {
    return this.follow('prx:authorization');
  }

  get defaultAccount(): HalObservable<MockHalDoc> {
    return this.auth.follow('prx:default-account');
  }

  get individualAccount(): HalObservable<MockHalDoc> {
    return <HalObservable<MockHalDoc>> this.auth.followItems('prx:accounts').map(accountDocs => {
      return accountDocs.find(d => d['type'] === 'IndividualAccount');
    });
  }

  get accounts(): HalObservable<MockHalDoc[]> {
    return <HalObservable<MockHalDoc[]>> this.auth.followItems('prx:accounts')
  }

  follow(rel: string, params: {} = null): HalObservable<MockHalDoc> {
    return this.mockRoot.follow(rel, params);
  }

  followList(rel: string, params: {} = null): HalObservable<MockHalDoc[]> {
    return this.mockRoot.followList(rel, params);
  }

  followItems(rel: string, params: {} = null): HalObservable<HalDoc[]> {
    return this.mockRoot.followItems(rel, params);
  }

}
