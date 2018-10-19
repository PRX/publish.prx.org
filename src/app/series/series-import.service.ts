import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { mergeMap } from 'rxjs/operators/mergeMap';
import { takeWhile } from 'rxjs/operators/takeWhile';
import { SeriesModel, SeriesImportModel } from '../shared';

@Injectable()
export class SeriesImportService {
  seriesImports: Observable<SeriesImportModel[]>;

  constructor() {}

  loadImports(series: SeriesModel): any {
    this.seriesImports = series.doc.followItems('prx:podcast-imports').pipe(
        map(importDocs => importDocs.map(doc => new SeriesImportModel(series.doc, doc)))
    );
  }

  refreshSeriesImports(series: SeriesModel) {
    this.loadImports(series); // I feel like we should be able to combine this Observable with the reload
    Observable.interval(1000).pipe(
      map(() => this.seriesImports.pipe(
        takeWhile(seriesImports => seriesImports.some(si => this.seriesImportIsImporting(si))),
        mergeMap(seriesImports => seriesImports.map(si => si.doc.reload()))
      ))
    );
  }

  seriesImportIsImporting(seriesImport: SeriesImportModel){
    return seriesImport.status !== 'complete' &&
      seriesImport.status !== 'failed';
  }

}
