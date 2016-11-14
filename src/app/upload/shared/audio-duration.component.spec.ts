import { cit, create, stubPipe } from '../../../testing';
import { AudioDurationComponent } from './audio-duration.component';

describe('AudioDurationComponent', () => {

  create(AudioDurationComponent, false);

  stubPipe('duration');

  stubPipe('filesize');

  cit('shows duration', (fix, el, comp) => {
    comp.file = {duration: 123, size: 987};
    fix.detectChanges();
    expect(el).toContainText('123');
    expect(el).not.toContainText('987');
  });

  cit('shows filesize', (fix, el, comp) => {
    comp.file = {duration: null, size: 987};
    fix.detectChanges();
    expect(el).toContainText('987');
    expect(el).not.toContainText('123');
  });

  cit('shows neither', (fix, el, comp) => {
    comp.file = {duration: null, size: null};
    fix.detectChanges();
    expect(el).not.toContainText('123');
    expect(el).not.toContainText('987');
    expect(el).not.toQuery('span');
  });

});
