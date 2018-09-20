import { Component, Input } from '@angular/core';
import { CmsService, HalDoc } from '../core';
import { SeriesImportModel } from '../shared';

@Component({
  templateUrl: 'series-import-status-card.component.html',
  styleUrls: ['./series-import-status-card.component.css'],
  selector: 'series-import-status-card'
})

export class SeriesImportStatusCardComponent {

  @Input() seriesImport: SeriesImportModel;
  episodeImports: HalDoc[] = [];

  constructor(private cms: CmsService) {}

  ngOnInit(): any {
    this.loadEpisodeStatus();
  }

  loadEpisodeStatus(){
    let episodeImportCount = this.seriesImport.doc.count('prx:episode-imports')
    this.seriesImport.doc.followItems('prx:episode-imports', {zoom: 'prx:story', per: episodeImportCount}).subscribe((episodes)=>{
      this.episodeImports = episodes;
    })
  }

  storyAttr(episodeImport, attr){
    if(!episodeImport['_embedded']){
      return null
    }

    let story = episodeImport['_embedded']['prx:story'];
    if(story){
      return episodeImport['_embedded']['prx:story'][attr];
    } else {
      return null;
    }
  }

  storyId(episodeImport){
    return this.storyAttr(episodeImport, 'id');
  }

  storyTitle(episodeImport){
    return this.storyAttr(episodeImport, 'title');
  }

  seriesImportIs(status){
    return this.seriesImport.status == status;
  }

  seriesImportIsImporting(){
    return !this.seriesImportIs('complete') && !this.seriesImportIs('failed');
  }

  episodeImportIs(episodeImport, status){
    return episodeImport.status == status;
  }

  episodeImportInProgress(episodeImport){
    return !(this.episodeImportIs(episodeImport, 'complete') || this.episodeImportIs(episodeImport, 'failed'));
  }
}
