import { Env } from './core.env';

describe('Env', () => {

  let prev: any;
  beforeEach(() => {
    prev = window['ENV'];
    window['ENV'] = {};
  });
  afterEach(() => {
    window['ENV'] = prev;
  });

  it('uses defaults', () => {
    delete window['ENV']['CMS_HOST'];
    expect(Env.CMS_HOST).toEqual('https://cms.prx.org');
  });

  it('guesses a scheme for host variables', () => {
    window['ENV']['CMS_HOST'] = 'http://cms.prx.org';
    expect(Env.CMS_HOST).toEqual('http://cms.prx.org');

    window['ENV']['CMS_HOST'] = 'cms.prx.org';
    expect(Env.CMS_HOST).toEqual('https://cms.prx.org');

    window['ENV']['CMS_HOST'] = 'localhost:1234';
    expect(Env.CMS_HOST).toEqual('http://localhost:1234');
  });

  it('gets booleans', () => {
    window['ENV']['BUCKET_ACCELERATION'] = 'true';
    expect(Env.BUCKET_ACCELERATION).toEqual(true);

    window['ENV']['BUCKET_ACCELERATION'] = true;
    expect(Env.BUCKET_ACCELERATION).toEqual(true);

    window['ENV']['BUCKET_ACCELERATION'] = '1';
    expect(Env.BUCKET_ACCELERATION).toEqual(true);

    window['ENV']['BUCKET_ACCELERATION'] = 1;
    expect(Env.BUCKET_ACCELERATION).toEqual(true);

    window['ENV']['BUCKET_ACCELERATION'] = 'false';
    expect(Env.BUCKET_ACCELERATION).toEqual(false);

    window['ENV']['BUCKET_ACCELERATION'] = '';
    expect(Env.BUCKET_ACCELERATION).toEqual(false);
  });

  it('gets numbers', () => {
    window['ENV']['CMS_TTL'] = '123';
    expect(Env.CMS_TTL).toEqual(123);

    window['ENV']['CMS_TTL'] = '';
    expect(Env.CMS_TTL).toEqual(0);

    window['ENV']['CMS_TTL'] = 'anything';
    expect(Env.CMS_TTL).toEqual(0);
  });

});
