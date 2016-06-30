import {Observable} from 'rxjs';
import {HalDoc} from '../../shared/cms/haldoc';
import {BaseModel} from '../../shared/model/base.model';
import {REQUIRED, LENGTH} from '../../shared/model/base.invalid';
import {AudioVersionModel} from './audio-version.model';
import {CATEGORIES, SUBCATEGORIES} from './story.categories';

export class StoryModel extends BaseModel {

  public id: number;
  public title: string;
  public shortDescription: string;
  public genre: string;
  public subGenre: string;
  public extraTags: string;
  public updatedAt: Date;
  public publishedAt: Date;
  public versions: AudioVersionModel[] = [];

  SETABLE = ['title', 'shortDescription', 'genre', 'subGenre', 'extraTags'];

  VALIDATORS = {
    title:            [REQUIRED(), LENGTH(10)],
    shortDescription: [REQUIRED(), LENGTH(10)],
    genre:            [REQUIRED()],
    subGenre:         [REQUIRED()]
  };

  constructor(series: HalDoc, story?: HalDoc, loadRelated = true) {
    super();
    this.init(series, story, loadRelated);
  }

  key() {
    if (this.doc) {
      return `prx.story.${this.doc.id}`;
    } else if (this.parent) {
      return `prx.story.new.${this.parent.id}`;
    } else {
      return 'prx.story.new';
    }
  }

  related() {
    if (this.doc) {
      return {
        versions: this.doc.followItems('prx:audio-versions').map((versions) => {
          return versions.map((vdoc) => {
            return new AudioVersionModel(this.doc, vdoc);
          });
        })
      };
    } else {
      return {
        versions: Observable.of([new AudioVersionModel()])
      };
    }
  }

  decode() {
    this.id = this.doc['id'];
    this.title = this.doc['title'] || '';
    this.shortDescription = this.doc['shortDescription'] || '';
    this.genre = this.parseGenre(this.doc['tags']) || '';
    this.subGenre = this.parseSubGenre(this.doc['tags']) || '';
    this.extraTags = this.parseExtraTags(this.doc['tags']) || '';
    this.updatedAt = new Date(this.doc['updatedAt']);
    this.publishedAt = new Date(this.doc['publishedAt']);
  }

  encode(): {} {
    let data = <any> {};
    data.title = this.title;
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
    return this.parent.create('prx:stories', {}, data);
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

}
