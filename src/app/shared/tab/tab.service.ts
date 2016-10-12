import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { BaseModel } from '../model/base.model';

@Injectable()
export class TabService {

  private modelSource = new ReplaySubject<BaseModel>(1);

  get model(): Observable<BaseModel> {
    return this.modelSource;
  }

  setModel(value: BaseModel) {
    this.modelSource.next(value);
  }

}
