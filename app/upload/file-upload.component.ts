import {Component, Input, OnInit} from 'angular2/core';
import {Upload} from './upload.service';

@Component({
  selector: 'file-upload',
  template: `
    <div>
      {{upload.name}}:
      {{progress | percent:'1.0-0'}}
      <button (click)="cancel($event)">Cancel</button>
    </div>
  `
})

export class FileUpload implements OnInit {
  public progress:number = 0;
  @Input() private upload: Upload;
  ngOnInit() {
    this.upload.progress.subscribe(
      (pct:number) => { this.progress = pct; },
      (err:any) => { console.log("*** upload error:", err); },
      () => { console.log("*** upload complete!"); }
    );
  }

  cancel(event:Event) {
    event.preventDefault();
    console.log("*** FileUpload.cancel():", this.upload);
    this.upload.cancel();
  }
}
