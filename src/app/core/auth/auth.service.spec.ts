import { AuthService } from './auth.service';

describe('AuthService', () => {

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

});
