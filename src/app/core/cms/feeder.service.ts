import { Injectable } from '@angular/core';
import { HalRemote } from './halremote';
import { HalLink } from './hallink';
import { Env } from '../core.env';
import { AbstractService } from './abstract.service';

@Injectable()
export class FeederService extends AbstractService {
  protected getRoot(): void {
    this.getRemote().get(<HalLink>{href: '/api/v1'}).subscribe(
      (obj) => { this.replayRoot.next(obj); },
      (err) => { this.replayRoot.error(err); }
    );
  }

  protected getRemote(): HalRemote {
    return new HalRemote(this.http, Env.FEEDER_HOST);
  }
}
