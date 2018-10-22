import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription.js'
import { Component, Input } from '@angular/core';
import { SeriesImportModel } from '../shared';
import { HalDoc } from '../core';

import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeWhile';

@Component({
  templateUrl: 'series-import-status-card.component.html',
  styleUrls: ['./series-import-status-card.component.css'],
  selector: 'series-import-status-card'
})

export class SeriesImportStatusCardComponent {

  @Input() seriesImport: SeriesImportModel;
  _seriesImport: SeriesImportModel;
  episodeImports: HalDoc[] = [];
  episodeImportPlaceholders: HalDoc[] = [];
  refresher: Subscription;

  ngOnInit(): any {
    // consume the input and track state privately:
    this._seriesImport = this.seriesImport;

    this.loadEpisodeStatus();
    this.refreshSeriesImport();
  }

  ngOnDestroy(): any {
    if(this.refresher){
      this.refresher.unsubscribe();
    }
  }

  loadEpisodeStatus(){
    this._seriesImport.doc.followList('prx:episode-imports').subscribe((episodes)=>{
      this.episodeImports = episodes;
    })

    this._seriesImport.doc.followList('prx:episode-import-placeholders').subscribe((episodes)=>{
      this.episodeImportPlaceholders = episodes;
    })
  }

  refreshSeriesImport(){
    this.refresher = Observable
      .interval(1000)
      .flatMap(() => this._seriesImport.doc.reload())
      .map(doc => {
        let parentDoc = this._seriesImport.parent;
        // this.isProcessTimeout = elapsed > this.UPLOAD_PROCESS_TIMEOUT;
        this._seriesImport = new SeriesImportModel(parentDoc, doc);
        this.loadEpisodeStatus();
      })
      .takeWhile(() => this.seriesImportIsImporting())
      .subscribe(val =>{});
  }

  entriesInRssFeed(){
    return this._seriesImport.feedEpisodeCount
      + this.episodeImportPlaceholders.length;
  }

  // collections

  episodeImportsSomeSkipped(){
    return this.episodeImportPlaceholders.length > 0
  }

  episodeImportsSomeFailed(){
    return this.episodeImportsFilter("failed").length > 0;
  }

  episodeImportsAllFinished(){
    return this.episodeImports
      .map((ei)=>{
        return this.episodeImportIsFinished(ei);
      })
      .reduce(function(accum, val){
        return accum && val;
      }, true)
  }

  episodeImportsFilter(status){
    return this.episodeImports
      .filter((ei)=> this.episodeImportIs(ei, status))
  }

  episodeImportsInProgress(){
    return this.episodeImports
      .filter((ei)=> this.episodeImportInProgress(ei));
  }

  episodeImportsRemaining(){
    let complete = this.episodeImportsFilter('complete').length;
    let failed = this.episodeImportsFilter('failed').length;

    return this._seriesImport.feedEpisodeCount -
      complete -
      failed;
  }

  episodeImportsPercentComplete(){
    return this.episodeImportsFilter('complete').length / this._seriesImport.feedEpisodeCount;
  }

  // status

  episodeImportIsFinished(episodeImport){
    return !this.episodeImportInProgress(episodeImport);
  }

  episodeImportIs(episodeImport, status){
    return episodeImport.status == status;
  }

  seriesImportIs(status){
    return this._seriesImport.status == status;
  }

  seriesImportIsFinished(){
    return !this.seriesImportIsImporting();
  }

  seriesImportIsImporting(){
    return !this.seriesImportIs('complete') &&
      !this.seriesImportIs('failed');
  }

  seriesImportIsInitializing(){
    return !this._seriesImport.feedEpisodeCount;
  }

  episodeImportInProgress(episodeImport){
    return !this.episodeImportIs(episodeImport, 'complete') &&
      !this.episodeImportIs(episodeImport, 'failed') &&
      !this.episodeImportIs(episodeImport, 'created');
  }
}
