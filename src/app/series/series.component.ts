import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { CmsService, HalDoc } from '../core';
import { ModalService, TabService, ToastrService } from 'ngx-prx-styleguide';
import { SeriesImportService } from './series-import.service';
import { SeriesModel, SeriesImportModel } from '../shared';
import { NEW_SERIES_VALIDATIONS } from '../shared/model/series.model';

import { map, debounceTime, takeUntil } from 'rxjs/operators';
import { timer } from 'rxjs/observable/timer';

@Component({
  providers: [TabService],
  selector: 'publish-series',
  styleUrls: ['series.component.css'],
  templateUrl: 'series.component.html'
})

export class SeriesComponent implements OnInit, OnDestroy {

  private _onDestroy = new Subject();

  id: number;
  base: string;
  series: SeriesModel;
  storyCount: number;
  storyNoun: string;

  // podcast imports
  fromImport = false;

  constructor(
    public cms: CmsService,
    private modal: ModalService,
    public toastr: ToastrService,
    private route: ActivatedRoute,
    private importLoader: SeriesImportService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.forEach(params => {
     this.id = +params['id'];
     this.base = '/series/' + (this.id || 'new');
     this.loadSeries();
   });
  }

  ngOnDestroy() {
    this._onDestroy.next();
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
          } else {
            throw(err);
          }
        }
      );
    } else {
      this.cms.defaultAccount.subscribe(a => this.setSeries(a, null));
    }
  }

  buildSeries(parent: any, series: any) {
    let newSeries = new SeriesModel(parent, series);
    // Because the series state is split between component and model, make the
    // loadSeries method idempotent and preserve the podcast import polling
    // state with each call. Then refresh the series model based on import
    // status polling intervals.
    if (this.series) {
      newSeries.seriesImports = this.series.seriesImports;
    }
    return newSeries;
  }

  setSeries(parent: any, series: any) {
    this.series = this.buildSeries(parent, series);
    if (series) {
      this.storyCount = series.count('prx:stories');
      this.storyNoun = this.storyCount === 1 ? 'Episode' : 'Episodes';
      this.setImportState();
      this.setSeriesValidationStrategy();
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

  setImportState() {
    this.fromImport = this.series.doc.count('prx:podcast-imports') > 0;
    if (this.fromImport) {
      this.pollForImportState();
    }
  }

  pollForImportState() {
    if (this.series.seriesImports !== null) {
      return this.series.seriesImports;
    }

    this.series.seriesImports = this.importLoader.fetchImportsForSeries(this.series)
      .pipe(
        map((seriesImports) => {
          return seriesImports.map((si) => {
            return this.importLoader.pollForChanges(si);
          });
        })
      );

    // start up your pollers!
    this.series.seriesImports
      .takeUntil(this._onDestroy)
      .subscribe((seriesImports) => {
        seriesImports.map((siObservable) => {
          siObservable
            .pipe(
              takeUntil(this._onDestroy),
              // TODO sample the series resource less frequently
              // auditTime(5000)
            )
            .subscribe((si) => {
              this.seriesImportStateChanged(si);
            });
        });
      });

    return this.series.seriesImports;
  }

  seriesImportStateChanged(si) {
    if (si.isFinished()) {
      return si;
    }
    // the state of `this.series` has changed!
    this.loadSeries();

    return si;

  }

  validationStrategy() {
    return NEW_SERIES_VALIDATIONS;
  }

  setSeriesValidationStrategy() {
    this.series.setComponentValidationStrategy(this.validationStrategy());
  }

  save() {
    let wasNew = this.series.isNew;

    this.series.save().subscribe(() => {
      this.toastr.success(`Series ${wasNew ? 'created' : 'saved'}`);
      if (wasNew) {
        this.router.navigate(this.afterSaveNavigateParams());
      }
    });
  }

  discard() {
    this.series.discard();
  }

  afterSaveNavigateParams() {
    return ['/series', this.series.id];
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
