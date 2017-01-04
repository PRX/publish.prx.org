import { cit, create, provide } from '../../../testing';
import { SeriesFeedComponent } from './series-feed.component';
import { TabService } from '../../shared';

describe('SeriesFeedComponent', () => {

  create(SeriesFeedComponent);

  provide(TabService);

  cit('does not render until the series and podcast are loaded', (fix, el, comp) => {
    expect(el).not.toContainText('Published Feed');
    comp.series = comp.podcast = {};
    comp.noStories = true;
    fix.detectChanges();

    expect(el).toContainText('You have no published stories');
  });

  cit('displays story titles and publication status', (fix, el, comp) => {
    comp.series = comp.podcast = {};
    comp.publicStories = [
      {title: 'First Public Story', pubDate: new Date()},
      {title: 'Second Public Story', pubDate: new Date()},
    ];
    comp.futurePublicStories = [
      {title: 'Future Story', pubDate: new Date('01/01/2020')}
    ];
    comp.privateStories = [
      {title: 'Private Story'}
    ];
    fix.detectChanges();
    expect(el).toContainText('Private Story');
    expect(el).toContainText('No publication date set');
    expect(el).toContainText('Future Story');
    expect(el).toContainText('Set for future publication');
    expect(el).toContainText('First Public Story');
    expect(el).toContainText('Second Public Story');
    expect(el).toContainText('Public feed');
  });

});
