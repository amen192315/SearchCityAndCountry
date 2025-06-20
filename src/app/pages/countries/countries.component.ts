import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import {
  catchError,
  debounceTime,
  EMPTY,
  filter,
  finalize,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { CountriesService } from './services/country.service';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { CountryData } from './models/countryData.interface';
import { NavLinksComponent } from '../../core/components/nav-links/nav-buttons.component';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { CountryApiResponse } from './models/country.interface';

@Component({
  selector: 'app-countries',
  imports: [
    MatTableModule,
    CommonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    NavLinksComponent,
    MatPaginatorModule,
  ],
  standalone: true,
  templateUrl: './countries.component.html',
  styleUrl: './countries.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountriesComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private readonly dataService = inject(CountriesService);
  private readonly takeUntilDestroyed = new Subject();
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  //---material ui данные----
  readonly displayedColumns: string[] = [
    'wikiDataId',
    'icon',
    'name',
    'code',
    'currencyCodes',
  ];

  readonly dataSource = signal<CountryData[]>([]);

  readonly pageSize = signal(5);
  readonly offset = signal(0);
  readonly totalCount = signal(0);
  readonly isLoading = signal(false);

  readonly searchForm = this.fb.group({
    searchInput: ['', [Validators.pattern(/^[A-Za-z]*$/)]],
  });

  ngOnInit() {
    this.initialData(0, this.pageSize());

    this.searchForm.valueChanges
      .pipe(
        debounceTime(400),
        filter(() => this.searchForm.valid),
        tap(() => {
          this.isLoading.set(true);
          if (this.paginator) {
            this.paginator.pageIndex = 0;
          }
        }),
        switchMap((items) => {
          return items.searchInput
            ? this.dataService.getCountries(
                0,
                this.pageSize(),
                items.searchInput
              )
            : this.dataService.getCountries(0, this.pageSize());
        }),
        catchError((err) => {
          console.error('Произошла ошибка:', err);
          this.dataSource.set([]);
          return EMPTY;
        }),
        tap(() => this.isLoading.set(false)),
        takeUntil(this.takeUntilDestroyed)
      )
      .subscribe({
        next: (res: CountryApiResponse) => {
          this.dataSource.set(res.data);
        },
      });
  }

  //Начальные данные
  initialData(offset: number, limit: number, namePrefix?: string): void {
    this.isLoading.set(true);

    this.dataService
      .getCountries(offset, limit, namePrefix)
      .pipe(
        catchError((err) => {
          console.error('Произошла ошибка:', err);
          this.dataSource.set([]);
          return EMPTY;
        }),
        takeUntil(this.takeUntilDestroyed),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (res: CountryApiResponse) => {
          this.dataSource.set(res.data);
          this.totalCount.set(res.metadata.totalCount);
        },
      });
  }
  get pageIndex() {
    return Math.floor(this.offset() / this.pageSize());
  }

  //пагинатор
  onPageChange(event: PageEvent) {
    const newPageIndex = event.pageIndex;
    const newPageSize = event.pageSize;

    const newOffset = newPageIndex * newPageSize;

    this.pageSize.set(newPageSize);
    this.offset.set(newOffset);
    this.initialData(newOffset, newPageSize);
  }

  //прокидываем данные в урл
  goToCities(countryCode: string) {
    this.router.navigate(['/cities', countryCode]);
  }

  ngOnDestroy(): void {
    this.takeUntilDestroyed.next(true);
    this.takeUntilDestroyed.complete();
  }
}
