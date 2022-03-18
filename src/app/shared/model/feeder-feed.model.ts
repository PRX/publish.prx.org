import { Observable } from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel, BaseInvalid, REQUIRED, URL } from 'ngx-prx-styleguide';

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const random = (n) =>
  new Array(n)
    .fill(null)
    .map(() => chars.charAt(Math.random() * chars.length))
    .join('');

export const UNLESS_DEFAULT = (validator: BaseInvalid) => {
  return (key: string, value: any, strict?: boolean, model?: any) => {
    if (model && model.isDefault) {
      return null;
    } else {
      return validator(key, value, strict, model);
    }
  };
};

const FEED_SLUG: BaseInvalid = (key: string, value: any): string => {
  if (value === 'images' || value.match(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/)) {
    return 'Slug is reserved';
  } else if (value.match(/^[0-9a-zA-Z_-]+$/)) {
    return null;
  } else {
    return 'Slug must contain only letters, numbers, underscores and dashes';
  }
};

const FEED_FILE_NAME: BaseInvalid = (key: string, value: any): string => {
  if (value.match(/^[0-9a-zA-Z_.-]+$/)) {
    return null;
  } else {
    return 'File name must contain only letters, numbers, underscores and dashes';
  }
};

const TOKENS_JSON: BaseInvalid = (key: string, value: any): string => {
  const tokens = JSON.parse(value);
  if (tokens.every((t) => t.label) && tokens.every((t) => t.token)) {
    return null;
  } else {
    return 'Tokens cannot have blank fields';
  }
};

const POSITIVE_INT_OR_BLANK: BaseInvalid = (_key: string, value: any): string => {
  if (value && !value.match(/^[1-9][0-9]*$/)) {
    return 'Enter a positive number';
  }
  return null;
};

export class FeederFeedModel extends BaseModel {
  id: number;
  tokens = [];

  SETABLE = [
    'title',
    'slug',
    'fileName',
    'private',
    'tokensJson',
    'url',
    'newFeedUrl',
    'enclosurePrefix',
    'displayEpisodesCount',
    'displayFullEpisodesCount',
    'billboardAds',
    'houseAds',
    'paidAds',
    'sonicAds'
  ];
  title = '';
  slug = '';
  fileName = 'feed-rss.xml';
  private = false;
  tokensJson = '[]';
  url = '';
  newFeedUrl = '';
  enclosurePrefix = '';
  displayEpisodesCount = '';
  displayFullEpisodesCount = '';
  billboardAds = true;
  houseAds = true;
  paidAds = true;
  sonicAds = true;
  // episodeOffsetSeconds = '';
  // includeTags = '';
  // audioFormat = '';

  VALIDATORS = {
    title: [UNLESS_DEFAULT(REQUIRED())],
    slug: [UNLESS_DEFAULT(REQUIRED()), UNLESS_DEFAULT(FEED_SLUG)],
    fileName: [REQUIRED(), FEED_FILE_NAME],
    tokensJson: [TOKENS_JSON],
    url: [URL('Not a valid URL')],
    newFeedUrl: [URL('Not a valid URL')],
    enclosurePrefix: [URL('Not a valid URL')],
    displayEpisodesCount: [POSITIVE_INT_OR_BLANK],
    displayFullEpisodesCount: [POSITIVE_INT_OR_BLANK]
  };

  constructor(podcast: HalDoc, feed?: HalDoc, loadRelated = true) {
    super();
    this.init(podcast, feed, loadRelated);
  }

  get isDefault(): boolean {
    return this.id && !this.slug;
  }

  key() {
    if (this.doc) {
      return `prx.feed.${this.doc.id}`;
    } else {
      return `prx.feed.new.${this.parent.id}`;
    }
  }

  related() {
    return {};
  }

  decode() {
    this.id = this.doc['id'];
    this.title = this.doc['title'];
    this.slug = this.doc['slug'];
    this.fileName = this.doc['fileName'];
    this.private = this.doc['private'] || false;
    this.tokensJson = JSON.stringify(this.doc['tokens'] || []);
    this.tokens = JSON.parse(this.tokensJson);
    this.url = this.doc['url'] || '';
    this.newFeedUrl = this.doc['newFeedUrl'] || '';
    this.enclosurePrefix = this.doc['enclosurePrefix'] || '';
    this.displayEpisodesCount = this.doc['displayEpisodesCount'] ? this.doc['displayEpisodesCount'].toString() : '';
    this.displayFullEpisodesCount = this.doc['displayFullEpisodesCount'] ? this.doc['displayFullEpisodesCount'].toString() : '';

    // null includeZones means include them all
    const include = this.doc['includeZones'] || ['billboard', 'house', 'ad', 'sonic_id'];
    this.billboardAds = include.includes('billboard');
    this.houseAds = include.includes('house');
    this.paidAds = include.includes('ad');
    this.sonicAds = include.includes('sonic_id');
  }

  encode(): {} {
    let data = <any>{};
    data.id = this.id;
    data.title = this.title;
    data.slug = this.slug;
    data.fileName = this.fileName;
    data.private = this.private;
    data.tokens = JSON.parse(this.tokensJson);
    data.url = this.url || null;
    data.newFeedUrl = this.newFeedUrl || null;
    data.enclosurePrefix = this.enclosurePrefix || null;
    data.displayEpisodesCount = parseInt(this.displayEpisodesCount, 10) || null;
    data.displayFullEpisodesCount = parseInt(this.displayFullEpisodesCount, 10) || null;

    // set to null if including all zones
    if (this.billboardAds && this.houseAds && this.paidAds && this.sonicAds) {
      data.includeZones = null;
    } else {
      data.includeZones = [
        this.billboardAds && 'billboard',
        this.houseAds && 'house',
        this.paidAds && 'ad',
        this.sonicAds && 'sonic_id'
      ].filter((z) => z);
    }

    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:feeds', {}, data);
  }

  privateFeedUrl(auth?: string): string {
    if (this.doc) {
      const url = this.doc.expand('prx:private-feed', { auth });

      // sub in the current slug/filename
      let parts = url.split('/');
      if (!this.isDefault) {
        parts[parts.length - 2] = this.slug;
      }
      if (parts[parts.length - 1].includes('?')) {
        parts[parts.length - 1] = this.fileName + '?' + parts[parts.length - 1].split('?').pop();
      } else {
        parts[parts.length - 1] = this.fileName;
      }

      return parts.join('/');
    }
  }

  publishedFeedUrl(): string {
    return this.url || this.privateFeedUrl();
  }

  addToken() {
    this.tokens.push({ label: '', token: random(20) });
    this.setTokens();
  }

  removeToken(index: number) {
    this.tokens.splice(index, 1);
    this.setTokens();
  }

  setTokens() {
    this.set('tokensJson', JSON.stringify(this.tokens));
  }

  labelChanged(index: number): boolean {
    const originalToken = JSON.parse(this.original['tokensJson'])[index];
    return !originalToken || originalToken.label !== this.tokens[index].label;
  }

  labelInvalid(index: number): boolean {
    return !this.tokens[index].label;
  }

  tokenChanged(index: number): boolean {
    const originalToken = JSON.parse(this.original['tokensJson'])[index];
    return !originalToken || originalToken.token !== this.tokens[index].token;
  }

  tokenInvalid(index: number): boolean {
    return !this.tokens[index].token;
  }
}
