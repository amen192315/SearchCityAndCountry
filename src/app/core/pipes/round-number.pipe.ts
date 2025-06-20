import { Pipe, PipeTransform } from '@angular/core';

//пайп для долготы и широты
@Pipe({
  name: 'roundPipe',
})
export class RoundPipe implements PipeTransform {
  transform(value: number): string {
    if (value === undefined || value === null) {
      return '';
    }
    return value.toFixed(3);
  }
}
