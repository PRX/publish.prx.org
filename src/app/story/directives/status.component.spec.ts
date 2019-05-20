import { cit, create, provide, stubPipe, By } from '../../../testing';
import { ModalService } from 'ngx-prx-styleguide';
import { StoryStatusComponent } from './status.component';
import * as moment from 'moment';

describe('StoryStatusComponent', () => {

  create(StoryStatusComponent);

  stubPipe('date');

  let modalAlertBody: any;
  provide(ModalService, {
    show: (data) => modalAlertBody = data.body,
    alert: (title, body) => modalAlertBody = body,
    confirm: (title, body) => modalAlertBody = body
  });
  beforeEach(() => modalAlertBody = null);

  const mockStory = (story, comp, fix) => {
    comp.story = story;
    comp.story.invalid = comp.story.invalid || (() => null);
    comp.story.changed = comp.story.changed || (() => false);
    comp.story.isNew = comp.story.isNew || false;
    comp.id = comp.story.isNew ? null : 1234;
    fix.detectChanges();
  };

  cit('determines the appropriate status based on story', (fix, el, comp: StoryStatusComponent) => {
    mockStory({isNew: true}, comp, fix);
    expect(Object.entries(comp.storyStatus).filter(([_, stat]) => stat.active).length).toBe(1);
    expect(comp.currentStatus.name).toBe('draft');
    mockStory({publishedAt: new Date(), isPublished: () => null}, comp, fix);
    expect(Object.entries(comp.storyStatus).filter(([_, stat]) => stat.active).length).toBe(1);
    expect(comp.currentStatus.name).toBe('scheduled');
    mockStory({publishedAt: new Date(), isPublished: () => true}, comp, fix);
    expect(Object.entries(comp.storyStatus).filter(([_, stat]) => stat.active).length).toBe(1);
    expect(comp.currentStatus.name).toBe('published');
  });

  cit('fails gracefully if status has not yet been determined', (fix, el, comp: StoryStatusComponent) => {
    expect(comp.currentStatus).toBe(null);
  });

  cit('shows story status', (fix, el, comp) => {
    mockStory({isNew: true}, comp, fix);
    expect(el).toQueryText('h1', 'Draft');
    mockStory({isNew: false}, comp, fix);
    expect(el).toQueryText('h1', 'Draft');
    mockStory({publishedAt: new Date(), isPublished: () => false}, comp, fix);
    expect(el).toQueryText('h1', 'Scheduled');
    mockStory({publishedAt: new Date(), isPublished: () => true}, comp, fix);
    expect(el).toQueryText('h1', 'Published');
  });

  cit('updates showReleasedAt based on story releasedAt', (fix, el, comp) => {
    const tomorrow = new Date(moment().add(1, 'days').valueOf());
    const scheduledStory = {
      publishedAt: tomorrow,
      releasedAt: tomorrow,
      isPublished: () => false
    };
    mockStory(scheduledStory, comp, fix);
    expect(comp.showReleasedAt).toBeTruthy();
    comp.story.releasedAt = null;
    fix.detectChanges()
    expect(comp.showReleasedAt).toBeFalsy();
  });

  cit('alerts when unscheduling a future published episode', (fix, el, comp) => {
    const tomorrow = new Date(moment().add(1, 'days').valueOf());
    const scheduledStory = {
      publishedAt: tomorrow,
      releasedAt: tomorrow,
      changed: () => true,
      isPublished: () => false
    };
    mockStory(scheduledStory, comp, fix);
    comp.showReleasedAt = true;
    fix.detectChanges();

    expect(modalAlertBody).toBeNull();
    let cancelReleaseDate = el.query(By.css('#showReleasedAt')).nativeElement;
    cancelReleaseDate.click();
    expect(modalAlertBody).toMatch(/will unpublish/i);
    expect(comp.story.releasedAt).toBeNull();
  });
});
