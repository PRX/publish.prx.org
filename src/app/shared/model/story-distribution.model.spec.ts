import { cms } from '../../../testing';
import { StoryDistributionModel } from './story-distribution.model';

describe('StoryDistributionModel', () => {

  let episodeUrl = 'http://some.where/your/episode/1234';
  let series = cms.mock('prx:series', {id: 'series1'});
  let story = series.mock('prx:story', {id: 'series1'});
  let fooDist = series.mock('prx:distributions', {id: 'dist1', kind: 'foo'});
  let episodeDist = series.mock('prx:distributions', {id: 'dist2', kind: 'episode', url: episodeUrl});
  let episode = episodeDist.mock(episodeUrl, {id: 'episode1'});

  beforeEach(() => window.localStorage.clear());

  it('loads no episode by default', () => {
    let dist = new StoryDistributionModel(series, story, episodeDist);
    expect(dist.kind).toEqual('episode');
    expect(dist.RELATIONS).toContain('episode');
    expect(dist.episode).toBeUndefined();
  });

  it('loads no episode for unknown distribution types', () => {
    let dist = new StoryDistributionModel(series, story, fooDist, true);
    expect(dist.kind).toEqual('foo');
    expect(dist.RELATIONS).toContain('episode');
    expect(dist.episode).toBeNull();
  });

  it('creates a new episode for new distributions', () => {
    let dist = new StoryDistributionModel(series, null, null, true);
    expect(dist.kind).toEqual('');
    expect(dist.RELATIONS).toContain('episode');
    expect(dist.episode).not.toBeNull();
  });

  it('loads the feeder episode on-demand only', () => {
    let dist = new StoryDistributionModel(series, story, episodeDist);
    expect(dist.episode).toBeUndefined();
    dist.loadRelated('episode');
    expect(dist.episode).not.toBeNull();
    expect(dist.episode.id).toEqual(episode.id);
  });

  it('swaps the new feeder episode for an existing one', () => {
    let dist = new StoryDistributionModel(series, story, episodeDist);
    expect(dist.episode).toBeUndefined();

     // a new-looking episode model
    dist.episode = (new StoryDistributionModel(series, null, null, true)).episode;
    dist.episode.set('guid', 'some-guid');

    dist.swapRelated().subscribe();
    expect(dist.episode.id).toEqual('episode1');
    expect(dist.episode.guid).toEqual('some-guid');
  });

  it('hacks the distribution url for podcast distributions to get at the podcast id', () => {
    const dist = new StoryDistributionModel(series, story, episodeDist);
    expect(dist.feederEpisodeId).toEqual('1234');
  });

});
