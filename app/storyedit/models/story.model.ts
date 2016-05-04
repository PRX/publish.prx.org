import {Observable} from 'rxjs';
import {CmsService} from '../../shared/cms/cms.service';
import {HalDoc} from '../../shared/cms/haldoc';
import {StoryChanged} from './story.changed';
import {StoryInvalid} from './story.invalid';
import {CATEGORIES, SUBCATEGORIES} from './story.categories';

export class StoryModel {

  public isSaving: boolean = false;
  public isLoaded: boolean = false;
  public isNew: boolean = false;

  // attributes
  public id: number;
  public title: string;
  public shortDescription: string;
  public genre: string;
  public subGenre: string;
  public extraTags: string;
  public updatedAt: Date;
  public publishedAt: Date;

  public changed: StoryChanged = new StoryChanged();
  public invalid: StoryInvalid = new StoryInvalid();

  public doc: HalDoc;
  public defaultAccount: HalDoc;

  constructor(cms: CmsService, id?: string) {
    if (this.isLoaded) { return; } // hotreload bug
    if (id) {
      this.isNew = false;
      cms.follow('prx:authorization').follow('prx:story', {id: id}).subscribe((doc) => {
        this.setDoc(doc);
        this.isLoaded = true;
      });
    } else {
      this.isNew = true;
      cms.follow('prx:authorization').follow('prx:default-account').subscribe((doc) => {
        this.defaultAccount = doc;
        this.setDoc(<HalDoc> {});
        this.isLoaded = true;
      });
    }
  }

  setDoc(doc: HalDoc): void {
    this.doc = doc;
    this.id = doc['id'];
    this.title = doc['title'] || '';
    this.shortDescription = doc['shortDescription'] || '';
    this.genre = this.parseGenre(doc['tags']) || '';
    this.subGenre = this.parseSubGenre(doc['tags']) || '';
    this.extraTags = this.parseExtraTags(doc['tags']) || '';
    this.updatedAt = new Date(doc['updatedAt']);
    this.publishedAt = new Date(doc['publishedAt']);

    // pass data to changed/invalid modules
    this.changed = new StoryChanged(this);
    this.invalid = new StoryInvalid(this);
  }

  set(key: string, value: any) {
    this[key] = value;
    this.changed.set(key, value);
    this.invalid.set(key, value);
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

  toJSON(): {} {
    let data = {};
    data['title'] = this.title;
    data['shortDescription'] = this.shortDescription;
    data['tags'] = [];
    if (this.extraTags) {
      for (let tag of this.extraTags.split(',')) {
        data['tags'].push(tag.trim());
      }
    }
    if (this.genre) {
      data['tags'].push(this.genre);
    }
    if (this.subGenre) {
      data['tags'].push(this.subGenre);
    }
    return data;
  }

  save(): Observable<boolean> {
    this.isSaving = true;
    if (this.isNew) {
      return this.defaultAccount.create('prx:stories', {}, this.toJSON()).map((doc) => {
        this.setDoc(doc);
        this.isSaving = false;
        this.isNew = false;
        return true; // was new
      });
    } else {
      return this.doc.update(this.toJSON()).map((doc) => {
        doc['updatedAt'] = new Date(); // Mock-update the timestamp
        this.setDoc(doc);
        this.isSaving = false;
        return false; // was old
      });
    }
  }

  destroy(): Observable<boolean> {
    this.isSaving = true;
    return this.doc.destroy().map(() => {
      this.isSaving = false;
      return true;
    });
  }

}
