import { cms } from '../../../testing';
import { DistributionModel } from './distribution.model';

describe('DistributionModel', () => {

  let podcastUrl = 'http://some.where/your/podcast/1234';
  let series = cms.mock('prx:series', {id: 'series1'});
  let account = series.mock('prx:account', {name: 'my account name'});
  let fooDist = series.mock('prx:distributions', {id: 'dist1', kind: 'foo'});
  let podDist = series.mock('prx:distributions', {id: 'dist2', kind: 'podcast', url: podcastUrl});
  let podcast = podDist.mock(podcastUrl, {id: 'pod1'});
  let podDistTemplate = podDist.mock('prx:audio-version-template', {id: 'template1'});
  podDistTemplate.mockItems('prx:audio-file-templates', []);

  beforeEach(() => window.localStorage.clear());

  it('loads no podcast by default', () => {
    let dist = new DistributionModel({series, distribution: podDist});
    expect(dist.kind).toEqual('podcast');
    expect(dist.RELATIONS).toContain('podcast');
    expect(dist.podcast).toBeUndefined();
  });

  it('loads no podcast for unknown distribution types', () => {
    let dist = new DistributionModel({series, distribution: fooDist}, true);
    expect(dist.kind).toEqual('foo');
    expect(dist.RELATIONS).toContain('podcast');
    expect(dist.podcast).toBeNull();
  });

  it('creates a new podcast for new distributions', () => {
    let dist = new DistributionModel({series}, true);
    expect(dist.kind).toEqual('');
    expect(dist.RELATIONS).toContain('podcast');
    expect(dist.podcast).not.toBeNull();
    expect(dist.podcast.category).toEqual('');
    expect(dist.podcast.authorName).toEqual(account['name']);
  });

  it('loads the feeder podcast on-demand only', () => {
    let dist = new DistributionModel({series, distribution: podDist});
    expect(dist.podcast).toBeUndefined();
    dist.loadRelated('podcast');
    expect(dist.podcast).not.toBeNull();
    expect(dist.podcast.id).toEqual(podcast.id);
  });

  it('swaps the new feeder podcast for an existing one', () => {
    let dist = new DistributionModel({series, distribution: podDist});
    expect(dist.podcast).toBeUndefined();

     // a new-looking podcast model
    dist.podcast = (new DistributionModel({series}, true)).podcast;
    dist.podcast.set('category', 'Education');

    dist.swapRelated().subscribe();
    expect(dist.podcast.id).toEqual('pod1');
    expect(dist.podcast.category).toEqual('Education');
  });

  it('loads the version template', () => {
    let dist = new DistributionModel({series, distribution: podDist});
    dist.loadRelated('versionTemplate');
    expect(dist.versionTemplate.id).toEqual(podDistTemplate.id);
  });

});
