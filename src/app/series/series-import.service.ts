import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { filter, map, mergeMap, takeWhile } from 'rxjs/operators';
import { SeriesModel, SeriesImportModel } from '../shared';

@Injectable()
export class SeriesImportService {

  constructor() {}

  fetchImportsForSeries(series: SeriesModel): Observable<SeriesImportModel[]> {
    return series.doc.followItems('prx:podcast-imports').pipe(
        map(importDocs => importDocs.map(doc => new SeriesImportModel(series.doc, doc)))
    );
  }

  pollForChanges(seriesImport: SeriesImportModel): Observable<SeriesImportModel> {

    let seriesImportPoller = Observable
      .interval(1000)
      .flatMap(() => {
        return seriesImport.doc.reload();
      })
      .map(doc => {
        let parentAccountDoc = seriesImport.parent;
        seriesImport.init(parentAccountDoc, doc, false);
        return new SeriesImportModel(parentAccountDoc, doc);
      })
      .takeWhile((si) => si.isImporting());

      return Observable.concat(
        Observable.of(seriesImport),
        seriesImportPoller
      );
  }

}