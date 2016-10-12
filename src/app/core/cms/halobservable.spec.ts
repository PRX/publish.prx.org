import { Observable } from 'rxjs';
import { HalObservable } from './halobservable';

describe('HalObservable', () => {

  let doc, observable;
  beforeEach(() => {
    doc = {
      follow: (rel, params) => ['followed'],
      followList: (rel, params) => ['followedlist'],
      followItems: (rel, params) => ['followeditems']
    };
    observable = <HalObservable<any>> Observable.of(doc);
  });

  it('follows doc links', () => {
    let out: any;
    observable.follow('foo').subscribe(d => out = d);
    expect(out).toEqual('followed');
  });

  it('follows doc lists', () => {
    let out: any;
    observable.followList('foo').subscribe(d => out = d);
    expect(out).toEqual('followedlist');
  });

  it('follows doc items', () => {
    let out: any;
    observable.followItems('foo').subscribe(d => out = d);
    expect(out).toEqual('followeditems');
  });

});
