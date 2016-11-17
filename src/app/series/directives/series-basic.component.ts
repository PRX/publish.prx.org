import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SeriesModel, TabService } from '../../shared';

@Component({
  styleUrls: [],
  template: `
    <form *ngIf="series">
      <publish-fancy-field textinput required [model]="series" name="title" label="Series Title">
        <div class="fancy-hint">A short headline to describe this series.</div>
      </publish-fancy-field>

      <publish-fancy-field textinput required [model]="series" name="shortDescription" label="Teaser">
        <div class="fancy-hint">A first impression for your series.</div>
      </publish-fancy-field>

      <publish-fancy-field textarea [model]="series" name="description" label="Description">
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
