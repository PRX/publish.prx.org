import {Pipe, PipeTransform} from 'angular2/core';

@Pipe({
  name: 'timeago'
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: Date): string {
    let now = new Date();
    let elapsed = Math.floor((now.getTime() - value.getTime()) / 1000);

    if (elapsed < 60) {
      return `about ${elapsed} seconds ago`;
    } else if (elapsed < 3600) {
      let minutes = Math.floor(elapsed / 60);
      return `about ${minutes} minutes ago`;
    } else {
      let date = (value.getMonth() + 1) + '/' + value.getDate() + '/' + value.getFullYear();
      let time = value.getHours() + ':' + value.getMinutes();
      return `at ${date}, ${time}`;
    }
  }

}
