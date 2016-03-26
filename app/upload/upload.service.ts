import { Injectable } from 'angular2/core';
import { UUID } from 'angular2-uuid';
import { MimeTypeService } from '../../util/mime-type.service';
import { Env } from '../../util/env';
import { Observable, Subscriber } from 'rxjs';
import Evaporate from 'evaporate';

@Injectable()
export class UploadService {
  public bucketName:string = Env.BUCKET_NAME;
  public signUrl:string = Env.SIGN_URL;
  public awsKey:string = Env.AWS_KEY;
  public awsUrl:string = Env.AWS_URL;
  public useCloudfront:boolean = Env.USE_CLOUDFRONT;

  public uploads:FileUpload[] = [];
  public evaporate:Evaporate;

  constructor(public mimeTypeService:MimeTypeService) {
    // until there is a good way to load from env and inject
    this.evaporate = new Evaporate({
      signerUrl: this.signUrl,
      aws_key: this.awsKey,
      aws_url: this.awsUrl,
      bucket: this.bucketName,
      cloudfront: true
    });
  }

  addFile(file:File, contentType?:string) : FileUpload {
    let ct = contentType || this.mimeTypeService.lookupFileMimetype(file).full();
    let upload = new FileUpload(file, ct, this.evaporate);
    this.uploads.push(upload);
    upload.upload();
    return upload;
  }
}

export class FileUpload {
  public status:string;
  public name:string;
  public progress:Observable<number>;
  public uploadId:string;

  constructor(
    public file:File,
    public contentType:string,
    private evaporate:Evaporate
  ) {
    this.name = file.name.replace(/[^a-z0-9\.]+/gi,'_');
  }

  cancel():boolean {
    if (this.uploadId) {
      return this.evaporate.cancel(this.uploadId);
    }
    return false;
  }

  upload():Observable<number> {
    let uploadOptions = {
      file: this.file,
      name: this.name,
      contentType: this.contentType,
      xAmzHeadersAtInitiate: {
        'x-amz-acl': 'private'
      },
      notSignedHeadersAtInitiate: {
        'Content-Disposition': 'attachment; filename=' + name
      }
    };

    this.progress = Observable.create((subscriber:Subscriber<number>) => {
      subscriber.next(0);
      uploadOptions['progress'] = (pct:number) => subscriber.next(pct);
      uploadOptions['complete'] = () => { subscriber.next(1.0); subscriber.complete(); }
      uploadOptions['error']    = (msg:string) => subscriber.error(msg);
    });

    this.uploadId = this.evaporate.add(uploadOptions);
    return this.progress;
  }
}
