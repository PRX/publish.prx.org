import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CmsService, ModalService } from '../core';
import { SeriesModel } from '../shared';

@Component({
  selector: 'publish-series',
  styleUrls: ['series.component.css'],
  templateUrl: 'series.component.html'
})

export class SeriesComponent implements OnInit {

  private id: number;
  private base: string;
  private series: SeriesModel;
  private storyCount: number;
  private storyNoun: string;

  constructor(
    private cms: CmsService,
    private modal: ModalService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.forEach(params => {
     this.id = +params['id'];
     this.base = '/series/' + (this.id || 'new');
     this.loadSeries();
   });
  }

  loadSeries() {
    if (this.id) {
      this.cms.auth.follow('prx:series', {id: this.id}).subscribe(s => this.setSeries(null, s));
    } else {
      this.cms.account.subscribe(a => this.setSeries(a, null));
    }
  }

  setSeries(parent: any, series: any) {
    this.series = new SeriesModel(parent, series);
    if (series) {
      this.storyCount = series.count('prx:stories');
      this.storyNoun = this.storyCount === 1 ? 'Episode' : 'Episodes';
    } else {
      this.storyCount = null;
    }
    this.checkSeriesVersion();
  }

  checkSeriesVersion() {
    if (!this.series.isV4()) {
      let oldLink = `https://www.prx.org/series/${this.id}`;
      this.modal.alert(
        'Cannot Edit Series',
        `This series was created in the older PRX.org app, and must be
        edited there. <a target="_blank" href="${oldLink}">Click here</a> to view it.`,
        () => { window.history.back(); }
      );
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

  confirmDelete(): void {
    this.modal.prompt(
      'Really delete?',
      'Are you sure you want to delete this series? This action cannot be undone.',
      (okay: boolean) => {
        if (okay) {
          this.series.isDestroy = true;
          this.series.save().subscribe(() => {
            this.router.navigate(['/']);
          });
        }
      }
    );
  }

}
