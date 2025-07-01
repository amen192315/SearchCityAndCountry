import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import {
  debounceTime,
  filter,
  finalize,
  Observable,
  switchMap,
  tap,
} from 'rxjs';
import { CountriesService } from './services/country.service';
import { GetLocationsParams } from '../../core/models/getLocationsParams.interface';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { CountryData } from './models/country.interface';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { ApiResponse } from '../../core/models/apiResponse.interface';
import { TranslocoDirective, TranslocoModule } from '@jsverse/transloco';
import { PaginationService } from '../../core/services/pagination/pagination.service';
import { SharedTableComponent } from '../../core/components/shared-table/shared-table.component';

@Component({
  selector: 'app-countries',
  imports: [
    MatTableModule,
    CommonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,

    MatPaginatorModule,
    TranslocoDirective,
    TranslocoModule,
  ],
  standalone: true,
  templateUrl: './countries.component.html',
  styleUrl: './countries.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountriesComponent extends SharedTableComponent<CountryData> {
  private readonly router = inject(Router);
  private readonly countryService = inject(CountriesService);

  // material ui данные
  readonly displayedColumns: string[] = [
    'wikiDataId',
    'icon',
    'name',
    'code',
    'currencyCodes',
  ];
  //-------------------
  loadData(
    params?: Partial<GetLocationsParams>
  ): Observable<ApiResponse<CountryData>> {
    this.isLoading.set(true);

    const queryParams = {
      ...this.paginationService.getQueryParams(),
      ...(this.currentFilter ? { namePrefix: this.currentFilter } : {}),
      ...params,
    };

    return this.countryService.getCountries(queryParams).pipe(
      tap((res: ApiResponse<CountryData>) => {
        this.dataSource.set(res.data);
        this.paginationService.setTotalCount(res.metadata.totalCount);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }
  goToCities(countryCode: string): void {
    this.router.navigate(['/cities'], { queryParams: { countryCode } });
  }
}
