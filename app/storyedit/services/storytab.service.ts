import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {StoryModel} from '../models/story.model';

@Injectable()
export class StoryTabService {

  private storyModelSource = new ReplaySubject<StoryModel>(1);

  get storyModel(): Observable<StoryModel> {
    return this.storyModelSource;
  }

  setStory(story: StoryModel) {
    this.storyModelSource.next(story);
  }

}
