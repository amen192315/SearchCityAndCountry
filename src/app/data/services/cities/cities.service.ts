import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  CityApiResponse,
  SearchCity,
} from '../../interfaces/city/city.interface';
import { DataCity } from '../../interfaces/city/dataCity.interface';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CitiesService {
  readonly http = inject(HttpClient);
  readonly baseApiUrl =
    'http://geodb-free-service.wirefreethought.com/v1/geo/cities';

  constructor() {}

  getCities(offset: number = 0, limit: number = 5) {
    return this.http.get<CityApiResponse>(
      `${this.baseApiUrl}?offset=${offset}&limit=${limit}`
    );
  }

  getTotalCount() {
    return this.http.get<CityApiResponse>(`${this.baseApiUrl}?limit=1`);
  }

  searchCity(value: string | null | undefined) {
    return this.http.get<SearchCity>(`${this.baseApiUrl}?namePrefix=${value}`);
  }

  cityDetailsPopup(wikiID: number) {
    return this.http
      .get<{ data: DataCity }>(`${this.baseApiUrl}/${wikiID}`)
      .pipe(map((resp) => resp.data));
  }
  getCitiesByCode(countryCode: string) {
    return this.http.get<CityApiResponse>(
      `${this.baseApiUrl}?countryIds=${countryCode}`
    );
  }
}
