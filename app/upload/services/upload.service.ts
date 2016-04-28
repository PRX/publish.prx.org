import {Injectable} from 'angular2/core';
import {Observable, ConnectableObservable, Subscriber} from 'rxjs';
import Evaporate from 'evaporate';
import {UUID} from 'angular2-uuid';
import {MimeTypeService} from '../../../util/mime-type.service';
import {Env} from '../../../config/env';

@Injectable()
export class UploadService {

  public bucketName: string = Env.BUCKET_NAME;
  public signUrl: string = Env.SIGN_URL;
  public awsKey: string = Env.AWS_KEY;
  public awsUrl: string = Env.AWS_URL;
  public useCloudfront: boolean = Env.USE_CLOUDFRONT;

  public uploads: Upload[] = [];
  public evaporate: Evaporate;

  constructor(public mimeTypeService: MimeTypeService) {
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

  addFile(versionId: number, file: File, contentType?: string): Upload {
    let ct = contentType || this.mimeTypeService.lookupFileMimetype(file).full();
    let upload = new Upload(versionId, file, ct, this.evaporate);
    this.uploads.push(upload);
    return upload;
  }

  remove(upload: Upload) {
    let i = this.uploads.indexOf(upload);
    if (i < 0) {
      return false;
    } else {
      this.uploads.splice(i, 1);
      return true;
    }
  }

  uploadsForVersion(audioVersionId: number): Upload[] {
    let uploads = this.uploads.filter((upload) => {
      return upload.versionId === audioVersionId;
    });
    return uploads;
  }

}

export class Upload {
  public name: string;
  public path: string;
  public progress: ConnectableObservable<number>;
  public uploadId: string = null;

  constructor(
    public versionId: number,
    public file: File,
    public contentType: string,
    private evaporate: Evaporate
  ) {
    this.name = file.name;
    this.path = ['test', UUID.UUID(), file.name.replace(/[^a-z0-9\.]+/gi,'_')].join('/');
    this.upload();
  }

  url(): string {
    return 's3://' + Env.BUCKET_NAME + '/' + this.path;
  }

  cancel(): boolean {
    let formerId = this.uploadId;
    this.uploadId = null;
    if (formerId !== null) {
      return this.evaporate.cancel(formerId);
    } else {
      return false;
    }
  }

  upload(): Observable<number> {
    this.cancel();

    let uploadOptions = {
      file: this.file,
      name: this.path,
      contentType: this.contentType,
      xAmzHeadersAtInitiate: {
        'x-amz-acl': 'private'
      },
      notSignedHeadersAtInitiate: {
        'Content-Disposition': 'attachment; filename=' + name
      }
    };

    let progressObservable: Observable<number> = Observable.create((sub: Subscriber<number>) => {
      sub.next(0);
      uploadOptions['progress'] = (pct: number) => sub.next(pct);
      uploadOptions['complete'] = () => { sub.next(1.0); sub.complete(); };
      uploadOptions['error']    = (msg: string) => sub.error(msg);
      this.uploadId = this.evaporate.add(uploadOptions);
    });

    // share the underlying observable without creating dups
    this.progress = progressObservable.publish();
    this.progress.connect();
    return this.progress;
  }
}
