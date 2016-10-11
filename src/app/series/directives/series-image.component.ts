import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SeriesModel, TabService } from '../../shared';

@Component({
  styleUrls: [],
  template: `
    <form *ngIf="series">
      <publish-fancy-field label="Series Image">
        <div class="fancy-hint">This image will be used as the cover image for your series</div>
        <publish-image-upload [model]="series"></publish-image-upload>
      </publish-fancy-field>
    </form>
  `
})

export class SeriesImageComponent implements OnDestroy {

  series: SeriesModel;
  tabSub: Subscription;

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: SeriesModel) => this.series = s);
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
