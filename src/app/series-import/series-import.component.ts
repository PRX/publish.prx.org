import { Component, OnInit } from '@angular/core';

import { ModalService, TabService, ToastrService } from 'ngx-prx-styleguide';
import { SeriesImportModel } from '../shared';

import { SeriesComponent } from '../series/series.component'

@Component({
  providers: [],
  selector: 'app-series-import',
  templateUrl: './series-import.component.html',
  styleUrls: ['./series-import.component.css']
})
export class SeriesImportComponent extends SeriesComponent implements OnInit {


}
