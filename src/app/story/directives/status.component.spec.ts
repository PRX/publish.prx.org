import { cit, create, provide, stubPipe } from '../../../testing';
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
    comp.story.isPublished = story.isPublished ? story.isPublished : () => false;
    comp.id = comp.story.isNew ? null : 1234;
    fix.detectChanges();
  };

  cit('determines the appropriate status based on story', (fix, el, comp: StoryStatusComponent) => {
    mockStory({isNew: true}, comp, fix);
    expect(comp.currentStatus).toBe('draft');
    mockStory({publishedAt: new Date(), isPublished: () => null}, comp, fix);
    expect(comp.currentStatus).toBe('scheduled');
    mockStory({publishedAt: new Date(), isPublished: () => true}, comp, fix);
    expect(comp.currentStatus).toBe('published');
  });

  cit('fails gracefully if status has not yet been determined', (fix, el, comp: StoryStatusComponent) => {
    expect(comp.currentStatus).toBeUndefined();
  });

  cit('shows story status', (fix, el, comp) => {
    mockStory({isNew: true}, comp, fix);
    expect(el).toQueryText('h2', 'draft');
    mockStory({isNew: false}, comp, fix);
    expect(el).toQueryText('h2', 'draft');
    mockStory({publishedAt: new Date(), isPublished: () => false}, comp, fix);
    expect(el).toQueryText('h2', 'scheduled');
    mockStory({publishedAt: new Date(), isPublished: () => true}, comp, fix);
    expect(el).toQueryText('h2', 'published');
  });

  cit('alerts when unscheduling a future published episode', (fix, el, comp) => {
    const tomorrow = new Date(moment().add(1, 'days').valueOf());
    const scheduledStory = {
      publishedAt: tomorrow,
      releasedAt: tomorrow,
      set: function (field, value) { this[field] = value; },
      changed: () => true,
      isPublished: () => false
    };
    mockStory(scheduledStory, comp, fix);
    fix.detectChanges();

    expect(modalAlertBody).toBeNull();
    comp.setDate(null);
    expect(modalAlertBody).toMatch(/will unpublish/i);
    expect(comp.story.releasedAt).toBeNull();
  });

  cit('shows the date without a toggle when it has not yet been set', (fix, el, comp) => {
    mockStory({isNew: true}, comp, fix);
    expect(el).toQuery('prx-tz-datepicker');
    expect(el).not.toQuery('dt.dropdate input[type=checkbox]+label');
  });

  cit('shows the date after it has been changed but not the toggle if it has not been saved', (fix, el, comp) => {
    mockStory({releasedAt: new Date(), isPublished: () => false, changed: (field) => field === 'releasedAt'}, comp, fix);
    expect(el).toQuery('prx-tz-datepicker');
    expect(el).not.toQuery('dt.dropdate input[type=checkbox]+label');
  });

  cit('does not show the date by default after it has been set', (fix, el, comp) => {
    comp.editingDate = false; // set up: component initialized by test with empty date
    mockStory({releasedAt: new Date(), isPublished: () => false, changed: () => false}, comp, fix);
    expect(el).not.toQuery('prx-tz-datepicker');
    expect(el).toQueryText('dt.dropdate input[type=checkbox]+label', 'Edit');
  });

  cit('shows the date when toggled', (fix, el, comp) => {
    comp.editingDate = false; // set up: component initialized by test with empty date
    mockStory({releasedAt: new Date(), isPublished: () => false, changed: () => false}, comp, fix);
    expect(el).not.toQuery('prx-tz-datepicker');
    comp.editingDate = true;
    fix.detectChanges();
    expect(el).toQuery('prx-tz-datepicker');
  });
});
