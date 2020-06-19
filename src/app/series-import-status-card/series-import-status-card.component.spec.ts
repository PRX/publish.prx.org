import { create, provide } from '../../testing';
import { RouterStub, ActivatedRouteStub } from '../../testing/stub.router';
import { ActivatedRoute, Router } from '@angular/router';
import { SeriesImportStatusCardComponent } from './series-import-status-card.component';
import { SeriesImportModel } from '../shared';
import { MockHalDoc } from 'ngx-prx-styleguide';

const activatedRoute = new ActivatedRouteStub();
const router = new RouterStub();

describe('SeriesImportStatusCardComponent', () => {
  create(SeriesImportStatusCardComponent, false);
  provide(Router, router);
  provide(ActivatedRoute, activatedRoute);

  let seriesImport;
  let podcastImportHal;
  beforeEach(() => {
    podcastImportHal = new MockHalDoc({ id: 99, feedEpisodeCount: 10 });
    podcastImportHal.MOCKS['prx:episode-imports'] = [];
    podcastImportHal.MOCKS['prx:episode-import-placeholders'] = [];

    seriesImport = new SeriesImportModel(new MockHalDoc(), podcastImportHal);
  });
});
