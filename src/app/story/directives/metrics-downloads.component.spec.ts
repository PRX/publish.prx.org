import { cit, cms as castle, create, provide } from '../../../testing';
import { MetricsDownloadsComponent } from './metrics-downloads.component';
import { TabService } from '../../shared';

describe('MetricsDownloadsComponent', () => {

  create(MetricsDownloadsComponent);

  provide(TabService);

  beforeEach(() => {
    castle.mockList('prx:episode-downloads', [{
      downloads: [
        [
          '2017-04-19T00:00:00Z',
          99
        ],
        [
          '2017-04-20T00:00:00Z',
          97
        ]
      ]
    }]);
  });

  cit('should not make castle request if episode not published', (fix, el, comp) => {
    spyOn(castle, 'followList').and.stub();
    comp.story = {publishedAt: null};
    comp.requestMetrics();
    expect(comp.error).toContain('not published');
    expect(castle.followList).not.toHaveBeenCalled();
  });

  cit('should not make castle request if interval not allowed with date range', (fix, el, comp) => {
    spyOn(castle, 'followList').and.stub();
    comp.story = {title: 'Cool Story Bro', appVersion: 'v4', publishedAt: new Date()};
    comp.beginDate = new Date('2017-01-01');
    comp.endDate = new Date('2017-04-21');
    comp.interval = comp.INTERVAL_HOURLY;
    comp.requestMetrics();
    expect(comp.error).toContain('should use daily interval');
    expect(castle.followList).not.toHaveBeenCalled();
  });

  cit('should not show error if interval and date range are ok', (fix, el, comp) => {
    comp.story = {title: 'Cool Story Bro', appVersion: 'v4', publishedAt: new Date()};
    comp.episode = {id: '668aefbf-a320-477d-8fea-db3ce4c50c94'};
    comp.beginDate = new Date('2017-04-19');
    comp.endDate = new Date('2017-04-20');
    comp.interval = comp.INTERVAL_DAILY;
    comp.requestMetrics();
    expect(comp.error).toBeNull();
  });

  cit('should adjust options with date range', (fix, el, comp) => {
    comp.story = {title: 'Cool Story Bro', appVersion: 'v4', publishedAt: new Date()};
    comp.episode = {id: '668aefbf-a320-477d-8fea-db3ce4c50c94'};
    expect(comp.intervalOptions.length).toEqual(3);
    comp.interval = comp.INTERVAL_15MIN.value;
    comp.beginDate = new Date('2017-01-01');
    comp.endDateChange(new Date('2017-04-21'));
    fix.detectChanges();
    expect(comp.intervalOptions.length).toEqual(1);
    comp.beginDateChange(new Date('2017-04-01'));
    fix.detectChanges();
    expect(comp.intervalOptions.length).toEqual(2);
  });


});
