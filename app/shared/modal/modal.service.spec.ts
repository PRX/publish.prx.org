import {it, describe, expect} from '@angular/core/testing';
import {ModalService, ModalState} from './modal.service';
import {Observable} from 'rxjs';

describe('ModalService', () => {

  it('shares a global modal state', () => {
    let modal = new ModalService();
    expect(modal.state).toBeAnInstanceOf(Observable);
  });

  it('creates alert dialogs', () => {
    let modal = new ModalService(), theState: ModalState;
    modal.state.subscribe((state) => { theState = state; });

    modal.alert('hello', 'world');
    modal.alert('foobar');
    expect(theState).not.toBeNull();
    expect(theState.hide).toBeFalsy();
    expect(theState.title).toEqual('foobar');
    expect(theState.body).toBeUndefined();
  });

  it('creates input prompts', () => {
    let modal = new ModalService(), theState: ModalState;
    modal.state.subscribe((state) => {
      theState = state;
      expect(state.title).toEqual('hello');
      expect(state.body).toEqual('world');
      theState.buttonCallback('Okay');
    });

    let callbacked = false;
    modal.prompt('hello', 'world', (okay: boolean) => {
      callbacked = true;
      expect(okay).toEqual(true);
    });
    expect(callbacked).toBeTruthy();
  });

});
