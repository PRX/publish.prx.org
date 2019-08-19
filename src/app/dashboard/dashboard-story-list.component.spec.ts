import { cit, create } from '../../testing';
import { DashboardStoryListComponent } from './dashboard-story-list.component';
import { StoryModel } from 'app/shared';

describe('DashboardStoryListComponent', () => {

  create(DashboardStoryListComponent, false);

  cit('status for unpublished stories is draft', (fix, el, comp) => {
    const story = {isNew: false, publishedAt: null, changed: () => true} as StoryModel;
    expect(comp.storyStatus(story)).toEqual('draft');
  });

  cit('status for future published stories is scheduled', (fix, el, comp) => {
    const story = {isNew: false, publishedAt: new Date(), isPublished: () => false, changed: () => true} as StoryModel;
    expect(comp.storyStatus(story)).toEqual('scheduled');
  });

});
