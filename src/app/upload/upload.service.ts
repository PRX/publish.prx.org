import { Injectable } from 'angular2/core';
import { UUID } from 'angular2-uuid';
import { MimeTypeService } from '../../util/mime-type.service';
import { Env } from '../../util/env';
import Evaporate from 'evaporate';

@Injectable()
export class UploadService {
  public bucketName:string = Env.BUCKET_NAME;
  public signUrl:string = Env.SIGN_URL;
  public awsKey:string = Env.AWS_KEY;
  public awsUrl:string = Env.AWS_URL;
  public useCloudfront:boolean = (Env.USE_CLOUDFRONT == 'true');

  public uploads:Array<string> = [];
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

  addFile(file:File, contentType?:string) : void {
    let ct = contentType || this.mimeTypeService.lookupFileMimetype(file).full();
    let name = file.name.replace(/[^a-z0-9\.]+/gi,'_');

    let uploadId = this.evaporate.add({
      file: file,
      name: name,
      contentType: ct,
      xAmzHeadersAtInitiate: {
        'x-amz-acl': 'private'
      },
      notSignedHeadersAtInitiate: {
        'Content-Disposition': 'attachment; filename=' + name
      }
    });
    this.uploads.push(uploadId);
  }
}
