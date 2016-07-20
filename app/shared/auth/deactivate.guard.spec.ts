import {it, describe, expect} from '@angular/core/testing';
import {Observable} from 'rxjs';
import {DeactivateGuard} from './deactivate.guard';

describe('DeactivateGuard', () => {

  let guard = new DeactivateGuard();

  it('allows deactivation by default', () => {
    let comp: any = {};
    expect(guard.canDeactivate(comp)).toEqual(true);
  });

  it('decides deactivation from a function', () => {
    let allow: any = {canDeactivate: () => true};
    let deny: any = {canDeactivate: () => false};
    expect(guard.canDeactivate(allow)).toEqual(true);
    expect(guard.canDeactivate(deny)).toEqual(false);
  });

  it('decides deactivation from an observable', () => {
    let allow: any = {canDeactivate: () => Observable.of(true)};
    let deny: any = {canDeactivate: () => Observable.of(false)};
    let allowObs = <Observable<boolean>> guard.canDeactivate(allow);
    let denyObs = <Observable<boolean>> guard.canDeactivate(deny);
    expect(allowObs instanceof Observable).toBeTruthy();
    expect(denyObs instanceof Observable).toBeTruthy();

    let allowResult: boolean, denyResult: boolean;
    allowObs.subscribe(can => allowResult = can);
    denyObs.subscribe(can => denyResult = can);
    expect(allowResult).toEqual(true);
    expect(denyResult).toEqual(false);
  });

});
