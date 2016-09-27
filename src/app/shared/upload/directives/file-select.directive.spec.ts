import { Component, Output, EventEmitter } from '@angular/core';
import { cit, create, direct } from '../../../../test-support';
import { FileSelectDirective } from './file-select.directive';

@Component({
  template: '<input publishFileSelect (file)="add($event)" />'
})
class MiniComponent {
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

describe('FileSelectDirective', () => {

  create(MiniComponent);

  direct(FileSelectDirective);

  cit('listens for file changes', (fix, el, comp) => {
    spyOn(FileSelectDirective.prototype, 'onChange').and.returnValue(null);
    triggerChange(el.nativeElement);
    expect(FileSelectDirective.prototype.onChange).toHaveBeenCalled();
  });

  cit('processes files individually', (fix, el, comp, done) => {
    let values = ['foo', 'bar', 'hello'];
    spyOn(FileSelectDirective.prototype, 'getFiles').and.returnValue(values);

    let index = 0;
    comp.changes.subscribe((data: any) => {
      expect(data).toEqual(values[index++]);
      if (index >= values.length) { done(); }
    });
    triggerChange(el.nativeElement);
  });

});
