
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CmsService, HalDoc } from '../../core';
import { SeriesModel } from '../../shared';
import { ToastrService } from 'ngx-prx-styleguide';

@Component({
  selector: 'publish-calendar',
  styleUrls: ['production-calendar.component.css'],
  template: `
    <prx-status-bar prxSticky="all" class="status_bar">
      <a prx-status-bar-link routerLink="/">
        <prx-status-bar-icon name="chevron-left" aria-label="Return To Home"></prx-status-bar-icon>
      </a>
      <prx-status-bar-text bold uppercase stretch>Production Calendar</prx-status-bar-text>
      <ng-container *ngIf="series">
        <a prx-status-bar-link [routerLink]="['/series', series.id]" alignArt="right" *ngIf="series">
          <prx-status-bar-image [src]="series.doc" alignAart="right"></prx-status-bar-image> {{series.title || '(Untitled Series)'}}
        </a>
      </ng-container>
    </prx-status-bar>

    <div class="main">
      <section>
        <publish-calendar-series *ngIf="series" [series]="series"></publish-calendar-series>
      </section>
    </div>
  `
})

export class ProductionCalendarComponent implements OnInit {

  id: number;
  series: SeriesModel;

  constructor(public cms: CmsService,
              public toastr: ToastrService,
              private route: ActivatedRoute,
              private router: Router) {}

  ngOnInit() {
    this.route.params.forEach(params => {
     this.id = +params['id'];
     if (this.id) {
      this.loadSeries();
     }
   });
  }

  loadSeries() {
    this.cms.auth.follow('prx:series', {id: this.id, zoom: 'prx:image'}).subscribe((series: HalDoc) => {
        this.series = new SeriesModel(null, series, false);
      },
      err => {
        if (err.status === 404 && err.name === 'HalHttpError') {
          this.toastr.error('No series found. Redirecting to home page.');
          console.error(`Series with id ${this.id} not found`);
          setTimeout(() => this.router.navigate(['/']), 3000);
        } else {
          throw(err);
        }
      }
    );
  }

}
