import { Directive, Input, HostListener } from '@angular/core';
import { AudioFileModel, AudioVersionModel } from '../../shared';

@Directive({
  selector: '[publishAudioCancel]'
})
export class AudioCancelDirective {

  DELAY = 1000;

  @Input() publishAudioCancel: AudioFileModel;

  @Input() version: AudioVersionModel;

  @HostListener('click') onClick() {
    this.publishAudioCancel.canceled = true;
    setTimeout(() => {
      this.publishAudioCancel.destroy();
      this.version.removeUpload(this.publishAudioCancel);
      this.publishAudioCancel.canceled = false;
    }, this.DELAY);
  }

}
