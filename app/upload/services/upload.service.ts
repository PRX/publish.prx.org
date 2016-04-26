import {Injectable} from 'angular2/core';
import {Observable, Subscriber} from 'rxjs';
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
    return this.uploads.filter((upload) => {
      return upload.versionId === audioVersionId;
    });
  }

}

export class Upload {
  public name: string;
  public path: string;
  public progress: Observable<number>;
  public uploadId: string;

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
    if (this.uploadId !== null) {
      return this.evaporate.cancel(this.uploadId);
    }
    return false;
  }

  upload(): Observable<number> {
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

    this.progress = Observable.create((sub: Subscriber<number>) => {
      sub.next(0);
      uploadOptions['progress'] = (pct: number) => sub.next(pct);
      uploadOptions['complete'] = () => { sub.next(1.0); sub.complete(); };
      uploadOptions['error']    = (msg: string) => sub.error(msg);
      this.uploadId = this.evaporate.add(uploadOptions);
    });

    return this.progress;
  }
}
