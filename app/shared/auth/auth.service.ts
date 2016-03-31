import {Injectable} from 'angular2/core';
import {Env} from '../../../config/env';

@Injectable()
export class AuthService {

  public authUrl(prompt = 'none') {
    let url = `${Env.AUTH_HOST}/authorize?client_id=${Env.AUTH_CLIENT_ID}`;
    let nonce = this.getNonce();
    return `${url}&nonce=${nonce}&response_type=token&prompt=${prompt}`;
  }

  public parseToken(query = ''): string {
    let data = {};
    for (let pair of query.split('&')) {
      let parts = pair.split('=');
      data[parts[0]] = parts[1];
    }
    return data['access_token'];
  }

  private getNonce(): string {
    let nonce: string[] = [];
    for (let i = 0; i < 8; i++) {
      nonce.push(this.randomInt(0, 15).toString(16));
    }
    return nonce.join('');
  }

  private randomInt(low: number, high: number): number {
    return Math.floor(Math.random() * (high - low + 1) + low);
  }

}
