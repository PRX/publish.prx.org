/**
 * Environment configs
 *
 * NOTE: the index.html of this app will dynamically set window.ENV based on
 * the environment of the server.  So these default values will be different
 * everywhere EXCEPT when running the tests.
 */
export class Env {

  private static DEFAULTS = {
    CMS_HOST: 'https://cms.prx.org',
    CMS_TTL: 1, // 1 second
    CMS_ROOT_TTL: 3600, // 1 hour
    CMS_USE_LOCALSTORAGE: false,
    AUTH_HOST: 'https://id.prx.org',
    AUTH_CLIENT_ID: 'rWeO7frPqkxmAR378PBlVwEQ0uf4F5u3Fwx8rv1D'
  };

  public static get CMS_HOST(): string { return this.getVariable('CMS_HOST'); }
  public static get CMS_TTL(): string { return this.getVariable('CMS_TTL'); }
  public static get CMS_ROOT_TTL(): string { return this.getVariable('CMS_ROOT_TTL'); }
  public static get CMS_USE_LOCALSTORAGE(): string {
    return this.getVariable('CMS_USE_LOCALSTORAGE');
  }
  public static get AUTH_HOST(): string { return this.getVariable('AUTH_HOST'); }
  public static get AUTH_CLIENT_ID(): string { return this.getVariable('AUTH_CLIENT_ID'); }
  public static get BUCKET_NAME(): string { return this.getVariable('BUCKET_NAME'); }
  public static get SIGN_URL(): string { return this.getVariable('SIGN_URL'); }
  public static get AWS_KEY(): string { return this.getVariable('AWS_KEY'); }
  public static get AWS_URL(): string { return this.getVariable('AWS_URL'); }
  public static get USE_CLOUDFRONT(): boolean { return this.getVariable('USE_CLOUDFRONT'); }

  private static getVariable(name: string): any {
    if (window && window['ENV'] && window['ENV'][name] !== undefined) {
      return window['ENV'][name];
    } else {
      return this.DEFAULTS[name];
    }
  }

}
