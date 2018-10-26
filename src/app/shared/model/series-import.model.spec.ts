import { cms } from '../../../testing';
import { SeriesImportModel } from './series-import.model';

describe('SeriesImportModel', () => {

  let accountMock: any;
  let podcastImportHal: any;

  beforeEach(() => {
    accountMock = cms.mock('prx:default-account', {id: 'account-id'});
    accountMock.mock('self', {href: '/api/v1/accounts/account-id'});

    podcastImportHal = cms.mock('prx:series-import', {
      id: 99,
      url: 'http://www.some.com/rss',
      status: 'complete',
      feedEpisodeCount: 10
    });
    podcastImportHal.mock('prx:account', {href: '/api/v1/accounts/series-account-id'});
    podcastImportHal.MOCKS['prx:episode-imports'] =  [];
    podcastImportHal.MOCKS['prx:episode-import-placeholders'] =  [];
  });

  it('encodes a new seriesImport', () => {
    let seriesImport = new SeriesImportModel(accountMock, podcastImportHal);
    seriesImport.accountId = 100;

    const data = seriesImport.encode();
    expect(data['accountId']).toBe(100);
    expect(data['url']).toBe('http://www.some.com/rss');
  });

  it('populates a list of episodeImports', () => {
    podcastImportHal.MOCKS['prx:episode-imports'] = [{id: 1}, {id: 2}, {id: 3}];
    podcastImportHal.MOCKS['prx:episode-import-placeholders'] = [{id: 4}, {id: 5}, {id: 6}];
    let seriesImport = new SeriesImportModel(accountMock, podcastImportHal);


    expect(seriesImport.episodeImports).not.toBeUndefined();
    expect(seriesImport.episodeImportPlaceholders).not.toBeUndefined();

    expect(seriesImport.episodeImports).toEqual([{id: 1}, {id: 2}, {id: 3}]);
    expect(seriesImport.episodeImportPlaceholders).toEqual([{id: 4}, {id: 5}, {id: 6}]);
  });


  it('#episodeImportsSomeFailed should be true if one episode imports failed', () => {
    podcastImportHal['MOCKS']['prx:episode-imports'] = [{status: 'failed'}, {status: 'complete'}];
    let seriesImport = new SeriesImportModel(accountMock, podcastImportHal);


    expect(seriesImport.episodeImportsSomeFailed()).toEqual(true);
  });

  it('#episodeImportsSomeFailed should be false if no episode imports failed', () => {
    podcastImportHal['MOCKS']['prx:episode-imports'] = [{status: 'complete'}, {status: 'complete'}, {status: 'story saved'}];
    let seriesImport = new SeriesImportModel(accountMock, podcastImportHal);


    expect(seriesImport.episodeImportsSomeFailed()).toEqual(false);
  });

  it('#seriesImport should supply a count of episodes to be imported', () => {
    let seriesImport = new SeriesImportModel(accountMock, podcastImportHal);

    expect(seriesImport.episodeImportsSomeFailed()).toEqual(false);
  });

  it('should supply a count of episodes to be imported', () => {
    podcastImportHal.MOCKS['prx:episode-import-placeholders'] = [{id: 6}];
    let seriesImport = new SeriesImportModel(accountMock, podcastImportHal);

    expect(seriesImport.feedEpisodeCount).toEqual(10);
    expect(seriesImport.entriesInRssFeed()).toEqual(10);
  });

  it('#episodeImportsRemaining', () => {
    podcastImportHal['MOCKS']['prx:episode-imports'] = [{status: 'complete'}, {status: 'complete'}, {status: 'story saved'}];
    let seriesImport = new SeriesImportModel(accountMock, podcastImportHal);


    seriesImport.feedEpisodeCount = 3;
    expect(seriesImport.episodeImportsRemaining()).toEqual(1);
  });

  it('should display an initializing screen if feedEpisodeCount is not set', () => {
    let seriesImport = new SeriesImportModel(accountMock, podcastImportHal);
    seriesImport.feedEpisodeCount = undefined;
    let seriesImport = new SeriesImportModel(accountMock, podcastImportHal);

    expect(seriesImport.isInitializing()).not.toBe(true);
  });

});
