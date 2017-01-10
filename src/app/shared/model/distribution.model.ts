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

  // external related models
  podcast: FeederPodcastModel;
  versionTemplate: AudioVersionTemplateModel;

  SETABLE = ['kind'];

  VALIDATORS = {
    kind: [REQUIRED()]
  };

  constructor(params: {series: HalDoc, template?: HalDoc, distribution?: HalDoc}, loadRelated = false) {
    super();
    if (params.template) {
      this.versionTemplate = new AudioVersionTemplateModel(params.series, params.template, loadRelated);
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
    this.url = this.doc['url'] || '';
  }

  encode(): {} {
    let data = <any> {};
    data.kind = this.kind;
    if (this.isNew && this.versionTemplate) {
      data.set_audio_version_template_uri = this.versionTemplate.doc.expand('self');
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

}
