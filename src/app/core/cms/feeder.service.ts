import { Injectable } from '@angular/core';
import { HalBaseService } from 'ngx-prx-styleguide';
import { Env } from '../core.env';

@Injectable()
export class FeederService extends HalBaseService {

  get host(): string {
    return 'feeder.prx.org'; // TODO
  }

  get path(): string {
    return '/api/v1';
  }

  get ttl(): number {
    return Env.CMS_TTL;
  }

}
