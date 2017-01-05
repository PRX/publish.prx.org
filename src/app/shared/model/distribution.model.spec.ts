import { cms } from '../../../testing';
import { Observable } from 'rxjs';
import { DistributionModel } from './distribution.model';

describe('DistributionModel', () => {

  let podcastUrl = 'http://some.where/your/podcast/1234';
  let series = cms.mock('prx:series', {id: 'series1'});
  let fooDist = series.mock('prx:distributions', {id: 'dist1', kind: 'foo'});
  let podDist = series.mock('prx:distributions', {id: 'dist2', kind: 'podcast', url: podcastUrl});
  let seriesVersionTemplates = series.mockItems('prx:audio-version-templates', []);
  let seriesVersionFileTemplates = series.mockItems('prx:audio-file-templates', [{}]);
  let seriesVersionFileTemplateItems = seriesVersionFileTemplates[0].mockItems('prx:items', [{}]);
  let fooDistTemplate = fooDist.mock('prx:audio-version-template', {id: 'templateFoo'});
  let fooDistFileTemplate = fooDistTemplate.mock('prx:audio-file-templates', {id: 'fileFoo'});
  let fooDistFileTemplateItems = fooDistFileTemplate.mockItems('prx:items', [{}]);
  let podDistTemplate = podDist.mock('prx:audio-version-template', {id: 'templatePod'});
  let podDistFileTemplate = podDistTemplate.mock('prx:audio-file-templates', {id: 'filePod'});
  let podDistFileTemplateItems = podDistFileTemplate.mockItems('prx:items', [{}]);
  let podcast = podDist.mock(podcastUrl, {id: 'pod1'});

  beforeEach(() => window.localStorage.clear());

  it('loads no podcast by default', () => {
    let dist = new DistributionModel({series, distribution: fooDist});
    expect(dist.kind).toEqual('foo');
    expect(dist.RELATIONS).toContain('podcast');
    expect(dist.podcast).toBeNull();
  });

  it('creates a new podcast for new distributions', () => {
    let dist = new DistributionModel({series});
    expect(dist.kind).toEqual('');
    expect(dist.RELATIONS).toContain('podcast');
    expect(dist.podcast).not.toBeNull();
    expect(dist.podcast.category).toEqual('');
  });

  it('loads the feeder podcast on-demand only', () => {
    let dist = new DistributionModel({series, distribution: podDist});
    expect(dist.podcast).toBeNull();
    dist.loadExternal().subscribe();
    expect(dist.podcast).not.toBeNull();
    expect(dist.podcast.id).toEqual(podcast.id);
  });

  it('does not attempt to create the feeder podcast directly', () => {
    let dist = new DistributionModel({series, distribution: podDist});
    expect(dist.podcast).toBeNull();
    dist.podcast = (new DistributionModel({series})).podcast; // get new-looking podcast
    dist.podcast.set('category', 'Education');
    spyOn(podcast, 'create').and.returnValue(Observable.empty());
    spyOn(podcast, 'update').and.returnValue(Observable.empty());
    dist.saveRelated().subscribe();
    expect(dist.podcast.id).toEqual('pod1');
    expect(dist.podcast.category).toEqual('Education');
    expect(podcast.create).not.toHaveBeenCalled();
    expect(podcast.update).toHaveBeenCalled();
  });

});
