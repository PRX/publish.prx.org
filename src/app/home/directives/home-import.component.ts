import { Component, Input, OnInit } from '@angular/core';
import { HalDoc } from '../../core';
import { SeriesImportModel } from '../../shared';
import { ToastrService } from 'ngx-prx-styleguide';

@Component({
  selector: 'created-podcast-imports',
  styleUrls: ['home-import.component.css'],
  template: `
    <div *ngIf="hasSeriesImports">


    <header>
      <h2>Your Series Import</h2>
    </header>

    <ul>
      <li *ngFor="let import of podcastImports">
        {{import.url}} {{import.status}}
      </li>
    </ul>
  </div>
  `
})

export class HomeImportComponent implements OnInit {


  @Input() auth: HalDoc;

  hasSeriesImports: boolean;
  hasPending: boolean;

  podcastImports: SeriesImportModel[];

  constructor(
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {

    this.auth.followItems('prx:podcast-imports').subscribe(imports => {
      let importModels = imports.map(si => {
        return new SeriesImportModel(this.auth, si)
        //var discoveredPending = !(si.status === "failed" || si.status === "complete")
        //console.log(`SeriesImport status: ${si.status}, discovered pending? ${discoveredPending}`)
        //return si;
      });
      this.setImports(importModels);
    },
      err => {
        if (err.status === 404 && err.name === 'HalHttpError') {
          this.toastr.error('ERRORZ');
        } else {
          throw(err);
        }
      }
    );
  }

  setImports(data: SeriesImportModel[]){
    this.podcastImports = data;
    this.hasSeriesImports =  this.podcastImports && this.podcastImports.length > 0;
  }

}
