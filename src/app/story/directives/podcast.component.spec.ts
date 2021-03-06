import { cit, create, provide, By } from '../../../testing';
import { PodcastComponent } from './podcast.component';
import { TabService } from 'ngx-prx-styleguide';

describe('PodcastComponent', () => {

  create(PodcastComponent);

  provide(TabService);

  cit('does not render until the episode is loaded', (fix, el, comp) => {
    comp.story = {images: [], changed: () => false};
    comp.episode = null;
    fix.detectChanges();
    expect(el).not.toQuery('form');
    comp.episode = {
      original: {guid: 'bar'},
      changed: () => false
    };
    fix.detectChanges();
    expect(el).toQuery('form');
  });

  cit('shows the podcast distribution edit fields', (fix, el, comp) => {
    expect(el).not.toQuery('prx-fancy-field');
    comp.story = {images: [], changed: () => false};
    comp.episode = {
      original: {guid: 'bar'},
      changed: () => false
    };
    comp.versions = ['foo'];
    fix.detectChanges();

    expect(el.queryAll(By.css('prx-fancy-field')).length).toEqual(9);
    expect(el).toContainText('explicit material');
    expect(el).toContainText('type of episode');
    expect(el).toContainText('author info');
    expect(el).toContainText('GUID');
    expect(el).toContainText('public URL');
    expect(el).toContainText('summary');
  });

});
