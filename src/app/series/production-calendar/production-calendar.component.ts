
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CmsService, HalDoc } from '../../core';
import { SeriesModel } from '../../shared';
import { ToastrService } from 'ngx-prx-styleguide';

@Component({
  selector: 'publish-calendar',
  styleUrls: ['production-calendar.component.css'],
  template: `
    <div class="hero">
      <section>
        <h1>Production Calendar</h1>
        <a *ngIf="series" [routerLink]="['/series', series.id]">
          <prx-image [imageDoc]="series.doc"></prx-image>
          <h3>{{series.title}}</h3>
        </a>
      </section>
    </div>

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
          this.toastr.error('No series found. Redirecting to home page');
          console.error(`Series with id ${this.id} not found`);
          setTimeout(() => this.router.navigate(['/']), 3000);
        } else {
          throw(err);
        }
      }
    );
  }

}
