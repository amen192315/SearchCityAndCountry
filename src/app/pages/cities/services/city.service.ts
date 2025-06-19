import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { CityApiResponse, SearchCity } from '../models/city.interface';
import { CityData } from '../models/cityData.interface';

@Injectable({
  providedIn: 'root',
})
export class CitiesService {
  readonly http = inject(HttpClient);
  readonly baseApiUrl =
    'http://geodb-free-service.wirefreethought.com/v1/geo/cities';

  constructor() {}
  //получение всех городов
  getCities(
    offset: number = 0,
    limit: number = 5
  ): Observable<CityApiResponse> {
    return this.http.get<CityApiResponse>(
      `${this.baseApiUrl}?offset=${offset}&limit=${limit}`
    );
  }

  getTotalCount(): Observable<CityApiResponse> {
    return this.http.get<CityApiResponse>(`${this.baseApiUrl}?limit=1`);
  }

  //поиск городов
  searchCity(value: string | null | undefined): Observable<SearchCity> {
    return this.http.get<SearchCity>(`${this.baseApiUrl}?namePrefix=${value}`);
  }

  //данные о городе в попап
  cityDetailsPopup(wikiID: number) {
    return this.http
      .get<{ data: CityData }>(`${this.baseApiUrl}/${wikiID}`)
      .pipe(map((resp) => resp.data));
  }

  //получение списка городов определенной страны (фильтр)
  getCitiesByCode(countryCode: string): Observable<CityApiResponse> {
    return this.http.get<CityApiResponse>(
      `${this.baseApiUrl}?countryIds=${countryCode}`
    );
  }

  //поиск города после фильтрации
  searchCitiesAfterCode(
    countryCode: string,
    value: string | null | undefined
  ): Observable<CityApiResponse> {
    return this.http.get<CityApiResponse>(
      `${this.baseApiUrl}?countryIds=${countryCode}&namePrefix=${value}`
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
