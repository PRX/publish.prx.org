import { Observable} from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel } from './base.model';
import { REQUIRED } from './invalid';
import { FeederPodcastModel } from './feeder-podcast.model';
import { AudioVersionTemplateModel } from './audio-version-template.model';

export class DistributionModel extends BaseModel {

  id: number;
  kind: string = '';
  url: string = '';
  versionTemplateUrl: string = '';

  // external related models
  podcast: FeederPodcastModel;
  versionTemplate: AudioVersionTemplateModel;

  SETABLE = ['kind', 'versionTemplateUrl'];

  VALIDATORS = {
    kind: [REQUIRED()],
    versionTemplateUrl: [REQUIRED()]
  };

  constructor(params: {series?: HalDoc, template?: HalDoc, distribution?: HalDoc}, loadRelated = false) {
    super();
    if (params.template) {
      this.setVersionTemplate(params.template, true);
    }
    this.init(params.series, params.distribution, loadRelated); // DO NOT load related by default
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
    let versionTemplate = Observable.of(null);
    let podcast = Observable.of(null);

    // set defaults from series for new podcasts
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

    // load existing version templates
    if (this.doc && this.doc.has('prx:audio-version-template')) {
      versionTemplate = this.doc.follow('prx:audio-version-template').map(tdoc => {
        return new AudioVersionTemplateModel(this.parent, tdoc);
      });
    }

    return {podcast, versionTemplate};
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
    if (this.doc['set_audio_version_template_uri']) {
      this.versionTemplateUrl = this.doc['set_audio_version_template_uri'];
    } else if (this.doc.has('prx:audio-version-template')) {
      this.versionTemplateUrl = this.doc.expand('prx:audio-version-template');
    } else {
      this.versionTemplateUrl = '';
    }
  }

  encode(): {} {
    let data = <any> {};
    data.kind = this.kind;
    if (this.versionTemplateUrl && this.changed('versionTemplateUrl')) {
      data.set_audio_version_template_uri = this.versionTemplateUrl;
    }
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

  setVersionTemplate(tpl: HalDoc, setOriginal = false) {
    this.set('versionTemplateUrl', tpl.expand('self'), setOriginal);
  }

}
