import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SeriesModel, TabService } from '../../shared';

@Component({
  styleUrls: [],
  template: `
    <form *ngIf="series">
      <publish-fancy-field [model]="series" textarea="true" name="title" label="Series Title" required>
        <div class="fancy-hint">A short headline to describe this series.</div>
      </publish-fancy-field>

      <publish-fancy-field [model]="series" textarea="true" name="shortDescription" label="Teaser" required>
        <div class="fancy-hint">A first impression for your series.</div>
      </publish-fancy-field>

      <publish-fancy-field [model]="series" textarea="true" name="description" label="Description" required>
        <div class="fancy-hint">A longer version of your teaser.</div>
      </publish-fancy-field>
    </form>
  `
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

}
