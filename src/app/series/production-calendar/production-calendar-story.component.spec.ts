import { cit, create } from '../../../testing';
import { ProductionCalendarStoryComponent } from './production-calendar-story.component';
import { By } from '@angular/platform-browser';
import { StoryModel } from 'app/shared';
import { MockHalDoc, AudioVersionModel } from 'ngx-prx-styleguide';

describe('ProductionCalendarStoryComponent', () => {

  create(ProductionCalendarStoryComponent, false);

  cit('status for unpublished stories is draft', (fix, el, comp) => {
    comp.story = {isNew: false, publishedAt: null, changed: () => true};
    fix.detectChanges();
    expect(comp.status).toEqual('draft');
  });

  cit('status for future published stories is scheduled', (fix, el, comp) => {
    comp.story = {isNew: false, publishedAt: new Date(), isPublished: () => false, changed: () => true};
    fix.detectChanges();
    expect(comp.status).toEqual('scheduled');
  });

  cit('has story template', (fix, el, comp) => {
    comp.story = new StoryModel(new MockHalDoc({id: 1}), new MockHalDoc({id: '1234', publishedAt: new Date()}));
    comp.story.versions = [new AudioVersionModel({version: new MockHalDoc({id: '56789', label: '2 Segments'})})];
    fix.detectChanges();
    expect(comp.template).toEqual('2 Segments');
    const metricsLink = el.query(By.css('.actions span'));
    expect(metricsLink.nativeElement.innerText).toEqual('2 Segments');
  });

});
