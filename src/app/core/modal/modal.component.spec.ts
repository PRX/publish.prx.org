import { cit, create, provide, By } from '../../../testing';
import { ModalService } from './modal.service';
import { ModalComponent } from './modal.component';

const simulateKey = (key: string) => {
  let e = document.createEvent('Event');
  e['key'] = key;
  e.initEvent('keydown', true, true);
  document.dispatchEvent(e);
};

describe('ModalComponent', () => {

  create(ModalComponent);

  provide(ModalService);

  cit('defaults to hidden', (fix, el, comp) => {
    expect(el.query(By.css('.overlay'))).toBeNull();
    expect(el.query(By.css('.modal'))).toBeNull();
  });

  cit('shows title and body info', (fix, el, comp) => {
    comp.shown = true;
    comp.state = {title: 'hello', body: 'world'};
    fix.detectChanges();
    expect(el).toQueryText('h1', 'hello');
    expect(el).toQueryText('section', 'world');
  });

  cit('shows a close button', (fix, el, comp) => {
    comp.shown = true;
    comp.state = {};
    fix.detectChanges();
    let close = el.query(By.css('button.close'));
    expect(close).not.toBeNull();
    spyOn(comp, 'close').and.stub();
    close.nativeElement.click();
    expect(comp.close).toHaveBeenCalled();
  });

  cit('shows footer buttons', (fix, el, comp) => {
    comp.shown = true;
    comp.state = {buttons: ['foo', 'bar']};
    fix.detectChanges();
    expect(el.query(By.css('button.close'))).toBeNull();
    let buttons = el.queryAll(By.css('footer button'));
    expect(buttons.length).toEqual(2);
    expect(buttons[0]).toHaveText('foo');
    expect(buttons[1]).toHaveText('bar');

    spyOn(comp, 'close').and.stub();
    buttons[0].nativeElement.click();
    buttons[1].nativeElement.click();
    expect(comp.close).toHaveBeenCalledTimes(2);
  });

  cit('listens to keys when open', (fix, el, comp) => {
    comp.shown = true;
    comp.state = {};
    fix.detectChanges();
    simulateKey('Escape');
    expect(comp.shown).toEqual(false);

    comp.shown = true;
    fix.detectChanges();
    simulateKey('Enter');
    expect(comp.shown).toEqual(false);
  });

  cit('matches the escape key to the cancel button', (fix, el, comp) => {
    comp.shown = true;
    comp.state = {buttons: ['Cancel', 'Okay']};
    fix.detectChanges();
    spyOn(comp, 'buttonClick').and.stub();
    simulateKey('Escape');
    expect(comp.buttonClick).toHaveBeenCalledWith('Cancel');
  });

  cit('matches the enter key to the okay button', (fix, el, comp) => {
    comp.shown = true;
    comp.state = {buttons: ['Cancel', 'Nothing', 'Ok', 'Whatever']};
    fix.detectChanges();
    spyOn(comp, 'buttonClick').and.stub();
    simulateKey('Enter');
    expect(comp.buttonClick).toHaveBeenCalledWith('Ok');
  });

});
