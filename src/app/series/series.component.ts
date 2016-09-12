import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeroComponent } from '../shared';

@Component({
  directives: [HeroComponent],
  selector: 'publish-series',
  styleUrls: ['series.component.css'],
  templateUrl: 'series.component.html'
})

export class SeriesComponent implements OnInit, OnDestroy {

  private isLoading = true;

  // private id: number;
  // private accountId: number;
  // private series: SeriesModel;

  constructor() {
    setInterval(() => this.isLoading = !this.isLoading, 5000);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
