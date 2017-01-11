//
// DYNAMIC env variables
//

const DEFAULTS = {
  CMS_HOST: 'https://cms.prx.org',
  CMS_TTL: 1, // 1 second
  CMS_ROOT_TTL: 3600, // 1 hour
  CMS_USE_LOCALSTORAGE: false,
  AUTH_HOST: 'https://id.prx.org',
  AUTH_CLIENT_ID: 'rWeO7frPqkxmAR378PBlVwEQ0uf4F5u3Fwx8rv1D',
  BUCKET_FOLDER: 'dev',
  PLAY_HOST: 'https://play.prx.org'
};

const getVar = (name: string): any => {
  if (window && window['ENV'] && window['ENV'][name] !== undefined) {
    return window['ENV'][name];
  } else {
    return DEFAULTS[name];
  }
};

export class Env {
  public static get CMS_HOST():              string { return getVar('CMS_HOST'); }
  public static get CMS_TTL():               number { return getVar('CMS_TTL'); }
  public static get CMS_ROOT_TTL():          number { return getVar('CMS_ROOT_TTL'); }
  public static get CMS_USE_LOCALSTORAGE(): boolean { return getVar('CMS_USE_LOCALSTORAGE'); }
  public static get AUTH_HOST():             string { return getVar('AUTH_HOST'); }
  public static get AUTH_CLIENT_ID():        string { return getVar('AUTH_CLIENT_ID'); }
  public static get BUCKET_NAME():           string { return getVar('BUCKET_NAME'); }
  public static get BUCKET_FOLDER():         string { return getVar('BUCKET_FOLDER'); }
  public static get SIGN_URL():              string { return getVar('SIGN_URL'); }
  public static get AWS_KEY():               string { return getVar('AWS_KEY'); }
  public static get AWS_URL():               string { return getVar('AWS_URL'); }
  public static get USE_CLOUDFRONT():       boolean { return getVar('USE_CLOUDFRONT'); }
  public static get PLAY_HOST():            boolean { return getVar('PLAY_HOST'); }
}
