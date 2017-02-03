import { Directive, Input, HostListener } from '@angular/core';
import { ModalService } from '../../core';
import { AudioFileModel, AudioVersionModel } from '../../shared';

@Directive({
  selector: '[publishAudioCancel]'
})
export class AudioCancelDirective {

  @Input() delay = 1000;

  @Input() publishAudioCancel: AudioFileModel;

  @Input() version: AudioVersionModel;

  constructor(private modal: ModalService) {}

  @HostListener('click') onClick() {
    if (this.publishAudioCancel.isUploading) {
      this.cancelAndDestroy();
    } else {
      this.modal.confirm(
        'Really delete audio file?',
        'This action cannot be undone.',
        (okay: boolean) => okay && this.cancelAndDestroy()
      );
    }
  }

  cancelAndDestroy() {
    this.publishAudioCancel.canceled = true;
    setTimeout(() => {
      this.publishAudioCancel.destroy();
      this.version.removeUpload(this.publishAudioCancel);
      this.publishAudioCancel.canceled = false;
    }, this.delay);
  }

}
