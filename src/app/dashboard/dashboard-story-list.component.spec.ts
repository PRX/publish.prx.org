import { cit, create, cms, By } from '../../testing';
import { MockHalDoc } from 'ngx-prx-styleguide';
import { DashboardStoryListComponent } from './dashboard-story-list.component';
import { StoryModel, SeriesModel } from 'app/shared';

describe('DashboardStoryListComponent', () => {

  create(DashboardStoryListComponent, false);

  let auth;
  let account;
  let series;
  beforeEach(() => {
    auth = cms.mock('prx:authorization', {});
    account = auth.mock('prx:default-account', {});
    // auth.mock('prx:series', {}).mockItems('prx:stories', []);
    auth.mockItems('prx:stories', []);
    series = new SeriesModel(null, new MockHalDoc({id: 99, count: () => 1, isa: () => true}));
    series.doc.mockItems('prx:stories', []);
  });

  cit('status for unpublished stories is draft', (fix, el, comp) => {
    const story = {isNew: false, publishedAt: null, changed: () => true} as StoryModel;
    expect(comp.storyStatus(story)).toEqual('draft');
  });

  cit('status for future published stories is scheduled', (fix, el, comp) => {
    const story = {isNew: false, publishedAt: new Date(), isPublished: () => false, changed: () => true} as StoryModel;
    expect(comp.storyStatus(story)).toEqual('scheduled');
  });

  cit('should load series stories by page', (fix, el, comp, done) => {
    comp.auth = auth;
    comp.account = account;
    comp.series = series;
    comp.noseries = false;
    comp.series.doc.mockItems('prx:stories', [new MockHalDoc({id: '1234', publishedAt: new Date()})]);
    comp.loadStoryPage(1);
    comp.series.doc.followItems('prx:stories').subscribe(() => {
      expect(comp.stories.length).toEqual(1);
      done();
    });
  });

  cit('should load standalone stories by page', (fix, el, comp, done) => {
    comp.auth = auth;
    comp.account = account;
    comp.series = series;
    comp.noseries = true;
    comp.auth.mockItems('prx:stories', [new MockHalDoc({id: '1234', publishedAt: new Date()})]);
    comp.loadStoryPage(1);
    comp.auth.followItems('prx:stories').subscribe(() => {
      expect(comp.stories.length).toEqual(1);
      done();
    });
  });

  cit('should show message about planning episodes', (fix, el, comp) => {
    comp.auth = auth;
    comp.account = account;
    comp.series = series;
    comp.noseries = false;
    comp.isUnpublishedList = true;
    comp.stories = [new StoryModel(comp.series.doc, new MockHalDoc({id: '1234', publishedAt: new Date()}))];
    fix.detectChanges();
    expect(el.query(By.css('p.call-to-action')).nativeElement.textContent).toContain('The more drafts you add');
  });
});
