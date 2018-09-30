import { cit, create, provide, By, cms } from '../../testing';
import { RouterStub, ActivatedRouteStub } from '../../testing/stub.router';
import { ActivatedRoute, Router } from '@angular/router';
import { SeriesImportStatusCardComponent } from './series-import-status-card.component';
import { ModalService, TabService, ToastrService } from 'ngx-prx-styleguide';
import { SeriesImportModel } from '../shared';
import { MockHalDoc } from 'ngx-prx-styleguide';

let activatedRoute = new ActivatedRouteStub();
let router = new RouterStub();

fdescribe('SeriesImportStatusCardComponent', () => {

  create(SeriesImportStatusCardComponent, false);
  provide(Router, router);
  provide(ActivatedRoute, activatedRoute);

  let seriesImport;
  let podcastImportHal;
  beforeEach(() => {
    podcastImportHal = new MockHalDoc({id: 99, episodeImportingCount: 10});
    podcastImportHal.MOCKS['prx:episode-imports'] =  []
    podcastImportHal.MOCKS['prx:episode-import-placeholders'] =  []

    seriesImport = new SeriesImportModel(new MockHalDoc(), podcastImportHal)
  });

  cit('populates a list of episodeImports', (fix, el, comp) => {

    podcastImportHal.MOCKS['prx:episode-imports'] = [{id: 1}, {id: 2}, {id: 3}]
    podcastImportHal.MOCKS['prx:episode-import-placeholders'] = [{id: 4}, {id: 5}, {id: 6}]

    comp.seriesImport = seriesImport;
    fix.detectChanges();
    expect(comp.episodeImports).not.toBeUndefined();
    expect(comp.episodeImportPlaceholders).not.toBeUndefined();

    expect(comp.episodeImports).toEqual([{id: 1}, {id: 2}, {id: 3}])
    expect(comp.episodeImportPlaceholders).toEqual([{id: 4}, {id: 5}, {id: 6}])
  });


  cit('#episodeImportsSomeFailed should be true if one episode imports failed', (fix, el, comp) => {
    podcastImportHal['MOCKS']['prx:episode-imports'] = [{status: "failed"}, {status: "complete"}]

    comp.seriesImport = seriesImport;
    fix.detectChanges();

    expect(comp.episodeImportsSomeFailed()).toEqual(true);
  });

  cit('#episodeImportsSomeFailed should be false if no episode imports failed', (fix, el, comp) => {
    podcastImportHal['MOCKS']['prx:episode-imports'] = [{status: "complete"}, {status: "complete"}, {status: "story saved"}]

    comp.seriesImport = seriesImport;
    fix.detectChanges();

    expect(comp.episodeImportsSomeFailed()).toEqual(false);
  });

  cit('#seriesImport should supply a count of episodes to be imported', (fix, el, comp) => {
    comp.seriesImport = seriesImport;
    fix.detectChanges();

    expect(comp.episodeImportsSomeFailed()).toEqual(false);
  });

  cit('should supply a count of episodes to be imported', (fix, el, comp) => {
    comp.seriesImport = seriesImport;
    fix.detectChanges();
    expect(comp.seriesImport.episodeImportingCount).toEqual(10);
  });

  cit('#episodeImportsRemaining', (fix, el, comp) => {
    podcastImportHal['MOCKS']['prx:episode-imports'] = [{status: "complete"}, {status: "complete"}, {status: "story saved"}]
    comp.seriesImport = seriesImport;
    comp.seriesImport.episodeImportingCount = 3;
    fix.detectChanges();
    expect(comp.episodeImportsRemaining()).toEqual(1);
  });

});
