import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'dateAgo'
})
export class DateAgoPipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';

    return moment(value).fromNow();
  }
}
