import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
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
import { NavLinksComponent } from '../../core/components/nav-links/nav-buttons.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomNumber } from '../../core/pipes/custom-number.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CityDetailsPopupComponent } from './components/city-details-popup/city-details-popup.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CityEditPopupComponent } from './components/city-edit-popup/city-edit-popup.component';
import { CityData } from './models/cityData.interface';
import {
  PageEvent,
  MatPaginator,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { CityApiResponse } from './models/city.interface';
import { TranslocoDirective } from '@jsverse/transloco';

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
    MatPaginator,
    MatPaginatorModule,
    TranslocoDirective,
  ],
  templateUrl: './cities.component.html',
  styleUrl: './cities.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitiesComponent implements OnInit {
  private readonly dataService = inject(CitiesService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
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
  //данные для пагинатора
  readonly pageSize = signal(5);
  readonly offset = signal(0);
  readonly totalCount = signal(0);

  readonly isLoading = signal(false);

  public firstCityName!: string;
  public countryCode?: string;

  readonly searchForm = this.fb.group({
    searchInput: ['', [Validators.pattern(/^[A-Za-z]*$/)]],
  });

  private currentFilter: string | null = null;
  ngOnInit() {
    this.route.params
      .pipe(
        tap(() => this.isLoading.set(true)),
        switchMap((params) => {
          this.countryCode = params['countryCode'];
          return this.countryCode
            ? this.dataService.getAndSearchCitiesByCode(
                undefined,
                undefined,
                this.countryCode,
                undefined
              )
            : this.initialData();
        }),
        tap((res) => {
          this.isLoading.set(false);
          this.firstCityName = res.data[0].country;
          this.totalCount.set(res.metadata.totalCount);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => this.dataSource.set(res.data),
        error: (err) => {
          console.error(err);
        },
      });

    this.searchForm.valueChanges
      .pipe(
        debounceTime(400),
        filter(() => this.searchForm.valid),
        tap((res) => {
          this.isLoading.set(true);
          this.currentFilter = res.searchInput || null;
        }),
        switchMap((items) => {
          //города определенной страны
          if (this.countryCode) {
            return this.dataService.getAndSearchCitiesByCode(
              this.offset(),
              this.pageSize(),
              this.countryCode,
              items.searchInput
            );
          }
          //все остальные города
          return items.searchInput
            ? this.dataService.getCities(
                this.offset(),
                this.pageSize(),
                items.searchInput
              )
            : this.dataService.getCities();
        }),
        tap((res) => {
          this.isLoading.set(false);
          this.totalCount.set(res.metadata.totalCount);
        }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (res) => this.dataSource.set(res.data),
        error: (err) => {
          console.error(err);
        },
      });
  }
  filterAndsome() {
    const offset = this.offset();
    const limit = this.pageSize();

    this.isLoading.set(true);

    return this.dataService
      .getAndSearchCitiesByCode(
        offset,
        limit,
        this.countryCode,
        this.currentFilter || undefined
      )
      .pipe(
        tap((res: CityApiResponse) => {
          this.dataSource.set(res.data);
          this.totalCount.set(res.metadata.totalCount);
        }),
        finalize(() => this.isLoading.set(false))
      );
  }
  //главный метод (получение данных)
  initialData(): Observable<CityApiResponse> {
    const offset = this.offset();
    const limit = this.pageSize();

    this.isLoading.set(true);

    return this.dataService
      .getCities(offset, limit, this.currentFilter || undefined)
      .pipe(
        tap((res: CityApiResponse) => {
          this.dataSource.set(res.data);
          this.totalCount.set(res.metadata.totalCount);
        }),
        finalize(() => this.isLoading.set(false))
      );
  }
  //геттер?
  get hasRouteData() {
    return this.countryCode ? true : false;
  }

  get pageIndex() {
    return Math.floor(this.offset() / this.pageSize());
  }
  // пагинатор
  onPageChange(event: PageEvent) {
    const newPageIndex = event.pageIndex;
    const newPageSize = event.pageSize;

    const newOffset = newPageIndex * newPageSize;

    this.pageSize.set(newPageSize);
    this.offset.set(newOffset);
    if (this.countryCode) {
      this.filterAndsome().subscribe();
    } else {
      this.initialData().subscribe();
    }
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
}
