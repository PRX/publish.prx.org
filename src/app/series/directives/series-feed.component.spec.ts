import { cit, create, provide, stubPipe } from '../../../testing';
import { SeriesFeedComponent } from './series-feed.component';
import { TabService } from 'ngx-prx-styleguide';

describe('SeriesFeedComponent', () => {

  create(SeriesFeedComponent);

  provide(TabService);

  stubPipe('duration');

  cit('shows a loading spinner', (fix, el, comp) => {
    comp.isLoaded = false;
    fix.detectChanges();
    expect(el).toQuery('prx-spinner');
  });

  cit('does not render until the series is loaded', (fix, el, comp) => {
    expect(el).not.toContainText('stories');
    comp.series = {};
    comp.noStories = true;
    comp.isLoaded = true;
    fix.detectChanges();

    expect(el).toContainText('You have no published episodes');
  });

  cit('displays story titles and publication status', (fix, el, comp) => {
    comp.series = {};
    comp.isLoaded = true;
    comp.publicStories = [
      {title: 'First Public Story'},
      {title: 'Second Public Story'},
    ];
    comp.futurePublicStories = [
      {title: 'Future Story'}
    ];
    comp.privateStories = [
      {title: 'Private Story'}
    ];
    fix.detectChanges();
    expect(el).toContainText('Private Story');
    expect(el).toContainText('Future Story');
    expect(el).toContainText('First Public Story');
    expect(el).toContainText('Second Public Story');
  });

});
