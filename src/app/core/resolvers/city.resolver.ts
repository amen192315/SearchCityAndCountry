// Получаем данные при рендере страницы из его урла
/** 
import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { CityService } from '../services/city.service';
import { City } from '../models/city.model';

@Injectable({ providedIn: 'root' })
export class CityResolver implements Resolve<City> {
  constructor(private cityService: CityService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<City> {
    const cityId = route.params['id'];
    return this.cityService.getCityById(cityId);
  }
}
*/
