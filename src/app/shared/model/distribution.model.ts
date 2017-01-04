import { Observable} from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel } from './base.model';
import { REQUIRED } from './invalid';
import { FeederPodcastModel } from './feeder-podcast.model';

export class DistributionModel extends BaseModel {

  id: number;
  kind: string = '';
  url: string = '';

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
    let podcast = Observable.of(null);
    if (this.isNew) {
      podcast = Observable.of(new FeederPodcastModel(this.parent, this.doc));
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

  saveRelated(): Observable<boolean[]> {
    if (this.podcast && this.podcast.isNew) {
      let oldModel = this.podcast;

      // CMS should actually have created the podcast in feeder
      return this.loadExternal().flatMap(() => {
        oldModel.copyTo(this.podcast);
        return super.saveRelated();
      });
    } else {
      return super.saveRelated();
    }
  }

  loadExternal(): Observable<boolean> {
    if (this.kind === 'podcast' && this.url) {
      return this.doc.followLink({href: this.url}).map(pdoc => {
        this.podcast = new FeederPodcastModel(this.parent, this.doc, pdoc);
        return true;
      });
    } else {
      return Observable.of(false);
    }
  }

}
