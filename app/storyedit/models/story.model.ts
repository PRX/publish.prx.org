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

  constructor(story?: HalDoc) {
    super();
    this.init(story);
  }

  key(doc: HalDoc) {
    if (doc) {
      return `prx.story.${doc['id']}`;
    } else {
      return `prx.story.new`;
    }
  }

  related(doc: HalDoc) {
    let rels = <any> {};
    if (doc) {
      rels.versions = doc.followItems('prx:audio-versions').map((versions) => {
        return versions.map((vdoc) => {
          return new AudioVersionModel(doc, vdoc);
        });
      });
    }
    return rels;
  }

  decode(doc: HalDoc) {
    this.id = doc['id'];
    this.title = doc['title'] || '';
    this.shortDescription = doc['shortDescription'] || '';
    this.genre = this.parseGenre(doc['tags']) || '';
    this.subGenre = this.parseSubGenre(doc['tags']) || '';
    this.extraTags = this.parseExtraTags(doc['tags']) || '';
    this.updatedAt = new Date(doc['updatedAt']);
    this.publishedAt = new Date(doc['publishedAt']);
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
    alert('saveNew story');
    return null;
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
