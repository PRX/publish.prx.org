import {HalDoc} from '../../shared/cms/haldoc';
import {BaseModel} from '../../shared/model/base.model';

export class AudioVersionModel extends BaseModel {

  story: HalDoc;

  constructor(story: HalDoc, audioVersion: HalDoc) {
    super(audioVersion);
    this.story = story;
  }

  key(doc: HalDoc) {
    if (doc) {
      return `prx.audio-version.${doc['id']}`;
    } else {
      return `prx.audio-version.new`;
    }
  }

  related(doc: HalDoc) {
    return {};
  }

  decode(doc: HalDoc) {
    console.log('decoding audio-version', doc);
  }

  encode(): {} {
    console.log('encode');
    return {};
  }

}
