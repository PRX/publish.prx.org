import { AudioVersionTemplateModel } from '../audio-version-template.model';
import { AudioFileTemplateModel } from '../audio-file-template.model';
import { BaseInvalid } from './base.invalid';

/**
 * Audio version template length
 */
const checkMinimum = (min, max): string => {
  if (!min && !max) {
    return null; // allow unset
  } else if (isNaN(parseInt(min, 10))) {
    return `Minimum is not a number`;
  } else if (min < 0) {
    return `Minimum must be a positive number`;
  } else if (min >= max) {
    return 'Minimum must be less than maximum';
  } else {
    return null;
  }
};

const checkMaximum = (min, max): string => {
  if (!min && !max) {
    return null; // allow unset
  } else if (isNaN(parseInt(max, 10))) {
    return `Maximum is not a number`;
  } else if (max < 0) {
    return `Maximum must be a positive number`;
  } else if (max <= min) {
    return 'Maximum must be greater than minimum';
  } else {
    return null;
  }
};

export const VERSION_LENGTH = (version?: AudioVersionTemplateModel): BaseInvalid => {
  return <BaseInvalid> (key: string, value: any) => {
    let min = version.lengthMinimum;
    let max = version.lengthMaximum;
    if (key === 'lengthMinimum') {
      return checkMinimum(min, max);
    } else if (key === 'lengthMaximum') {
      return checkMaximum(min, max);
    }
  };
};

export const FILE_LENGTH = (file?: AudioFileTemplateModel): BaseInvalid => {
  return <BaseInvalid> (key: string, value: any) => {
    let min = file.lengthMinimum;
    let max = file.lengthMaximum;
    if (key === 'lengthMinimum') {
      return checkMinimum(min, max);
    } else if (key === 'lengthMaximum') {
      return checkMaximum(min, max);
    }
  };
};
