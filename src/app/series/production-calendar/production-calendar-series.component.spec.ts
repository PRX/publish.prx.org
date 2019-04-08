import { cit, create, cms, stubPipe, By } from '../../../testing';
import { MockHalDoc } from 'ngx-prx-styleguide';
import { ProductionCalendarSeriesComponent } from './production-calendar-series.component';
import { SeriesModel, StoryModel } from 'app/shared';


describe('ProductionCalendarSeriesComponent', () => {

  create(ProductionCalendarSeriesComponent, false);

  stubPipe('capitalize');

  let auth;
  let series;
  let storyDates = new Array(3);
  for (let i = 0; i < 3; i++) {
    storyDates[i] = new Date();
    storyDates[i].setMonth(storyDates[i].getMonth() + i);
  }
  const stories = [
    {title: 'ep0', publishedAt: storyDates[0]},
    {title: 'ep1', publishedAt: storyDates[1]},
    {title: 'ep2', publishedAt: storyDates[2]}
  ];
  beforeEach(() => {
    auth = cms.mock('prx:authorization', {});
    auth.mock('prx:series', {}).mockItems('prx:stories', stories);
    series = new SeriesModel(null, new MockHalDoc({id: 99, count: () => 1}));
  });

  cit('loads series into month map', (fix, el, comp) => {
    comp.series = series;
    comp.setStoryMonths(stories.map(s => new StoryModel(series.doc, new MockHalDoc(s))));
    fix.detectChanges();
    expect(comp.storyMonths.length).toEqual(stories.length);
    expect(el).toQuery('h2');
    const months = el.queryAll(By.css('h2'));
    months.forEach((m, i) => expect(m.nativeElement.textContent).toContain(storyDates[i].getFullYear()));
  });

  cit('filters by publish state', (fix, el, comp) => {
    spyOn(comp, 'loadSeriesStories');
    comp.filterByPublishState('published');
    expect(comp.loadSeriesStories).toHaveBeenCalled();
  });

  cit('filters by month', (fix, el, comp) => {
    spyOn(comp, 'loadSeriesStories');
    comp.filterByMonth('2019-04-01');
    expect(comp.loadSeriesStories).toHaveBeenCalled();
  });
});
