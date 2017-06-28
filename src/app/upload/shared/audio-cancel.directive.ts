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
        'Really delete?',
        'Are you sure you want to remove this audio file?',
        (confirm: boolean) => confirm && this.cancelAndDestroy()
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
