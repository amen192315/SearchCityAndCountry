import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CitiesService } from '../../data/services/cities/cities.service';
import {
  CityApiResponse,
  SearchCity,
} from '../../data/interfaces/city/city.interface';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime, Subject, switchMap, takeUntil } from 'rxjs';
import { DataCity } from '../../data/interfaces/city/dataCity.interface';
import { NavButtonsComponent } from '../../common-ui/nav-buttons/nav-buttons.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomNumber } from '../../helpers/pipes/custom-number.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CityDetailsPopupComponent } from '../../common-ui/city-details-popup/city-details-popup.component';
import { ActivatedRoute } from '@angular/router';

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
  editItem(_t99: any) {
    throw new Error('Method not implemented.');
  }

  private readonly dataService = inject(CitiesService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject();
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);

  //---material ui data----
  readonly displayedColumns: string[] = [
    'country',
    'name',
    'region',
    'population',
    'actions',
  ];
  readonly dataSource = new MatTableDataSource<DataCity>([]);
  //------------------------
  isLoading = false;
  countryCode?: string;

  readonly searchForm = this.fb.group({
    searchInput: ['', [Validators.pattern(/^[A-Za-z]*$/)]],
  });

  ngOnInit() {
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

  private finallyRender(): void {
    this.cdr.markForCheck();
    this.isLoading = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
