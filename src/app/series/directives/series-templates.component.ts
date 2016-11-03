import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SeriesModel, TabService } from '../../shared';

@Component({
  styleUrls: ['series-templates.component.css'],
  template: `
    <form *ngIf="series">

      <div *ngFor="let v of series.versionTemplates" class="version">

        <publish-fancy-field textinput required [model]="v" name="label" label="Version Label">
        </publish-fancy-field>

        <publish-fancy-field class="length" [model]="v" label="Total length in seconds" invalid="lengthAny">
          <publish-fancy-field number small inline hideinvalid [model]="v" name="lengthMinimum" label="Minimum">
          </publish-fancy-field>
          <publish-fancy-field number small inline hideinvalid [model]="v" name="lengthMaximum" label="Maximum">
          </publish-fancy-field>
        </publish-fancy-field>

        <publish-fancy-field label="Audio Segments">
          <publish-file-template *ngFor="let t of v.fileTemplates" [file]="t">
          </publish-file-template>
          <div *ngIf="!v.fileTemplates.length" class="empty">
            <h4>No segments defined</h4>
          </div>
        </publish-fancy-field>

      </div>

    </form>
  `
})

export class SeriesTemplatesComponent implements OnDestroy {

  series: SeriesModel;
  tabSub: Subscription;

  constructor(tab: TabService) {
    this.tabSub = tab.model.subscribe((s: SeriesModel) => this.series = s);
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

}
