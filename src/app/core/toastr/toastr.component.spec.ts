import { cit, create, provide, By } from '../../../testing';
import { ToastrService } from './toastr.service';
import { ToastrComponent } from './toastr.component';

const simulateKey = (key: string) => {
  let e = document.createEvent('Event');
  e['key'] = key;
  e.initEvent('keydown', true, true);
  document.dispatchEvent(e);
};

describe('ToastrComponent', () => {

  create(ToastrComponent);

  provide(ToastrService);

  cit('defaults to hidden', (fix, el, comp) => {
    expect(el).not.toQueryAttr('div', 'class', 'show');
  });

  cit('shows message', (fix, el, comp) => {
    comp.shown = true;
    comp.toastMessage = 'something happened';
    comp.status = '';
    fix.detectChanges();
    expect(el).toQueryAttr('div', 'class', 'show');
    expect(el).toQueryText('div', 'something happened');
  });

  cit('shows info/success/error status', (fix, el, comp) => {
    comp.status = 'info';
    fix.detectChanges();
    expect(el).toQueryAttr('div', 'class', 'info');
    comp.status = 'success';
    fix.detectChanges();
    expect(el).toQueryAttr('div', 'class', 'success');
    comp.status = 'error';
    fix.detectChanges();
    expect(el).toQueryAttr('div', 'class', 'error');
    fix.detectChanges();
  });

  cit('closes with Esc', (fix, el, comp) => {
    comp.shown = true;
    comp.state = {};
    fix.detectChanges();
    simulateKey('Escape');
    expect(comp.shown).toEqual(false);
  });

});
