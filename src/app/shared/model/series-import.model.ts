import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import { HalDoc, Upload } from '../../core';
import { BaseModel } from 'ngx-prx-styleguide';
import { DistributionModel } from './distribution.model';
import { REQUIRED, LENGTH } from './invalid';

export class SeriesImportModel extends BaseModel {

  public id: number;
  public url: string;
  public status: string;
  public createdAt: Date;
  public updatedAt: Date;
  public accountId: number;
  // XXX fixme
  public config: any;

  SETABLE = ['url', 'accountId'];

  VALIDATORS = {
    url:        [REQUIRED()],
    accountId:  [REQUIRED()]
  };

  constructor(account: HalDoc, seriesImportDoc?: HalDoc, loadRelated = true) {
    super();
    this.init(account, seriesImportDoc, loadRelated);
  }

  key() {
    if (this.doc) {
      return `prx.series-import.${this.doc.id}`;
    } else {
      return `prx.series-import.new`; // new import
    }
  }

  related() {
    return {
    };
  }

  decode() {
    this.id = this.doc['id'];
    this.url = this.doc['url'];
    this.status = this.doc['status'];
    this.createdAt = new Date(this.doc['createdAt']);
    this.updatedAt = new Date(this.doc['updatedAt']);
    this.accountId = this.doc['account']
    this.config = this.doc['config']
  }

  encode(): {} {
    let data = <any> {};

    data["id"] = this.doc['id'];
    data["url"] = this.doc['url'];
    data["accountId"] = this.doc['account']
    data["config"] = this.doc['config']

    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:podcast-imports', {}, data);
  }

}
