import { UUID } from 'angular2-uuid';
import { MimeTypeService } from './mime-type.service';

const KB = 1024;
const MB = 1024 * KB;
const GB = 1024 * MB;

// Status of `FileUpload`s and `FilePart`s
const enum UploadStatus {
  waiting,
  uploading,
  complete,
  failed
}

// This is per ENV, put into a single class for convenience, typing, and clarity
export class UploaderConfiguration {
  constructor(
    public bucketName:string,
    public signUrl:string,
    public awsKey:string,
    public awsUrl:string = 'https://s3.amazonaws.com',
    public useCloudfront:boolean = false
  ) {}
}

export class Uploader {
  public uploads:Array<FileUpload> = [];
  public mimeTypeService:MimeTypeService = new MimeTypeService();

  constructor(public config:UploaderConfiguration) {
  }

  addFile(file:File, contentType?:string) : void {
    let ct = contentType || this.mimeTypeService.lookupFileMimetype(file).full();
    let up = new FileUpload(this.config, file, ct);
    this.uploads.push(up);

    // starts downloading immediately, should be a param
    up.upload();
  }
}

class FileUpload {
  public uuid:string;
  public name:string;
  public uploadId:string;
  public parts:Array<FilePart> = [];
  public PART_SIZE_DEFAULT:number = 6 * MB;
  public amzHeaders:Object;
  public unsignedHeaders:Object;
  public request:S3Request;

  constructor(
    public config:UploaderConfiguration,
    public file:File,
    public contentType:string
  ) {
    this.uuid = UUID.UUID();
    this.name = file.name.replace(/[^a-z0-9\.]+/gi,'_');
    this.amzHeaders = {
      'x-amz-acl': 'private'
    };
    this.unsignedHeaders = {
      'Content-Disposition': 'attachment; filename=' + this.name,
      'Content-Type': this.contentType
    };
  }

  upload(): void {
    this.initiate();
  }

  initiate(): void {
    this.request = new S3Request(
      this.config,
      'POST',
      this.getPath('?uploads'),
      this.amzHeaders,
      this.unsignedHeaders,
      null,
      this.initiateSuccess.bind(this),
      this.initiateError.bind(this)
    );
    this.request.request();
  }

  initiateSuccess(response:S3Response): void {
    let uploadId = response.getElements('UploadId')[0].textContent;

    if (!uploadId) {
      return this.initiateError(response);
    }
    console.log('***** uploadId', uploadId);
    this.uploadId = uploadId;
    this.uploadParts();
  }

  initiateError(response:S3Response) {
    console.log("initiateError", response);
  }

  uploadParts() {
    // how many parts, and create objects for each
    let remaining:number = this.file.size;
    let partNum:number = 1;
    let start:number = 0;
    let end:number = 0;
    let partSize:number = this.PART_SIZE_DEFAULT

    while(remaining > 0) {
      if(remaining >= partSize) {
        end = start + partSize;
        remaining = remaining - partSize;
      } else {
        end = start + remaining;
        remaining = 0;
      }
      let part:FilePart = new FilePart(this, partNum, start, end)
      this.parts.push(part);
      part.upload()
      start = end;
      partNum++;
    }
    console.log("parts", this.parts);
  }

  getPath(extra?:string) {
    let path = '/' + this.uploadKey() + (extra || '');
    if (!this.config.useCloudfront) {
      path = path + '/' + this.config.bucketName;
    }
    return path;
  }

  uploadKey():string {
    return ['development', this.uuid, this.name].join('/');
  }
}

class FilePart {
  public status:UploadStatus = UploadStatus.waiting;
  public uploadRequest:S3Request;

  constructor(
    public fileUpload:FileUpload,
    public partNumber:number,
    public start:number,
    public end:number
  ) {}

  upload() {
    if (!this.setStatus(UploadStatus.uploading)) {
      return;
    }

    let path = this.fileUpload.getPath('?partNumber=' + this.partNumber + '&uploadId=' + this.fileUpload.uploadId);
    this.uploadRequest = new S3Request(
      this.fileUpload.config,
      'PUT',
      path,
      {},
      this.fileUpload.unsignedHeaders,
      () => this.fileUpload.file.slice(this.start, this.end),
      this.onSuccess.bind(this),
      this.onError.bind(this),
      this.onProgress.bind(this)
    );
    this.uploadRequest.request();
  }

  onSuccess(res:S3Response) {
    this.setStatus(UploadStatus.complete);
    console.log(this.partNumber + " success :)");
  }

