import { AuthService } from './auth.service';

fdescribe('AuthService', () => {

  let auth = new AuthService();

  it('emits tokens', () => {
    let currentToken = 'nothing';
    auth.token.subscribe((token) => { currentToken = token; });
    expect(currentToken).toEqual('nothing');
    auth.setToken(undefined);
    expect(currentToken).toBeNull();
    auth.setToken('something');
    expect(currentToken).toEqual('something');
  });

  it('replays the last token', () => {
    auth.setToken('something');
    let currentToken = 'nothing';
    auth.token.subscribe((token) => { currentToken = token; });
    expect(currentToken).toEqual('something');
  });

  it('refreshes and waits for a new token', () => {
    auth.setToken('something');

    let currentToken = 'nothing';
    let refreshToken = 'nothing';
    auth.token.subscribe(token => currentToken = token);
    auth.refreshToken().subscribe(token => refreshToken = token);
    expect(currentToken).toEqual('something');
    expect(refreshToken).toEqual('nothing');

    auth.setToken('somethingelse');
    expect(currentToken).toEqual('somethingelse');
    expect(refreshToken).toEqual('somethingelse');
  });

});
