import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription.js';
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
  refresher: Subscription;

  ngOnInit(): any {
  }

  ngOnDestroy(): any {
  }

}
