import { Observable} from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel } from './base.model';
import { REQUIRED, URL, TOKENY } from './invalid';

export class FeederPodcastModel extends BaseModel {

  // read-only
  id: number;
  publishedUrl: string;

  // writeable
  SETABLE = ['category', 'subCategory', 'explicit', 'link', 'newFeedUrl', 'authorName'];
  category: string = '';
  subCategory: string = '';
  explicit: string = '';
  link: string = '';
  newFeedUrl: string = '';
  authorName: string = '';

  VALIDATORS = {
    link: [REQUIRED(), URL('Not a valid URL')],
    newFeedUrl: [URL('Not a valid URL')]
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
    this.id = this.doc['id'];
    this.publishedUrl = this.doc['publishedUrl'] || '';
    this.explicit = this.doc['explicit'] || '';
    if (this.explicit) {
      this.explicit = this.explicit.charAt(0).toUpperCase() + this.explicit.slice(1);
    }
    this.link = this.doc['link'] || '';
    this.newFeedUrl = this.doc['newFeedUrl'] || '';
    if (this.doc['author'] && this.doc['author']['name']) {
      this.authorName = this.doc['author']['name'];
    } else if (this.series.has('prx:account')) {
      this.series.follow('prx:account').subscribe(account => this.authorName = account['name']);
    } else {
      this.authorName = '';
    }

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
  }

  encode(): {} {
    let data = <any> {};

    // unset things with nulls instead of blank strings
    data.explicit = this.explicit || null;
    if (data.explicit) {
      data.explicit = data.explicit.toLowerCase();
    }
    data.link = this.link || null;
    data.newFeedUrl = this.newFeedUrl || null;

    if (this.authorName) {
      data.author = { name: this.authorName };
    }

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
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return Observable.throw(new Error('Cannot directly create a feeder podcast'));
  }

  copyTo(model: FeederPodcastModel) {
    if (this !== model) {
      for (let fld of this.SETABLE) {
        model.set(fld, this[fld]);
      }
      this.unstore();
    }
  }

}
