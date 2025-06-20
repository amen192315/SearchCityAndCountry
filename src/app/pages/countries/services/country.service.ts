import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CountryApiResponse, SearchCountry } from '../models/country.interface';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  readonly http = inject(HttpClient);
  readonly endpoint =
    'http://geodb-free-service.wirefreethought.com/v1/geo/countries';

  constructor() {}

  getCountries(offset: number = 0, limit: number = 5) {
    // похожи
    return this.http.get<CountryApiResponse>(
      `${this.endpoint}?offset=${offset}&limit=${limit}`
    );
  }

  getTotalCount() {
    return this.http.get<CountryApiResponse>(`${this.endpoint}?limit=1`);
  }

  searchCountry(value: string | null | undefined) {
    // похожи
    return this.http.get<SearchCountry>(`${this.endpoint}?namePrefix=${value}`);
  }
}
