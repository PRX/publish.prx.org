import { Observable} from 'rxjs';
import { HalDoc } from '../../core';
import { BaseModel } from './base.model';

export class FeederPodcastModel extends BaseModel {

  id: number;
  category: string = '';
  subCategory: string = '';
  SETABLE = ['category', 'subCategory'];
  VALIDATORS = {};

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
