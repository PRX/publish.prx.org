import { cit, create, cms, provide, By } from '../../../testing';
import { of as observableOf } from 'rxjs';
import { BasicComponent } from './basic.component';
import { ModalService, TabService } from 'ngx-prx-styleguide';
import * as moment from 'moment';

describe('BasicComponent', () => {

  create(BasicComponent);

  provide(TabService);

  let modalAlertMsg: any;
  provide(ModalService, {
    alert: (title, msg) => { modalAlertMsg = msg; }
  });

  cit('does not render until the story is loaded', (fix, el, edit) => {
    edit.story = null;
    fix.detectChanges();
    expect(el).not.toQuery('form');
    edit.story = {changed: () => false, invalid: () => false};
    fix.detectChanges();
    expect(el).toQuery('form');
  });

  cit('shows the basic story edit fields', (fix, el, comp) => {
    expect(el).not.toQuery('prx-fancy-field');
    expect(el).not.toQuery('publish-wysiwyg');
    comp.story = {images: [], changed: () => false, invalid: () => false};
    fix.detectChanges();

    expect(el.queryAll(By.css('prx-fancy-field')).length).toEqual(12);
    expect(el.queryAll(By.css('publish-wysiwyg')).length).toEqual(1);
    expect(el).toContainText('Tweetable title');
    expect(el).toContainText('clean version of the title');
    expect(el).toContainText('short description');
    expect(el).toContainText('full description');
    expect(el).toContainText('categories relevant to the content');
    expect(el).toContainText('season number');
    expect(el).toContainText('episode number');
  });

  cit('shows warning if no audio versions', (fix, el, comp) => {
    comp.story = {versions: [], changed: () => false, invalid: () => false};
    fix.detectChanges();

    expect(el).toContainText('Pick a version of your audio files to upload for this episode');
  });

  cit('shows tip if audio version is selected', (fix, el, comp) => {
    comp.story = {versions: [{label: 'whatev', template: {id: 456}}], changed: () => false, invalid: () => false};
    fix.detectChanges();

    expect(el).toContainText('Clear your selection to select another template');
  });

  describe('version select', () => {

    let story, versions, templates;
    beforeEach(() => {
      versions = [{label: 'whatev', template: {id: 456}}];
      templates = [{id: 123, label: 'tpl 123'}, {id: 456, label: 'tpl 456'}];
      story = {
        loadRelated: () => (story.versions = versions) && observableOf(true),
        removeRelated: r => story.versions = story.versions.filter(v => v !== r),
        getSeriesTemplates: () => observableOf(templates.map(t => cms.mock('prx:tpl', t)))
      };
    });

    cit('updates version templates to match the selection', (fix, el, comp) => {
      comp.story = story;
      comp.loadVersionTemplates();
      comp.updateVersions([123]);
      expect(story.versions.length).toEqual(2);
      expect(story.versions[0].label).toEqual('whatev');
      expect(story.versions[0].template.id).toEqual(456);
      expect(story.versions[0].isDestroy).toEqual(true);
      expect(story.versions[1].label).toEqual('tpl 123');
      expect(story.versions[1].template.id).toEqual(123);
    });

    cit('refuses to select an unknown template id', (fix, el, comp) => {
      comp.story = story;
      comp.loadVersionTemplates();
      comp.updateVersions([456, 99999]);
      expect(story.versions.length).toEqual(1);
    });

    cit('undestroys audio files when their version is destroyed', (fix, el, comp) => {
      versions[0].files = [{isDestroy: true}, {isDestroy: false}];
      comp.story = story;
      comp.loadVersionTemplates();
      comp.updateVersions([123]);
      expect(story.versions.length).toEqual(2);
      expect(story.versions[0].isDestroy).toEqual(true);
      expect(story.versions[0].files[0].isDestroy).toEqual(false);
      expect(story.versions[0].files[1].isDestroy).toEqual(false);
    });

    cit('alerts when unscheduling a future published episode', (fix, el, comp) => {
      const tomorrow = new Date(moment().add(1, 'days').valueOf());
      comp.story = {
        publishedAt: tomorrow,
        releasedAt: tomorrow,
        changed: () => true
      };
      comp.showReleasedAt = true;
      fix.detectChanges();

      expect(modalAlertMsg).toBeUndefined();
      let cancelReleaseDate = el.query(By.css('#showReleasedAt')).nativeElement;
      cancelReleaseDate.click();
      expect(modalAlertMsg).toMatch(/will unpublish/i);
      expect(comp.story.releasedAt).toBeNull();
    });

  });

});
