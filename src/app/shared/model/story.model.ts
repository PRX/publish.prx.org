import { from as observableFrom, of as observableOf, Observable } from 'rxjs';
import { map, toArray, concatAll, mergeMap } from 'rxjs/operators';
import { HalDoc } from '../../core';
import {
  BaseModel,
  REQUIRED,
  LENGTH,
  RELATIONS,
  Upload,
  AudioVersionModel,
  HasUpload,
  createGetUploads,
  createSetUploads,
  BaseInvalid
} from 'ngx-prx-styleguide';
import { ImageModel } from './image.model';
import { StoryDistributionModel } from './story-distribution.model';

const NO_UNPUBLISHING_VIA_RELEASED: BaseInvalid = (_key, val: Date, _strict, model): string => {
  const now = new Date().valueOf();
  if (val && val.valueOf() > now && model.isPublished()) {
    return 'Woh there - Dropdate cannot be in the future. Unpublish first if you really want this.';
  }
  return null;
};

const MIN = (min: number): BaseInvalid => {
  return (key: string, value: number) => {
    if (value !== undefined && value !== null && value < min) {
      return `${key} must be greater than ${min}`;
    } else {
      return null;
    }
  };
};

export class StoryModel extends BaseModel implements HasUpload {
  public id: number;
  public title: string; // show changes
  public cleanTitle: string;
  public shortDescription = '';
  public description = '';
  public productionNotes: string;
  public tags = [];
  public status: string;
  public statusMessage: string;
  public updatedAt: Date;
  public publishedAt: Date;
  public seasonNumber: number;
  public episodeNumber: number;
  public releasedAt: Date;
  public versions: AudioVersionModel[] = [];
  public images: ImageModel[] = [];
  public account: HalDoc;
  public distributions: StoryDistributionModel[] = [];

  SETABLE = [
    'title',
    'cleanTitle',
    'shortDescription',
    'description',
    'tags',
    'hasUploadMap',
    'releasedAt',
    'seasonNumber',
    'episodeNumber',
    'productionNotes'
  ];

  VALIDATORS = {
    title: [REQUIRED(true), LENGTH(1, 255)],
    cleanTitle: [LENGTH(0, 255)],
    shortDescription: [REQUIRED()],
    description: [LENGTH(0, 4000)],
    productionNotes: [LENGTH(0, 255)],
    releasedAt: [NO_UNPUBLISHING_VIA_RELEASED],
    versions: [RELATIONS('You must include at least 1 version of your audio')],
    seasonNumber: [MIN(1)],
    episodeNumber: [MIN(1)]
  };

  // HasUpload mixin
  hasUploadMap: string;
  get getUploads() {
    return createGetUploads();
  }
  get setUploads() {
    return createSetUploads();
  }

  constructor(seriesOrAccount: HalDoc, story?: HalDoc, loadRelated = true) {
    super();
    if (seriesOrAccount && seriesOrAccount.isa('series')) {
      this.init(seriesOrAccount, story, loadRelated);
    } else {
      this.account = seriesOrAccount;
      this.init(null, story, loadRelated);
    }
  }

  key() {
    if (this.doc) {
      return `prx.story.${this.doc.id}`;
    } else if (this.parent) {
      return `prx.story.new.${this.parent.id}`; // new in series
    } else {
      return 'prx.story.new'; // new standalone
    }
  }

  related() {
    let versions: Observable<AudioVersionModel[]>;
    let images: Observable<ImageModel[]>;
    let distributions = observableOf([]);

    // audio versions (with optional templates)
    if (this.doc) {
      versions = this.doc.followItems('prx:audio-versions').pipe(
        mergeMap((vdocs) => {
          return observableFrom(
            vdocs.map((vdoc) => {
              if (vdoc.has('prx:audio-version-template')) {
                return vdoc.follow('prx:audio-version-template').pipe(
                  map((tdoc) => {
                    return new AudioVersionModel({ story: this.doc, version: vdoc, template: tdoc });
                  })
                );
              } else {
                return observableOf(new AudioVersionModel({ story: this.doc, version: vdoc }));
              }
            })
          ).pipe(concatAll(), toArray());
        })
      );
    } else {
      versions = this.getSeriesTemplates().pipe(
        map((tdocs) => {
          const defaultTemplate = tdocs.find((t) => t['label'].toLowerCase().match(/default/)) || tdocs[tdocs.length - 1];
          const defaultVersion = new AudioVersionModel({ series: this.parent, template: defaultTemplate });
          defaultVersion.set('label', defaultVersion.label, true); // mark unchanged
          return [defaultVersion];
        })
      );
    }

    // image uploads
    images = this.getUploads('prx:images').pipe(
      map((idocs) => {
        let models = idocs.map((docOrUuid) => new ImageModel(this.doc, docOrUuid));
        this.setUploads(
          'prx:images',
          models.map((m) => m.uuid)
        );
        return models;
      })
    );

    // story distributions
    if (this.doc && this.doc.count('prx:distributions')) {
      distributions = this.doc.followItems('prx:distributions').pipe(
        map((ddocs) => {
          return ddocs.map((d) => new StoryDistributionModel(this.parent, this.doc, d));
        })
      );
    } else if (this.isNew && this.parent) {
      distributions = this.getSeriesDistribution('podcast').pipe(
        map((dist) => {
          if (dist) {
            let newEpisode = new StoryDistributionModel(this.parent, this.doc);
            newEpisode.set('kind', 'episode', true);
            return [newEpisode];
          } else {
            return [];
          }
        })
      );
    }

    return { images: images, versions: versions, distributions: distributions };
  }

