import { Observable} from 'rxjs';
import { HalDoc } from '../cms/haldoc';
import { BaseModel } from './base.model';
import { REQUIRED, LENGTH } from './base.invalid';

export class SeriesModel extends BaseModel {

  public id: number;
  public title: string;
  public description: string;
  public shortDescription: string;
  public createdAt: Date;
  public updatedAt: Date;

  SETABLE = ['title', 'description', 'shortDescription'];

  VALIDATORS = {
    title:            [REQUIRED(), LENGTH(10)],
    description:      [LENGTH(10)],
    shortDescription: [REQUIRED(), LENGTH(10)]
  };

  constructor(account: HalDoc, series?: HalDoc, loadRelated = true) {
    super();
    this.init(account, series, loadRelated);
  }

  key() {
    if (this.doc) {
      return `prx.series.${this.doc.id}`;
    } else {
      return `prx.series.new.${this.parent.id}`; // new in series
    }
  }

  related() {
    return {};
  }

  decode() {
    this.id = this.doc['id'];
    this.title = this.doc['title'] || '';
    this.description = this.doc['description'] || '';
    this.shortDescription = this.doc['shortDescription'] || '';
    this.createdAt = new Date(this.doc['createdAt']);
    this.updatedAt = new Date(this.doc['updatedAt']);
  }

  encode(): {} {
    let data = <any> {};
    data.title = this.title;
    data.description = this.description;
    data.shortDescription = this.shortDescription;
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:series', {}, data);
  }

}
