import { Component, Input } from '@angular/core';
import { ModalService } from 'ngx-prx-styleguide';
import { AudioFileModel, DurationPipe, FileSizePipe } from '../../shared';

const duration = new DurationPipe();
const fileSize = new FileSizePipe();

@Component({
  selector: 'publish-audio-duration',
  styleUrls: ['audio-duration.component.css'],
  template: `
    <span *ngIf="hasDuration">({{file.duration | duration}})</span>
    <span *ngIf="file?.size && !hasDuration">({{file.size | filesize}})</span>
    <button *ngIf="hasInfo" class="btn-icon" aria-label="Info" (click)="showInfo()"></button>
  `
})

export class AudioDurationComponent {

  @Input() file: AudioFileModel;

  private infoStyle = `
    <style type="text/css">
      a { font-weight: 600; text-decoration: underline; }
      dl { padding-bottom: 10px; }
      dt, dd { padding-top: 6px; }
      dt { float: left; clear: left; margin-right: 10px; font-weight: bold; }
      dd { min-height: 30px; margin-left: 120px; color: #555; }
    </style>
  `;

  constructor(private modal: ModalService) {}

  get hasDuration(): boolean {
    return this.file && (this.file.duration !== null && this.file.duration !== undefined);
  }

  get hasInfo(): boolean {
    return this.hasDuration && (this.file.frequency !== null && this.file.frequency !== undefined);
  }

  showInfo() {
    this.modal.show({
      title: this.file.label,
      body: this.infoHtml(),
      width: 300,
      secondaryButton: 'Okay'
    });
  }

  private infoHtml(): string {
    let original = this.file.filename;
    let type = this.file.contenttype || '<i>Unknown</i>';
    let layer = this.file.layer || '<i>Unknown</i>';
    let frequency = '<i>Unknown</i>';
    if (this.file.frequency) {
      frequency = `${this.file.frequency / 1000} kHz`;
    }
    let bitrate = '<i>Unknown</i>';
    if (this.file.bitrate) {
      bitrate = `${this.file.bitrate / 1000} kb/s`;
    }
    let channels = this.file.channelmode || '<i>Unknown</i>';
    return this.infoStyle + `
      <dl>
        <dt>File:</dt><dd>${this.enclosureLink}</dd>
        <dt>Size:</dt><dd>${fileSize.transform(this.file.size)}</dd>
        <dt>Duration:</dt><dd>${duration.transform(this.file.duration)}</dd>
        <dt>Content Type:</dt><dd>${type}</dd>
        <dt>MPEG Layer:</dt><dd>${layer}</dd>
        <dt>Frequency:</dt><dd>${frequency}</dd>
        <dt>Bitrate:</dt><dd>${bitrate}</dd>
        <dt>Channels:</dt><dd>${channels}</dd>
      </dl>
    `;
  }

  private get enclosureLink(): string {
    let name = this.file.filename, href = this.file.enclosureHref;
    if (href) {
      return `<a target="_blank" rel="noopener" href="${href}">${name}</a>`;
    } else {
      return name;
    }
  }

}
