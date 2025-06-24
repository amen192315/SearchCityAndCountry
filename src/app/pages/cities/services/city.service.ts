import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { ApiResponse } from '../../../core/models/apiResponse.interface';
import { CityData } from '../models/city.interface';
import { GetParams } from '../../../core/models/getParams.interface';

@Injectable({
  providedIn: 'root',
})
export class CitiesService {
  readonly http = inject(HttpClient);
  readonly endpoint =
    'http://geodb-free-service.wirefreethought.com/v1/geo/cities';

  constructor() {}
  //получение всех городов

  getCities(params: GetParams = {}): Observable<ApiResponse<CityData>> {
    return this.http.get<ApiResponse<CityData>>(this.endpoint, { params });
  }
  //получение списка городов определенной страны (фильтр) и поиск
  /**  getAndSearchCitiesByCode(
    offset?: number,
    limit?: number,
    countryIds?: string | null,
    namePrefix?: string | null
  ): Observable<ApiResponse<CityData>> {
    let params = new HttpParams();

    if (offset !== undefined) {
      params = params.set('offset', offset.toString());
    }

    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }

    if (countryIds !== undefined && countryIds !== null) {
      params = params.set('countryIds', countryIds);
    }

    if (namePrefix !== undefined && namePrefix !== null) {
      params = params.set('namePrefix', namePrefix);
    }

    return this.http.get<ApiResponse<CityData>>(this.endpoint, { params });
  }
    */
  //данные о городе в попап
  cityDetailsPopup(wikiID: number) {
    return this.http
      .get<{ data: CityData }>(`${this.endpoint}/${wikiID}`)
      .pipe(map((resp) => resp.data));
  }
}
