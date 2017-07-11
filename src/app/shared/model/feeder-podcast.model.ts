import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { HalDoc } from '../../core';
import { BaseModel } from 'ngx-prx-styleguide';
import { REQUIRED, URL, LENGTH } from './invalid';

export class FeederPodcastModel extends BaseModel {

  // read-only
  id: number;
  publishedUrl: string;

  // writeable
  SETABLE = ['category', 'subCategory', 'explicit', 'link', 'newFeedUrl', 'publicFeedUrl', 'enclosurePrefix', 'copyright', 'complete',
    'language', 'summary', 'authorName', 'authorEmail', 'ownerName', 'ownerEmail', 'managingEditorName', 'managingEditorEmail'];
  URLS = ['link', 'newFeedUrl', 'publicFeedUrl', 'enclosurePrefix'];
  category = '';
  subCategory = '';
  explicit = '';
  link = '';
  newFeedUrl = '';
  publicFeedUrl = '';
  enclosurePrefix = '';
  authorName = '';
  authorEmail = '';
  copyright = '';
  complete = false;
  language = '';
  summary = '';
  hasPublicFeed = false;

  VALIDATORS = {
    category: [REQUIRED()],
    explicit: [REQUIRED()],
    link: [REQUIRED(), URL('Not a valid URL')],
    newFeedUrl: [URL('Not a valid URL')],
    publicFeedUrl: [URL('Not a valid URL')],
    enclosurePrefix: [URL('Not a valid URL')],
    summary: [LENGTH(0, 4000)]
  };

  constructor(private series: HalDoc, distrib: HalDoc, podcast?: HalDoc, loadRelated = true) {
    super();
    this.init(distrib, podcast, loadRelated);
  }

  key() {
    if (this.doc) {
      return `prx.podcast.${this.doc.id}`;
    } else if (this.series) {
      return `prx.podcast.new.${this.series.id}`; // new in series
    } else {
      return null; // Cannot create podcast until parent series exists
    }
  }

  related() {
    return {};
  }

  decode() {
    this.complete = this.doc['complete'];
    this.copyright = this.doc['copyright'] || '';
    this.enclosurePrefix = this.doc['enclosurePrefix'] || '';
    this.id = this.doc['id'];
    this.link = this.doc['link'] || '';
    this.newFeedUrl = this.doc['newFeedUrl'] || '';

    ['author', 'owner', 'managingEditor'].forEach((role) => {
      if (this.doc[role]) {
        if (this.doc[role]['name']) {
          this[`${role}Name`] = this.doc[role]['name'];
        }
        if (this.doc[role]['email']) {
          this[`${role}Email`] = this.doc[role]['email'];
        }
      }
    });

    // just ignore all but first category/subcategory
    let cat = (this.doc['itunesCategories'] || [])[0];
    if (cat) {
      this.category = cat['name'] || '';
      if (cat['subcategories']) {
        this.subCategory = cat['subcategories'][0] || '';
      } else {
        this.subCategory = '';
      }
    } else {
      this.category = '';
      this.subCategory = '';
    }

    this.explicit = this.doc['explicit'] || '';
    if (this.explicit) {
      this.explicit = this.explicit.charAt(0).toUpperCase() + this.explicit.slice(1);
    }

    this.language = this.doc['language'] || '';
    if (this.language) {
      this.language = this.language.toLowerCase();
    }

    this.publishedUrl = this.doc['publishedUrl'] || '';
    if (this.doc['url']) {
      this.publicFeedUrl = this.doc['url'];
      this.hasPublicFeed = true;
    }
    this.summary = this.doc['summary'];
  }

  encode(): {} {
    let data = <any> {};

    // unset with nulls instead of blank strings
    data.complete = this.complete;
    data.copyright = this.copyright || null;
    data.enclosurePrefix = this.enclosurePrefix || null;
    data.language = this.language || null;
    data.link = this.link || null;
    data.newFeedUrl = this.newFeedUrl || null;
    data.url = this.publicFeedUrl || null;

    ['author', 'owner', 'managingEditor'].forEach((role) => {
      data[role] = {
        name: this[`${role}Name`] || null,
        email: this[`${role}Email`] || null
      };
    });

    // we can always send a categories array
    data.itunesCategories = [];
    if (this.category) {
      data.itunesCategories = [{name: this.category, subcategories: []}];
      if (this.subCategory) {
        data.itunesCategories[0].subcategories.push(this.subCategory);
      }
    } else {
      data.itunesCategories = [];
    }

    data.explicit = this.explicit || null;
    if (data.explicit) {
      data.explicit = data.explicit.toLowerCase();
    }

    data.summary = this.summary || null;

    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return Observable.throw(new Error('Cannot directly create a feeder podcast'));
  }

  swapNew(newModel: FeederPodcastModel) {
    for (let fld of this.SETABLE) {
      newModel.set(fld, this[fld]);
    }
  }
}
