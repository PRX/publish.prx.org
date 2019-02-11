
import {of as observableOf,  Observable, interval, concat } from 'rxjs';
import { Injectable } from '@angular/core';
import { map, takeWhile, flatMap } from 'rxjs/operators';
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

    let lastReceived = null;

    let seriesImportPoller = interval(1000)
      .pipe(flatMap(() => {
        return seriesImport.doc.reload();
      }))
      .pipe(map(doc => {
        let parentAccountDoc = seriesImport.parent;
        seriesImport.init(parentAccountDoc, doc, false);
        return new SeriesImportModel(parentAccountDoc, doc);
      }))
      .pipe(takeWhile((si) => {
        // HACK
        // https://github.com/ReactiveX/rxjs/issues/2420
        // TODO fixed in rxjs 6
        if (lastReceived !== null) {
          return false;
        }
        if (si.isFinished()) {
          lastReceived = si;
        }
        return true;
      }));

    return concat(
      observableOf(seriesImport),
      seriesImportPoller
    );
  }

}
