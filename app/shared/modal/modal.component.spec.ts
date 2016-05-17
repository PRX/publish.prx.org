import {it, describe, expect} from 'angular2/testing';
import {setupComponent, buildComponent, mockService} from '../../../util/test-helper';
import {ModalService} from './modal.service';
import {ModalComponent} from './modal.component';

describe('ModalComponent', () => {

  setupComponent(ModalComponent);

  mockService(ModalService, {state: {subscribe: () => { return; }}});

  it('defaults to hidden', buildComponent((fix, el, modal) => {
    fix.detectChanges();
    expect(el.querySelector('.overlay')).toBeNull();
    expect(el.querySelector('.modal')).toBeNull();
  }));

  it('shows title and body info', buildComponent((fix, el, modal) => {
    modal.shown = true;
    modal.state = {title: 'hello', body: 'world'};
    fix.detectChanges();
    expect(el.querySelector('h1')).toHaveText('hello');
    expect(el.querySelector('p')).toHaveText('world');
  }));

  it('shows a close button', buildComponent((fix, el, modal) => {
    modal.shown = true;
    modal.state = {};
    fix.detectChanges();
    let close = el.querySelector('button.close');
    expect(close).not.toBeNull();
    spyOn(modal, 'close').and.stub();
    close['click']();
    expect(modal.close).toHaveBeenCalled();
  }));

  it('shows footer buttons', buildComponent((fix, el, modal) => {
    modal.shown = true;
    modal.state = {buttons: ['foo', 'bar']};
    fix.detectChanges();
    expect(el.querySelector('button.close')).toBeNull();
    let buttons = el.querySelectorAll('footer button');
    expect(buttons.length).toEqual(2);
    expect(buttons[0]).toHaveText('foo');
    expect(buttons[1]).toHaveText('bar');

    spyOn(modal, 'close').and.stub();
    buttons[0]['click']();
    buttons[1]['click']();
    expect(modal.close).toHaveBeenCalledTimes(2);
  }));

});
