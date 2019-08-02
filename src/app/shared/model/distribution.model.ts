
import { of as observableOf, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HalDoc } from '../../core';
import { AudioVersionTemplateModel, BaseModel, BaseInvalid, REQUIRED } from 'ngx-prx-styleguide';
import { FeederPodcastModel } from './feeder-podcast.model';

const REQUIRE_IF_LOADED: BaseInvalid = (key: string, value: any): string => {
  if (value !== undefined && value.length === 0) {
    return 'You must pick at least one template';
  }
  return null;
};

export class DistributionModel extends BaseModel {

  id: number;
  kind = '';
  url = '';
  versionTemplateUrls: string[];

  // external related models
  podcast: FeederPodcastModel;
  versionTemplates: AudioVersionTemplateModel[];

  SETABLE = ['kind', 'versionTemplateUrls'];

  VALIDATORS = {
    kind: [REQUIRED()],
    versionTemplateUrls: [REQUIRE_IF_LOADED]
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
    let versionTemplates = observableOf([]);
    let podcast = observableOf(null);

    // set defaults from series for new podcasts
    if (this.isNew && this.parent) {
      podcast = this.parent.follow('prx:account').pipe(map(account => {
        let podmodel = new FeederPodcastModel(this.parent, this.doc);
        if (account && account['name']) {
          podmodel.set('authorName', account['name'], true);
        }
        if (!podmodel.link) {
          podmodel.set('link', this.parent.expand('alternate'), true);
        }
        return podmodel;
      }));
    }

    // load existing podcasts
    if (this.kind === 'podcast' && this.url) {
      podcast = this.doc.followLink({href: this.url}).pipe(map(pdoc => {
        return new FeederPodcastModel(this.parent, this.doc, pdoc);
      }));
    }

    // load existing version templates
    if (this.doc && this.doc.count('prx:audio-version-templates')) {
      versionTemplates = this.doc.followItems('prx:audio-version-templates').pipe(map(tdocs => {
        let models = tdocs.map(t => new AudioVersionTemplateModel(this.parent, t));
        this.resetVersionTemplateUrls(models);
        return models;
      }));
    }

    return {podcast, versionTemplates};
  }

  get feederPodcastId(): string {
    if (this.kind === 'podcast' && this.url) {
      return this.url.split('/').pop();
    }
  }

  decode() {
    this.id = this.doc['id'];
    this.kind = this.doc['kind'] || '';

    // TODO: cms has non-auth'd urls
    this.url = this.doc['url'] || '';
    if (this.url && !this.url.match('/authorization/')) {
      this.url = this.url.replace('/podcasts/', '/authorization/podcasts/');
    }
  }

  discard() {
    this.resetVersionTemplateUrls(this.versionTemplates);
    super.discard();
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

  private resetVersionTemplateUrls(tpls: AudioVersionTemplateModel[]) {
    if (tpls) {
      let urls = tpls.filter(t => t.doc).map(t => t.doc.expand('self'));
      let isFirstSet = !this.versionTemplateUrls;
      this.set('versionTemplateUrls', urls, isFirstSet);
    }
  }

}
