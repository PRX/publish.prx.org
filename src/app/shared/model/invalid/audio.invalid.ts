import { HalDoc } from '../../../core';
import { AudioFileModel } from '../audio-file.model';
import { AudioVersionModel } from '../audio-version.model';
import { DurationPipe } from '../../file';
import { BaseInvalid } from 'ngx-prx-styleguide';

const durationPipe = new DurationPipe();

/**
 * Audio version template validations
 */
export const VERSION_TEMPLATED = (template?: HalDoc): BaseInvalid => {
  return <BaseInvalid> (key: string, version: AudioVersionModel, strict: boolean) => {
    let undeleted = version.files.filter(f => !f.isDestroy);
    let count = undeleted.length;

    // wait for uploads to complete
    if (!version.files.every(f => !f.isUploading)) {
      return 'wait for uploads to complete';
    }

    // prevent publishing unless strict checks pass
    if (strict) {

      // segment count
      if (template && template.count('prx:audio-file-templates')) {
        let segments = template.count('prx:audio-file-templates');
        if (count !== segments) {
          return `you must upload ${segments} segments (got ${count})`;
        }
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

      if (version.status === 'invalid') {
        return version.statusMessage;
      }

    }

    return null;
  };
};

/**
 * Audio file template validations
 */
export const FILE_TEMPLATED = (template?: HalDoc): BaseInvalid => {
  return <BaseInvalid> (key: string, file: AudioFileModel) => {

    if (file.format && file.format !== 'mp3') {
      return 'not an mp3 file';
    }
    if (file.duration === null || file.duration === undefined) {
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

    return null;
  };
};
