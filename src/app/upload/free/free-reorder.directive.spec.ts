import { cit, create, direct, provide } from '../../../testing';
import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { FreeReorderDirective } from './free-reorder.directive';
import { DragulaService } from 'ng2-dragula/ng2-dragula';

@Component({
  template: '<div [publishFreeReorder]="version"></div>'
})
class MiniComponent {
  version: any;
}

describe('FreeReorderDirective', () => {

  create(MiniComponent, false);

  direct(FreeReorderDirective);

  let dropped = new Subject<any>();
  provide(DragulaService, {
    find: () => null,
    add: () => null,
    setOptions: () => null,
    dropModel: dropped
  });

  cit('triggers reordering', (fix, el, comp) => {
    let reassigned = false;
    comp.version = {reassign: () => reassigned = true};
    fix.detectChanges();
    dropped.next({});
    expect(reassigned).toEqual(true);
  });

});
