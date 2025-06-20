import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
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

@Component({
  selector: 'app-countries',
  imports: [
    MatTableModule,
    CommonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    NavLinksComponent,
  ],
  standalone: true,
  templateUrl: './countries.component.html',
  styleUrl: './countries.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountriesComponent implements OnInit, OnDestroy {
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

  isLoading = signal(false);

  readonly searchForm = this.fb.group({
    searchInput: ['', [Validators.pattern(/^[A-Za-z]*$/)]],
  });
  ngOnInit() {
    this.initialData();

    this.searchForm.valueChanges
      .pipe(
        debounceTime(400),
        filter(() => this.searchForm.valid),
        tap(() => this.isLoading.set(true)),
        switchMap((items) => {
          return items.searchInput
            ? this.dataService.searchCountry(items.searchInput)
            : this.dataService.getCountries();
        }),
        catchError((err) => {
          console.error('Error occurred:', err);
          return EMPTY;
        }),
        tap((res) => {
          this.isLoading.set(false);
          this.dataSource.set(res.data);
        }),
        takeUntil(this.takeUntilDestroyed)
      )
      .subscribe();
  }

  //Начальные данные
  initialData(): void {
    this.isLoading.set(true);

    this.dataService
      .getCountries()
      .pipe(
        tap((res) => this.dataSource.set(res.data)),
        catchError((err) => {
          console.error('Error occurred:', err);
          return EMPTY;
        }),
        takeUntil(this.takeUntilDestroyed),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();
  }

  //Данные полученные с input
  searchCities(item: string): void {
    this.isLoading.set(true);

    this.dataService
      .searchCountry(item)
      .pipe(
        tap((res) => this.dataSource.set(res.data)),
        catchError((err) => {
          console.error('Error occurred:', err);
          return EMPTY;
        }),
        takeUntil(this.takeUntilDestroyed),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();
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
