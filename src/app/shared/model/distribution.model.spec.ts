import { cms } from '../../../testing';
import { DistributionModel } from './distribution.model';

describe('DistributionModel', () => {

  let podcastUrl = 'http://some.where/your/podcast/1234';
  let series = cms.mock('prx:series', {id: 'series1'});
  let account = series.mock('prx:account', {name: 'my account name'});
  let alternate = series.mock('alternate', {href: 'http://linkto.beta'});
  let fooDist = series.mock('prx:distributions', {id: 'dist1', kind: 'foo'});
  let podDist = series.mock('prx:distributions', {id: 'dist2', kind: 'podcast', url: podcastUrl});
  let podcast = podDist.mock(podcastUrl, {id: 'pod1'});
  let tpls = podDist.mockItems('prx:audio-version-templates', [{id: 'template1'}]);
  tpls[0].mockItems('prx:audio-file-templates', []);

  beforeEach(() => window.localStorage.clear());

  it('loads no podcast by default', () => {
    let dist = new DistributionModel(series, podDist);
    expect(dist.kind).toEqual('podcast');
    expect(dist.RELATIONS).toContain('podcast');
    expect(dist.podcast).toBeUndefined();
  });

  it('loads no podcast for unknown distribution types', () => {
    let dist = new DistributionModel(series, fooDist, true);
    expect(dist.kind).toEqual('foo');
    expect(dist.RELATIONS).toContain('podcast');
    expect(dist.podcast).toBeNull();
  });

  it('creates a new podcast for new distributions', () => {
    let dist = new DistributionModel(series, null, true);
    expect(dist.kind).toEqual('');
    expect(dist.RELATIONS).toContain('podcast');
    expect(dist.podcast).not.toBeNull();
    expect(dist.podcast.category).toEqual('');
    expect(dist.podcast.authorName).toEqual(account['name']);
  });

  it('defaults author and link for new podcasts', () => {
    let dist = new DistributionModel(series, null, true);
    expect(dist.podcast).not.toBeNull();
    expect(dist.podcast.authorName).toEqual(account['name']);
    expect(dist.podcast.link).toEqual(alternate['href']);
  });

  it('loads the feeder podcast on-demand only', () => {
    let dist = new DistributionModel(series, podDist);
    expect(dist.podcast).toBeUndefined();
    dist.loadRelated('podcast');
    expect(dist.podcast).not.toBeNull();
    expect(dist.podcast.id).toEqual(podcast.id);
  });

  it('swaps the new feeder podcast for an existing one', () => {
    let dist = new DistributionModel(series, podDist);
    expect(dist.podcast).toBeUndefined();

     // a new-looking podcast model
    dist.podcast = (new DistributionModel(series, null, true)).podcast;
    dist.podcast.set('category', 'Education');

    dist.swapRelated().subscribe();
    expect(dist.podcast.id).toEqual('pod1');
    expect(dist.podcast.category).toEqual('Education');
  });

  it('loads the version templates', () => {
    let dist = new DistributionModel(series, podDist);
    dist.loadRelated('versionTemplates');
    expect(dist.versionTemplates.length).toEqual(1);
    expect(dist.versionTemplates[0].id).toEqual('template1');
  });

});
