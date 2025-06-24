import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/apiResponse.interface';
import { CityData } from '../models/city.interface';
import { GetLocationsParams } from '../../../core/models/GetLocationsParams.interface';

@Injectable({
  providedIn: 'root',
})
export class CitiesService {
  readonly http = inject(HttpClient);
  readonly endpoint =
    'http://geodb-free-service.wirefreethought.com/v1/geo/cities';

  constructor() {}

  //получение всех городов
  getCities(
    params: GetLocationsParams = {}
  ): Observable<ApiResponse<CityData>> {
    return this.http.get<ApiResponse<CityData>>(this.endpoint, { params });
  }

  //данные о городе в попап
  cityDetailsPopup(wikiID: number) {
    return this.http
      .get<{ data: CityData }>(`${this.endpoint}/${wikiID}`)
      .pipe(map((resp) => resp.data));
  }
}
