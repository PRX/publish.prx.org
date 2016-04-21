import {Pipe, PipeTransform} from 'angular2/core';

@Pipe({
  name: 'timeago'
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: Date): string {
    let now = new Date();
    let elapsed = Math.floor((now.getTime() - value.getTime()) / 1000);

    if (elapsed < 60) {
      let noun = (elapsed === 1) ? 'second' : 'seconds';
      return `about ${elapsed} ${noun} ago`;
    } else if (elapsed < 3600) {
      let minutes = Math.floor(elapsed / 60);
      let noun = (minutes === 1) ? 'minute' : 'minutes';
      return `about ${minutes} ${noun} ago`;
    } else {
      let date = (value.getMonth() + 1) + '/' + value.getDate() + '/' + value.getFullYear();
      let hours = value.getHours(), minutes: any = value.getMinutes(), ampm = 'am';
      if (hours > 12) {
        hours = hours - 12;
        ampm = 'pm';
      } else if (hours < 1) {
        hours = 12;
      }
      if (minutes < 10) {
        minutes = `0${minutes}`;
      }
      return `at ${date}, ${hours}:${minutes}${ampm}`;
    }
  }

}
