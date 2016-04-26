import {Pipe, PipeTransform} from 'angular2/core';

@Pipe({
  name: 'filesize'
})
export class FileSizePipe implements PipeTransform {

  transform(bytes: number): string {
    let labels = ['B', 'kB', 'MB', 'GB', 'TB'];

    if (bytes > 0) {
      let i = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + labels[i];
    } else {
      return '0 B';
    }
  }

}
