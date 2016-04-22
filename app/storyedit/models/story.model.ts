import {Observable} from 'rxjs';
import {CmsService} from '../../shared/cms/cms.service';
import {HalDoc} from '../../shared/cms/haldoc';
import {CATEGORIES, SUBCATEGORIES} from './story.categories';

export class StoryModel {

  isLoaded: boolean = false;
  isNew: boolean;

  // attributes
  id: number;
  title: string;
  shortDescription: string;
  genre: string;
  subGenre: string;
  extraTags: string;
  updatedAt: Date;
  publishedAt: Date;

  private doc: HalDoc;
  private defaultAccount: HalDoc;
  private initialValues = {};

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
        this.isLoaded = true;
      });
    }
  }

  setDoc(doc: HalDoc): void {
    this.doc = doc;
    this.initialValues = {
      id: doc['id'],
      title: doc['title'],
      shortDescription: doc['shortDescription'],
      genre: this.parseGenre(doc['tags']),
      subGenre: this.parseSubGenre(doc['tags']),
      extraTags: this.parseExtraTags(doc['tags']),
      updatedAt: new Date(doc['updatedAt']),
      publishedAt: new Date(doc['publishedAt'])
    };
    for (let key of Object.keys(this.initialValues)) {
      if (this.initialValues.hasOwnProperty(key)) {
        this[key] = this.initialValues[key];
      }
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
    if (this.isNew) {
      return this.defaultAccount.create('prx:stories', {}, this.toJSON()).map((doc) => {
        this.setDoc(doc);
        this.isNew = false;
        return true; // was new
      });
    } else {
      return this.doc.update(this.toJSON()).map((doc) => {
        this.setDoc(doc);
        return false; // was old
      });
    }
  }

  destroy(): Observable<boolean> {
    return this.doc.destroy().map(() => { return true; });
  }

  invalid(fieldName?: string): string {
    if (fieldName === 'title') {
      if (!this.title || this.title.length < 1) {
        return 'is required';
      } else if (this.title.length < 10) {
        return 'is too short';
      }
    } else if (fieldName === 'shortDescription') {
      if (!this.shortDescription || this.shortDescription.length < 1) {
        return 'is required';
      } else if (this.shortDescription.length < 10) {
        return 'is too short';
      }
    } else if (fieldName === 'genre') {
      if (!this.genre || this.genre.length < 1) {
        return 'is required';
      }
    } else if (fieldName === 'subGenre') {
      if (!this.subGenre || this.subGenre.length < 1) {
        return 'is required';
      }
    } else if (fieldName === 'extraTags') {
      let tags = (this.extraTags || '').replace(/\s*,\s*/, ',').split(',');
      for (let tag of tags) {
        if (tag && tag.length < 3) {
          return `must contain at least 3 characters per tag (see ${tag})`;
        }
      }
    } else if (fieldName === 'tags') {
      if (this.invalid('genre')) {
        return `Genre ${this.invalid('genre')}`;
      } else if (this.invalid('subGenre')) {
        return `SubGenre ${this.invalid('subGenre')}`;
      } else if (this.invalid('extraTags')) {
        return `Tags ${this.invalid('extraTags')}`;
      }
    } else if (!fieldName) {
      return this.invalid('title') || this.invalid('shortDescription') ||
             this.invalid('genre') || this.invalid('subGenre');
    } else {
      return null;
    }
  }

  changed(fieldName?: string): boolean {
    if (fieldName) {
      return this.initialValues[fieldName] !== this[fieldName];
    } else {
      return this.changed('title') || this.changed('shortDescription') ||
             this.changed('genre') || this.changed('subGenre') ||
             this.changed('extraTags');
    }

  }

}
