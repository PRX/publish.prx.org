import { Component, OnInit } from '@angular/core';
import { mergeMap } from 'rxjs/operators';
import { CmsService, HalDoc } from '../core';
import { SeriesModel } from '../shared';
import { ModalService } from 'ngx-prx-styleguide';

@Component({
  selector: 'publish-dashboard',
  styleUrls: ['dashboard.component.css'],
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  isLoaded = false;
  totalCount: number;
  noSeries: boolean;
  auth: HalDoc;
  defaultAccount: HalDoc;
  series: SeriesModel[];

  constructor(private cms: CmsService, private modal: ModalService) {}

  ngOnInit() {
    this.cms.auth
      .pipe(
        mergeMap((auth: HalDoc) => {
          this.auth = auth;
          return auth.follow('prx:default-account');
        }),
        mergeMap((defaultAccount: HalDoc) => {
          this.defaultAccount = defaultAccount;
          return this.auth.followItems('prx:series', { filters: 'v4', zoom: 'prx:image' });
        })
      )
      .subscribe((series: HalDoc[]) => {
        this.isLoaded = true;
        this.totalCount = series.length ? series[0].total() : 0;
        this.noSeries = series.length < 1 ? true : null;
        this.series = series.map((s) => new SeriesModel(null, s, false));

        if (this.auth['feederUiAccess'] && this.noSeries) {
          this.showFeederModal(this.auth['feederUiAccess']);
        }
      });
  }

  showFeederModal(url) {
    this.modal.show({
      title: 'Good news everyone!',
      body: `
        <p>It looks like all your podcasts have been migrated to our shiny new publishing application.</p>
        <hr/>
        <p>Go to <strong><a href="${url}">Dovetail Podcasts</a></strong> to access them!</p>
        <br/>
      `,
      primaryButton: `Let's Goooooooooo!`,
      buttonCallback: () => {
        window.location.href = url;
      }
      // height: 400,
      // width: 700
    });
  }
}
