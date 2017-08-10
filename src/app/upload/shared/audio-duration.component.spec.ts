import { cit, create, provide, stubPipe, By } from '../../../testing';
import { ModalService } from 'ngx-prx-styleguide';
import { AudioDurationComponent } from './audio-duration.component';

describe('AudioDurationComponent', () => {

  create(AudioDurationComponent, false);

  let modalState: any;
  provide(ModalService, {show: s => modalState = s});

  stubPipe('duration');

  stubPipe('filesize');

  cit('shows duration', (fix, el, comp) => {
    comp.file = {duration: 123, size: 987};
    fix.detectChanges();
    expect(el).toContainText('123');
    expect(el).not.toContainText('987');
    expect(el).not.toQuery('button');
  });

  cit('shows 0 durations', (fix, el, comp) => {
    comp.file = {duration: 0, size: 987};
    fix.detectChanges();
    expect(el).toContainText('0');
    expect(el).not.toContainText('987');
  });

  cit('shows filesize', (fix, el, comp) => {
    comp.file = {duration: null, size: 987};
    fix.detectChanges();
    expect(el).toContainText('987');
    expect(el).not.toContainText('123');
    expect(el).not.toQuery('button');
  });

  cit('shows neither', (fix, el, comp) => {
    comp.file = {duration: null, size: null};
    fix.detectChanges();
    expect(el).not.toContainText('123');
    expect(el).not.toContainText('987');
    expect(el).not.toQuery('span');
    expect(el).not.toQuery('button');
  });

  cit('shows file info modal', (fix, el, comp) => {
    comp.file = {label: 'Foo', duration: 123, size: 987, frequency: 44100};
    fix.detectChanges();
    expect(el).toQuery('button');
    el.query(By.css('button')).nativeElement.click();
    expect(modalState.title).toEqual('Foo');
    expect(modalState.body).toMatch(/987 B/);
    expect(modalState.body).toMatch(/0:02:03/);
    expect(modalState.body).toMatch(/44.1 kHz/);
  });

});
