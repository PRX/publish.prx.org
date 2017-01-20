import { cit, create, stubPipe } from '../../../testing';
import { HomeStoryComponent } from './home-story.component';


describe('HomeStoryComponent', () => {

  create(HomeStoryComponent, false);

  stubPipe('duration');

  cit('renders new stories as new', (fix, el, comp) => {
    comp.story = {isNew: true, changed: () => true, images: []};
    fix.detectChanges();
    expect(el).toContainText('New');
  });

  cit('renders unpublished stories as draft', (fix, el, comp) => {
    comp.story = {isNew: false, publishedAt: null, changed: () => true, images: []};
    fix.detectChanges();
    expect(el).toContainText('Draft');
  });

  cit('renders future published stories as scheduled', (fix, el, comp) => {
    comp.story = {isNew: false, publishedAt: new Date(), isPublished: () => false, changed: () => true, images: []};
    fix.detectChanges();
    expect(el).toContainText('Scheduled');
  });

  cit('renders add story button when no draft changes', (fix, el, comp) => {
    comp.story = {isNew: true, changed: () => false, images: []};
    fix.detectChanges();
    expect(el).toQuery('.plus-sign');
  });

});
