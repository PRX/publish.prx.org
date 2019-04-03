import { cit, create, stubPipe } from '../../testing';
import { DashboardStoryComponent } from './dashboard-story.component';
import { By } from '@angular/platform-browser';
import { SeriesModel, StoryModel, DistributionModel, StoryDistributionModel } from 'app/shared';
import { MockHalDoc } from 'ngx-prx-styleguide';


describe('DashboardStoryComponent', () => {

  create(DashboardStoryComponent, false);

  stubPipe('duration');
  stubPipe('date');

  cit('still renders new stories as new', (fix, el, comp) => {
    comp.story = {isNew: true, changed: () => true};
    fix.detectChanges();
    const statusText = el.query(By.css('.status.text.new')).nativeElement;
    expect(statusText.innerText.toLowerCase()).toEqual('new');
  });

  cit('renders unpublished stories as draft', (fix, el, comp) => {
    comp.story = {isNew: false, publishedAt: null, changed: () => true};
    fix.detectChanges();
    const statusText = el.query(By.css('.status.text.draft')).nativeElement;
    expect(statusText.innerText.toLowerCase()).toEqual('draft');
  });

  cit('renders future published stories as scheduled', (fix, el, comp) => {
    comp.story = {isNew: false, publishedAt: new Date(), isPublished: () => false, changed: () => true};
    fix.detectChanges();
    const statusText = el.query(By.css('.status.text.scheduled')).nativeElement;
    expect(statusText.innerText.toLowerCase()).toEqual('scheduled');
  });

  cit('has metrics link for published stories', (fix, el, comp) => {
    comp.status = 'published';
    comp.series = new SeriesModel(null, new MockHalDoc({id: 1}));
    comp.series.distributions = [new DistributionModel(comp.series.doc,
      new MockHalDoc({kind: 'podcast', url: 'anywhere.com/that/ends/with/14'}))];
    comp.story = new StoryModel(comp.series.doc, new MockHalDoc({id: '1234', publishedAt: new Date()}));
    comp.story.distributions = [new StoryDistributionModel(comp.series.doc, comp.story.doc,
      new MockHalDoc({kind: 'episode', url: 'anywhere.com/that/ends/with/abcdefg'}))]
    fix.detectChanges();
    const statusText = el.query(By.css('.status.text.published')).nativeElement;
    expect(statusText.innerText.toLowerCase()).toEqual('published');
    const metricsLink = el.query(By.css('.actions a[target]'));
    expect(metricsLink.nativeElement.href).toContain('metrics.prx');
  });

  cit('does not show a metrics link for yet-to-be published stories', (fix, el, comp) => {
    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() + 1);
    comp.story = {isNew: false, publishedAt, isPublished: () => false, changed: () => true};
    fix.detectChanges();
    expect(el).not.toQuery('.actions a[target]');
  });

});
