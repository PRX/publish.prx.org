import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { CmsService } from '../core';
import { ModalService, TabService, ToastrService } from 'ngx-prx-styleguide';
import { SeriesModel } from '../shared';

@Component({
  providers: [TabService],
  selector: 'app-series-import',
  templateUrl: './series-import.component.html',
  styleUrls: ['./series-import.component.css']
})
export class SeriesImportComponent implements OnInit {

  rssUrl: string;
  profile: number;
  podcastImports: any[];
  podcastImportCount: number;

  constructor(
    private cms: CmsService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadSeriesImports()
  }

  loadSeriesImports() {
    this.cms.auth.subscribe(
      s => {
        this.profile = s.id;
        s.follow('prx:podcast-imports').subscribe(a => {
          this.podcastImports = a._embedded["prx:items"]
        });
      },
      err => {
        if (err.status === 404 && err.name === 'HalHttpError') {
          this.toastr.error('ERRORZ');
          debugger
        } else {
          throw(err);
        }
      }
    );
  }


}
