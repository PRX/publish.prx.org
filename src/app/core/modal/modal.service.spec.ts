import { Observable } from 'rxjs';
import { ModalService, ModalState } from './modal.service';

const fakeSanitizer: any = {
  bypassSecurityTrustHtml: (s: string) => `<sanitized>${s}</sanitized>`
};

describe('ModalService', () => {

  it('shares a global modal state', () => {
    let modal = new ModalService(fakeSanitizer);
    expect(modal.state instanceof Observable).toBeTruthy();
  });

  it('creates alert dialogs', () => {
    let modal = new ModalService(fakeSanitizer), theState: ModalState;
    modal.state.subscribe((state) => { theState = state; });

    modal.alert('hello', 'world');
    modal.alert('foobar');
    expect(theState).not.toBeNull();
    expect(theState.hide).toBeFalsy();
    expect(theState.title).toEqual('foobar');
    expect(theState.body).toBeUndefined();
  });

  it('creates input prompts', () => {
    let modal = new ModalService(fakeSanitizer), theState: ModalState;
    modal.state.subscribe((state) => {
      theState = state;
      expect(state.title).toEqual('hello');
      expect(state.body).toEqual('<sanitized><p><a href="blah">world</a></p></sanitized>');
      theState.buttonCallback('Okay');
    });

    let callbacked = false;
    modal.prompt('hello', '<a href="blah">world</a>', (okay: boolean) => {
      callbacked = true;
      expect(okay).toEqual(true);
    });
    expect(callbacked).toBeTruthy();
  });

});
