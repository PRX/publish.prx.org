import { cms } from '../../../testing';
import { SeriesModel } from './series.model';

describe('SeriesModel', () => {

  let accountMock: any, seriesMock: any;
  beforeEach(() => {
    accountMock = cms.mock('prx:default-account', {id: 'account-id'});
    accountMock.mock('self', {href: '/api/v1/accounts/account-id'});

    seriesMock = cms.mock('prx:series', {id: 'series-id'});
    seriesMock.mock('prx:account', {href: '/api/v1/accounts/series-account-id'});
  });

  const makeSeries = (isNew: boolean) => {
    if (isNew) {
      return new SeriesModel(accountMock, null);
    } else {
      return new SeriesModel(accountMock, seriesMock);
    }
  };

  it('allows account switching on new series', () => {
    let series = makeSeries(true);
    series.accountId = 100;
    const data = series.encode();
    expect(data['set_account_uri']).toMatch(/100/);
    expect(data['set_account_uri']).not.toMatch(/account-id/);
  });

  it('allows account switching on existing series', () => {
    let series = makeSeries(false);
    series.accountId = 200;
    const data = series.encode();
    expect(data['set_account_uri']).toMatch(/200/);
    expect(data['set_account_uri']).not.toMatch(/series-account-id/);
  });

  it('restores account id on discard', () => {
    const series = makeSeries(false);
    const originalAccountId = series.accountId;
    series.set('accountId', 200);
    series.discard();
    expect(originalAccountId).not.toBeNull();
    expect(series.accountId).toEqual(originalAccountId);
    series.set('accountId', null);
    series.discard();
    expect(series.accountId).toEqual(originalAccountId);
  });

  it('allows clearing version templates on new series', () => {
    let series = makeSeries(true);
    expect(series.versionTemplates.length).toEqual(1);
    series.flushVersionTemplates();
    expect(series.versionTemplates.length).toEqual(0);
  });

});
