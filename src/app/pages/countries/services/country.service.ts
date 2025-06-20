import { HttpClient, HttpParams } from '@angular/common/http';
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

  getCountries(offset?: number, limit?: number, namePrefix?: string | null) {
    let params = new HttpParams();

    if (offset !== undefined) {
      params = params.set('offset', offset.toString());
    }

    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }

    if (namePrefix !== undefined && namePrefix !== null) {
      params = params.set('namePrefix', namePrefix);
    }

    return this.http.get<CountryApiResponse>(this.endpoint, { params });
  }
}
