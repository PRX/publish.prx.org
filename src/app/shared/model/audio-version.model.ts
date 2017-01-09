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
  public explicit: string = '';
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
  public filesAndTemplates: {tpl: HalDoc, file: AudioFileModel}[] = [];

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

  private setLabel() {
    if (this.doc && this.doc['label']) {
      this.set('label', this.doc['label'], true); // probably already set to this
    } else if (this.template) {
      this.set('label', this.template['label'] || AudioVersionModel.DEFAULT_LABEL, true);
    } else {
      this.set('label', AudioVersionModel.DEFAULT_LABEL, true);
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
    this.set('uploads', validUuids.join(','), true);
    newAudio = newAudio.sort(fileSort);

    let files: Observable<AudioFileModel[]> = Observable.of(newAudio);
    if (this.doc && this.doc.has('prx:audio')) {
      files = this.doc.followList('prx:audio').map(fdocs => {
        return fdocs.map(fdoc => new AudioFileModel(this.doc, fdoc))
                    .concat(newAudio).sort(fileSort);
      });
    }

    // optionally load-and-assign file templates
    if (this.hasFileTemplates) {
      let tpls = this.template.followItems('prx:audio-file-templates');
      files = Observable.forkJoin(files, tpls).map(([models, tdocs]) => {
        this.fileTemplates = tdocs.sort(fileSort);
        return models;
      }).finally(() => this.reassign());
    }

    return {files: files};
  }

  decode() {
    this.id = this.doc['id'];
    this.uploads = '';
    this.label = this.doc['label'];
    switch (this.doc['explicit']) {
      case 'yes':
        this.explicit = 'Explicit';
        break;
      case 'clean':
        this.explicit = 'Clean';
        break;
      default:
        this.explicit = '';
        break;
    }
  }

  encode(): {} {
    let data = <any> {};
    data.label = this.label;
    switch (this.explicit) {
      case 'Explicit':
        data.explicit = 'yes';
        break;
      case 'Clean':
        data.explicit = 'clean';
        break;
      default:
        data.explicit = '';
        break;
    }
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
    this.reassign();
    return false; // don't discard
  }

  changed(field?: string | string[], includeRelations = true): boolean {
    return !(this.isNew && this.files.length === 0) || super.changed(field, includeRelations);
  }

  addUpload(upload: Upload, position?: number): AudioFileModel {
    let audio = new AudioFileModel(this.doc, upload);
    if (position) {
      audio.set('position', position);
      for (let i = 0; i <= this.files.length; i++) {
        if (!this.files[i] || this.files[i].position >= audio.position) {
          this.files.splice(i, 0, audio);
          break;
        }
      }
    } else {
      this.files.push(audio);
    }
    this.reassign();

    let uuids = this.uploadUuids.concat(upload.uuid);
    this.set('uploads', uuids.sort().join(','));
    return audio;
  }

  removeUpload(file: AudioFileModel) {
    if (file.isNew) {
      if (this.files.indexOf(file) > -1) {
        this.files.splice(this.files.indexOf(file), 1);
      }
    }
    if (file.uuid) {
      let uuids = this.uploadUuids;
      if (uuids.indexOf(file.uuid) > -1) {
        uuids.splice(uuids.indexOf(file.uuid), 1);
        this.set('uploads', uuids.sort().join(','));
      }
    }
    this.reassign();
  }

  reassign() {
    if (this.hasFileTemplates) {
      this.assignTemplates();
    } else {
      this.assignPositions();
    }
  }

  assignPositions() {
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

  assignTemplates() {
    if (this.files && this.fileTemplates) {
      this.filesAndTemplates = [];
      for (let t of this.fileTemplates) {
        this.filesAndTemplates.push({file: null, tpl: t});
      }
      for (let f of this.files.filter(f => !f.isDestroy)) {
        let ft = this.filesAndTemplates.find(ft => ft.tpl && ft.tpl['position'] === f.position);
        if (ft) {
          f.setTemplate(ft.tpl);
          ft.file = f;
        } else {
          f.setTemplate(null);
          this.filesAndTemplates.push({file: f, tpl: null});
        }
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
