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
      if (this.publishAudioCancel.uuid) {
        this.version.removeUpload(this.publishAudioCancel.uuid);
      }
      this.publishAudioCancel.canceled = false;
    }, this.DELAY);
  }

}
