import {it, describe, expect} from 'angular2/testing';
import {AuthService} from './auth.service';

describe('AuthService', () => {

  let auth = new AuthService();

  describe('authUrl', () => {

    it('generates unique nonces', () => {
      let url1 = auth.authUrl();
      let url2 = auth.authUrl();
      expect(url1).not.toEqual(url2);
      expect(url1.replace(/nonce=\w+/, '')).toEqual(url2.replace(/nonce=\w+/, ''));
    });

    it('inserts a prompt string', () => {
      expect(auth.authUrl()).toMatch('prompt=none');
      expect(auth.authUrl('foobar')).toMatch('prompt=foobar');
    });

    it('asks for a token', () => {
      expect(auth.authUrl()).toMatch('response_type=token');
    });

  });

  describe('parseToken', () => {

    it('parses url params', () => {
      expect(auth.parseToken('toke=n&access_token=foobar&hello')).toEqual('foobar');
    });

    it('gives undefined for invalid strings', () => {
      expect(auth.parseToken('oetu7&&94ho=8&')).toBeUndefined();
    });

    it('handles blank input', () => {
      expect(auth.parseToken('')).toBeUndefined();
    });

  });

});