  onError(res:S3Response) {
    this.setStatus(UploadStatus.failed);
    console.log(this.partNumber + " error :(", res);
  }

  onProgress(event:ProgressEvent) {
    console.log(this.partNumber + " progress!", event);
  }

  setStatus(newStatus:UploadStatus): boolean {
    if (this.status == newStatus) {
      return false;
    }
    this.status = newStatus;
    return true;
  }
}

class S3Request {
  public auth:string;
  public xhr:XMLHttpRequest;

  constructor(
    public config:UploaderConfiguration,
    public method:string,
    public path:string,
    public amzHeaders:any,
    public unsignedHeaders:any,
    public payload:() => any,
    public onSuccess?:(res:S3Response) => any,
    public onError?:(res:S3Response) => any,
    public onProgress?:(event:ProgressEvent) => any
  ) {
    amzHeaders['x-amz-date'] = new Date().toUTCString();
  }

  request() {
    new SignRequest(this, this.makeRequest.bind(this)).authorizeRequest();
  }

  makeRequest(auth:string) {
    this.auth = auth;
    let payload:any = (this.payload ? this.payload() : null);
    let url:string = this.config.awsUrl + this.path;
    let allHeaders = Object.assign({}, this.unsignedHeaders, this.amzHeaders);
    allHeaders['Authorization'] = 'AWS ' + this.config.awsKey + ':' + this.auth;

    console.log("headers", allHeaders);

    this.xhr = new XMLHttpRequest();
    this.xhr.onreadystatechange = this.onXhrStateChange.bind(this);
    this.xhr.onerror = this.onXhrError.bind(this);
    this.xhr.upload.onprogress = this.onXhrProgress.bind(this);
    this.xhr.open(this.method, url);

    Object.keys(allHeaders).forEach(key => {
      console.log("setRequestHeader", key, allHeaders[key]);
      this.xhr.setRequestHeader(key, allHeaders[key]);
    })

    this.xhr.send(payload);
  }

  private onXhrStateChange() {
    if (this.onSuccess && this.xhr.readyState === XMLHttpRequest.DONE) {
      this.onSuccess(new S3Response(this));
    }
  }

  private onXhrError() {
    if (this.onError) {
      this.onError(new S3Response(this))
    }
  }

  private onXhrProgress(event:ProgressEvent) {
    if (this.onProgress) {
      this.onProgress(event);
    }
  }
}

class S3Response {
  public status:number;
  public response:any;
  public xhr:XMLHttpRequest;

  constructor(public request:S3Request) {
    this.xhr = request.xhr;
    this.status = this.xhr.status;
    this.response = this.xhr.response;
  }

  getElements(name:string):NodeList {
    return this.xhr.responseXML.getElementsByTagName(name);
  }
}

class SignRequest {

  private authXhr:XMLHttpRequest;

  constructor(
    private s3Request:S3Request,
    private callback:(auth:string) => any
  ) {
  }

  authorizeRequest(): void {
    let authUrl = this.s3Request.config.signUrl + '?to_sign=' + this.toSign();
    console.log("S3Request: authorize: url", authUrl);

    this.authXhr = new XMLHttpRequest();
    this.authXhr.onreadystatechange = this.authOnSuccess.bind(this);
    this.authXhr.onerror = this.authOnError.bind(this);
    this.authXhr.open('GET', authUrl);
    this.authXhr.send();
  }

  authOnSuccess() {
    if (this.authXhr.readyState === XMLHttpRequest.DONE) {
      let auth = this.authXhr.response.trim();
      console.log("auth", auth);
      this.callback(auth);
    }
  }

  authOnError() {
    let msg = 'failed to get authorization (onerror): ' + this.authXhr.status + ': ' + this.authXhr.status;
    console.log(msg);
  }

  toSign(): string {
    let sign:string = this.s3Request.method + '\n' + '\n' +
      (this.s3Request.unsignedHeaders["Content-Type"] || "") + '\n' + '\n' +
      this.headersToSign() +
      (this.s3Request.config.useCloudfront ? '/' + this.s3Request.config.bucketName : '') +
      this.s3Request.path;
    return encodeURIComponent(sign);
  }

  headersToSign(): string {
    return Object.keys(this.s3Request.amzHeaders)
      .sort()
      .reduce((s, h) => { return (s + h + ':' + this.s3Request.amzHeaders[h] + '\n'); }, '');
  }
}
