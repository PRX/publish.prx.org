import { MimeTypeService } from './mime-type.service';

describe('MimeTypeService', () => {

  const service = new MimeTypeService();

  it('returns a mime type for the file type', () => {
    let type = service.lookupFileMimetype(<any> {type: 'foo/bar'});
    expect(type.major()).toEqual('foo');
    expect(type.minor()).toEqual('bar');
    expect(type.full()).toEqual('foo/bar');
  });

  it('parses the filename extension', () => {
    let type = service.lookupFileMimetype(<any> {name: 'foo.bar-thing.mp3'});
    expect(type.major()).toEqual('audio');
    expect(type.minor()).toEqual('mpeg');
    expect(type.full()).toEqual('audio/mpeg');
  });

  it('falls back to a default type', () => {
    let type = service.lookupFileMimetype(<any> {name: 'foo.bar'});
    expect(type.major()).toEqual('application');
    expect(type.minor()).toEqual('octet-stream');
    expect(type.full()).toEqual('application/octet-stream');
  });

  it('overrides the default type', () => {
    let type = service.lookupFileMimetype(<any> {name: 'foo.bar'}, 'some/thing');
    expect(type.major()).toEqual('some');
    expect(type.minor()).toEqual('thing');
    expect(type.full()).toEqual('some/thing');
  });

});
