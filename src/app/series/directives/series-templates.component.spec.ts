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

  cit('adds new version templates', (fix, el, comp) => {
    comp.series = {versionTemplates: []};
    fix.detectChanges();
    el.query(By.css('.add-version')).nativeElement.click();
    fix.detectChanges();
    expect(el).toQuery('[label="Template Label"]');
    expect(el.queryAll(By.css('[label="Template Label"]')).length).toEqual(1);
    el.query(By.css('.add-version')).nativeElement.click();
    fix.detectChanges();
    expect(el.queryAll(By.css('[label="Template Label"]')).length).toEqual(2);
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
    let added = false;
    comp.series = {versionTemplates: [{isAudio: true, fileTemplates: [], addFile: () => added = true}]};
    fix.detectChanges();
    expect(el).not.toQuery('publish-file-template');
    el.query(By.css('[label="Segments"] .icon-plus')).nativeElement.click();
    fix.detectChanges();
    expect(added).toEqual(true);
  });

  cit('adds a destroyed file template', (fix, el, comp) => {
    let files = [{label: 'Foo', isDestroy: true}];
    comp.series = {versionTemplates: [{isAudio: true, fileTemplates: files}]};
    fix.detectChanges();
    expect(el).toQuery('publish-file-template');
    el.query(By.css('[label="Segments"] .icon-plus')).nativeElement.click();
    fix.detectChanges();
    expect(files[0].isDestroy).toEqual(false);
  });

  cit('hides segment info for video content types', (fix, el, comp) => {
    comp.series = {versionTemplates: [{isAudio: true, fileTemplates: []}]};
    fix.detectChanges();
    expect(el).toQuery('[label="Segments"]');
    comp.series = {versionTemplates: [{isAudio: false, fileTemplates: []}]};
    fix.detectChanges();
    expect(el).not.toQuery('[label="Segments"]');
  });

});
