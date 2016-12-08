import { AuroraValidation } from './aurora-validation';

describe('AuroraValidation', () => {

  let asset: any, valid: AuroraValidation;
  beforeEach(() => {
    asset = {get: (name, fn) => null};
    window['AV'] = {Asset: {fromFile: () => asset, fromURL: () => asset}};
    valid = new AuroraValidation('some-href');
  });

  it('listens for the format and duration', () => {
    spyOn(asset, 'get').and.callFake((name, fn) => {
      if (name === 'format') { asset.format = {formatID: 'mp3'}; fn(); }
      if (name === 'duration') { asset.duration = 100; fn(); }
    });
    let data: any;
    let sub = valid.validate().subscribe(d => data = d);
    expect(data.format).toEqual('mp3');
    expect(data.duration).toEqual(100);
    expect(sub.closed).toEqual(true);
  });

  it('does not emit data without format', () => {
    spyOn(asset, 'get').and.callFake((name, fn) => {
      if (name === 'duration') { asset.duration = 100; fn(); }
    });
    let data: any;
    let sub = valid.validate().subscribe(d => data = d);
    expect(data).toBeUndefined();
    expect(asset.get).toHaveBeenCalled();
    expect(sub.closed).toEqual(false);
  });

  it('does not emit data without duration', () => {
    spyOn(asset, 'get').and.callFake((name, fn) => {
      if (name === 'format') { asset.format = {formatID: 'mp3'}; fn(); }
    });
    let data: any;
    let sub = valid.validate().subscribe(d => data = d);
    expect(data).toBeUndefined();
    expect(asset.get).toHaveBeenCalled();
    expect(sub.closed).toEqual(false);
  });

});
