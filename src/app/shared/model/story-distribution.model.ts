import { Observable} from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel } from './base.model';
import { REQUIRED } from './invalid';
import { FeederEpisodeModel } from './feeder-episode.model';

export class StoryDistributionModel extends BaseModel {

  id: number;
  kind: string = '';
  url: string = '';

  // external related models
  episode: FeederEpisodeModel;

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
      return `prx.story.distribution.${this.doc.id}`;
    } else if (this.parent) {
      return `prx.story.distribution.new.${this.parent.id}`; // new in story
    } else {
      return 'prx.story.distribution.new.new'; // new in new story
    }
  }

  related() {
    let episode = Observable.of(null);
    if (this.isNew) {
      episode = Observable.of(new FeederEpisodeModel(this.parent, this.doc));
    } else if (this.url) {
      episode = this.doc.followLink({href: this.url}).map(edoc => {
        return new FeederEpisodeModel(this.parent, this.doc, edoc);
      });
    }
    return {episode: episode};
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
    throw new Error('Cannot directly create an episode distribution');
  }

  // swap new episode with this.url
  saveRelated(): Observable<boolean[]> {
    if (this.episode && this.episode.isNew && this.url) {
      let oldModel = this.episode;
      this.loadRelated('episode', true).subscribe((newModel: FeederEpisodeModel) => {
        oldModel.copyTo(newModel);
        return super.saveRelated();
      });
    } else {
      return super.saveRelated();
    }
  }

}
