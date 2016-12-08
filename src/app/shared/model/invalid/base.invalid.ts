/**
 * Model validations
 */
export interface BaseInvalid {
  (key: string, value: any): string;
}

export const REQUIRED = (): BaseInvalid => {
  return <BaseInvalid> (key: string, value: any) => {
    if (!value || value.length < 1) {
      return `${key} is a required field`;
    } else {
      return null;
    }
  };
};

export const LENGTH = (minLength: number, maxLength?: number): BaseInvalid => {
  return <BaseInvalid> (key: string, value: any) => {
    if (minLength && value && (value.length < minLength)) {
      return `${key} is too short`;
    } else if (maxLength && value && (value.length > maxLength)) {
      return `${key} is too long`;
    } else {
      return null;
    }
  };
};

export const IN = (list: any[]): BaseInvalid => {
  return <BaseInvalid> (key: string, value: any) => {
    if (list.indexOf(value) < 0) {
      return `${key} is not a valid value`;
    } else {
      return null;
    }
  };
};

export const FALSEY = (msg: string): BaseInvalid => {
  return <BaseInvalid> (key: string, value: any) => {
    return value ? msg : null;
  };
};
