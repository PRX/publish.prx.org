import { cms } from '../../../testing';
import { SeriesImportModel } from './series-import.model';

describe('SeriesImportModel', () => {

  let accountMock: any;
  let seriesImportMock: any;

  beforeEach(() => {
    accountMock = cms.mock('prx:default-account', {id: 'account-id'});
    accountMock.mock('self', {href: '/api/v1/accounts/account-id'});

    seriesImportMock = cms.mock('prx:series-import', {id: 'series-import-id', url: 'http://www.some.com/rss', status: 'complete'});
    seriesImportMock.mock('prx:account', {href: '/api/v1/accounts/series-account-id'});
  });

  it('encodes a new seriesImport', () => {
    let seriesImport = new SeriesImportModel(accountMock, seriesImportMock);
    seriesImport.accountId = 100;

    const data = seriesImport.encode();
    expect(data['accountId']).toBe(100);
    expect(data['url']).toBe('http://www.some.com/rss');
  });


});
