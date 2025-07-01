import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { finalize, Observable, tap } from 'rxjs';
import { CountriesService } from './services/country.service';
import { GetLocationsParams } from '../../core/models/getLocationsParams.interface';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { CountryData } from './models/country.interface';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ApiResponse } from '../../core/models/apiResponse.interface';
import { TranslocoDirective, TranslocoModule } from '@jsverse/transloco';
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
