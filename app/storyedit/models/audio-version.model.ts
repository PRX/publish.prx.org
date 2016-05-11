import {Observable} from 'rxjs';
import {HalDoc} from '../../shared/cms/haldoc';
import {BaseModel} from '../../shared/model/base.model';
import {Upload} from '../../upload/services/upload.service';
import {AudioFileModel} from './audio-file.model';

export class AudioVersionModel extends BaseModel {

  public id: number;
  public label: string;
  public files: AudioFileModel[];
  public uploadUuids: string[];

  // save in-progress uploads to localstorage
  SETABLE = ['uploadUuids'];

  private story: HalDoc;

  constructor(story: HalDoc, audioVersion: HalDoc) {
    super();
    this.story = story;
    this.init(audioVersion);
  }

  key(doc: HalDoc) {
    if (doc) {
      return `prx.audio-version.${doc['id']}`;
    } else if (this.story['id']) {
      return `prx.audio-version.new.${this.story['id']}`;
    } else {
      return `prx.audio-version.new`;
    }
  }

  related(doc: HalDoc) {
    let rels = <any> {};

    // unsaved/in-progress file uploads
    let unsavedAudio: AudioFileModel[] = [];
    for (let i = 0; i < this.uploadUuids.length; i++) {
      let audio = new AudioFileModel(doc, this.uploadUuids[i]);
      if (audio.filename) {
        unsavedAudio.push(audio);
      } else {
        this.uploadUuids.splice(i, 1); // remove deleted audio
        this.set('uploadUuids', this.uploadUuids);
      }
    }

    // load existing audio files
    if (doc) {
      rels.files = doc.followList('prx:audio').map((fileDocs) => {
        let savedAudio = fileDocs.map((fdoc) => { return new AudioFileModel(doc, fdoc); });
        return savedAudio.concat(unsavedAudio);
      });
    } else {
      rels.files = Observable.of(unsavedAudio);
    }
    return rels;
  }

  decode(doc: HalDoc) {
    this.id = doc['id'];
    this.label = doc['label'];
    this.uploadUuids = [];
  }

  encode(): {} {
    return {
      label: this.label
    };
  }

  saveNew(data: {}): Observable<HalDoc> {
    return null;
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
