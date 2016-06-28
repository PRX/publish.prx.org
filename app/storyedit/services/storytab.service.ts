import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {StoryModel} from '../models/story.model';

@Injectable()
export class StoryTabService {

  private storyModelSource = new ReplaySubject<StoryModel>(1);

  private heroTextSource = new ReplaySubject<string>(1);

  get storyModel(): Observable<StoryModel> {
    return this.storyModelSource;
  }

  get heroText(): Observable<string> {
    return this.heroTextSource;
  }

  setStory(story: StoryModel) {
    this.storyModelSource.next(story);
  }

  setHero(text: string) {
    this.heroTextSource.next(text);
  }

}
