import { cit, create, provide, By } from '../../../testing';
import { PodcastComponent } from './podcast.component';
import { TabService } from '../../shared';

describe('PodcastComponent', () => {

  create(PodcastComponent);

  provide(TabService);

  cit('does not render until the episode is loaded', (fix, el, comp) => {
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
    expect(el).not.toQuery('publish-fancy-field');
    comp.episode = {
      original: {guid: 'bar'},
      changed: () => false
    };
    comp.version = 'foo';
    fix.detectChanges();

    expect(el.queryAll(By.css('publish-fancy-field')).length).toEqual(6);
    expect(el).toContainText('explicit material');
    expect(el).toContainText('author info');
    expect(el).toContainText('GUID');
  });

});
