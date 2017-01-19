/**
 * Model validations
 */
export interface BaseInvalid {
  (key: string, value: any, strict?: boolean, model?: any): string;
}

export const UNLESS_NEW = (validator: BaseInvalid) => {
  return (key: string, value: any, strict?: boolean, model?: any) => {
    if (model && model.isNew) {
      return null;
    } else {
      return validator(key, value, strict, model);
    }
  };
};

export const REQUIRED = (beVeryStrict = false): BaseInvalid => {
  return (key: string, value: any, strict: boolean) => {
    if ((strict || beVeryStrict) && (!value || value.length < 1)) {
      return `${key} is a required field`;
    } else {
      return null;
    }
  };
};

export const LENGTH = (minLength: number, maxLength?: number): BaseInvalid => {
  return (key: string, value: any) => {
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
  return (key: string, value: any) => {
    if (list.indexOf(value) < 0) {
      return `${key} is not a valid value`;
    } else {
      return null;
    }
  };
};

export const FALSEY = (msg: string): BaseInvalid => {
  return (key: string, value: any) => {
    return value ? msg : null;
  };
};

export const TOKENY = (msg?: string): BaseInvalid => {
  return (key: string, value: any) => {
    if (value && !value.match(/^[a-zA-Z0-9_]+$/)) {
      return msg || `${key} is not a valid token - use letters, numbers and underscores only`;
    } else {
      return null;
    }
  };
};

// basic url matching ... not entirely accurate, but hopefully good enough
const urlPattern = /(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
export const URL = (msg?: string): BaseInvalid => {
  return (key: string, value: any) => {
    if (value && !value.match(urlPattern)) {
      return msg || `${key} is not a valid URL`;
    } else {
      return null;
    }
  };
};
