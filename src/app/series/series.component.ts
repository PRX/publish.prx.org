import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { CmsService, ModalService, ToastrService } from '../core';
import { SeriesModel } from '../shared';

@Component({
  selector: 'publish-series',
  styleUrls: ['series.component.css'],
  templateUrl: 'series.component.html'
})

export class SeriesComponent implements OnInit {

  id: number;
  base: string;
  series: SeriesModel;
  storyCount: number;
  storyNoun: string;

  constructor(
    private cms: CmsService,
    private modal: ModalService,
    private toastr: ToastrService,
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
      this.cms.auth.follow('prx:series', {id: this.id}).subscribe(
        s => {
          s.follow('prx:account').subscribe(a => {
            this.setSeries(a, s);
          });
        },
        err => {
          if (err.status === 404 && err.name === 'HalHttpError') {
            this.toastr.error('No series found. Redirecting to new series page');
            console.error(`Series with id ${this.id} not found`);
            setTimeout(() => this.router.navigate(['/series', 'new']), 3000);
            throw(err);
          }
        }
      );
    } else {
      this.cms.defaultAccount.subscribe(a => this.setSeries(a, null));
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
      this.toastr.success(`Series ${wasNew ? 'created' : 'saved'}`);
      if (wasNew) {
        this.router.navigate(['/series', this.series.id]);
      }
    });
  }

  discard() {
    this.series.discard();
  }

  confirmDelete(event: MouseEvent): void {
    if (event.target['blur']) {
      event.target['blur']();
    }
    this.modal.confirm(
      'Really delete?',
      'Are you sure you want to delete this series? This action cannot be undone.',
      (confirm: boolean) => {
        if (confirm) {
          if (this.series.changed()) {
            this.discard();
          }
          this.series.isDestroy = true;
          this.series.save().subscribe(() => {
            this.toastr.success('Series deleted');
            this.router.navigate(['/']);
          });
        }
      }
    );
  }

  canDeactivate(next: any, prev: any): boolean | Observable<boolean> {
    if (this.series && this.series.changed() && !this.series.isDestroy) {
      let thatsOkay = new Subject<boolean>();
      this.modal.confirm(
        'Unsaved changes',
        `This series has unsaved changes. You may discard the changes and
          continue or click 'Cancel' to complete and ${this.series.isNew ? 'create' : 'save'} the series.`,
        (confirm: boolean) => {
          if (confirm) {
            this.discard();
          }
          thatsOkay.next(confirm);
          thatsOkay.complete();
        },
        'Discard'
      );
      return thatsOkay;
    } else {
      return true;
    }
  }

}
