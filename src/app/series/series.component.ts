import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CmsService, ModalService } from '../core';
import { SeriesModel } from '../shared';

@Component({
  selector: 'publish-series',
  styleUrls: ['series.component.css'],
  templateUrl: 'series.component.html'
})

export class SeriesComponent implements OnInit, OnDestroy {

  private id: string;
  private series: SeriesModel;
  private routeSub: Subscription;

  constructor(
    private cms: CmsService,
    private modal: ModalService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
     this.id = params['id'] || 'new';
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
        if (seriesDoc['appVersion'] !== 'v4') {
          let oldLink = `https://www.prx.org/series/${this.id}`;
          this.modal.alert(
            'Cannot Edit Series',
            `This series was created in the older PRX.org app, and must be
            edited there. <a target="_blank" href="${oldLink}">Click here</a> to view it.`,
            () => { window.history.back(); }
          );
        } else {
          this.series = new SeriesModel(null, seriesDoc);
        }
      });
    } else {
      auth.follow('prx:default-account').subscribe(accountDoc => {
        this.series = new SeriesModel(accountDoc, null);
      });
    }
  }

  save() {
    let wasNew = this.series.isNew;
    this.series.save().subscribe(() => {
      if (wasNew) {
        this.router.navigate(['/series', this.series.id]);
      }
    });
  }

  discard() {
    this.series.discard();
  }

}
