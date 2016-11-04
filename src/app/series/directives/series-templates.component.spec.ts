import { cit, create, provide, By } from '../../../testing';
import { SeriesTemplatesComponent } from './series-templates.component';
import { TabService } from '../../shared';

describe('SeriesTemplatesComponent', () => {

  create(SeriesTemplatesComponent);

  provide(TabService);

  cit('renders a placeholder if you have no version templates', (fix, el, comp) => {
    comp.series = {versionTemplates: []};
    fix.detectChanges();
    expect(el).toContainText('You have no templates');
  });

  cit('ignores deleted version templates', (fix, el, comp) => {
    comp.series = {versionTemplates: [{isDestroy: true}]};
    fix.detectChanges();
    expect(el).toContainText('You have no templates');
  });

  cit('adds a new version template', (fix, el, comp) => {
    comp.series = {versionTemplates: []};
    fix.detectChanges();
    el.query(By.css('.add-version')).nativeElement.click();
    fix.detectChanges();
    expect(el).toQuery('[label="Version Label"]');
  });

  cit('removes a version template', (fix, el, comp) => {
    comp.series = {versionTemplates: [{fileTemplates: []}]};
    fix.detectChanges();
    expect(el).toQuery('[label="Version Label"]');
    el.query(By.css('.actions a')).nativeElement.click();
    fix.detectChanges();
    expect(el).not.toQuery('[label="Version Label"]');
  });

  cit('adds a file template', (fix, el, comp) => {
    let files = [];
    comp.series = {versionTemplates: [{fileTemplates: files}]};
    fix.detectChanges();
    expect(el).toContainText('No segments defined');
    el.query(By.css('[label="Audio Segments"] .icon-plus')).nativeElement.click();
    fix.detectChanges();
    expect(el).not.toContainText('No segments defined');
    expect(files[0].label).toEqual('Segment A');
  });

  cit('adds a destroyed file template', (fix, el, comp) => {
    let files = [{label: 'Foo', isDestroy: true}];
    comp.series = {versionTemplates: [{fileTemplates: files}]};
    fix.detectChanges();
    expect(el).toContainText('No segments defined');
    el.query(By.css('[label="Audio Segments"] .icon-plus')).nativeElement.click();
    fix.detectChanges();
    expect(el).not.toContainText('No segments defined');
    expect(files[0].isDestroy).toEqual(false);
  });

  cit('removes a file template by destroying', (fix, el, comp) => {
    let files = [{label: 'Foo', isDestroy: false}];
    comp.series = {versionTemplates: [{fileTemplates: files}]};
    fix.detectChanges();
    el.query(By.css('[label="Audio Segments"] .icon-cancel')).nativeElement.click();
    fix.detectChanges();
    expect(el).toContainText('No segments defined');
    expect(files[0].isDestroy).toEqual(true);
  });

  cit('completely removes a new file template', (fix, el, comp) => {
    let files = [{label: 'Foo', isNew: true, unstore: () => null}];
    comp.series = {versionTemplates: [{fileTemplates: files}]};
    fix.detectChanges();
    el.query(By.css('[label="Audio Segments"] .icon-cancel')).nativeElement.click();
    fix.detectChanges();
    expect(el).toContainText('No segments defined');
    expect(files.length).toEqual(0);
  });

  cit('hides the remove button until there is a file', (fix, el, comp) => {
    let files = [{label: 'Foo', isDestroy: true}];
    comp.series = {versionTemplates: [{fileTemplates: files}]};
    fix.detectChanges();
    expect(el).not.toQuery('[label="Audio Segments"] .icon-cancel');
    files[0].isDestroy = false;
    fix.detectChanges();
    expect(el).toQuery('[label="Audio Segments"] .icon-cancel');
  });

});
