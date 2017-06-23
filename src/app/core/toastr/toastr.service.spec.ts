import { Observable } from 'rxjs/Observable';
import { ToastrService, ToastrState } from './toastr.service';

describe('ToastrService', () => {

  it('shares a global state', () => {
    let toastr = new ToastrService();
    expect(toastr.state instanceof Observable).toBeTruthy();
  });

  it('creates default, info, success, and error toasts', () => {
    let toastr = new ToastrService(), theState: ToastrState;
    toastr.state.subscribe((state) => { theState = state; });

    toastr.info('eh, you might care');
    expect(theState).not.toBeNull();
    expect(theState.status).toEqual('info');
    expect(theState.message).toEqual('eh, you might care');

    toastr.success('a good thing happened');
    expect(theState).not.toBeNull();
    expect(theState.status).toEqual('success');
    expect(theState.message).toEqual('a good thing happened');

    toastr.error('a bad thing happened');
    expect(theState).not.toBeNull();
    expect(theState.status).toEqual('error');
    expect(theState.message).toEqual('a bad thing happened');

    toastr.show({message: 'whatever'});
    expect(theState).not.toBeNull();
    expect(theState.status).toBeUndefined;
    expect(theState.message).toEqual('whatever');
  });

});
