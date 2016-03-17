import { Injectable } from 'angular2/core';

@Injectable()
export class MimeTypeService {

  private serviceDefault:string = 'application\/octet-stream';

  lookupFileMimetype(file:File, overrideDefault?:string) {
    let typeDefault = overrideDefault || this.serviceDefault;
    let type = file.type;
    if (!type) {
      var ext = file.name.split('.').pop();
      type = DEFAULT_MIMETYPES[ext];
    }
    return new MimeDefinition(type || typeDefault);
  }
}

class MimeDefinition {
  constructor(public type:string) { }
  major() { return this.type.split('/')[0]; }
  minor() { return this.type.split('/')[1]; }
  full() { return this.type; }
}

export var DEFAULT_MIMETYPES:any = {
  "aif": "audio\/x-aiff",
  "aifc": "audio\/x-aiff",
  "aiff": "audio\/x-aiff",
  "caf": "audio\/x-caf",
  "flac": "audio\/x-flac",
  "m2a": "audio\/mpeg",
  "m3a": "audio\/mpeg",
  "m4a": "audio\/mp4",
  "mp2": "audio\/mpeg",
  "mp2a": "audio\/mpeg",
  "mp3": "audio\/mpeg",
  "mp4": "video\/mp4",
  "mp4a": "audio\/mp4",
  "mpga": "audio\/mpeg",
  "oga": "audio\/ogg",
  "ogg": "audio\/ogg",
  "spx": "audio\/ogg",
  "wav": "audio\/x-wav",
  "weba": "audio\/webm",
  "gif": "image\/gif",
  "jpe": "image\/jpeg",
  "jpeg": "image\/jpeg",
  "jpg": "image\/jpeg",
  "png": "image\/png",
  "svg": "image\/svg+xml",
  "svgz": "image\/svg+xml",
  "webp": "image\/webp"
};
