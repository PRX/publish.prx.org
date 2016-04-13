import {Observable} from 'rxjs';
import {CmsService} from '../../shared/cms/cms.service';
import {HalDoc} from '../../shared/cms/haldoc';

class StoryPayload {
  id: number = null;
  title: string = '';
  shortDescription: string = '';
  modifiedAt: Date = null;
  toJSON(): {} {
    return {
      title: this.title,
      shortDescription: this.shortDescription
    };
  }
}

class StoryChanged {
  title: boolean = false;
  shortDescription: boolean = false;
}

class StoryInvalid {
  title: string;
  shortDescription: string;
}

export class StoryModel {

  public isLoaded: boolean = false;
  public changed: StoryChanged = new StoryChanged();
  public invalid: StoryInvalid = new StoryInvalid();

  private payload: StoryPayload = new StoryPayload();
  private doc: HalDoc;
  private defaultAccount: HalDoc;

  constructor(cms: CmsService, id?: string) {
    if (id) {
      this.payload.id = parseInt(id, 10);
      cms.follow('prx:authorization').follow('prx:story', {id: id}).subscribe((doc) => {
        this.setDoc(doc);
        this.isLoaded = true;
      });
    } else {
      cms.follow('prx:authorization').follow('prx:default-account').subscribe((doc) => {
        this.defaultAccount = doc;
        this.setDoc(null);
        this.isLoaded = true;
      });
    }
  }

  save(): Observable<boolean> {
    if (this.id) {
      return this.doc.update(this.payload).map((doc) => {
        this.setDoc(doc);
        return false; // is old
      });
    } else {
      return this.defaultAccount.create('prx:stories', {}, this.payload).map((doc) => {
        this.setDoc(doc);
        return true; // is new
      });
    }
  }

  destroy(): Observable<boolean> {
    return this.doc.destroy().map(() => { return true; });
  }

  get isValid(): boolean {
    for (let key in this.invalid) {
      if (this.invalid[key]) { return false; }
    }
    return true;
  }

  get isChanged(): boolean {
    for (let key in this.changed) {
      if (this.changed[key]) { return true; }
    }
    return false;
  }

  // Model attributes
  get id(): number { return this.payload.id; }
  get title(): string { return this.payload.title; }
  get shortDescription(): string { return this.payload.shortDescription; }
  get modifiedAt(): Date { return new Date(); }

  // Setters with validations
  set title(val: string) {
    this.payload.title = val;
    this.changed.title = val !== (this.doc ? this.doc['title'] : '');
    this.invalid.title = null;
    if (!val || val.length < 1) {
      this.invalid.title = 'is required';
    } else if (val.length < 10) {
      this.invalid.title = 'is too short';
    }
  }
  set shortDescription(val: string) {
    this.payload.shortDescription = val;
    this.changed.shortDescription = val !== (this.doc ? this.doc['shortDescription'] : '');
    this.invalid.shortDescription = null;
    if (!val || val.length < 1) {
      this.invalid.shortDescription = 'is required';
    } else if (val.length < 10) {
      this.invalid.shortDescription = 'is too short';
    }
  }

  private setDoc(doc: HalDoc): void {
    this.doc = doc;
    for (let key in this.payload) {
      if (this.payload.toJSON().hasOwnProperty(key)) {
        this[key] = doc ? doc[key] : this.payload[key]; // trigger validation
      } else if (this.payload.hasOwnProperty(key)) {
        this.payload[key] = doc ? doc[key] : this.payload[key];
      }
    }
  }

}
