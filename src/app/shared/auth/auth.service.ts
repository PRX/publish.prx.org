import {Injectable} from 'angular2/core';

@Injectable()
export class AuthService {

  public host: string = 'https://id.prx.org';
  public clientId: string = 'rWeO7frPqkxmAR378PBlVwEQ0uf4F5u3Fwx8rv1D'; // publish.prx.dev/callback

  public authUrl(prompt: string = 'none') {
    let nonce = this.getNonce();
    return `${this.host}/authorize?client_id=${this.clientId}&nonce=${nonce}&response_type=token&prompt=${prompt}`;
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
