import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription.js';
import { Component, Input } from '@angular/core';
import { SeriesImportModel } from '../shared';
import { HalDoc } from '../core';

@Component({
  templateUrl: 'series-import-status-card.component.html',
  styleUrls: ['./series-import-status-card.component.css'],
  selector: 'publish-series-import-status-card'
})

export class SeriesImportStatusCardComponent {

  @Input() seriesImport: SeriesImportModel;

}
