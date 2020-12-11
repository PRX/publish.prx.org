import { throwError as observableThrowError, Observable } from 'rxjs';

import { HalDoc } from '../../core';
import { BaseModel, REQUIRED, UNLESS_NEW, URL, LENGTH, IN } from 'ngx-prx-styleguide';

export class FeederEpisodeModel extends BaseModel {
  // read-only
  id: string;
  publishedUrl: string;

  // writeable
  SETABLE = ['guid', 'authorName', 'authorEmail', 'episodeUrl', 'itunesType', 'summary'];
  URLS = ['episodeUrl', 'enclosureUrl'];
  guid = '';
  authorName = '';
  authorEmail = '';
  episodeUrl = '';
  enclosureUrl = '';
  itunesType = 'full';
  summary = '';

  VALIDATORS = {
    guid: [UNLESS_NEW(REQUIRED())],
    episodeUrl: [URL('Not a valid URL')],
    summary: [LENGTH(0, 4000)],
    itunesType: [IN(['full', 'trailer', 'bonus'])]
  };

  constructor(private series: HalDoc, distrib: HalDoc, episode?: HalDoc, loadRelated = true) {
    super();
    this.init(distrib, episode, loadRelated);
  }

  key() {
    if (this.doc) {
      return `prx.episode.${this.doc.id}`;
    } else if (this.series) {
      return `prx.episode.new.${this.series.id}`;
    } else {
      throw new Error('Cannot have a feeder episode outside of a series');
    }
  }

  related() {
    return {};
  }

  decode() {
    this.id = '' + (this.doc['id'] || '');
    this.guid = this.doc['guid'] || '';
    this.episodeUrl = this.doc['url'] || '';
    let author = this.doc['author'] || {};
    this.authorName = author['name'] || '';
    this.authorEmail = author['email'] || '';
    this.summary = this.doc['summary'] || '';
    this.enclosureUrl = this.doc.expand('enclosure') || '';
    this.itunesType = this.doc['itunesType'] || 'full';
  }

  encode(): {} {
    let data = <any>{};
    data.guid = this.guid || null;
    if (this.authorName || this.authorEmail) {
      data.author = {};
      if (this.authorName) {
        data.author.name = this.authorName;
      }
      if (this.authorEmail) {
        data.author.email = this.authorEmail;
      }
    } else {
      data.author = null;
    }
    data.url = this.episodeUrl || null;
    data.summary = this.summary || null;
    data.itunesType = this.itunesType || 'full';
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return observableThrowError(new Error('Cannot directly create a feeder episode'));
  }

  swapNew(newModel: FeederEpisodeModel) {
    for (let fld of this.SETABLE) {
      newModel.set(fld, this[fld]);
    }
  }
}
