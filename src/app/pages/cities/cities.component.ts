import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CitiesService } from './services/city.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import {
  debounceTime,
  filter,
  finalize,
  Observable,
  switchMap,
  tap,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomNumber } from '../../core/pipes/custom-number.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CityDetailsPopupComponent } from './components/city-details-popup/city-details-popup.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CityEditPopupComponent } from './components/city-edit-popup/city-edit-popup.component';
import { CityData } from './models/city.interface';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ApiResponse } from '../../core/models/apiResponse.interface';
import { TranslocoDirective } from '@jsverse/transloco';
import { GetLocationsParams } from '../../core/models/getLocationsParams.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatAutocompleteModule,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CountriesService } from '../countries/services/country.service';
import { CountryData } from '../countries/models/country.interface';
import { SharedTableComponent } from '../../core/components/shared-table/shared-table.component';

@Component({
  selector: 'app-cities',
  imports: [
    MatTableModule,
    CommonModule,
    CustomNumber,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule,
    MatPaginator,
    MatPaginatorModule,
    TranslocoDirective,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    ScrollingModule,
  ],
  templateUrl: './cities.component.html',
  styleUrl: './cities.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitiesComponent extends SharedTableComponent<CityData> {
  private readonly dataService = inject(CitiesService);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly countriesService = inject(CountriesService);

  readonly displayedColumns: string[] = [
    'country',
    'name',
    'region',
    'population',
    'actions',
  ];

  public firstCityName!: string;
  readonly countriesData = signal<CountryData[]>([]);
  readonly isCountriesLoading = signal(false);
  private selectedCountryCode: string | null = null;

  constructor() {
    super();
    this.countriesInit.set(false);
    this.searchForm = this.fb.group({
      searchInput: ['', [Validators.pattern(/^[A-Za-z\s]*$/)]],
      countryInput: ['', [Validators.pattern(/^[A-Za-z\s]*$/)]],
    });
  }

  override ngOnInit() {
    super.ngOnInit();

    this.route.queryParams
      .pipe(
        tap((params) => {
          this.isLoading.set(true);
          this.selectedCountryCode = params['countryCode'] ?? null;
        }),
        switchMap(() => {
          return this.loadData();
        }),
        tap((res) => {
          this.isLoading.set(false);
          this.firstCityName = res.data[0]?.country ?? '';
          this.paginationService.setTotalCount(res.metadata.totalCount);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => this.dataSource.set(res.data),
        error: console.error,
      });

    this.searchForm.controls['countryInput'].valueChanges
      .pipe(
        debounceTime(400),
        filter(() => this.searchForm.controls['countryInput'].valid),
        tap((value) => {
          this.isCountriesLoading.set(true);
          if (!value) {
            this.selectedCountryCode = null;
          }
        }),
        switchMap((value) => {
          return value
            ? this.loadCountries({ namePrefix: value, limit: 10 })
            : this.loadCountries({});
        }),
        finalize(() => this.isCountriesLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => this.countriesData.set(res.data),
        error: console.error,
      });
  }

  loadData(
    params?: Partial<GetLocationsParams>
  ): Observable<ApiResponse<CityData>> {
    this.isLoading.set(true);

    const queryParams = {
      ...this.paginationService.getQueryParams(),
      ...(this.currentFilter ? { namePrefix: this.currentFilter } : {}),
      ...(this.selectedCountryCode
        ? { countryIds: this.selectedCountryCode }
        : {}),
      ...params,
    };

    return this.dataService.getCities(queryParams).pipe(
      tap((res) => {
        this.dataSource.set(res.data);
        this.paginationService.setTotalCount(res.metadata.totalCount);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  private loadCountries(
    params: Partial<GetLocationsParams> = {}
  ): Observable<ApiResponse<CountryData>> {
    return this.countriesService.getCountries(params);
  }

  private loadCountriesIfNeeded(): Observable<ApiResponse<CountryData>> | null {
    if (this.countriesData().length === 0) {
      this.isCountriesLoading.set(true);
      return this.loadCountries({ limit: 10 }).pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isCountriesLoading.set(false))
      );
    }
    return null;
  }

  openCountryPanel(trigger: MatAutocompleteTrigger) {
    const load$ = this.loadCountriesIfNeeded();

    if (load$) {
      load$.subscribe({
        next: (res) => {
          this.countriesData.set(res.data);
          trigger.openPanel();
        },
        error: console.error,
      });
    } else {
      trigger.openPanel();
    }
  }

  onCountrySelected(code: string | null) {
    this.selectedCountryCode = code;
    this.paginationService.reset();
    this.loadData().subscribe();
  }

  private updateCity(wikiDataId: string, updatedData: Partial<CityData>) {
    const updatedCities = this.dataSource().map((city) =>
      city.wikiDataId === wikiDataId ? { ...city, ...updatedData } : city
    );
    this.dataSource.set(updatedCities);
  }

  closeFilter() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/cities']);
    });
  }

  viewCity(wikiID: number) {
    this.dataService
      .cityDetailsPopup(wikiID)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dialog?.open(CityDetailsPopupComponent, {
            data: res,
            width: '500px',
          });
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  editItem(city: CityData) {
    const dialogRef = this.dialog.open(CityEditPopupComponent, {
      width: '600px',
      data: city,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateCity(city.wikiDataId, result);
      }
    });
  }
}
