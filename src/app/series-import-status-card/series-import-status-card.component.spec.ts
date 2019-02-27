import { cit, create, provide, By, cms } from '../../testing';
import { RouterStub, ActivatedRouteStub } from '../../testing/stub.router';
import { ActivatedRoute, Router } from '@angular/router';
import { SeriesImportStatusCardComponent } from './series-import-status-card.component';
import { ModalService, TabService, ToastrService } from 'ngx-prx-styleguide';
import { SeriesImportModel } from '../shared';
import { MockHalDoc } from 'ngx-prx-styleguide';
import { Subscription } from 'rxjs';

let activatedRoute = new ActivatedRouteStub();
let router = new RouterStub();

function setupComp(comp, seriesImport) {
  comp.seriesImport = seriesImport;
  spyOn(comp, 'refreshSeriesImport');
  comp.refresher = Subscription.EMPTY;
}

describe('SeriesImportStatusCardComponent', () => {

  create(SeriesImportStatusCardComponent, false);
  provide(Router, router);
  provide(ActivatedRoute, activatedRoute);

  let seriesImport;
  let podcastImportHal;
  beforeEach(() => {
    podcastImportHal = new MockHalDoc({id: 99, feedEpisodeCount: 10});
    podcastImportHal.MOCKS['prx:episode-imports'] =  [];
    podcastImportHal.MOCKS['prx:episode-import-placeholders'] =  [];

    seriesImport = new SeriesImportModel(new MockHalDoc(), podcastImportHal);
  });


});
