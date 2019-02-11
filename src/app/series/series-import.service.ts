
import {of as observableOf,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
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

    let lastReceived = null;

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
      .takeWhile((si) => {
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
      });

    return Observable.concat(
      observableOf(seriesImport),
      seriesImportPoller
    );
  }

}
