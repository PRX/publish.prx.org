import { cit, contain, By } from '../../../testing';
import { FancyFieldComponent } from './fancy-field.component';

describe('FancyFieldComponent', () => {

  contain(FancyFieldComponent, {
    template: `
      <publish-fancy-field [model]="model" [name]="name" [changed]="changed" [invalid]="invalid"
        [textinput]="textinput" [textarea]="textarea" [select]="select" [label]="label"
        [invalidlabel]="invalidlabel" [small]="small" [required]="required">
        <div class="fancy-hint" *ngIf="hint">{{hint}}</div>
        <h1 *ngIf="nested">{{nested}}</h1>
      </publish-fancy-field>
    `
  });

  cit('renders a blank story field', (fix, el, comp) => {
    expect(el).toQuery('.field');
    expect(el).not.toQuery('h1');
    expect(el).not.toQuery('h3');
    expect(el).not.toQuery('label');
    expect(el).toQueryText('p.hint', '');
  });

  cit('renders a small label', (fix, el, comp) => {
    comp.label = 'small label';
    comp.small = true;
    fix.detectChanges();
    expect(el).toQueryText('h4 label', 'small label');
  });

  cit('renders a large label', (fix, el, comp) => {
    comp.label = 'large label';
    fix.detectChanges();
    expect(el).toQueryText('h3 label', 'large label');
  });

  cit('renders a required label', (fix, el, comp) => {
    comp.label = 'the label';
    fix.detectChanges();
    expect(el).not.toQuery('label[required]');
    comp.required = true;
    fix.detectChanges();
    expect(el).toQuery('label[required]');
  });

  cit('renders hint content', (fix, el, comp) => {
    comp.hint = 'the hint content';
    fix.detectChanges();
    expect(el).toQueryText('p.hint', 'the hint content');
  });

  cit('renders arbitrary nested content', (fix, el, comp) => {
    comp.nested = 'some nested content';
    fix.detectChanges();
    expect(el).toQueryText('h1', 'some nested content');
  });

  cit('can have a text field', (fix, el, comp) => {
    comp.model = {foobar: 'some value', changed: () => false, invalid: () => false};
    comp.name = 'foobar';
    comp.textinput = true;
    fix.detectChanges();
    expect(el).toQueryAttr('input', 'id', 'foobar');
    expect(el).toQueryAttr('input', 'value', 'some value');
  });

  cit('can have a text area', (fix, el, comp) => {
    comp.model = {foobar: 'some textarea value', changed: () => false, invalid: () => false};
    comp.name = 'foobar';
    comp.textarea = true;
    fix.detectChanges();
    expect(el).toQueryAttr('textarea', 'id', 'foobar');
    expect(el).toQueryAttr('textarea', 'value', 'some textarea value');
  });

  cit('can have a select with options', (fix, el, comp) => {
    comp.model = {foobar: 'theselected', changed: () => false, invalid: () => false};
    comp.name = 'foobar';
    comp.select = ['foo', 'bar', 'theselected'];
    fix.detectChanges();
    expect(el).toQueryAttr('select', 'id', 'foobar');
    expect(el.queryAll(By.css('option')).length).toEqual(3);
  });

  cit('indicates changed fields', (fix, el, comp) => {
    let isChanged = false;
    comp.model = {changed: () => isChanged, invalid: () => false};
    comp.name = 'foobar';
    fix.detectChanges();
    expect(el).not.toQuery('.field.changed');
    isChanged = true;
    fix.detectChanges();
    expect(el).toQuery('.field.changed');
  });

  cit('explicitly overrides changed fieldnames', (fix, el, comp) => {
    comp.model = {changed: (fld) => fld === 'somethingelse', invalid: () => false};
    fix.detectChanges();
    expect(el).not.toQuery('.field.changed-explicit');
    comp.changed = 'somethingelse';
    fix.detectChanges();
    expect(el).toQuery('.field.changed-explicit');
  });

  cit('indicates invalid fields', (fix, el, comp) => {
    let isInvalid = false;
    comp.model = {changed: () => false, invalid: () => isInvalid};
    comp.name = 'foobar';
    fix.detectChanges();
    expect(el).not.toQuery('.field.invalid');
    isInvalid = true;
    fix.detectChanges();
    expect(el).toQuery('.field.invalid');
  });

  cit('explicitly overrides invalid fieldnames', (fix, el, comp) => {
    comp.model = {changed: false, invalid: (fld) => fld === 'somethingelse'};
    fix.detectChanges();
    expect(el).not.toQuery('.field.invalid-explicit');
    comp.invalid = 'somethingelse';
    fix.detectChanges();
    expect(el).toQuery('.field.invalid-explicit');
  });

});
