import {Injectable} from 'angular2/core';
import {Subject} from 'rxjs';
import {StoryModel} from '../models/story.model';

@Injectable()
export class StoryTabService {

  // Sources
  storyModelSource = new Subject<StoryModel>();
  heroTextSource = new Subject<string>();

  // Streams
  storyModel = this.storyModelSource.asObservable();
  heroText = this.heroTextSource.asObservable();

  // Service message commands
  setStory(story: StoryModel) {
    this.storyModelSource.next(story);
  }

  setHero(text: string) {
    this.heroTextSource.next(text);
  }

}
