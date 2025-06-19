import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CountryApiResponse, SearchCountry } from '../models/country.interface';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  readonly http = inject(HttpClient);
  readonly baseApiUrl =
    'http://geodb-free-service.wirefreethought.com/v1/geo/countries';

  constructor() {}

  getCountries(offset: number = 0, limit: number = 5) {
    return this.http.get<CountryApiResponse>(
      `${this.baseApiUrl}?offset=${offset}&limit=${limit}`
    );
  }

  getTotalCount() {
    return this.http.get<CountryApiResponse>(`${this.baseApiUrl}?limit=1`);
  }

  searchCountry(value: string | null | undefined) {
    return this.http.get<SearchCountry>(
      `${this.baseApiUrl}?namePrefix=${value}`
    );
  }
}
