import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime, Subject, switchMap, takeUntil } from 'rxjs';
import { DataCountry } from '../../data/interfaces/country/dataCountry.interface';
import {
  CountryApiResponse,
  SearchCountry,
} from '../../data/interfaces/country/country.interface';
import { CountriesService } from '../../data/services/countries/countries.service';
import { CommonModule } from '@angular/common';
import { NavButtonsComponent } from '../../common-ui/nav-buttons/nav-buttons.component';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-countries',
  imports: [
    MatTableModule,
    CommonModule,
    NavButtonsComponent,
    MatIconModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  standalone: true,
  templateUrl: './countries.component.html',
  styleUrl: './countries.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountriesComponent implements OnInit, OnDestroy {
  private readonly dataService = inject(CountriesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject();
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
  readonly dataSource = new MatTableDataSource<DataCountry>([]);
  //--------------------------
  isLoading = false;

  readonly searchForm = this.fb.group({
    searchInput: ['', [Validators.pattern(/^[A-Za-z]*$/)]],
  });
  ngOnInit() {
    this.initialData();

    this.searchForm.valueChanges
      .pipe(
        debounceTime(400),
        switchMap((items) => {
          this.isLoading = true;
          if (this.searchForm.valid) {
            this.cdr.markForCheck();
          }
          return items.searchInput
            ? this.dataService.searchCountry(items.searchInput)
            : this.dataService.getCountries();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.dataSource.data = res.data;
          this.finallyRender();
        },
        error: (err) => {
          console.warn(err);
          this.finallyRender();
        },
      });
  }

  //Начальные данные
  initialData(): void {
    this.isLoading = true;

    this.dataService
      .getCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: CountryApiResponse) => {
          this.dataSource.data = response.data;
          this.finallyRender();
        },
        error: (err) => {
          console.warn(err);
          this.finallyRender();
        },
      });
  }

  //Данные полученные с input
  searchCities(item: string): void {
    this.isLoading = true;

    this.dataService
      .searchCountry(item)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: SearchCountry) => {
          this.dataSource.data = res.data;
          this.finallyRender();
        },
        error: (err) => {
          console.warn(err);
          this.finallyRender();
        },
      });
  }

  //прокидываем данные в урл
  goToCities(countryCode: string) {
    this.router.navigate(['/cities', countryCode]);
  }

  private finallyRender(): void {
    this.cdr.markForCheck();
    this.isLoading = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
