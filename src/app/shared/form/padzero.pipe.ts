import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'padzero'
})
export class PadZeroPipe implements PipeTransform {

  transform(value: any, length = 2): string {
    let num = parseInt(value, 10);
    let padded = `${num}`;
    while (padded.length < length) {
      padded = `0${padded}`;
    }
    return padded;
  }

}
