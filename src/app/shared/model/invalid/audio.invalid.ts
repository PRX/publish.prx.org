import { HalDoc } from '../../../core';
import { AudioFileModel } from '../audio-file.model';
import { DurationPipe } from '../../file';
import { BaseInvalid } from './base.invalid';

const durationPipe = new DurationPipe();

/**
 * Audio version template validations
 */
export const VERSION_TEMPLATED = (template?: HalDoc): BaseInvalid => {
  return <BaseInvalid> (key: string, files: AudioFileModel[]) => {
    let undeleted = files.filter(f => !f.isDestroy);
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
      return `total duration must be greater than ${min} - currently ${got}`;
    }

    // max duration
    if (template && template['lengthMaximum'] && duration > template['lengthMaximum']) {
      let max = durationPipe.transform(template['lengthMaximum']);
      let got = durationPipe.transform(duration);
      return `total duration must be less than ${max} - currently ${got}`;
    }
  };
};
