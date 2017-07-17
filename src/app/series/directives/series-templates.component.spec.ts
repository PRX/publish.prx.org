import { cit, create, provide, By, stubPipe } from '../../../testing';
import { SeriesTemplatesComponent } from './series-templates.component';
import { ModalService, TabService } from 'ngx-prx-styleguide';

describe('SeriesTemplatesComponent', () => {

  create(SeriesTemplatesComponent);

  provide(TabService);
  provide(ModalService);

  stubPipe('duration');

  cit('ignores deleted version templates', (fix, el, comp) => {
    comp.series = {versionTemplates: [{isDestroy: true}]};
    fix.detectChanges();
    expect(el).not.toQuery('.version');
  });

  cit('adds a new version template', (fix, el, comp) => {
    comp.series = {versionTemplates: []};
    fix.detectChanges();
    el.query(By.css('.add-version')).nativeElement.click();
    fix.detectChanges();
    expect(el).toQuery('[label="Template Label"]');
  });

  cit('removes a version template', (fix, el, comp) => {
    comp.series = {versionTemplates: [{fileTemplates: []}]};
    fix.detectChanges();
    expect(el).toQuery('[label="Template Label"]');
    el.query(By.css('.icon-cancel')).nativeElement.click();
    fix.detectChanges();
    expect(el).not.toQuery('[label="Template Label"]');
  });

  cit('adds a file template', (fix, el, comp) => {
    let files = [];
    comp.series = {versionTemplates: [{fileTemplates: files}]};
    fix.detectChanges();
    expect(el).not.toQuery('publish-file-template');
    el.query(By.css('[label="Segments"] .icon-plus')).nativeElement.click();
    fix.detectChanges();
    expect(el).toQuery('publish-file-template');
    expect(files[0].label).toEqual('Segment A');
  });

  cit('adds a destroyed file template', (fix, el, comp) => {
    let files = [{label: 'Foo', isDestroy: true}];
    comp.series = {versionTemplates: [{fileTemplates: files}]};
    fix.detectChanges();
    expect(el).toQuery('publish-file-template');
    el.query(By.css('[label="Segments"] .icon-plus')).nativeElement.click();
    fix.detectChanges();
    expect(files[0].isDestroy).toEqual(false);
  });

});
