import { cit, create, cms, provide, By } from '../../../testing';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { BasicComponent } from './basic.component';
import { TabService } from 'ngx-prx-styleguide';

describe('BasicComponent', () => {

  create(BasicComponent);

  provide(TabService);

  cit('does not render until the story is loaded', (fix, el, edit) => {
    edit.story = null;
    fix.detectChanges();
    expect(el).not.toQuery('form');
    edit.story = {changed: () => false};
    fix.detectChanges();
    expect(el).toQuery('form');
  });

  cit('shows the basic story edit fields', (fix, el, comp) => {
    expect(el).not.toQuery('prx-fancy-field');
    expect(el).not.toQuery('publish-wysiwyg');
    comp.story = {images: [], changed: () => false};
    fix.detectChanges();

    expect(el.queryAll(By.css('prx-fancy-field')).length).toEqual(7);
    expect(el.queryAll(By.css('publish-wysiwyg')).length).toEqual(1);
    expect(el).toContainText('Tweetable title');
    expect(el).toContainText('short description');
    expect(el).toContainText('full description');
    expect(el).toContainText('list of tags');
  });

  cit('shows warning if no audio versions', (fix, el, comp) => {
    comp.story = {versions: [], changed: () => false};
    fix.detectChanges();

    expect(el).toContainText('You have no audio templates for this episode');
  });


  describe('version select', () => {

    let story, versions, templates;
    beforeEach(() => {
      versions = [];
      templates = [];
      story = {
        loadRelated: () => (story.versions = versions) && Observable.of(true),
        removeRelated: r => story.versions = story.versions.filter(v => v !== r),
        getSeriesTemplates: () => Observable.of(templates.map(t => cms.mock('prx:tpl', t)))
      };
    });

    cit('updates version templates to match the selection', (fix, el, comp) => {
      comp.story = story;
      versions = [{label: 'whatev', template: {id: 456}}, {label: 'whatev2', isNew: true, template: {id: 456}}];
      templates = [{id: 123, label: 'tpl 123'}, {id: 456, label: 'tpl 456'}];
      comp.loadVersionTemplates();
      comp.updateVersions([123]);
      expect(story.versions.length).toEqual(2);
      expect(story.versions[0].label).toEqual('whatev');
      expect(story.versions[0].template.id).toEqual(456);
      expect(story.versions[0].isDestroy).toEqual(true);
      expect(story.versions[1].label).toEqual('tpl 123');
      expect(story.versions[1].template.id).toEqual(123);
    });

  });

});
