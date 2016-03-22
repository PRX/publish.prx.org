import {Injectable} from 'angular2/core';
import {Env} from '../../../util/env';

@Injectable()
export class AuthService {

  public authUrl(prompt: string = 'none') {
    let nonce = this.getNonce();
    let host = Env.AUTH_HOST;
    let client = Env.AUTH_CLIENT_ID;
    return `${host}/authorize?client_id=${client}&nonce=${nonce}&response_type=token&prompt=${prompt}`;
  }

  public parseToken(query: string = ''): string {
    var data = {};
    for (var pair of query.split('&')) {
      var parts = pair.split('=');
      data[parts[0]] = parts[1];
    }
    return data['access_token'];
  }

  private getNonce(): string {
    var nonce:string[] = [];
    for (var i = 0; i < 8; i++) {
      nonce.push(this.randomInt(0, 15).toString(16));
    }
    return nonce.join('');
  }

  private randomInt(low: number, high: number): number {
    return Math.floor(Math.random() * (high - low + 1) + low);
  }

}
