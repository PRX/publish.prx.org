import { Observable } from 'rxjs';
import { HalDoc, Upload } from '../../core';
import { BaseModel } from './base.model';
import { AudioFileModel } from './audio-file.model';
import { VERSION_TEMPLATED } from './invalid';

export class AudioVersionModel extends BaseModel {

  static DEFAULT_LABEL = 'Main Audio';

  public id: number;
  public uploads: string = '';
  public label: string;
  public explicit: string;
  public files: AudioFileModel[];

  // save in-progress uploads to localstorage
  SETABLE = ['uploads', 'label', 'explicit'];

  VALIDATORS = {
    self: [VERSION_TEMPLATED()]
  };

  public series: HalDoc;
  public template: HalDoc;
  public fileTemplates: HalDoc[] = [];
  public hasFileTemplates: boolean = false;

  constructor(params: {series?: HalDoc, story?: HalDoc, template?: HalDoc, version?: HalDoc}) {
    super();
    this.series = params.series;
    this.template = params.template;
    if (this.template) {
      this.hasFileTemplates = this.template.count('prx:audio-file-templates') ? true : false;
    }
    this.VALIDATORS['self'] = [VERSION_TEMPLATED(params.template)];
    this.init(params.story, params.version);
    this.setLabel();
  }

  setLabel() {
    if (this.doc && this.doc['label']) {
      this.set('label', this.doc['label']); // probably already set to this
    } else if (this.template) {
      this.set('label', this.template['label'] || AudioVersionModel.DEFAULT_LABEL);
    } else {
      this.set('label', AudioVersionModel.DEFAULT_LABEL);
    }
  }

  key() {
    if (this.doc) {
      return `prx.audio-version.${this.doc.id}`;
    } else if (this.template) {
      return `prx.audio-version.new.template.${this.template.id}`; // new for template
    } else if (this.parent) {
      return `prx.audio-version.new.${this.parent.id}`; // existing story
    } else if (this.series) {
      return `prx.audio-version.new.series.${this.series.id}`; // new story in series
    } else {
      return `prx.audio-version.new`; // new standalone story
    }
  }

  related() {
    const fileSort = (f1, f2) => f1.position - f2.position;

    let newAudio: AudioFileModel[] = [];
    let validUuids = this.uploadUuids.filter(uuid => {
      let audio = new AudioFileModel(this.doc, uuid);
      if (audio.filename) {
        newAudio.push(audio);
        return true;
      }
    });
    this.set('uploads', validUuids.join(','));

    let savedFiles: Observable<AudioFileModel[]> = Observable.of(newAudio);
    if (this.doc && this.doc.has('prx:audio')) {
      savedFiles = this.doc.followList('prx:audio').map(fdocs => {
        return fdocs.map(fdoc => new AudioFileModel(this.doc, fdoc))
                    .concat(newAudio).sort(fileSort);
      });
    }

    let fileTemplates: Observable<HalDoc[]> = Observable.of([]);
    if (this.template && this.template.has('prx:audio-file-templates')) {
      fileTemplates = this.template.followList('prx:audio-file-templates');
      this.hasFileTemplates = this.template.count('prx:audio-file-templates') ? true : false;
    } else {
      this.hasFileTemplates = false;
    }

    let files = Observable.forkJoin(savedFiles, fileTemplates).map(([models, tdocs]) => {
      let tidx = 0;
      this.fileTemplates = tdocs.sort(fileSort);
      models.forEach(f => f.setTemplate(f.isDestroy ? null : this.fileTemplates[tidx++]));
      return models;
    });
    return {files: files};
  }

  decode() {
    this.id = this.doc['id'];
    this.uploads = '';
    this.label = this.doc['label'];
    this.explicit = (this.doc['explicit'] === 'yes') ? 'Yes' : 'Clean';
  }

  encode(): {} {
    let data = <any> {};
    data.label = this.label;
    data.explicit = (this.explicit === 'Yes') ? 'yes' : 'clean';
    if (this.isNew && this.template) {
      data.set_audio_version_template_uri = this.template.expand('self');
    }
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:audio-versions', {}, data);
  }

  discard() {
    super.discard();
    this.files.sort((f1, f2) => f1.position - f2.position);
    this.setLabel();
    return false; // don't discard
  }

  changed(field?: string | string[], includeRelations = true): boolean {
    if (this.isNew && this.files.length === 0) {
      return false;
    } else {
      return super.changed(field, includeRelations);
    }
  }

  addUpload(upload: Upload) {
    let audio = new AudioFileModel(this.doc, upload);
    this.files.push(audio);
    this.refreshPositions();

    let uuids = this.uploadUuids.concat(upload.uuid);
    this.set('uploads', uuids.sort().join(','));
  }

  removeUpload(uuid: string) {
    let uuids = this.uploadUuids;
    if (uuids.indexOf(uuid) > -1) {
      uuids.splice(uuids.indexOf(uuid), 1);
      this.set('uploads', uuids.sort().join(','));
    }
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].uuid === uuid && this.files[i].isNew) {
        this.files.splice(i, 1);
        break;
      }
    }
  }

  refreshPositions() {
    let position = 1;
    let defaultLabels = this.files.every(f => {
      return !f.label || !!f.label.match(/Segment [A-Z]/);
    });
    this.files.forEach(f => {
      if (!f.isDestroy) {
        f.set('position', position++);
        if (defaultLabels) {
          let segLetter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[(f.position - 1) % 26];
          f.set('label', `Segment ${segLetter}`);
        }
      }
    });
  }

  watchUpload(upload: Upload) {
    for (let file of this.files) {
      if (file.uuid === upload.uuid) {
        file.watchUpload(upload, false);
      }
    }
  }

  get noAudioFiles(): boolean {
    return this.fileTemplates.length < 1 && this.files.every(f => f.isDestroy);
  }

  get audioCount(): number {
    return this.files.filter(f => !f.isDestroy).length;
  }

  get uploadUuids(): string[] {
    return this.uploads.split(',').filter(u => u);
  }

}
