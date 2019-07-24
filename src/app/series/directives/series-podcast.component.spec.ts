import { cit, create, provide } from '../../../testing';
import { of as observableOf } from 'rxjs';
import { SeriesPodcastComponent } from './series-podcast.component';
import { TabService } from 'ngx-prx-styleguide';

describe('SeriesPodcastComponent', () => {

  create(SeriesPodcastComponent);

  provide(TabService);

  cit('forces you to create the series first', (fix, el, comp) => {
    comp.series = {isNew: true, loadRelated: () => observableOf(null), distributions: []};
    fix.detectChanges();
    expect(el).toContainText('The series itself must be created');
    comp.series.isNew = false;
    comp.podcastTemplate = {};
    fix.detectChanges();
    expect(el).toContainText('Create Podcast');
  });

  cit('warns if no audio version templates exist', (fix, el, comp) => {
    comp.series = {loadRelated: () => observableOf(null), distributions: []};
    comp.audioVersionOptions = [];
    fix.detectChanges();
    expect(el).toContainText('This series must have audio templates');
    comp.series.isNew = false;
    comp.podcastTemplate = {};
    fix.detectChanges();
    expect(el).not.toContainText('Create Podcast');
  });

  cit('picks your only audio version template from the dropdown', (fix, el, comp) => {
    comp.series = {loadRelated: () => observableOf(null), distributions: []};
    comp.audioVersionOptions = [['Something', 'some-href']];
    comp.createDistribution();
    expect(comp.distribution.versionTemplateUrls).toEqual(['some-href']);
  });

  cit('finds podcast distributions for the series', (fix, el, comp) => {
    comp.series = {
      loadRelated: () => observableOf(null),
      distributions: [
        {id: 1, kind: 'something', loadRelated: () => observableOf(null)},
        {id: 2, kind: 'podcast', loadRelated: () => observableOf(null)},
        {id: 3, kind: 'podcast', loadRelated: () => observableOf(null)}
      ]
    };
    fix.detectChanges();
    expect(comp.distribution.id).toEqual(2);
  });

  cit('sets itunes subcategories', (fix, el, comp) => {
    comp.podcast = {set: () => null};
    comp.setSubCategories();
    expect(comp.subCategories).toEqual([]);

    comp.podcast.category = 'Music';
    comp.setSubCategories();
    expect(comp.subCategories).toEqual(['', 'Music Commentary', 'Music History', 'Music Interviews']);

    comp.podcast.category = 'Technology';
    comp.setSubCategories();
    expect(comp.subCategories).toEqual([]);
  });

  cit('unsets subcategory when the category changes', (fix, el, comp) => {
    comp.podcast = {set: () => null, category: 'Leisure', subCategory: ''};
    spyOn(comp.podcast, 'set').and.stub();
    comp.setSubCategories();
    expect(comp.podcast.set).not.toHaveBeenCalled();

    comp.podcast.subCategory = 'Crafts';
    comp.setSubCategories();
    expect(comp.podcast.set).not.toHaveBeenCalled();

    comp.podcast.category = 'Arts';
    comp.setSubCategories();
    expect(comp.podcast.set).toHaveBeenCalledWith('subCategory', '');
  });

  cit('gets a list of language options', (fix, el, comp) => {
    let langs = comp.getLanguageOptions();
    expect(langs.length).toEqual(210);
  });
});
