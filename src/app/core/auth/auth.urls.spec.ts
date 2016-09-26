import { AuthUrls } from './auth.urls';

describe('AuthUrls', () => {

  describe('buildUrl', () => {

    it('generates unique nonces', () => {
      let url1 = AuthUrls.buildUrl();
      let url2 = AuthUrls.buildUrl();
      expect(url1).not.toEqual(url2);
      expect(url1.replace(/nonce=\w+/, '')).toEqual(url2.replace(/nonce=\w+/, ''));
    });

    it('inserts a prompt string', () => {
      expect(AuthUrls.buildUrl()).toMatch('prompt=none');
      expect(AuthUrls.buildUrl('foobar')).toMatch('prompt=foobar');
    });

    it('asks for a token', () => {
      expect(AuthUrls.buildUrl()).toMatch('response_type=token');
    });

  });

  describe('parseToken', () => {

    it('parses url params', () => {
      expect(AuthUrls.parseToken('toke=n&access_token=foobar&hello')).toEqual('foobar');
    });

    it('gives undefined for invalid strings', () => {
      expect(AuthUrls.parseToken('oetu7&&94ho=8&')).toBeUndefined();
    });

    it('handles blank input', () => {
      expect(AuthUrls.parseToken('')).toBeUndefined();
    });

  });

});
