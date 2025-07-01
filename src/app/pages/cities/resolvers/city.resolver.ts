import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { ApiResponse } from '../../../core/models/apiResponse.interface';
import { CityData } from '../models/city.interface';
import { CitiesService } from '../services/city.service';
import { inject } from '@angular/core';
import { PaginationService } from '../../../core/services/pagination/pagination.service';

export const cityResolver: ResolveFn<ApiResponse<CityData>> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const citiesService = inject(CitiesService);
  const paginationService = inject(PaginationService);

  const countryCode = route.queryParams['countryCode'] || null;

  const queryParams = {
    ...paginationService.getQueryParams(),
    ...(countryCode ? { countryIds: countryCode } : {}),
  };
  return citiesService.getCities(queryParams);
};
