import { cit, create, By } from '../../../testing';
import { MockHalDoc } from 'ngx-prx-styleguide';
import { ProductionCalendarSeriesComponent } from './production-calendar-series.component';
import { SeriesModel, StoryModel } from 'app/shared';


describe('ProductionCalendarSeriesComponent', () => {

  create(ProductionCalendarSeriesComponent, false);

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
    series = new SeriesModel(null, new MockHalDoc({id: 99, count: () => 1}));
    series.doc.mockItems('prx:stories', stories);
  });

  cit('loads series into month map', (fix, el, comp) => {
    comp.series = series;
    comp.setStoryMonths(stories.map(s => new StoryModel(series.doc, new MockHalDoc(s))));
    fix.detectChanges();
    expect(comp.storyMonths.length).toEqual(stories.length);
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

  cit('only gets first and last story on initial load', (fix, el, comp) => {
    spyOn(comp, 'loadTopStory');
    comp.series = series;
    fix.detectChanges();
    expect(comp.loadTopStory).toHaveBeenCalledTimes(2);
    comp.firstStoryDate = storyDates[0];
    comp.lastStoryDate = storyDates[storyDates.length - 1];
    comp.filterByPublishState('published');
    expect(comp.loadTopStory).toHaveBeenCalledTimes(2);
  });

  cit('gracefully handles no stories', (fix, el, comp) => {
    series.doc.mockItems('prx:stories', []);
    comp.series = series;
    fix.detectChanges();
    expect(el.query(By.css('prx-episode-card'))).toBeNull();
    expect(el.query(By.css('p.no-episodes')).nativeElement.innerText).toContain('plan episodes');
    comp.filterByPublishState('published');
    fix.detectChanges();
    expect(el.query(By.css('p.no-episodes')).nativeElement.innerText).toContain('filter criteria');
  })
});
