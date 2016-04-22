import {Component, Input, OnInit} from 'angular2/core';
import {Upload} from '../services/upload.service';

@Component({
  selector: 'file-upload',
  styleUrls: ['app/upload/directives/file-upload.component.css'],
  template: `
    <div class="file-upload">
      <div class="reorder"><i class="icon-menu"></i></div>
      <div class="main">
        <div class="type">
          <span>Segment</span>
          <i class="icon-down-dir"></i>
        </div>
        <div class="info">
          <span>{{upload.name}}</span>
          <span class="time">(0:20:39)</span>
        </div>
        <div class="progress">
          <p>Uploading</p>
          <div class="meter">
            <span [style.width]="progress | percent:'1.0-0'"></span>
          </div>
        </div>
      </div>
      <div class="cancel"><i class="icon-cancel" (click)="cancel($event)"></i></div>
    </div>
  `
})

export class FileUpload implements OnInit {

  public progress: number = 0;

  @Input() private upload: Upload;

  ngOnInit() {
    this.upload.progress.subscribe(
      (pct: number) => { this.progress = pct; },
      (err: any) => { console.log('*** upload error:', err); },
      () => { console.log('*** upload complete!'); }
    );
  }

  cancel(event: Event) {
    event.preventDefault();
    console.log('*** FileUpload.cancel():', this.upload);
    this.upload.cancel();
  }

}
