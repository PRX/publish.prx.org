import { Injectable } from '@angular/core';
import { Observable, ConnectableObservable, Subscriber } from 'rxjs';
import Evaporate from 'evaporate';

import { Env } from '../../env';
import { UUID } from '../uuid/uuid';
import { MimeTypeService } from './mime-type.service';

@Injectable()
export class UploadService {

  public uploads: Upload[] = [];

  private evaporate: Evaporate;
  private bucketName: string = Env.BUCKET_NAME;
  private signUrl: string = Env.SIGN_URL;
  private awsKey: string = Env.AWS_KEY;
  private awsUrl: string = Env.AWS_URL;
  private useCloudfront: boolean = Env.USE_CLOUDFRONT;

  constructor(private mimeTypeService: MimeTypeService) {
    // until there is a good way to load from env and inject
    this.evaporate = new Evaporate({
      signerUrl: this.signUrl,
      aws_key: this.awsKey,
      aws_url: this.awsUrl,
      bucket: this.bucketName,
      cloudfront: this.useCloudfront,
      logging: false
    });
  }

  add(file: File, contentType?: string): Upload {
    let ct = contentType || this.mimeTypeService.lookupFileMimetype(file).full();
    let upload = new Upload(file, ct, this.evaporate);
    this.uploads.push(upload);
    return upload;
  }

  find(uuid: string): Upload {
    for (let upload of this.uploads) {
      if (upload.uuid === uuid) {
        return upload;
      }
    }
    return null;
  }

}

export class Upload {
  public uuid: string;
  public name: string;
  public size: number;
  public path: string;
  public url: string;
  public s3url: string;

  public progress: ConnectableObservable<number>;
  public uploadId: string;
  public complete: boolean;

  constructor(
    public file: File,
    public contentType: string,
    private evaporate: Evaporate
  ) {
    this.uuid = UUID.UUID();
    this.name = file.name;
    this.size = file.size;
    this.path = [Env.BUCKET_FOLDER, this.uuid, file.name.replace(/[^a-z0-9\.]+/gi, '_')].join('/');
    this.url = '//s3.amazonaws.com/' + Env.BUCKET_NAME + '/' + this.path;
    this.s3url = 's3://' + Env.BUCKET_NAME + '/' + this.path;
    this.upload();
  }

  cancel(): boolean {
    if (this.evaporate && !this.complete) {
      let formerId = this.uploadId;
      this.uploadId = null;
      if (formerId !== null) {
        return this.evaporate.cancel(formerId);
      }
    }
    return false;
  }

  upload(): Observable<number> {
    if (this.complete) {
      return null;
    }
    this.cancel();

    let uploadOptions = {
      file: this.file,
      name: this.path,
      contentType: this.contentType,
      xAmzHeadersAtInitiate: {
        'x-amz-acl': 'public-read'
      },
      notSignedHeadersAtInitiate: {
        'Content-Disposition': 'attachment; filename=' + name
      }
    };

    let progressObservable: Observable<number> = Observable.create((sub: Subscriber<number>) => {
      sub.next(0);
      uploadOptions['progress'] = (pct: number) => sub.next(pct);
      uploadOptions['complete'] = () => { sub.next(1.0); this.complete = true; sub.complete(); };
      uploadOptions['error']    = (msg: string) => sub.error(msg);
      this.uploadId = this.evaporate.add(uploadOptions);
    });

    // share the underlying observable without creating dups
    this.progress = progressObservable.publish();
    this.progress.connect();
    return this.progress;
  }

}
