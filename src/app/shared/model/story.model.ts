import { Observable} from 'rxjs';
import { AudioVersionModel, BaseModel, HalDoc, ImageModel } from '..';
import { REQUIRED, LENGTH } from './base.invalid';
import { CATEGORIES, SUBCATEGORIES } from './story.categories';

export class StoryModel extends BaseModel {

  public id: number;
  public title: string;
  public description: string;
  public shortDescription: string;
  public genre: string;
  public subGenre: string;
  public extraTags: string;
  public updatedAt: Date;
  public publishedAt: Date;
  public versions: AudioVersionModel[] = [];
  public images: ImageModel[] = [];
  public isPublishing: boolean;
  public account: HalDoc;

  SETABLE = ['title', 'description', 'shortDescription', 'genre', 'subGenre', 'extraTags'];

  VALIDATORS = {
    title:            [REQUIRED(), LENGTH(10)],
    description:      [LENGTH(10)],
    shortDescription: [REQUIRED(), LENGTH(10)],
    genre:            [REQUIRED()],
    subGenre:         [REQUIRED()]
  };

  constructor(seriesOrAccount: HalDoc, story?: HalDoc, loadRelated = true) {
    super();
    if (seriesOrAccount.isa('series')) {
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
    if (this.doc) {
      return {
        versions: this.doc.followItems('prx:audio-versions').map((versions) => {
          return versions.map((vdoc) => {
            return new AudioVersionModel(this.parent, this.doc, vdoc);
          });
        }),
        images: this.doc.followItems('prx:images').map((images) => {
          let imageModels = images.map(idoc => new ImageModel(this.parent, this.doc, idoc));
          if (this.unsavedImage) { imageModels.push(this.unsavedImage); }
          return imageModels;
        })
      };
    } else {
      return {
        versions: Observable.of([new AudioVersionModel(this.parent)]),
        images: this.unsavedImage ? Observable.of([this.unsavedImage]) : Observable.of([])
      };
    }
  }

  decode() {
    this.id = this.doc['id'];
    this.title = this.doc['title'] || '';
    this.description = this.doc['description'] || '';
    this.shortDescription = this.doc['shortDescription'] || '';
    this.genre = this.parseGenre(this.doc['tags']) || '';
    this.subGenre = this.parseSubGenre(this.doc['tags']) || '';
    this.extraTags = this.parseExtraTags(this.doc['tags']) || '';
    this.updatedAt = new Date(this.doc['updatedAt']);
    this.publishedAt = this.doc['publishedAt'] ? new Date(this.doc['publishedAt']) : null;
  }

  encode(): {} {
    let data = <any> {};
    data.title = this.title;
    data.description = this.description;
    data.shortDescription = this.shortDescription;
    data.tags = [];
    if (this.extraTags) {
      for (let tag of this.extraTags.split(',')) {
        data.tags.push(tag.trim());
      }
    }
    if (this.genre) {
      data.tags.push(this.genre);
    }
    if (this.subGenre) {
      data.tags.push(this.subGenre);
    }
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    if (this.parent) {
      return this.parent.create('prx:stories', {}, data);
    } else {
      return this.account.create('prx:stories', {}, data);
    }
  }

  parseGenre(tags: string[] = []): string {
    return tags.find((val) => {
      return CATEGORIES.indexOf(val) > -1;
    });
  }

  parseSubGenre(tags: string[] = []): string {
    let genre = this.parseGenre(tags);
    if (genre && SUBCATEGORIES[genre]) {
      return tags.find((val) => {
        return SUBCATEGORIES[genre].indexOf(val) > -1;
      });
    }
  }

  parseExtraTags(tags: string[] = []): string {
    return tags.filter((val) => {
      for (let cat of CATEGORIES) {
        if (cat === val) { return false; }
      }
      for (let key of Object.keys(SUBCATEGORIES)) {
        for (let subcat of SUBCATEGORIES[key]) {
          if (subcat === val) { return false; }
        }
      }
      return true;
    }).join(', ') || undefined;
  }

  setPublished(published: boolean): Observable<boolean> {
    if (!published && this.doc.has('prx:unpublish')) {
      this.isPublishing = true;
      return this.doc.follow('prx:unpublish', {method: 'post'}).map(doc => {
        this.init(this.parent, doc, false);
        this.isPublishing = false;
        return false;
      });
    } else if (published && this.doc.has('prx:publish')) {
      this.isPublishing = true;
      return this.doc.follow('prx:publish', {method: 'post'}).map(doc => {
        this.init(this.parent, doc, false);
        this.isPublishing = false;
        return true;
      });
    } else {
      return Observable.of(null);
    }
  }

  get unsavedImage(): ImageModel {
    let img = new ImageModel(this.parent, this.doc, null);
    return img.isStored() && !img.isDestroy ? img : null;
  }

}
