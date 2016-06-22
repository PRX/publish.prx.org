import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'filesize'
})
export class FileSizePipe implements PipeTransform {

  transform(bytes: number): string {
    let labels = ['B', 'KB', 'MB', 'GB', 'TB'];

    if (bytes <= 0) {
      return '0 B';
    } else if (bytes < 1024) {
      return `${bytes} B`;
    } else {
      let i = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + labels[i];
    }
  }

}
