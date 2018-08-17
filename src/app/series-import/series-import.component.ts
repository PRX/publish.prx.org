import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { CmsService } from '../core';
import { HalDoc } from '../core';
import { ModalService, TabService, ToastrService } from 'ngx-prx-styleguide';
import { SeriesImportModel } from '../shared';

@Component({
  providers: [TabService],
  selector: 'app-series-import',
  templateUrl: './series-import.component.html',
  styleUrls: ['./series-import.component.css']
})
export class SeriesImportComponent implements OnInit {

  rssUrl: string;
  profile: number;

  constructor(
    private cms: CmsService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
  }

}
