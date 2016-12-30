import { cms as cms, cms as feeder } from '../../../testing';
import { FeederEpisodeModel } from './feeder-episode.model';

describe('FeederEpisodeModel', () => {
  let story = cms.mock('prx:story', {id: '186750'});

  beforeEach(() => window.localStorage.clear());

  it('decodes author name and email', () => {
    let doc = feeder.mock('some-episode', {author: {name: 'John Q. Public', email: 'john@q.public.com'}});
    let episode = new FeederEpisodeModel(story, doc);
    expect(episode.authorName).toEqual('John Q. Public');
    expect(episode.authorEmail).toEqual('john@q.public.com');
  });

  it('decodes enclosure Url', () => {
    let doc = feeder.mock('some-episode', {media: [{href: 'http://q.public.com/podcast/episode/1234.mp3'}]});
    let episode = new FeederEpisodeModel(story, doc);
    expect(episode.enclosureUrl).toEqual('http://q.public.com/podcast/episode/1234.mp3');
  });

  it('allows the guid to be set', () => {
    let doc = feeder.mock('some-episode', {id: 1234, guid: 'prx:custompath:1234'});
    let episode = new FeederEpisodeModel(story, doc);
    expect(episode.id).toEqual('1234');
    expect(episode.guid).toEqual('prx:custompath:1234');
    episode.set('guid', 'prx:newcustompath:1234');
    expect(episode.guid).toEqual('prx:newcustompath:1234');
  });
});
