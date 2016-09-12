import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { CmsService, ModalService, SeriesModel } from '../shared';
import { HeroComponent, ButtonComponent } from '../shared';

@Component({
  directives: [HeroComponent, ButtonComponent],
  selector: 'publish-series',
  styleUrls: ['series.component.css'],
  templateUrl: 'series.component.html'
})

export class SeriesComponent implements OnInit, OnDestroy {

  private id: number;
  private series: SeriesModel;
  private routeSub: Subscription;

  constructor(
    private cms: CmsService,
    private modal: ModalService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
     this.id = +params['id'];
     this.loadSeries();
   });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }

  loadSeries() {
    let auth = this.cms.follow('prx:authorization');
    if (this.id) {
      auth.follow('prx:series', {id: this.id}).subscribe(seriesDoc => {
        this.series = new SeriesModel(null, seriesDoc);
      });
    } else {
      auth.follow('prx:default-account').subscribe(accountDoc => {
        this.series = new SeriesModel(accountDoc, null);
      });
    }
  }

}
