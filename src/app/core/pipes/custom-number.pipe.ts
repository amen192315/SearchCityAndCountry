import { Pipe, PipeTransform } from '@angular/core';

//пайп для кол-во населения
@Pipe({ name: 'customNumber' })
export class CustomNumber implements PipeTransform {
  transform(value: number): string {
    if (value === undefined || value === null) {
      return '';
    }
    if (value >= 1000000) {
      return (value / 1000000).toFixed(3).replace(/\.?0+$/, '') + ' млн';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(3).replace(/\.?0+$/, '') + ' тыс';
    } else {
      return value.toString();
    }
  }
}
