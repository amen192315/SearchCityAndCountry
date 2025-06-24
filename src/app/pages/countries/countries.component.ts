import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { GetParams } from '../../core/models/getParams.interface';
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
import { NavLinksComponent } from '../../core/components/nav-links/nav-buttons.component';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { ApiResponse } from '../../core/models/apiResponse.interface';
import { TranslocoDirective, TranslocoModule } from '@jsverse/transloco';

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

  //---material ui данные----
  readonly displayedColumns: string[] = [
    'wikiDataId',
    'icon',
    'name',
    'code',
    'currencyCodes',
  ];

  readonly dataSource = signal<CountryData[]>([]);
  //данные для пагинации
  readonly pageSize = signal(5);
  readonly offset = signal(0);
  readonly totalCount = signal(0);

  readonly isLoading = signal(false);

  public pageIndex = computed(() =>
    Math.floor(this.offset() / this.pageSize())
  );

  readonly searchForm: FormGroup<{ searchInput: FormControl<string | null> }> =
    this.fb.group({
      searchInput: ['', [Validators.pattern(/^[A-Za-z\s]*$/)]],
    });
  //текущее зн-е инпута
  private currentFilter: string | null = null;
  //query параметры
  private readonly queryParams = signal<GetParams>({
    offset: this.offset(),
    limit: this.pageSize(),
  });

  ngOnInit() {
    this.loadData();

    this.searchForm.valueChanges
      .pipe(
        debounceTime(400),
        filter(() => this.searchForm.valid),
        tap((val) => {
          this.isLoading.set(true);
          this.currentFilter = val.searchInput || null;
          this.updateQueryParams();
          this.offset.set(0);
        }),
        switchMap(() => {
          return this.loadCountries();
        }),
        tap((res) => {
          this.isLoading.set(false);
          this.totalCount.set(res.metadata.totalCount);
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

  //начальные данные
  private loadData(): void {
    this.loadCountries()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => console.error(err),
      });
  }
  //метод прогрузки данных (старался убрать дублирующий код)
  private loadCountries(
    params?: Partial<GetParams>
  ): Observable<ApiResponse<CountryData>> {
    this.isLoading.set(true);
    this.updateQueryParams();

    const queryParams = {
      ...this.queryParams(),
      ...(this.currentFilter ? { namePrefix: this.currentFilter } : {}),
      ...params,
    };

    return this.dataService.getCountries(queryParams).pipe(
      tap((res: ApiResponse<CountryData>) => {
        this.dataSource.set(res.data);
        this.totalCount.set(res.metadata.totalCount);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  private updateQueryParams(): void {
    this.queryParams.set({
      offset: this.offset(),
      limit: this.pageSize(),
    });
  }

  //пагинатор
  onPageChange(event: PageEvent): void {
    const newPageIndex = event.pageIndex;
    const newPageSize = event.pageSize;

    const newOffset = newPageIndex * newPageSize;

    this.pageSize.set(newPageSize);
    this.offset.set(newOffset);
    this.loadData();
  }

  //прокидываем данные в урл
  goToCities(countryCode: string): void {
    this.router.navigate(['/cities'], { queryParams: { countryCode } });
  }
}
