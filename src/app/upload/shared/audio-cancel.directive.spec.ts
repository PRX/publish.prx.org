import { cit, create, direct, provide, By } from '../../../testing';
import { Component } from '@angular/core';
import { ModalService } from '../../core';
import { AudioCancelDirective } from './audio-cancel.directive';

@Component({
  template: '<button [publishAudioCancel]="file" [version]="version" [delay]="delay"></button>'
})
class MiniComponent {
  file: any;
  version: any;
  delay = 10;
}
const getDirective = (el): AudioCancelDirective => {
  let cancelEl = el.query(By.directive(AudioCancelDirective));
  expect(cancelEl).toBeDefined();
  return cancelEl.injector.get(AudioCancelDirective);
};

describe('AudioCancelDirective', () => {

  create(MiniComponent, false);

  direct(AudioCancelDirective);

  let modalAlertTitle: any;
  beforeEach(() => modalAlertTitle = null);
  provide(ModalService, {
    prompt: (p) => modalAlertTitle = p
  });

  cit('prompts before deleting audio', (fix, el, comp) => {
    comp.file = {canceled: false, destroy: () => true};
    comp.version = {removeUpload: () => true};
    fix.detectChanges();

    let cancel = getDirective(el);
    spyOn(cancel, 'cancelAndDestroy').and.stub();
    el.query(By.css('button')).nativeElement.click();
    expect(modalAlertTitle).toMatch(/really delete/i);
  });

  cit('cancels but delays deletion', (fix, el, comp, done) => {
    let destroyed = false;
    let removed = false;
    comp.file = {canceled: false, destroy: () => destroyed = true};
    comp.version = {removeUpload: () => removed = true};
    fix.detectChanges();

    let cancel = getDirective(el);
    cancel.cancelAndDestroy();
    expect(comp.file.canceled).toEqual(true);
    expect(destroyed).toEqual(false);
    expect(removed).toEqual(false);
    setTimeout(() => {
      expect(comp.file.canceled).toEqual(false);
      expect(destroyed).toEqual(true);
      expect(removed).toEqual(true);
      done();
    }, 20);
  });

});
