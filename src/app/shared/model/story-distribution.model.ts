
import {of as observableOf,  Observable } from 'rxjs';

import {map} from 'rxjs/operators';


import { HalDoc } from '../../core';
import { BaseModel } from 'ngx-prx-styleguide';
import { REQUIRED } from './invalid';
import { FeederEpisodeModel } from './feeder-episode.model';

export class StoryDistributionModel extends BaseModel {

  id: number;
  kind = '';
  url = '';

  // external related models
  episode: FeederEpisodeModel;

  SETABLE = ['kind'];

  VALIDATORS = {
    kind: [REQUIRED()]
  };

  constructor(private series: HalDoc, story: HalDoc, storyDistribution?: HalDoc, loadRelated = false) {
    super();
    this.init(story, storyDistribution, loadRelated); // DO NOT load related by default
  }

  key() {
    if (this.doc) {
      return `prx.story.distribution.${this.doc.id}`;
    } else if (this.series) {
      return `prx.story.distribution.new.${this.series.id}`;
    } else {
      throw new Error('Cannot have a story-distribution outside of a series');
    }
  }

  related() {
    let episode = observableOf(null);
    if (this.isNew) {
      episode = observableOf(new FeederEpisodeModel(this.series, this.doc));
    } else if (this.url) {
      episode = this.doc.followLink({href: this.url}).pipe(map(edoc => {
        return new FeederEpisodeModel(this.series, this.doc, edoc);
      }));
    }
    return {episode: episode};
  }

  decode() {
    this.id = this.doc['id'];
    this.kind = this.doc['kind'] || '';

    // TODO: cms has non-auth'd urls
    this.url = this.doc['url'] || '';
    if (this.url && !this.url.match('/authorization/')) {
      this.url = this.url.replace('/episodes/', '/authorization/episodes/');
    }
  }

  encode(): {} {
    let data = <any> {};
    data.kind = this.kind;
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    throw new Error('Cannot directly create a story distribution');
  }

  swapNew(newModel: StoryDistributionModel) {
    newModel.episode = this.episode;
  }

}
