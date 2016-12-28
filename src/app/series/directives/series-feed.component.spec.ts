import { cit, create, provide } from '../../../testing';
import { SeriesFeedComponent } from './series-feed.component';
import { TabService } from '../../shared';

describe('SeriesFeedComponent', () => {

  create(SeriesFeedComponent);

  provide(TabService);

  cit('does not render until the series and podcast are loaded', (fix, el, comp) => {
    expect(el).not.toContainText('Published Feed');
    comp.series = comp.podcast = {};
    fix.detectChanges();

    expect(el).toContainText('Published Feed');
    expect(el).toContainText('published stories as they appear');
  });

  cit('displays story titles and pub dates', (fix, el, comp) => {
    comp.series = comp.podcast = {};
    comp.stories = [
      {title: 'First Story', pubDate: new Date()},
      {title: 'Second Story', pubDate: new Date()},
    ];
    fix.detectChanges();
    expect(el).toContainText('First Story');
    expect(el).toContainText('Second Story');
    expect(el).toContainText('Published ');
  });

});
