import { Observable} from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel } from './base.model';
import { REQUIRED } from './invalid';
import { FeederPodcastModel } from './feeder-podcast.model';

export class DistributionModel extends BaseModel {

  id: number;
  kind: string = '';

  // external resources -> explicitly loaded by loadExternal
  podcast: FeederPodcastModel;

  SETABLE = ['kind'];

  VALIDATORS = {
    kind: [REQUIRED()]
  };

  constructor(series: HalDoc, distrib?: HalDoc, loadRelated = true) {
    super();
    this.init(series, distrib, loadRelated);
  }

  key() {
    if (this.doc) {
      return `prx.distribution.${this.doc.id}`;
    } else if (this.parent) {
      return `prx.distribution.new.${this.parent.id}`; // new in series
    } else {
      return 'prx.distribution.new.new'; // new in new series
    }
  }

  related() {
    return {
      podcast: Observable.of(new FeederPodcastModel(this.parent, this.doc))
    };
  }

  decode() {
    this.id = this.doc['id'];
    this.kind = this.doc['kind'] || '';
  }

  encode(): {} {
    let data = <any> {};
    data.kind = this.kind;
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:distributions', {}, data);
  }

  loadExternal(): Observable<boolean> {
    if (this.kind === 'podcast' && this.doc && this.doc['url']) {
      return this.doc.followLink({href: this.doc['url']}).map(pdoc => {
        this.podcast = new FeederPodcastModel(this.parent, this.doc, pdoc);
        return true;
      });
    } else {
      return Observable.of(false);
    }
  }

}
