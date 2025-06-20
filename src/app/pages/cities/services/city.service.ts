import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { CityApiResponse, SearchCity } from '../models/city.interface';
import { CityData } from '../models/cityData.interface';

@Injectable({
  providedIn: 'root',
})
export class CitiesService {
  readonly http = inject(HttpClient);
  readonly endpoint =
    'http://geodb-free-service.wirefreethought.com/v1/geo/cities';

  constructor() {}
  //получение всех городов
  getCities(offset?: number, limit?: number, namePrefix?: string | null) {
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

    return this.http.get<CityApiResponse>(this.endpoint, { params });
  }

  //данные о городе в попап
  cityDetailsPopup(wikiID: number) {
    return this.http
      .get<{ data: CityData }>(`${this.endpoint}/${wikiID}`)
      .pipe(map((resp) => resp.data));
  }

  //получение списка городов определенной страны (фильтр)
  getCitiesByCode(countryCode: string): Observable<CityApiResponse> {
    return this.http.get<CityApiResponse>(
      `${this.endpoint}?countryIds=${countryCode}`
    );
  }

  //поиск города после фильтрации
  searchCitiesAfterCode(
    countryCode: string,
    value: string | null | undefined
  ): Observable<CityApiResponse> {
    return this.http.get<CityApiResponse>(
      `${this.endpoint}?countryIds=${countryCode}&namePrefix=${value}`
    );
  }

  //изменение города (для localStorage)
  updateCity(
    wikiDataId: string,
    data: Partial<CityData>
  ): Observable<CityData> {
    return of({ ...data, wikiDataId } as CityData);
  }
}
