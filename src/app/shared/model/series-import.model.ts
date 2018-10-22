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
  public feedEpisodeCount: number;

  public episodeImports: HalDoc[] = [];
  public episodeImportPlaceholders: HalDoc[] = [];

  // TODO
  public config: any;

  SETABLE = ['url', 'accountId'];

  VALIDATORS = {
    url:        [REQUIRED()],
    accountId:  [REQUIRED()],
    status:  [REQUIRED()]
  };

  constructor(account: HalDoc, seriesImportDoc?: HalDoc, loadRelated = true) {
    super();
    if (account) {
      this.set('accountId', account.id, true);
    }
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
    // TODO these are pure haldocs, no front-end model wrapper
    let episodeImports = Observable.of([]);
    let episodeImportPlaceholders = Observable.of([]);

    episodeImports = this.doc.followList('prx:episode-imports').map((episodes) => {
      return episodes;
    });

    episodeImportPlaceholders = this.doc.followList('prx:episode-import-placeholders').map((episodes) => {
      return episodes;
    });

    return {
      episodeImports,
      episodeImportPlaceholders
    };
  }

  decode() {
    this.id = this.doc['id'];
    this.url = this.doc['url'];
    this.status = this.doc['status'];
    this.createdAt = new Date(this.doc['createdAt']);
    this.updatedAt = new Date(this.doc['updatedAt']);
    this.accountId = this.doc['account'];
    this.feedEpisodeCount = this.doc['feedEpisodeCount'];
    this.config = this.doc['config'];
  }

  encode(): {} {
    let data = <any> {};

    data['id'] = this.id;
    data['url'] = this.url;
    data['accountId'] = this.accountId;
    // TODO implement the config for the episode only import
    data['config'] = {};

    return data;
  }


  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:podcast-imports', {}, data);
  }

  discard() {
    // TODO
  }

  entriesInRssFeed(){
    return this.feedEpisodeCount
      + this.episodeImportPlaceholders.length;
  }

  // collections
  episodeImportsSomeSkipped(){
    return this.episodeImportPlaceholders.length > 0;
  }

  episodeImportsSomeFailed(){
    return this.episodeImportsFilter('failed').length > 0;
  }

  episodeImportsAllFinished(){
    return this.episodeImports
      .map((ei) => {
        return this.episodeImportIsFinished(ei);
      })
      .reduce(function(accum, val){
        return accum && val;
      }, true);
  }

  episodeImportsFilter(status){
    return this.episodeImports
      .filter((ei) => this.episodeImportIs(ei, status));
  }

  episodeImportsInProgress(){
    return this.episodeImports
      .filter((ei) => this.episodeImportInProgress(ei));
  }

  episodeImportsRemaining(){
    let complete = this.episodeImportsFilter('complete').length;
    let failed = this.episodeImportsFilter('failed').length;

    return this.feedEpisodeCount -
      complete -
      failed;
  }

  episodeImportsPercentComplete(){
    return this.episodeImportsFilter('complete').length / this.feedEpisodeCount;
  }

  // status

  episodeImportIsFinished(episodeImport){
    return !this.episodeImportInProgress(episodeImport);
  }

  episodeImportIs(episodeImport, status){
    return episodeImport.status == status;
  }

  is(status){
    return this.status == status;
  }

  isFinished(){
    return !this.isImporting();
  }

  isImporting(){
    return !this.is('complete') &&
      !this.is('failed');
  }

  isInitializing(){
    return !this.feedEpisodeCount;
  }

  episodeImportInProgress(episodeImport){
    return !this.episodeImportIs(episodeImport, 'complete') &&
      !this.episodeImportIs(episodeImport, 'failed') &&
      !this.episodeImportIs(episodeImport, 'created');
  }

}
