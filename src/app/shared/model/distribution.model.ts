import { Observable} from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel } from './base.model';
import { REQUIRED } from './invalid';
import { FeederPodcastModel } from './feeder-podcast.model';

export class DistributionModel extends BaseModel {

  id: number;
  kind: string = '';
  url: string = '';

  // external related models
  podcast: FeederPodcastModel;

  SETABLE = ['kind'];

  VALIDATORS = {
    kind: [REQUIRED()]
  };

  constructor(series: HalDoc, distrib?: HalDoc, loadRelated = false) {
    super();
    this.init(series, distrib, loadRelated); // DO NOT load related by default
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
    let podcast = Observable.of(null);

    // set defauls for new podcasts
    if (this.isNew && this.parent) {
      podcast = this.parent.follow('prx:account').map(account => {
        let podmodel = new FeederPodcastModel(this.parent, this.doc);
        if (account && account['name']) {
          podmodel.set('authorName', account['name'], true);
        }
        return podmodel;
      });
    }

    // load existing podcasts
    if (this.kind === 'podcast' && this.url) {
      podcast = this.doc.followLink({href: this.url}).map(pdoc => {
        return new FeederPodcastModel(this.parent, this.doc, pdoc);
      });
    }

    return {podcast: podcast};
  }

  decode() {
    this.id = this.doc['id'];
    this.kind = this.doc['kind'] || '';
    this.url = this.doc['url'] || '';
  }

  encode(): {} {
    let data = <any> {};
    data.kind = this.kind;
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:distributions', {}, data);
  }

  // swap new episode with this.url
  saveRelated(): Observable<boolean[]> {
    if (this.podcast && this.podcast.isNew && this.url) {
      let oldModel = this.podcast;
      this.loadRelated('podcast', true).subscribe((newModel: FeederPodcastModel) => {
        oldModel.copyTo(newModel);
        return super.saveRelated();
      });
    } else {
      return super.saveRelated();
    }
  }

}
