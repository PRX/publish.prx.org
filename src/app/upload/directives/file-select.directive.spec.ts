import { Component, Output, EventEmitter } from '@angular/core';
import { setupComponent, buildComponent } from '../../../test-support';
import { FileSelectDirective } from './file-select.directive';

@Component({
  directives: [FileSelectDirective],
  selector: 'mini-container',
  template: '<input fileSelect (file)="add($event)" />'
})
export class MiniComponent {
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

  setupComponent(MiniComponent);

  it('listens for file changes', buildComponent((fix, el, mini) => {
    spyOn(FileSelectDirective.prototype, 'onChange').and.returnValue(null);
    triggerChange(el);
    expect(FileSelectDirective.prototype.onChange).toHaveBeenCalled();
  }));

  it('processes files individually', buildComponent((fix, el, mini) => {
    let values = ['foo', 'bar', 'hello'];
    spyOn(FileSelectDirective.prototype, 'getFiles').and.returnValue(values);

    return new Promise((resolve, reject) => {
      let index = 0;
      mini.changes.subscribe((data: any) => {
        expect(data).toEqual(values[index++]);
        if (index >= values.length) { resolve(); }
      });
      triggerChange(el);
    });
  }));

});
