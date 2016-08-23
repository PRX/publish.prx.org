import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {

  transform(totalSeconds: number): string {
    let h = Math.floor(totalSeconds / 3600);
    let m = Math.floor(totalSeconds % 3600 / 60);
    let s = Math.floor(totalSeconds % 3600 % 60);
    return `${h}:` + (m < 10 ? `0${m}:` : `${m}:`) + (s < 10 ? `0${s}` : `${s}`);
  }

}
