import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SeriesModel, TabService } from '../../shared';

@Component({
  styleUrls: ['series-templates.component.css'],
  template: `
    <form *ngIf="series">

      <div *ngFor="let v of series.versionTemplates" class="version">

        <publish-fancy-field [model]="v" textinput=true name="label" label="Version Label" required>
        </publish-fancy-field>

        <publish-fancy-field [model]="v" label="Total Length" class="length" invalid="lengthAny">
          <div class="fancy-hint">The total length of all audio in this version, in seconds.</div>
          <publish-fancy-field [model]="v" name="lengthMinimum" label="Minimum" number=true small=true inline=true>
          </publish-fancy-field>
          <publish-fancy-field [model]="v" name="lengthMaximum" label="Maximum" number=true small=true inline=true>
          </publish-fancy-field>
        </publish-fancy-field>

        <publish-fancy-field [model]="v" label="Audio Segments">

          <b>No Segments</b>

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
