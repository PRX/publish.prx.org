/**
 * Environment defaults (suitable for running the tests)
 *
 * NOTE: this file is never served directly. Instead, the express server
 * dynamically checks for (1) ENV variables of the same name, and (2) a file
 * "config/.env" containing overrides to these variables.
 *
 * Then an identical class with different static values will be served in
 * place of this file.
 */
export class Env {

  // PRX API
  public static CMS_HOST: string = 'https://cms.prx.org';

  // Auth (redirects to http://publish.prx.dev/assets/callback)
  public static AUTH_HOST: string = 'https://id.prx.org';
  public static AUTH_CLIENT_ID: string = 'rWeO7frPqkxmAR378PBlVwEQ0uf4F5u3Fwx8rv1D';

  // File uploading
  public static BUCKET_NAME: string;
  public static SIGN_URL: string;
  public static AWS_KEY: string;
  public static AWS_URL: string;
  public static USE_CLOUDFRONT: boolean;

}
