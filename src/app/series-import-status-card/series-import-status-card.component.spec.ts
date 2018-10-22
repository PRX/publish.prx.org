import { cit, create, provide, By, cms } from '../../testing';
import { RouterStub, ActivatedRouteStub } from '../../testing/stub.router';
import { ActivatedRoute, Router } from '@angular/router';
import { SeriesImportStatusCardComponent } from './series-import-status-card.component';
import { ModalService, TabService, ToastrService } from 'ngx-prx-styleguide';
import { SeriesImportModel } from '../shared';
import { MockHalDoc } from 'ngx-prx-styleguide';
import { Subscription } from 'rxjs/Subscription';

let activatedRoute = new ActivatedRouteStub();
let router = new RouterStub();

function setupComp(comp, seriesImport){
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

  cit('populates a list of episodeImports', (fix, el, comp) => {

    podcastImportHal.MOCKS['prx:episode-imports'] = [{id: 1}, {id: 2}, {id: 3}];
    podcastImportHal.MOCKS['prx:episode-import-placeholders'] = [{id: 4}, {id: 5}, {id: 6}];

    setupComp(comp, seriesImport);

    fix.detectChanges();
    expect(comp.episodeImports).not.toBeUndefined();
    expect(comp.episodeImportPlaceholders).not.toBeUndefined();

    expect(comp.episodeImports).toEqual([{id: 1}, {id: 2}, {id: 3}]);
    expect(comp.episodeImportPlaceholders).toEqual([{id: 4}, {id: 5}, {id: 6}]);
  });


  cit('#episodeImportsSomeFailed should be true if one episode imports failed', (fix, el, comp) => {
    podcastImportHal['MOCKS']['prx:episode-imports'] = [{status: 'failed'}, {status: 'complete'}];

    setupComp(comp, seriesImport);
    fix.detectChanges();

    expect(comp.episodeImportsSomeFailed()).toEqual(true);
  });

  cit('#episodeImportsSomeFailed should be false if no episode imports failed', (fix, el, comp) => {
    podcastImportHal['MOCKS']['prx:episode-imports'] = [{status: 'complete'}, {status: 'complete'}, {status: 'story saved'}];

    setupComp(comp, seriesImport);
    fix.detectChanges();

    expect(comp.episodeImportsSomeFailed()).toEqual(false);
  });

  cit('#seriesImport should supply a count of episodes to be imported', (fix, el, comp) => {
    setupComp(comp, seriesImport);
    fix.detectChanges();

    expect(comp.episodeImportsSomeFailed()).toEqual(false);
  });

  cit('should supply a count of episodes to be imported', (fix, el, comp) => {
    podcastImportHal.MOCKS['prx:episode-import-placeholders'] = [{id: 6}];
    comp.seriesImport = seriesImport;
    spyOn(comp, 'refreshSeriesImport');
    fix.detectChanges();
    expect(comp.seriesImport.feedEpisodeCount).toEqual(10);
    expect(comp.entriesInRssFeed()).toEqual(11);
  });

  cit('#episodeImportsRemaining', (fix, el, comp) => {
    podcastImportHal['MOCKS']['prx:episode-imports'] = [{status: 'complete'}, {status: 'complete'}, {status: 'story saved'}];

    setupComp(comp, seriesImport);

    comp.seriesImport.feedEpisodeCount = 3;
    fix.detectChanges();
    expect(comp.episodeImportsRemaining()).toEqual(1);
  });

  cit('should display an initializing screen if feedEpisodeCount is not set', (fix, el, comp) => {
    setupComp(comp, seriesImport);
    comp.seriesImport.feedEpisodeCount = undefined;
    fix.detectChanges();

    let initScoreBoard = el.queryAll(By.css('.import-scoreboard')).find(e => {
      return e.nativeElement.textContent.trim() === 'Podcast Import is Initializing';
    });

    expect(initScoreBoard).not.toBeNull();
  });

});
