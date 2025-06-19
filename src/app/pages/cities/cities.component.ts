import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CitiesService } from './services/city.service';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime, of, Subject, switchMap, takeUntil } from 'rxjs';

import { NavButtonsComponent } from '../../core/components/nav-buttons/nav-buttons.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomNumber } from '../../core/pipes/custom-number.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CityDetailsPopupComponent } from '../../core/components/city-details-popup/city-details-popup.component';
import { ActivatedRoute } from '@angular/router';
import { CityEditPopupComponent } from '../../core/components/city-edit-popup/city-edit-popup.component';
import { CityData } from './models/cityData.interface';
import { CityApiResponse, SearchCity } from './models/city.interface';

@Component({
  selector: 'app-cities',
  imports: [
    MatTableModule,
    NavButtonsComponent,
    CommonModule,
    CustomNumber,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './cities.component.html',
  styleUrl: './cities.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitiesComponent implements OnInit, OnDestroy {
  private readonly dataService = inject(CitiesService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject();
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);

  //---material ui данные----
  readonly displayedColumns: string[] = [
    'country',
    'name',
    'region',
    'population',
    'actions',
  ];
  readonly dataSource = new MatTableDataSource<CityData>([]);
  //------------------------
  isLoading = false;
  countryCode?: string;

  readonly searchForm = this.fb.group({
    searchInput: ['', [Validators.pattern(/^[A-Za-z]*$/)]],
  });

  // сохранение и получение данных из localStorage
  private saveToLocalStorage(cities: CityData[]) {
    localStorage.setItem('citiesData', JSON.stringify(cities));
  }

  private getFromLocalStorage(): CityData[] | null {
    const data = localStorage.getItem('citiesData');
    return data ? JSON.parse(data) : null;
  }
  //----------------------------------------------

  ngOnInit() {
    this.loadLocalData();
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          this.isLoading = true;
          this.countryCode = params['countryCode'];
          return this.countryCode
            ? this.dataService.getCitiesByCode(this.countryCode)
            : this.dataService.getCities();
        })
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

    this.searchForm.valueChanges
      .pipe(
        debounceTime(400),
        switchMap((items) => {
          this.isLoading = true;
          if (this.searchForm.valid) {
            this.cdr.markForCheck();
          }
          // При поиске используем данные из localStorage или API
          const localData = this.getFromLocalStorage();
          if (localData && !items.searchInput) {
            return of({ data: localData });
          }
          //города определенной страны
          if (this.countryCode) {
            return this.dataService.searchCitiesAfterCode(
              this.countryCode,
              items.searchInput
            );
          }
          //все остальные города
          return items.searchInput
            ? this.dataService.searchCity(items.searchInput)
            : this.dataService.getCities();
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
  loadLocalData() {
    this.isLoading = true;

    // Проверяем localStorage
    const localData = this.getFromLocalStorage();

    if (localData) {
      this.dataSource.data = localData;
      this.finallyRender();
    }
  }

  //Начальные данные
  initialData(): void {
    this.isLoading = true;

    this.dataService
      .getCities()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: CityApiResponse) => {
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
      .searchCity(item)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: SearchCity) => {
          this.dataSource.data = res.data;
          this.finallyRender();
        },
        error: (err) => {
          console.warn(err);
          this.finallyRender();
        },
      });
  }

  //Обновляем данные в таблице
  private updateCity(wikiDataId: string, updatedData: Partial<CityData>) {
    const updatedCities = this.dataSource.data.map((city) =>
      city.wikiDataId === wikiDataId ? { ...city, ...updatedData } : city
    );

    this.dataSource.data = updatedCities;

    this.saveToLocalStorage(updatedCities);

    this.cdr.markForCheck();
  }

  //попап, показывает данные о городе
  viewCity(wikiID: number) {
    this.dataService
      .cityDetailsPopup(wikiID)
      .pipe(takeUntil(this.destroy$))
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

  private finallyRender(): void {
    this.cdr.markForCheck();
    this.isLoading = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
