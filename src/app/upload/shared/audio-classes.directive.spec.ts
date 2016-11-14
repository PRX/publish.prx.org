import { cit, create, direct } from '../../../testing';
import { Component } from '@angular/core';
import { AudioClassesDirective } from './audio-classes.directive';

@Component({
  template: '<button [publishAudioClasses]="file"></button>'
})
class MiniComponent {
  file: any;
}

describe('AudioClassesDirective', () => {

  create(MiniComponent, false);

  direct(AudioClassesDirective);

  cit('sets canceled state', (fix, el, comp) => {
    comp.file = {canceled: true, changed: () => false, invalid: () => false};
    fix.detectChanges();
    expect(el).toQuery('.audio.canceled');
  });

  cit('sets changed state', (fix, el, comp) => {
    comp.file = {changed: () => true, invalid: () => false};
    fix.detectChanges();
    expect(el).toQuery('.audio.changed');
  });

  cit('avoids invalid state', (fix, el, comp) => {
    comp.file = {changed: () => true, invalid: () => true};
    fix.detectChanges();
    expect(el).not.toQuery('.audio.invalid');
    expect(el).not.toQuery('.audio.changed');
  });

  cit('marks in-progress uploads as changed', (fix, el, comp) => {
    comp.file = {isUploading: true, changed: () => false, invalid: () => false};
    fix.detectChanges();
    expect(el).toQuery('.audio.changed');
  });

});
