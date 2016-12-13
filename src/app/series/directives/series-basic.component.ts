import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SeriesModel, TabService } from '../../shared';

@Component({
  template: `
    <form *ngIf="series">
      <publish-fancy-field textinput required [model]="series" name="title" label="Series Title" required>
        <div class="fancy-hint">What's the name of your series?</div>
      </publish-fancy-field>

      <publish-fancy-field textinput required [model]="series" name="shortDescription" label="Teaser" required>
        <div class="fancy-hint">A short description of your series.</div>
      </publish-fancy-field>

      <h3><label for="description">Description</label></h3>
      <p class="hint">A full description of your series.</p>
      <publish-wysiwyg *ngIf="series" [model]="series" name="description" [content]="series.description" [images]="series.images" 
        [changed]="descriptionChanged"></publish-wysiwyg>
    </form>
  `,
  styleUrls: ['./series-basic.component.css']
})

export class SeriesBasicComponent implements OnDestroy {

  series: SeriesModel;
  tabSub: Subscription;

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: SeriesModel) => this.series = s);
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  get descriptionChanged(): boolean {
    return this.series && this.series.changed('description', false);
  }
}
