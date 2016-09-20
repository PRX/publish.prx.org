import { Routes } from '@angular/router';
import { AuthGuard, DeactivateGuard } from '../shared';

import { StoryComponent }       from './story.component';
import { StoryHeroComponent }   from './directives/hero.component';
import { EditComponent }        from './directives/edit.component';
import { DecorateComponent }    from './directives/decorate.component';
import { SellComponent }        from './directives/sell.component';

import { ButtonComponent, FancyFieldComponent, HeroComponent }  from '../shared';
import { AudioUploadComponent, ImageUploadComponent, AudioFileComponent,
  AudioVersionComponent, FileSelectDirective, ImageFileComponent} from '../upload';

export const storyComponents: any[] = [
  StoryComponent,
  StoryHeroComponent,
  EditComponent,
  DecorateComponent,
  SellComponent,

  ButtonComponent,
  FancyFieldComponent,
  HeroComponent,

  AudioUploadComponent,
  ImageUploadComponent,
  AudioFileComponent,
  AudioVersionComponent,
  FileSelectDirective,
  ImageFileComponent
];

export const storyRoutes: Routes = [
  {
    path: 'edit/:id',
    component: StoryComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard],
    children: [
      { path: '',         component: EditComponent },
      { path: 'decorate', component: DecorateComponent },
      { path: 'sell',     component: SellComponent }
    ]
  },
  {
    path: 'create',
    component: StoryComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard],
    children: [
      { path: '',         component: EditComponent },
      { path: 'decorate', component: DecorateComponent },
      { path: 'sell',     component: SellComponent }
    ]
  },
  {
    path: 'create/:series_id',
    component: StoryComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard],
    children: [
      { path: '',         component: EditComponent },
      { path: 'decorate', component: DecorateComponent },
      { path: 'sell',     component: SellComponent }
    ]
  }
];
