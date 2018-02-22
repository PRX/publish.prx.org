import { cit, cms, create, provide } from '../../../testing';
import { Subject } from 'rxjs/Subject';
import { StoryModel } from '../../shared';
import { MetricsDownloadsComponent } from './metrics-downloads.component';
import { TabService } from 'ngx-prx-styleguide';

describe('MetricsDownloadsComponent', () => {

  create(MetricsDownloadsComponent);

  let tabModel = new Subject<StoryModel>();
  provide(TabService, {model: tabModel});

  let series, story;
  beforeEach(() => {
    series = cms.mock('prx:series', {id: 10, title: 'ExistingSeriesTitle'});
    story = series.mock('prx:story', {id: 99, title: 'ExistingStoryTitle'});
    story.mockItems('prx:images', []);
    story.mockItems('prx:audio-versions', []);
  });

  cit('shows a link to metrics app', (fix, el, comp) => {
    fix.detectChanges();
    expect(el).not.toContainText('Metrics have moved');
    tabModel.next(new StoryModel(series, story));
    fix.detectChanges();
    expect(el).toContainText('Metrics have moved');
    expect(el).toQueryAttr('a', 'href', 'https://metrics.prx.org/10/downloads/podcast/daily');
  });

});
