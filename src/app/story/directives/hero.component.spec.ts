import { cit, create, provide, stubPipe } from '../../../testing';
import { Router } from '@angular/router';
import { RouterStub } from '../../../testing/stub.router';
import { ToastrService } from 'ngx-prx-styleguide';
import { StoryHeroComponent } from './hero.component';

describe('StoryHeroComponent', () => {

  create(StoryHeroComponent);
  provide(Router, RouterStub);
  provide(ToastrService, {success: () => {}});

  stubPipe('timeago');

  cit('shows edit vs create state', (fix, el, comp) => {
    expect(el).toContainText('Create Episode');
    comp.id = 1234;
    fix.detectChanges();
    expect(el).toContainText('Edit Episode');
  });
});
