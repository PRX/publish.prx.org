import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { BaseModel } from 'ngx-prx-styleguide';

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
