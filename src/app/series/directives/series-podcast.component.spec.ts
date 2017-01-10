import { cit, create, provide } from '../../../testing';
import { SeriesPodcastComponent } from './series-podcast.component';
import { TabService } from '../../shared';

describe('SeriesPodcastComponent', () => {

  create(SeriesPodcastComponent);

  provide(TabService);

  cit('forces you to create the series first', (fix, el, comp) => {
    comp.series = {isNew: true};
    fix.detectChanges();
    expect(el).toContainText('The series itself must be created');
    comp.series.isNew = false;
    comp.podcastTemplate = {};
    fix.detectChanges();
    expect(el).toContainText('Create Podcast');
  });

  cit('warns if no audio version templates exist', (fix, el, comp) => {
    comp.series = {};
    comp.podcastTemplate = undefined;
    fix.detectChanges();
    expect(el).toContainText('This series must have audio templates');
    comp.series.isNew = false;
    comp.podcastTemplate = {};
    fix.detectChanges();
    expect(el).toContainText('Create Podcast');
  });

  cit('finds podcast distributions for the series', (fix, el, comp) => {
    comp.series = {distributions: [
      {id: 1, kind: 'something'}, {id: 2, kind: 'podcast'}, {id: 3, kind: 'podcast'}
    ]};
    spyOn(comp, 'loadPodcast').and.stub();
    fix.detectChanges();
    expect(comp.distribution.id).toEqual(2);
    expect(comp.loadPodcast).toHaveBeenCalled();
  });

  cit('sets itunes subcategories', (fix, el, comp) => {
    comp.podcast = {set: () => null};
    comp.setSubCategories();
    expect(comp.subCategories).toEqual([]);

    comp.podcast.category = 'Music';
    comp.setSubCategories();
    expect(comp.subCategories).toEqual([]);

    comp.podcast.category = 'Technology';
    comp.setSubCategories();
    expect(comp.subCategories).toEqual(['', 'Gadgets', 'Tech News', 'Podcasting', 'Software How-To']);
  });

  cit('unsets subcategory when the category changes', (fix, el, comp) => {
    comp.podcast = {set: () => null, category: 'Technology', subCategory: ''};
    spyOn(comp.podcast, 'set').and.stub();
    comp.setSubCategories();
    expect(comp.podcast.set).not.toHaveBeenCalled();

    comp.podcast.subCategory = 'Gadgets';
    comp.setSubCategories();
    expect(comp.podcast.set).not.toHaveBeenCalled();

    comp.podcast.category = 'Arts';
    comp.setSubCategories();
    expect(comp.podcast.set).toHaveBeenCalledWith('subCategory', '');
  });

});
