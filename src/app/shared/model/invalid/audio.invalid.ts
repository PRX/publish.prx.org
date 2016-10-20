import { HalDoc } from '../../../core';
import { AudioFileModel } from '../audio-file.model';
import { AudioVersionModel } from '../audio-version.model';
import { DurationPipe } from '../../file';
import { BaseInvalid } from './base.invalid';

const durationPipe = new DurationPipe();

/**
 * Audio version template validations
 */
export const VERSION_TEMPLATED = (template?: HalDoc): BaseInvalid => {
  return <BaseInvalid> (key: string, version: AudioVersionModel) => {
    let undeleted = version.files.filter(f => !f.isDestroy);
    let count = undeleted.length;

    // segment count
    if (template && template['segmentCount'] && count !== template['segmentCount']) {
      return `you must upload ${template['segmentCount']} segments (got ${count})`;
    } else if (count < 1) {
      return 'upload at least 1 segment';
    }

    // min duration
    let duration = undeleted.map(f => f.duration || 0).reduce((a, b) => a + b);
    if (template && template['lengthMinimum'] && duration < template['lengthMinimum']) {
      let min = durationPipe.transform(template['lengthMinimum']);
      let got = durationPipe.transform(duration);
      return `total length must be greater than ${min} - currently ${got}`;
    }

    // max duration
    if (template && template['lengthMaximum'] && duration > template['lengthMaximum']) {
      let max = durationPipe.transform(template['lengthMaximum']);
      let got = durationPipe.transform(duration);
      return `total length must be less than ${max} - currently ${got}`;
    }
  };
};

/**
 * Audio file template validations
 */
export const FILE_TEMPLATED = (template?: HalDoc): BaseInvalid => {
  return <BaseInvalid> (key: string, file: AudioFileModel) => {

    // TODO: bad assumption all audio is html5-playable
    if (!file.duration) {
      return 'not an audio file';
    }

    // min duration
    if (template && template['lengthMinimum'] && file.duration < template['lengthMinimum']) {
      let min = durationPipe.transform(template['lengthMinimum']);
      let got = durationPipe.transform(file.duration);
      return `length must be greater than ${min} - currently ${got}`;
    }

    // max duration
    if (template && template['lengthMaximum'] && file.duration > template['lengthMaximum']) {
      let max = durationPipe.transform(template['lengthMaximum']);
      let got = durationPipe.transform(file.duration);
      return `length must be less than ${max} - currently ${got}`;
    }
  };
};
