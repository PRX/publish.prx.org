import {Observable} from 'rxjs';
import {HalDoc} from '../../shared/cms/haldoc';
import {BaseModel} from '../../shared/model/base.model';
import {Upload} from '../../upload/services/upload.service';
import {AudioFileModel} from './audio-file.model';

export class AudioVersionModel extends BaseModel {

  static DEFAULT_LABEL = 'Main Audio';

  public id: number;
  public label: string;
  public files: AudioFileModel[];
  public uploadUuids: string[] = [];

  // save in-progress uploads to localstorage
  SETABLE = ['uploadUuids'];

  constructor(story?: HalDoc, audioVersion?: HalDoc) {
    super();
    this.init(story, audioVersion);
    if (!audioVersion) {
      this.set('label', AudioVersionModel.DEFAULT_LABEL);
    }
  }

  key() {
    if (this.doc) {
      return `prx.audio-version.${this.doc.id}`;
    } else if (this.parent) {
      return `prx.audio-version.new.${this.parent.id}`; // old story, new version
    } else {
      return `prx.audio-version.new`; // new story, new version
    }
  }

  related() {
    let rels = <any> {};

    // unsaved/in-progress file uploads
    let unsavedAudio: AudioFileModel[] = [];
    for (let i = 0; i < this.uploadUuids.length; i++) {
      let audio = new AudioFileModel(this.doc, this.uploadUuids[i]);
      if (audio.filename) {
        unsavedAudio.push(audio);
      } else {
        this.uploadUuids.splice(i, 1); // remove deleted audio
        this.set('uploadUuids', this.uploadUuids);
      }
    }

    // load existing audio files
    if (this.doc) {
      rels.files = this.doc.followList('prx:audio').map((fileDocs) => {
        let savedAudio = fileDocs.map((fdoc) => { return new AudioFileModel(this.doc, fdoc); });
        return savedAudio.concat(unsavedAudio);
      });
    } else {
      rels.files = Observable.of(unsavedAudio);
    }
    return rels;
  }

  decode() {
    this.id = this.doc['id'];
    this.label = this.doc['label'];
  }

  encode(): {} {
    return {label: this.label};
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:audio-versions', {}, data);
  }

  discard() {
    super.discard();
    this.files.sort((f1, f2) => f1.position - f2.position);
  }

  changed(field?: string | string[], includeRelations = true): boolean {
    if (this.isNew && this.files.length === 0) {
      return false;
    } else {
      return super.changed(field, includeRelations);
    }
  }

  invalid(field?: string | string[]): string {
    let invalid = super.invalid(field);
    if (!field && !invalid && this.files.length === 0) {
      invalid = 'You must upload at least 1 audio file';
    }
    return invalid;
  }

  addUpload(upload: Upload) {
    this.files.push(new AudioFileModel(this.doc, upload));
    this.uploadUuids.push(upload.uuid);
    this.set('uploadUuids', this.uploadUuids);
  }

  watchUpload(upload: Upload) {
    for (let file of this.files) {
      if (file.uuid === upload.uuid) {
        file.watchUpload(upload, false);
      }
    }
  }

}
