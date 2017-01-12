import { cms } from '../../../testing';
import { FeederEpisodeModel } from './feeder-episode.model';

describe('FeederEpisodeModel', () => {

  let series = cms.mock('prx:series', {id: 'series1'});
  let story = series.mock('prx:story', {id: '186750'});
  let dist = story.mock('prx:distributions', {id: 'dist1', kind: 'episode'});

  beforeEach(() => window.localStorage.clear());

  it('decodes author name and email', () => {
    let doc = cms.mock('some-episode', {author: {name: 'John Q. Public', email: 'john@q.public.com'}});
    let episode = new FeederEpisodeModel(series, dist, doc);
    expect(episode.authorName).toEqual('John Q. Public');
    expect(episode.authorEmail).toEqual('john@q.public.com');
  });

  it('encodes author name and email', () => {
    let episode = new FeederEpisodeModel(series, dist);
    expect(episode.encode()['author']).toBeNull();
    episode.set('authorName', 'name');
    expect(episode.encode()['author']).toEqual({name: 'name'});
    episode.set('authorEmail', 'email');
    expect(episode.encode()['author']).toEqual({name: 'name',  email: 'email'});
  });

  it('only validates guids for existing models', () => {
    let newEpisode = new FeederEpisodeModel(series, dist);
    expect(newEpisode.guid).toEqual('');
    expect(newEpisode.invalid('guid')).toBeFalsy();

    let doc = cms.mock('some-episode', {id: 1234});
    let oldEpisode = new FeederEpisodeModel(series, dist, doc);
    expect(oldEpisode.guid).toEqual('');
    expect(oldEpisode.invalid('guid')).toMatch(/guid is a required field/);
    oldEpisode.set('guid', '1234');
    expect(oldEpisode.invalid('guid')).toBeFalsy();
  });

});
