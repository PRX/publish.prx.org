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
  BUCKET_FOLDER: 'dev',
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

export class Env {
  public static get CMS_HOST():              string { return getVar('CMS_HOST'); }
  public static get CMS_TTL():               number { return getVar('CMS_TTL'); }
  public static get CMS_ROOT_TTL():          number { return getVar('CMS_ROOT_TTL'); }
  public static get CMS_USE_LOCALSTORAGE(): boolean { return getTruthy('CMS_USE_LOCALSTORAGE'); }
  public static get AUTH_HOST():             string { return getVar('AUTH_HOST'); }
  public static get AUTH_CLIENT_ID():        string { return getVar('AUTH_CLIENT_ID'); }
  public static get BUCKET_NAME():           string { return getVar('BUCKET_NAME'); }
  public static get BUCKET_FOLDER():         string { return getVar('BUCKET_FOLDER'); }
  public static get BUCKET_ACCELERATION():  boolean { return getTruthy('BUCKET_ACCELERATION'); }
  public static get SIGN_URL():              string { return getVar('SIGN_URL'); }
  public static get AWS_KEY():               string { return getVar('AWS_KEY'); }
  public static get PLAY_HOST():             string { return getVar('PLAY_HOST'); }
  public static get METRICS_HOST():          string { return getVar('METRICS_HOST'); }
}
