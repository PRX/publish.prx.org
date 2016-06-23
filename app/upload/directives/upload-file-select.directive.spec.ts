import {it, describe, expect, beforeEach} from '@angular/core/testing';
import {setupComponent, buildComponent} from '../../../util/test-helper';
import {UploadFileSelect} from './upload-file-select.directive';

import {Component, Output, EventEmitter} from '@angular/core';
@Component({
  directives: [UploadFileSelect],
  selector: 'container',
  template: '<input upload-file (file)="add($event)" />'
})
export class MiniContainer {
  @Output() changes = new EventEmitter();
  add(file: any) {
    this.changes.emit(file);
  }
}

const triggerChange = (el: Element) => {
  let e = document.createEvent('HTMLEvents');
  e.initEvent('change', false, true);
  el.firstChild.dispatchEvent(e);
};

describe('UploadFileSelect', () => {

  setupComponent(MiniContainer);

  // TODO: need this funky before syntax, so we can use a done() function
  // in the tests
  let fix: any, el: any, mini: any;
  beforeEach(buildComponent((theFixture, theEl, theMini) => {
    fix = theFixture;
    el = theEl;
    mini = theMini;
  }));

  it('listens for file changes', () => {
    spyOn(UploadFileSelect.prototype, 'onChange').and.returnValue(null);
    triggerChange(el);
    expect(UploadFileSelect.prototype.onChange).toHaveBeenCalled();
  });

  it('processes files individually', (done: Function) => {
    let values = ['foo', 'bar', 'hello'];
    spyOn(UploadFileSelect.prototype, 'getFiles').and.returnValue(values);

    let index = 0;
    mini.changes.subscribe((data: any) => {
      expect(data).toEqual(values[index++]);
      if (index >= values.length) { done(); }
    });
    triggerChange(el);
  });

});
