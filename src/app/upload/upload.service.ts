import { Injectable } from 'angular2/core';
import { UUID } from 'angular2-uuid';
import { MimeTypeService } from '../../util/mime-type.service';
import { Env } from '../../util/env';
import { Observable, Observer } from 'rxjs';
import Evaporate from 'evaporate';

@Injectable()
export class UploadService {
  public bucketName:string = Env.BUCKET_NAME;
  public signUrl:string = Env.SIGN_URL;
  public awsKey:string = Env.AWS_KEY;
  public awsUrl:string = Env.AWS_URL;
  public useCloudfront:boolean = (Env.USE_CLOUDFRONT == 'true');

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

  constructor(
    public file:File,
    public contentType:string,
    private evaporate:Evaporate
  ) {
    this.name = file.name.replace(/[^a-z0-9\.]+/gi,'_');
  }

  upload():void {
    let progressCallback:(progress:number) => void;

    this.progress = Observable.create((observer:Observer<number>) => {
      observer.next(0);
      progressCallback = (pct) => observer.next(pct);
    });

    let uploadId = this.evaporate.add({
      file: this.file,
      name: name,
      contentType: this.contentType,
      xAmzHeadersAtInitiate: {
        'x-amz-acl': 'private'
      },
      notSignedHeadersAtInitiate: {
        'Content-Disposition': 'attachment; filename=' + name
      },
      progress: progressCallback
    });
  }
}
