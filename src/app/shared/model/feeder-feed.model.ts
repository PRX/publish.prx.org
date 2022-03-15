import { Observable } from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel, BaseInvalid, REQUIRED } from 'ngx-prx-styleguide';

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

export class FeederFeedModel extends BaseModel {
  id: number;
  title = '';
  slug = '';
  fileName = 'feed-rss.xml';
  private = false;

  SETABLE = ['title', 'slug', 'fileName', 'private'];

  VALIDATORS = {
    title: [UNLESS_DEFAULT(REQUIRED())],
    slug: [UNLESS_DEFAULT(REQUIRED()), UNLESS_DEFAULT(FEED_SLUG)],
    fileName: [REQUIRED(), FEED_FILE_NAME]
  };

  constructor(podcast: HalDoc, feed?: HalDoc, loadRelated = true) {
    super();
    this.init(podcast, feed, loadRelated);
  }

  get isDefault(): boolean {
    return this.id && !this.slug;
  }

  get privateFeedUrl(): string {
    const base = this.parent['publishedUrl'].split('/', 4).join('/');
    if (this.isDefault) {
      return `${base}/${this.fileName}`;
    } else {
      return `${base}/${this.slug}/${this.fileName}`;
    }
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
  }

  encode(): {} {
    let data = <any>{};
    data.id = this.id;
    data.title = this.title;
    data.slug = this.slug;
    data.fileName = this.fileName;
    data.private = this.private;
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:feeds', {}, data);
  }
}
