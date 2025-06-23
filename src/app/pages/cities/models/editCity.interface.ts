import { FormControl } from '@angular/forms';

export interface EditCity {
  name: FormControl<string | null>;
  country: FormControl<string | null>;
  region: FormControl<string | null>;
  population: FormControl<number | null>;
  latitude: FormControl<number | null>;
  longitude: FormControl<number | null>;
}
