import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CitiesService } from './services/city.service';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  catchError,
  debounceTime,
  EMPTY,
  filter,
  finalize,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';

import { NavLinksComponent } from '../../core/components/nav-links/nav-buttons.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomNumber } from '../../core/pipes/custom-number.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CityDetailsPopupComponent } from '../../core/components/city-details-popup/city-details-popup.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CityEditPopupComponent } from '../../core/components/city-edit-popup/city-edit-popup.component';
import { CityData } from './models/cityData.interface';
import { CityApiResponse, SearchCity } from './models/city.interface';

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
    NavLinksComponent,
  ],
  templateUrl: './cities.component.html',
  styleUrl: './cities.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitiesComponent implements OnInit, OnDestroy {
  private readonly dataService = inject(CitiesService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly takeUntilDestroyed = new Subject();
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  //---material ui данные----
  readonly displayedColumns: string[] = [
    'country',
    'name',
    'region',
    'population',
    'actions',
  ];
  readonly dataSource = signal<CityData[]>([]);
  //------------------------
  isLoading = signal(false);
  countryCode?: string;

  readonly searchForm = this.fb.group({
    searchInput: ['', [Validators.pattern(/^[A-Za-z]*$/)]],
  });

  ngOnInit() {
    this.route.params
      .pipe(
        takeUntil(this.takeUntilDestroyed),
        tap(() => this.isLoading.set(true)),
        switchMap((params) => {
          this.countryCode = params['countryCode'];
          return this.countryCode
            ? this.dataService.getCitiesByCode(this.countryCode)
            : this.dataService.getCities();
        }),
        tap(() => {
          this.isLoading.set(false);
        }),
        catchError((err) => {
          console.error('Error occurred:', err);
          return EMPTY;
        })
      )
      .subscribe({ next: (res) => this.dataSource.set(res.data) });

    this.searchForm.valueChanges
      .pipe(
        debounceTime(400),
        filter(() => this.searchForm.valid),
        tap(() => this.isLoading.set(true)),
        switchMap((items) => {
          //города определенной страны
          if (this.countryCode) {
            return this.dataService.searchCitiesAfterCode(
              this.countryCode,
              items.searchInput
            );
          }
          //все остальные города
          return items.searchInput
            ? this.dataService.getCities(
                undefined,
                undefined,
                items.searchInput
              )
            : this.dataService.getCities();
        }),
        tap(() => {
          this.isLoading.set(false);
        }),
        catchError((err) => {
          console.error('Error occurred:', err);
          return EMPTY;
        }),
        takeUntil(this.takeUntilDestroyed),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({ next: (res) => this.dataSource.set(res.data) });
  }
  //геттер?
  hasRouteData() {
    return this.countryCode ? true : false;
  }

  closeFilter() {
    this.router.navigate(['/cities']);
  }

  //Обновляем данные в таблице
  private updateCity(wikiDataId: string, updatedData: Partial<CityData>) {
    const updatedCities = this.dataSource().map((city) =>
      city.wikiDataId === wikiDataId ? { ...city, ...updatedData } : city
    );
    this.dataSource.set(updatedCities);
  }

  //попап, показывает данные о городе
  viewCity(wikiID: number) {
    this.dataService
      .cityDetailsPopup(wikiID)
      .pipe(takeUntil(this.takeUntilDestroyed))
      .subscribe({
        next: (res) => {
          this.dialog?.open(CityDetailsPopupComponent, {
            data: res,
            width: '500px',
          });
        },
        error: (err) => {
          console.error('Ошибка:', err);
        },
      });
  }

  //попап, изменяет данные о городе
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

  clearFilter() {
    this.router.navigate(['/cities']);
  }

  ngOnDestroy(): void {
    this.takeUntilDestroyed.next(true);
    this.takeUntilDestroyed.complete();
  }
}