  decode() {
    this.id = this.doc['id'];
    this.title = this.doc['title'] || '';
    this.cleanTitle = this.doc['cleanTitle'] || '';
    this.shortDescription = this.doc['shortDescription'] || '';
    this.description = this.doc['descriptionMd'] || '';
    this.productionNotes = this.doc['productionNotes'] || '';
    this.tags = this.doc['tags'];
    this.status = this.doc['status'];
    this.statusMessage = this.doc['statusMessage'];
    this.seasonNumber = parseInt(this.doc['seasonIdentifier'], 10) || null;
    this.episodeNumber = parseInt(this.doc['episodeIdentifier'], 10) || null;
    this.updatedAt = new Date(this.doc['updatedAt']);
    this.publishedAt = this.doc['publishedAt'] ? new Date(this.doc['publishedAt']) : null;
    this.releasedAt = this.doc['releasedAt'] ? new Date(this.doc['releasedAt']) : null;
  }

  encode(): {} {
    let data = <any>{};
    data.title = this.title;
    data.cleanTitle = this.cleanTitle;
    data.shortDescription = this.shortDescription;
    data.descriptionMd = this.description;
    data.productionNotes = this.productionNotes;
    data.tags = this.tags;
    data.episodeIdentifier = this.episodeNumber;
    data.seasonIdentifier = this.seasonNumber;
    data.releasedAt = this.releasedAt;
    return data;
  }

  discard(): any {
    this.loadRelated('versions', true);
    return super.discard();
  }

  saveNew(data: {}): Observable<HalDoc> {
    if (this.parent) {
      return this.parent.create('prx:stories', {}, data);
    } else {
      return this.account.create('prx:stories', {}, data);
    }
  }

  // clear status messages, as it's easier than refreshing
  saveRelated(): Observable<boolean[]> {
    if (this.changed('versions')) {
      this.status = null;
      this.statusMessage = null;
    }
    return super.saveRelated();
  }

  setPublished(published: boolean): Observable<boolean> {
    if (!published && this.doc.has('prx:unpublish')) {
      return this.doc.follow('prx:unpublish', { method: 'post' }).pipe(
        map((doc) => {
          this.init(this.parent, doc, false);
          return false;
        })
      );
    } else if (published && this.doc.has('prx:publish')) {
      return this.doc.follow('prx:publish', { method: 'post' }).pipe(
        map((doc) => {
          this.init(this.parent, doc, false);
          return true;
        })
      );
    } else {
      return observableOf(null);
    }
  }

  addImage(upload: Upload): ImageModel {
    let image = new ImageModel(this.doc, upload);
    this.images = [...this.images, image];
    this.setUploads(
      'prx:images',
      this.images.map((i) => i.uuid)
    );
    return image;
  }

  removeImage(image: ImageModel) {
    if (image.isNew) {
      this.images = this.images.filter((i) => i !== image);
    } else {
      this.images = [...this.images]; // trigger change detection
    }
    this.setUploads(
      'prx:images',
      this.images.map((i) => i.uuid)
    );
  }

  isV4(): boolean {
    return !this.doc || this.doc['appVersion'] === 'v4';
  }

  isPublished(bufferSeconds = 0): boolean {
    if (this.publishedAt) {
      return new Date().valueOf() >= this.publishedAt.valueOf() + bufferSeconds * 1000;
    } else {
      return false;
    }
  }

  getSeriesDistribution(kind: string): Observable<HalDoc> {
    if (this.parent && this.parent.count('prx:distributions')) {
      return this.parent.followItems('prx:distributions').pipe(
        map((dists) => {
          return dists.find((d) => d['kind'] === kind);
        })
      );
    } else {
      return observableOf(null);
    }
  }

  getSeriesTemplates(): Observable<HalDoc[]> {
    if (this.parent && this.parent.count('prx:audio-version-templates')) {
      return this.parent.followItems('prx:audio-version-templates');
    } else {
      return observableOf([]);
    }
  }
}
