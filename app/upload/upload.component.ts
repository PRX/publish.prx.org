import {Component, Input} from 'angular2/core';
import {UploadService} from './services/upload.service';
import {UploadFileSelect} from './directives/upload-file-select.directive';
import {FileUpload} from './directives/file-upload.component';
import {StoryModel} from '../storyedit/models/story.model';
import {ReplaySubject} from 'rxjs';

@Component({
  directives: [UploadFileSelect, FileUpload],
  selector: 'audio-uploader',
  styleUrls: ['app/upload/upload.component.css'],
  template: `
    <header>
      <strong>{{cutName}}</strong><span>{{cutDesc}}</span>
    </header>
    <section>
      <file-upload *ngFor="#upload of uploadService.uploadsForStory(story.id)" [upload]="upload">
      </file-upload>
      <div *ngIf="uploadService.uploadsForStory(story.id)" class="empty">
        <h4>Upload a file to get started</h4>
      </div>
      <div class="uploader">
        <input type="file" id="file" upload-file [storyId]="story.id" />
        <label class="button" for="file">Upload Files</label>
      </div>
    </section>
  `
})

export class UploadComponent {

  cutName = `Producer's Cut`;
  cutDesc = 'The standard version of your story you would most like people to hear and buy';

  @Input() story: StoryModel;

  constructor(private uploadService: UploadService) {}

}
