import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
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
import { PaginationService } from '../../core/services/pagination.service';

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
export class CountriesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly dataService = inject(CountriesService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly paginationService = inject(PaginationService);

  //---material ui данные----
  readonly displayedColumns: string[] = [
    'wikiDataId',
    'icon',
    'name',
    'code',
    'currencyCodes',
  ];

  readonly dataSource = signal<CountryData[]>([]);
  readonly isLoading = signal(false);

  readonly searchForm: FormGroup<{ searchInput: FormControl<string | null> }> =
    this.fb.group({
      searchInput: ['', [Validators.pattern(/^[A-Za-z\s]*$/)]],
    });

  private currentFilter: string | null = null;

  ngOnInit() {
    this.loadData();

    this.searchForm.valueChanges
      .pipe(
        debounceTime(400),
        filter(() => this.searchForm.valid),
        tap((val) => {
          this.isLoading.set(true);
          this.currentFilter = val.searchInput || null;
          this.paginationService.reset();
        }),
        switchMap(() => {
          return this.loadCountries();
        }),
        tap((res) => {
          this.isLoading.set(false);
          this.paginationService.setTotalCount(res.metadata.totalCount);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res: ApiResponse<CountryData>) => {
          this.dataSource.set(res.data);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  private loadData(): void {
    this.loadCountries()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => console.error(err),
      });
  }

  private loadCountries(
    params?: Partial<GetLocationsParams>
  ): Observable<ApiResponse<CountryData>> {
    this.isLoading.set(true);

    const queryParams = {
      ...this.paginationService.getQueryParams(),
      ...(this.currentFilter ? { namePrefix: this.currentFilter } : {}),
      ...params,
    };

    return this.dataService.getCountries(queryParams).pipe(
      tap((res: ApiResponse<CountryData>) => {
        this.dataSource.set(res.data);
        this.paginationService.setTotalCount(res.metadata.totalCount);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  onPageChange(event: PageEvent): void {
    this.paginationService.handlePageChange(event);
    this.loadData();
  }

  goToCities(countryCode: string): void {
    this.router.navigate(['/cities'], { queryParams: { countryCode } });
  }
}
