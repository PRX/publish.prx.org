import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import { HalDoc } from '../../core';
import { BaseModel } from 'ngx-prx-styleguide';
import { REQUIRED } from './invalid';
import { FeederPodcastModel } from './feeder-podcast.model';
import { AudioVersionTemplateModel } from './audio-version-template.model';

export class DistributionModel extends BaseModel {

  id: number;
  kind = '';
  url = '';
  versionTemplateUrls = [];

  // external related models
  podcast: FeederPodcastModel;
  versionTemplates: AudioVersionTemplateModel[];

  SETABLE = ['kind', 'versionTemplateUrls'];

  VALIDATORS = {
    kind: [REQUIRED()],
    versionTemplateUrls: [REQUIRED()]
  };

  constructor(series: HalDoc, distribution?: HalDoc, loadRelated = false) {
    super();
    this.init(series, distribution, loadRelated); // DO NOT load related by default
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
    let versionTemplates = Observable.of([]);
    let podcast = Observable.of(null);

    // set defaults from series for new podcasts
    if (this.isNew && this.parent) {
      podcast = this.parent.follow('prx:account').map(account => {
        let podmodel = new FeederPodcastModel(this.parent, this.doc);
        if (account && account['name']) {
          podmodel.set('authorName', account['name'], true);
        }
        if (!podmodel.link) {
          podmodel.set('link', this.parent.expand('alternate'), true);
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

    // load existing version templates
    if (this.doc && this.doc.count('prx:audio-version-templates')) {
      versionTemplates = this.doc.followItems('prx:audio-version-templates').map(tdocs => {
        return tdocs.map(t => new AudioVersionTemplateModel(this.parent, t));
      });
    } else if (this.doc && this.doc.has('prx:audio-version-template')) {
      versionTemplates = this.doc.follow('prx:audio-version-template').map(tdoc => {
        return [new AudioVersionTemplateModel(this.parent, tdoc)];
      });
    }

    return {podcast, versionTemplates};
  }

  decode() {
    this.id = this.doc['id'];
    this.kind = this.doc['kind'] || '';

    // TODO: cms has non-auth'd urls
    this.url = this.doc['url'] || '';
    if (this.url && !this.url.match('/authorization/')) {
      this.url = this.url.replace('/podcasts/', '/authorization/podcasts/');
    }

    // TODO: since a PUT returns no data, underscored key is set on callback
    if (this.doc['set_audio_version_template_uris']) {
      this.versionTemplateUrls = this.doc['set_audio_version_template_uris'];
    } else if (this.doc.count('prx:audio-version-templates')) {
      this.versionTemplateUrls = []; // TODO: how to get this syncronously???
    } else if (this.doc.has('prx:audio-version-template')) {
      this.versionTemplateUrls = [this.doc.expand('prx:audio-version-template')];
    } else {
      this.versionTemplateUrls = [];
    }
  }

  encode(): {} {
    let data = <any> {};
    data.kind = this.kind;
    if (this.isNew || this.changed('versionTemplateUrls')) {
      data.set_audio_version_template_uris = this.versionTemplateUrls;
    }
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:distributions', {}, data);
  }

}
