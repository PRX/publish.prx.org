import { cit, create, direct, By } from '../../../testing';
import { Component } from '@angular/core';
import { AudioCancelDirective } from './audio-cancel.directive';

@Component({
  template: '<button [publishAudioCancel]="file" [version]="version" [delay]="delay"></button>'
})
class MiniComponent {
  file: any;
  version: any;
  delay = 10;
}

describe('AudioCancelDirective', () => {

  create(MiniComponent, false);

  direct(AudioCancelDirective);

  cit('cancels but delays deletion', (fix, el, comp, done) => {
    let destroyed = false;
    let removed = false;
    comp.file = {canceled: false, destroy: () => destroyed = true};
    comp.version = {removeUpload: () => removed = true};
    fix.detectChanges();
    el.query(By.css('button')).nativeElement.click();
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
