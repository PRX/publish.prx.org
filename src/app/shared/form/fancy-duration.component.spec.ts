import { cit, create, stubPipe } from '../../../testing';
import { FancyDurationComponent } from './fancy-duration.component';

describe('FancyDurationComponent', () => {

  create(FancyDurationComponent, false);

  stubPipe('padzero');

  cit('parses seconds to HH:MM:SS', (fix, el, comp) => {
    comp.model = {foobar: 84716, original: {}};
    comp.name = 'foobar';
    fix.detectChanges();
    expect(comp.total).toEqual(84716);
    expect(comp.hours).toEqual(23);
    expect(comp.minutes).toEqual(31);
    expect(comp.seconds).toEqual(56);
  });

  cit('detects changes for each subfield', (fix, el, comp) => {
    comp.model = {foobar: 84716, original: {foobar: 84716}};
    comp.name = 'foobar';
    fix.detectChanges();
    expect([comp.hoursChanged, comp.minutesChanged, comp.secondsChanged]).toEqual([false, false, false]);

    comp.model.foobar = 23 * 60 * 60;
    fix.detectChanges();
    expect([comp.hoursChanged, comp.minutesChanged, comp.secondsChanged]).toEqual([false, true, true]);

    comp.model.foobar = 31 * 60 + 56;
    fix.detectChanges();
    expect([comp.hoursChanged, comp.minutesChanged, comp.secondsChanged]).toEqual([true, false, false]);
  });

  cit('sets from subfields', (fix, el, comp) => {
    comp.model = {foobar: 0, original: {}, set: (f, v) => comp.model[f] = v};
    comp.name = 'foobar';
    comp.set('hours', 1);
    expect(comp.model.foobar).toEqual(3600);
    comp.set('minutes', 61);
    expect(comp.model.foobar).toEqual(7260);
    comp.set('seconds', 52);
    expect(comp.model.foobar).toEqual(7312);
    comp.set('seconds', -2);
    expect(comp.model.foobar).toEqual(7260);
  });

});
