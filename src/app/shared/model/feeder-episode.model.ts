import { Observable} from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel } from './base.model';

export class FeederEpisodeModel extends BaseModel {
  id: string;
  guid: string;
  authorName: string = '';
  authorEmail: string = '';
  enclosureUrl: string = '';

  SETABLE = ['guid', 'authorName', 'authorEmail'];

  constructor(private story: HalDoc, episode: HalDoc, loadRelated = true) {
    super();
    this.init(story, episode, loadRelated);
  }

  key() {
    if (this.doc) {
      return `prx.episode.${this.doc.id}`;
    } else if (this.story) {
      return `prx.episode.new.${this.story.id}`;
    } else {
      return null;
    }
  }

  related() {
    return {};
  }

  decode() {
    // hmm, episode id is string but Haldoc id is number and making it number | string throws all kinds of errors
    this.id = '' + this.doc['id'];
    this.guid = this.doc['guid'];
    // TODO: needs to default to account if not set,
    //  should this be done here (with follow on story prx:account like with FeederPodcastModel)
    //  or where we're using this model for the story?
    if (this.doc['author']) {
      if (this.doc['author']['name']) {
        this.authorName = this.doc['author']['name'];
      }
      if (this.doc['author']['email']) {
        this.authorEmail = this.doc['author']['email'];
      }
    }

    if (this.doc['media'] && this.doc['media'].length > 0 && this.doc['media'][0]['href']) {
      this.enclosureUrl = this.doc['media'][0]['href'];
    }
  }

  encode(): {} {
    let data = <any>{};

    data.guid = this.guid || null;
    data.author = <any>{};
    data.author.name = this.authorName || null;
    data.author.email = this.authorEmail || null;

    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return Observable.throw(new Error('Cannot directly create a feeder episode'));
  }
}
