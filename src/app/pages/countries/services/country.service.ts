import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CountryData } from '../models/country.interface';
import { ApiResponse } from '../../../core/models/apiResponse.interface';
import { Observable } from 'rxjs';
import { GetLocationsParams } from '../../../core/models/getLocationsParams.interface';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  readonly http = inject(HttpClient);
  readonly endpoint =
    'http://geodb-free-service.wirefreethought.com/v1/geo/countries';

  constructor() {}

  getCountries(
    params: GetLocationsParams = {}
  ): Observable<ApiResponse<CountryData>> {
    return this.http.get<ApiResponse<CountryData>>(this.endpoint, {
      params: new HttpParams().appendAll(params),
    });
  }
}
