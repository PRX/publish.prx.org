import { Observable } from 'rxjs';
import { HalDoc, Upload } from '../../core';
import { BaseModel } from './base.model';
import { AudioFileModel } from './audio-file.model';
import { VERSION_TEMPLATED } from './invalid';

export class AudioVersionModel extends BaseModel {

  static DEFAULT_LABEL = 'Main Audio';

  public id: number;
  public label: string;
  public files: AudioFileModel[];
  public uploadUuids: string[] = [];
  public noAudioFiles = true;

  // save in-progress uploads to localstorage
  SETABLE = ['uploadUuids'];

  VALIDATORS = {
    files: [VERSION_TEMPLATED()]
  };

  private series: HalDoc;
  private template: HalDoc;

  constructor(series?: HalDoc, story?: HalDoc, audioVersion?: HalDoc) {
    super();
    this.series = series;
    this.init(story, audioVersion);
    if (!audioVersion) {
      this.set('label', AudioVersionModel.DEFAULT_LABEL);
    }
    if (audioVersion && audioVersion.has('prx:audio-version-template')) {
      audioVersion.follow('prx:audio-version-template').subscribe(tdoc => {
        this.setTemplate(tdoc);
      });
    }
  }

  setTemplate(template: HalDoc) {
    this.template = template;
    this.VALIDATORS['files'] = [VERSION_TEMPLATED(template)];
    this.set('label', template['label'] || AudioVersionModel.DEFAULT_LABEL);
  }

  key() {
    if (this.doc) {
      return `prx.audio-version.${this.doc.id}`;
    } else if (this.parent) {
      return `prx.audio-version.new.${this.parent.id}`; // existing story
    } else if (this.series) {
      return `prx.audio-version.new.series.${this.series.id}`; // new story in series
    } else {
      return `prx.audio-version.new`; // new standalone story
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
    this.noAudioFiles = unsavedAudio.every(f => f.isDestroy);

    // load existing audio files
    if (this.doc) {
      rels.files = this.doc.followList('prx:audio').map((fileDocs) => {
        let savedAudio = fileDocs.map(fdoc => new AudioFileModel(this.doc, fdoc));
        if (this.noAudioFiles) {
          this.noAudioFiles = savedAudio.every(f => f.isDestroy);
        }
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

  addUpload(upload: Upload) {
    this.noAudioFiles = false;
    this.files.push(new AudioFileModel(this.doc, upload));
    this.uploadUuids.push(upload.uuid);
    this.set('uploadUuids', this.uploadUuids);
  }

  removeUpload(uuid: string) {
    for (let i = 0; i < this.uploadUuids.length; i++) {
      if (this.uploadUuids[i] === uuid) {
        this.uploadUuids.splice(i, 1);
        this.set('uploadUuids', this.uploadUuids);
        break;
      }
    }
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].uuid === uuid && this.files[i].isNew) {
        this.files.splice(i, 1);
        break;
      }
    }
  }

  watchUpload(upload: Upload) {
    for (let file of this.files) {
      if (file.uuid === upload.uuid) {
        file.watchUpload(upload, false);
      }
    }
  }

}
