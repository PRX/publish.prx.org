import { Component, Input } from '@angular/core';
import { CmsService, HalDoc } from '../core';
import { SeriesImportModel } from '../shared';

@Component({
  templateUrl: 'series-import-status-card.component.html',
  styleUrls: ['./series-import-status-card.component.css']
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
    this.seriesImport.doc.followItems('prx:episode-imports').subscribe((episodes)=>{
      this.episodeImports = episodes;
    })
  }
}
