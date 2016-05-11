import {it, describe, expect} from 'angular2/testing';
import {setupComponent, buildComponent} from '../../../util/test-helper';
import {StoryFieldComponent} from './storyfield.component';

// fake container, with all @Inputs bound
import {Component} from 'angular2/core';
@Component({
  directives: [StoryFieldComponent],
  template: `
    <story-field [story]="mockStory" [name]="name" [changed]="changed" [invalid]="invalid"
      [textinput]="textinput" [textarea]="textarea" [select]="select" [label]="label"
      [invalidlabel]="invalidlabel" [small]="small" [required]="required">
      <hint *ngIf="hint">{{hint}}</hint>
      <h1 *ngIf="nested">{{nested}}</h1>
    </story-field>
  `
})
class MiniContainer {
  _changed: boolean = false;
  _invalid: boolean = false;
  mockStory: any = {
    changed: () => { return this._changed; },
    invalid: () => { return this._invalid; }
  };
}

describe('StoryFieldComponent', () => {

  setupComponent(MiniContainer);

  it('renders a blank story field', buildComponent((fix, el, mini) => {
    fix.detectChanges();
    expect(el.querySelector('.field')).not.toBeNull();;
    expect(el.querySelector('h1')).toBeNull();
    expect(el.querySelector('h3')).toBeNull();
    expect(el.querySelector('label')).toBeNull();
    expect(el.querySelector('p.hint')).toHaveText('');
  }));

  it('renders a small label', buildComponent((fix, el, mini) => {
    mini['label'] = 'small label';
    mini['small'] = true;
    fix.detectChanges();
    expect(el.querySelector('h4 label')).toHaveText('small label');
  }));

  it('renders a large label', buildComponent((fix, el, mini) => {
    mini['label'] = 'large label';
    fix.detectChanges();
    expect(el.querySelector('h3 label')).toHaveText('large label');
  }));

  it('renders a required label', buildComponent((fix, el, mini) => {
    mini['label'] = 'the label';
    fix.detectChanges();
    expect(el.querySelector('label[required]')).toBeNull();
    mini['required'] = true;
    fix.detectChanges();
    expect(el.querySelector('label[required]')).not.toBeNull();
  }));

  it('renders hint content', buildComponent((fix, el, mini) => {
    mini['hint'] = 'the hint content';
    fix.detectChanges();
    expect(el.querySelector('p.hint')).toHaveText('the hint content');
  }));

  it('renders arbitrary nested content', buildComponent((fix, el, mini) => {
    mini['nested'] = 'some nested content';
    fix.detectChanges();
    expect(el.querySelector('h1')).toHaveText('some nested content');
  }));

  it('can have a text field', buildComponent((fix, el, mini) => {
    mini.mockStory.foobar = 'some value';
    mini['name'] = 'foobar';
    mini['textinput'] = true;
    fix.detectChanges();
    let field = el.querySelector('input');
    expect(field.id).toEqual('foobar');
    expect(field['value']).toEqual('some value');
  }));

  it('can have a text area', buildComponent((fix, el, mini) => {
    mini.mockStory.foobar = 'some textarea value';
    mini['name'] = 'foobar';
    mini['textarea'] = true;
    fix.detectChanges();
    let field = el.querySelector('textarea');
    expect(field.id).toEqual('foobar');
    expect(field['value']).toEqual('some textarea value');
  }));

  it('can have a select with options', buildComponent((fix, el, mini) => {
    mini.mockStory.foobar = 'theselected';
    mini['name'] = 'foobar';
    mini['select'] = ['foo', 'bar', 'theselected'];
    fix.detectChanges();
    let field = el.querySelector('select');
    expect(field.id).toEqual('foobar');
    expect(field.querySelectorAll('option').length).toEqual(3);
  }));

  it('indicates changed fields', buildComponent((fix, el, mini) => {
    mini['name'] = 'foobar';
    fix.detectChanges();
    expect(el.querySelector('.field.changed')).toBeNull();
    mini._changed = true;
    fix.detectChanges();
    expect(el.querySelector('.field.changed')).not.toBeNull();
  }));

  it('explicitly overrides changed fieldnames', buildComponent((fix, el, mini) => {
    mini['changed'] = 'somethingelse';
    fix.detectChanges();
    expect(el.querySelector('.field.changed-explicit')).toBeNull();
    mini._changed = true;
    fix.detectChanges();
    expect(el.querySelector('.field.changed-explicit')).not.toBeNull();
  }));

  it('indicates invalid fields', buildComponent((fix, el, mini) => {
    mini['name'] = 'foobar';
    fix.detectChanges();
    expect(el.querySelector('.field.invalid')).toBeNull();
    mini._invalid = true;
    fix.detectChanges();
    expect(el.querySelector('.field.invalid')).not.toBeNull();
  }));

  it('explicitly overrides invalid fieldnames', buildComponent((fix, el, mini) => {
    mini['invalid'] = 'somethingelse';
    fix.detectChanges();
    expect(el.querySelector('.field.invalid-explicit')).toBeNull();
    mini._invalid = true;
    fix.detectChanges();
    expect(el.querySelector('.field.invalid-explicit')).not.toBeNull();
  }));

});
