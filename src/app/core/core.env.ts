//
// DYNAMIC env variables
//

const DEFAULTS = {
  CMS_HOST: 'cms.prx.org',
  CMS_TTL: 1, // 1 second
  CMS_ROOT_TTL: 3600, // 1 hour
  CMS_USE_LOCALSTORAGE: false,
  AUTH_HOST: 'id.prx.org',
  AUTH_CLIENT_ID: 'rWeO7frPqkxmAR378PBlVwEQ0uf4F5u3Fwx8rv1D',
  UPLOAD_BUCKET_FOLDER: 'dev',
  PLAY_HOST: 'play.prx.org',
  METRICS_HOST: 'metrics.prx.org'
};

const addScheme = (name: string, value: any): any => {
  if (name.match(/_HOST$/) && value && !value.startsWith('http')) {
    let scheme = value.match(/.*\.prxu?\.(?:org|tech|dev)$/) ? 'https' : 'http';
    return `${scheme}://${value}`;
  } else {
    return value;
  }
};

const getVar = (name: string): any => {
  if (window && window['ENV'] && window['ENV'][name] !== undefined) {
    return addScheme(name, window['ENV'][name]);
  } else {
    return addScheme(name, DEFAULTS[name]);
  }
};

const getTruthy = (name: string): boolean => {
  if (window && window['ENV'] && window['ENV'][name] !== undefined) {
    return [true, 'true', 1, '1'].indexOf(window['ENV'][name]) > -1;
  } else {
    return DEFAULTS[name] || false;
  }
};

const getNumber = (name: string): number => {
  if (window && window['ENV'] && window['ENV'][name] !== undefined) {
    const num = parseInt(window['ENV'][name], 10);
    return isNaN(num) ? 0 : num;
  } else {
    return DEFAULTS[name] || 0;
  }
};

export class Env {
  public static get CMS_HOST():                        string { return getVar('CMS_HOST'); }
  public static get CMS_TTL():                         number { return getNumber('CMS_TTL'); }
  public static get CMS_ROOT_TTL():                    number { return getNumber('CMS_ROOT_TTL'); }
  public static get CMS_USE_LOCALSTORAGE():           boolean { return getTruthy('CMS_USE_LOCALSTORAGE'); }
  public static get AUTH_HOST():                       string { return getVar('AUTH_HOST'); }
  public static get AUTH_CLIENT_ID():                  string { return getVar('AUTH_CLIENT_ID'); }
  public static get UPLOAD_BUCKET_NAME():              string { return getVar('UPLOAD_BUCKET_NAME'); }
  public static get UPLOAD_BUCKET_FOLDER():            string { return getVar('UPLOAD_BUCKET_FOLDER'); }
  public static get UPLOAD_S3_ENDPOINT_URL():          string { return getVar('UPLOAD_S3_ENDPOINT_URL'); }
  public static get UPLOAD_SIGNING_SERVICE_URL():      string { return getVar('UPLOAD_SIGNING_SERVICE_URL'); }
  public static get UPLOAD_SIGNING_SERVICE_KEY_ID():   string { return getVar('UPLOAD_SIGNING_SERVICE_KEY_ID'); }
  public static get PLAY_HOST():                       string { return getVar('PLAY_HOST'); }
  public static get METRICS_HOST():                    string { return getVar('METRICS_HOST'); }
}
