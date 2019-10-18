import { cit, create, provide, cms } from '../../../testing';
import { SeriesModel } from '../../shared';
import { SeriesPlanComponent } from './series-plan.component';
import { TabService, SimpleDate } from 'ngx-prx-styleguide';

describe('SeriesPlanComponent', () => {

  create(SeriesPlanComponent);

  provide(TabService);

  let series, tpl1, tpl2, dist1, dist2;
  beforeEach(() => {
    series = cms.mock('prx:series', {title: 'mock-series'});
    tpl1 = cms.mock('prx:tpl1', {label: 'one', _links: {self: {href: '/link/one'}}});
    tpl2 = cms.mock('prx:tpl2', {label: 'two', _links: {self: {href: '/link/two'}}});
    dist1 = cms.mock('prx:dist', {kind: 'somethingelse'});
    dist2 = cms.mock('prx:dist', {kind: 'podcast'});
    series.mockItems('prx:distributions', [dist1, dist2]);
    series.mockItems('prx:audio-version-templates', [tpl1, tpl2]);
  });

  cit('loads the series templates', (_fix, _el, comp) => {
    comp.setSeries(new SeriesModel(null, series, false));
    expect(comp.templateOptions).toEqual([['one', '/link/one'], ['two', '/link/two']]);
    expect(comp.templateLink).toEqual('/link/one');
  });

  cit('warns you to pick a podcast template', (_fix, _el, comp) => {
    comp.setSeries(new SeriesModel(null, series, false));
    expect(comp.isPodcast).toEqual(true);
    // fix.detectChanges();
    // expect(el).toMatch(/choose a template associated with your series podcast/i);
  });

  cit('awarns for lack of templates', (_fix, _el, comp) => {
    series.mockItems('prx:audio-version-templates', []);
    comp.setSeries(new SeriesModel(null, series, false));
    expect(comp.noTemplates).toEqual(true);
    // fix.detectChanges();
    // expect(el).toMatch(/series has no audio templates/i);
  });

  cit('toggles between specific weeks and every-other', (_fix, _el, comp) => {
    comp.weeks[2] = true;
    comp.weeks[5] = true;
    expect(comp.weeks).toEqual({1: false, 2: true, 3: false, 4: false, 5: true});
    expect(comp.everyOtherWeek).toEqual(false);

    comp.toggleEveryOtherWeek();
    expect(comp.weeks).toEqual({1: false, 2: false, 3: false, 4: false, 5: false});
    expect(comp.everyOtherWeek).toEqual(true);

    comp.toggleEveryOtherWeek();
    expect(comp.weeks).toEqual({1: false, 2: false, 3: false, 4: false, 5: false});
    expect(comp.everyOtherWeek).toEqual(false);
  });

  cit('toggles between max episodes and max date', (_fix, _el, comp) => {
    comp.toggleRecur();
    expect(comp.generateEndingAt).not.toEqual(null);
    expect(comp.generateMax).toEqual(null);

    comp.toggleRecur();
    expect(comp.generateEndingAt).toEqual(null);
    expect(comp.generateMax).not.toEqual(null);
  });

  cit('creates episodes with a different time', (_fix, _el, comp) => {
    const [planHours, planMinutes] = [10, 30];
    comp.series = series;
    comp.templateLink = '/some/link';
    comp.planned = [new SimpleDate('2019-02-01')];
    comp.planTime = new Date(2019, 1, 1, planHours, planMinutes);

    comp.createEpisodes().subscribe(d => {
      expect(d[0].releasedAt.getHours()).toEqual(planHours);
      expect(d[0].releasedAt.getMinutes()).toEqual(planMinutes);
    });
  });

  cit('plans episodes with a max number', (_fix, _el, comp) => {
    comp.generateStartingAt = new Date(2019, 1, 1);
    comp.days[2] = true;
    comp.weeks[2] = true;
    comp.weeks[4] = true;
    comp.generateMax = 6;
    comp.generate();
    expect(comp.planned.length).toEqual(6);
    expect(comp.planned.map(d => `${d}`)).toEqual([
      '2019-02-12', '2019-02-26',
      '2019-03-12', '2019-03-26',
      '2019-04-09', '2019-04-23',
    ]);
  });

  cit('plans episodes with a max date', (_fix, _el, comp) => {
    comp.generateStartingAt = new Date(2019, 1, 1);
    comp.generateEndingAt = new Date(2019, 2, 1);
    comp.days[3] = true;
    comp.days[5] = true;
    comp.weeks[1] = true;
    comp.weeks[2] = true;
    comp.weeks[3] = true;
    comp.generate();
    expect(comp.planned.length).toEqual(7);
    expect(comp.planned.map(d => `${d}`)).toEqual([
      '2019-02-01',
      '2019-02-06', '2019-02-08',
      '2019-02-13', '2019-02-15',
      '2019-02-20',
      '2019-03-01',
    ]);
  });

  cit('plans episodes every other week', (_fix, _el, comp) => {
    comp.generateStartingAt = new Date(2019, 1, 4);
    comp.generateEndingAt = new Date(2019, 3, 1);
    comp.days[1] = true;
    comp.everyOtherWeek = true;
    comp.generate();
    expect(comp.planned.length).toEqual(5);
    expect(comp.planned.map(d => `${d}`)).toEqual([
      '2019-02-04', '2019-02-18', '2019-03-04', '2019-03-18', '2019-04-01'
    ]);
  });

  cit('creates stories and audio-versions', (_fix, _el, comp) => {
    comp.series = series;
    comp.templateLink = '/some/link';
    comp.planned = [new SimpleDate('2019-02-01'), new SimpleDate('2019-02-02')];

    const stories = [];
    const versions = [];
    comp.createEpisodes().subscribe(d => {
      expect(d.length).toEqual(2);
      stories.push(d[0]);
      versions.push(d[1]);
    });

    expect(stories.length).toEqual(2);
    expect(versions.length).toEqual(2);
    expect(stories[0].title).toEqual('February 1, 2019');
    expect(stories[0].releasedAt).toEqual(comp.planned[0].toLocaleDate(12));
    expect(stories[1].title).toEqual('February 2, 2019');
    expect(stories[1].releasedAt).toEqual(comp.planned[1].toLocaleDate(12));
    expect(versions[0].set_audio_version_template_uri).toEqual('/some/link');
    expect(versions[1].set_audio_version_template_uri).toEqual('/some/link');
  });

});
