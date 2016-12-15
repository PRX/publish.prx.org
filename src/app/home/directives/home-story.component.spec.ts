import { cit, create, stubPipe } from '../../../testing';
import { HomeStoryComponent } from './home-story.component';


describe('HomeStoryComponent', () => {

  create(HomeStoryComponent, false);

  stubPipe('duration');

  cit('renders new story as draft', (fix, el, comp) => {
    comp.story = {isNew: true, changed: () => true};
    fix.detectChanges();
    expect(el).toContainText('Draft');
  });

  cit('renders add story button when no draft changes', (fix, el, comp) => {
    comp.story = {isNew: true, changed: () => false};
    fix.detectChanges();
    expect(el).toQuery('.plus-sign');
  });

});
