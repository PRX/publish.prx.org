import { throwError as observableThrowError, of as observableOf, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HalDoc } from '../../core';
import { BaseModel, BaseInvalid, REQUIRED, URL, LENGTH } from 'ngx-prx-styleguide';
import { FeederFeedModel } from './feeder-feed.model';

const POSITIVE_INT_OR_BLANK: BaseInvalid = (_key: string, value: any): string => {
  if (value && !value.match(/^[1-9][0-9]*$/)) {
    return 'Enter a positive number';
  }
  return null;
};

const PAYMENT_POINTER: BaseInvalid = (key: string, value: any): string => {
  if (value && !value.match(/^\$[A-Za-z0-9-.]+\/?[^\s]*$/)) {
    return 'Payment pointers must have the format: $prx.wallet.example/abcd1234';
  }
  return null;
};

export class FeederPodcastModel extends BaseModel {
  // read-only
  id: number;
  publishedUrl: string;

  // writeable
  SETABLE = [
    'category',
    'subCategory',
    'explicit',
    'link',
    'newFeedUrl', // TODO: moved to feed
    'publicFeedUrl', // TODO: moved to feed
    'enclosurePrefix', // TODO: moved to feed
    'copyright',
    'complete',
    'language',
    'summary',
    'authorName',
    'authorEmail',
    'ownerName',
    'ownerEmail',
    'managingEditorName',
    'managingEditorEmail',
    'serialOrder',
    'displayEpisodesCount', // TODO: moved to feed
    'displayFullEpisodesCount', // TODO: moved to feed
    'paymentPointer',
    'donationUrl'
  ];
  URLS = ['link', 'newFeedUrl', 'publicFeedUrl', 'enclosurePrefix', 'donationUrl'];
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
  serialOrder = false;
  displayEpisodesCount = '';
  displayFullEpisodesCount = '';
  paymentPointer = '';
  donationUrl = '';

  feeds: FeederFeedModel[];

  VALIDATORS = {
    category: [REQUIRED()],
    explicit: [REQUIRED()],
    link: [URL('Not a valid URL')],
    newFeedUrl: [URL('Not a valid URL')],
    publicFeedUrl: [URL('Not a valid URL')],
    enclosurePrefix: [URL('Not a valid URL')],
    summary: [LENGTH(0, 4000)],
    displayEpisodesCount: [POSITIVE_INT_OR_BLANK],
    displayFullEpisodesCount: [POSITIVE_INT_OR_BLANK],
    paymentPointer: [PAYMENT_POINTER],
    donationUrl: [URL('Not a valid URL')]
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
    let feeds = observableOf([]);

    if (this.doc && this.doc.has('prx:feeds')) {
      feeds = this.doc.followItems('prx:feeds', { per: 999 }).pipe(
        map((docs) => {
          return docs.map((d) => new FeederFeedModel(this.doc, d)).sort((a, b) => (a.id > b.id ? 1 : -1));
        })
      );
    }

    return { feeds };
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

    this.explicit = this.doc['explicit'] || null;

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
    this.serialOrder = this.doc['serialOrder'] || false;
    this.displayEpisodesCount = this.doc['displayEpisodesCount'] ? this.doc['displayEpisodesCount'].toString() : '';
    this.displayFullEpisodesCount = this.doc['displayFullEpisodesCount'] ? this.doc['displayFullEpisodesCount'].toString() : '';
    this.paymentPointer = this.doc['paymentPointer'] || '';
    this.donationUrl = this.doc['donationUrl'] || '';
  }

  encode(): {} {
    let data = <any>{};

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
      data.itunesCategories = [{ name: this.category, subcategories: [] }];
      if (this.subCategory) {
        data.itunesCategories[0].subcategories.push(this.subCategory);
      }
    } else {
      data.itunesCategories = [];
    }

    data.explicit = this.explicit || null;
    data.summary = this.summary || null;
    data.serialOrder = this.serialOrder || null;
    data.displayEpisodesCount = parseInt(this.displayEpisodesCount, 10) || null;
    data.displayFullEpisodesCount = parseInt(this.displayFullEpisodesCount, 10) || null;
    data.paymentPointer = this.paymentPointer || null;
    data.donationUrl = this.donationUrl || null;

    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return observableThrowError(new Error('Cannot directly create a feeder podcast'));
  }

  swapNew(newModel: FeederPodcastModel) {
    for (let fld of this.SETABLE) {
      newModel.set(fld, this[fld]);
    }
  }
}
