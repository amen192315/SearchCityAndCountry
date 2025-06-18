import { Pipe, PipeTransform } from '@angular/core';

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
