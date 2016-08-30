import { setupComponent, buildComponent, mockService } from '../../../test-support';
import { ModalService } from './modal.service';
import { ModalComponent } from './modal.component';

const simulateKey = (key: string) => {
  let e = document.createEvent('Event');
  e['key'] = key;
  e.initEvent('keyup', true, true);
  document.dispatchEvent(e);
};

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
    expect(el.querySelector('h1').textContent).toEqual('hello');
    expect(el.querySelector('p').textContent).toEqual('world');
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
    expect(buttons[0].textContent).toEqual('foo');
    expect(buttons[1].textContent).toEqual('bar');

    spyOn(modal, 'close').and.stub();
    buttons[0]['click']();
    buttons[1]['click']();
    expect(modal.close).toHaveBeenCalledTimes(2);
  }));

  it('listens to keys when open', buildComponent((fix, el, modal) => {
    modal.shown = true;
    modal.state = {};
    fix.detectChanges();
    simulateKey('Escape');
    expect(modal.shown).toEqual(false);

    modal.shown = true;
    fix.detectChanges();
    simulateKey('Enter');
    expect(modal.shown).toEqual(false);
  }));

  it('matches the escape key to the cancel button', buildComponent((fix, el, modal) => {
    modal.shown = true;
    modal.state = {buttons: ['Cancel', 'Okay']};
    fix.detectChanges();
    spyOn(modal, 'buttonClick').and.stub();
    simulateKey('Escape');
    expect(modal.buttonClick).toHaveBeenCalledWith('Cancel');
  }));

  it('matches the enter key to the okay button', buildComponent((fix, el, modal) => {
    modal.shown = true;
    modal.state = {buttons: ['Cancel', 'Nothing', 'Ok', 'Whatever']};
    fix.detectChanges();
    spyOn(modal, 'buttonClick').and.stub();
    simulateKey('Enter');
    expect(modal.buttonClick).toHaveBeenCalledWith('Ok');
  }));

});
