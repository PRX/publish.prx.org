import { cit, create, stubPipe } from '../../testing';
import { DashboardStoryComponent } from './dashboard-story.component';
import { By } from '@angular/platform-browser';


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
    comp.series = {id: 1, distributions: [{kind: 'podcast', podcast: {id: 14}}]};
    comp.story = {
      isNew: false,
      parent: {id: 1},
      publishedAt: new Date(),
      isPublished: () => true,
      changed: () => true,
      distributions: [{kind: 'episode', episode: {id: 'abcdefg'}}]
    };
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
