import { cit, create, stubPipe, By } from '../../testing';
import { UploadComponent } from './upload.component';

describe('UploadComponent', () => {

  create(UploadComponent, false);

  stubPipe('capitalize');

  const mockVersion = (data: any = {}): any => {
    return {
      label: data.label || '',
      hasFileTemplates: data.filesAndTemplates || false,
      files: data.files || [],
      filesAndTemplates: data.filesAndTemplates || [],
      invalid: data.invalid || (() => data.invalid),
      changed: data.changed || (() => data.changed),
      status: data.status,
      statusMessage: data.statusMessage
    };
  };

  cit('renders a default description', (fix, el, comp) => {
    comp.version = mockVersion({label: 'My Label'});
    fix.detectChanges();
    expect(el).toQueryText('header strong', 'My Label');
    expect(el).toQueryText('header span', comp.DESCRIPTIONS.DEFAULT);
  });

  cit('lists templated uploads', (fix, el, comp) => {
    let fts = [{file: true, tpl: true}, {file: true, tpl: true}];
    comp.version = mockVersion({filesAndTemplates: fts});
    fix.detectChanges();
    expect(el.queryAll(By.css('publish-templated-upload')).length).toEqual(2);
  });

  cit('lists extra/illegal templated uploads', (fix, el, comp) => {
    let fts = [{file: true, tpl: true}, {file: true, tpl: false}];
    comp.version = mockVersion({filesAndTemplates: fts});
    fix.detectChanges();
    expect(el.queryAll(By.css('publish-templated-upload')).length).toEqual(1);
    expect(el.queryAll(By.css('publish-illegal-upload')).length).toEqual(1);
  });

  cit('lists free uploads', (fix, el, comp) => {
    comp.version = mockVersion({files: [{}, {}, {}]});
    fix.detectChanges();
    expect(el.queryAll(By.css('publish-free-upload')).length).toEqual(3);
  });

  cit('shows invalid state and message', (fix, el, comp) => {
    comp.version = mockVersion({
      changed: () => true,
      invalid: (fld) => fld === 'self' && 'Something something something'
    });
    fix.detectChanges();
    expect(el.nativeElement.className).toContain('invalid');
    expect(el).toContainText('Something something something');
  });

  cit('shows remote status messages', (fix, el, comp) => {
    let isChanged = true;
    let invalid = 'Local invalid';
    comp.version = mockVersion({
      changed: () => isChanged,
      invalid: (fld) => fld === 'self' && invalid,
      status: 'invalid',
      statusMessage: 'Remote invalid'
    });
    fix.detectChanges();
    expect(el).toContainText('Local invalid');

    invalid = null;
    fix.detectChanges();
    expect(el).not.toContainText('Local invalid');

    isChanged = false;
    fix.detectChanges();
    expect(el).toContainText('Remote invalid');
  });

});
