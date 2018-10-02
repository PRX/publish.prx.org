import { Component, Input } from '@angular/core';
import { SeriesImportModel } from '../shared';
import { HalDoc } from '../core';

@Component({
  templateUrl: 'series-import-status-card.component.html',
  styleUrls: ['./series-import-status-card.component.css'],
  selector: 'series-import-status-card'
})

export class SeriesImportStatusCardComponent {

  @Input() seriesImport: SeriesImportModel;
  episodeImports: HalDoc[] = [];
  episodeImportPlaceholders: HalDoc[] = [];

  constructor() {}

  ngOnInit(): any {
    this.loadEpisodeStatus();
  }

  loadEpisodeStatus(){
    this.seriesImport.doc.followList('prx:episode-imports').subscribe((episodes)=>{
      this.episodeImports = episodes;
    })

    this.seriesImport.doc.followList('prx:episode-import-placeholders').subscribe((episodes)=>{
      this.episodeImportPlaceholders = episodes;
    })

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

    return this.seriesImport.episodeImportingCount -
      complete -
      failed;
  }

  episodeImportsPercentComplete(){
    return this.episodeImportsFilter('complete').length / this.seriesImport.episodeImportingCount;
  }

  // status

  episodeImportIsFinished(episodeImport){
    return !this.episodeImportInProgress(episodeImport);
  }

  episodeImportIs(episodeImport, status){
    return episodeImport.status == status;
  }

  seriesImportIs(status){
    return this.seriesImport.status == status;
  }

  seriesImportIsFinished(){
    return !this.seriesImportIsImporting();
  }

  seriesImportIsImporting(){
    return !this.seriesImportIs('complete') &&
      !this.seriesImportIs('failed');
  }

  episodeImportInProgress(episodeImport){
    return !this.episodeImportIs(episodeImport, 'complete') && !this.episodeImportIs(episodeImport, 'failed');
  }
}
