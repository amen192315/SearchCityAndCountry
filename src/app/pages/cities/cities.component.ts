import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Input,
  OnInit,
  signal,
  ViewChild,
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
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CustomNumber } from '../../core/pipes/custom-number.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CityDetailsPopupComponent } from './components/city-details-popup/city-details-popup.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CityEditPopupComponent } from './components/city-edit-popup/city-edit-popup.component';
import { CityData } from './models/city.interface';
import {
  PageEvent,
  MatPaginator,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { ApiResponse } from '../../core/models/apiResponse.interface';
import { TranslocoDirective } from '@jsverse/transloco';
import { GetLocationsParams } from '../../core/models/getLocationsParams.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from '@angular/cdk/scrolling';
import { PaginationService } from '../../core/services/pagination.service';

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
export class CitiesComponent implements OnInit {
  @Input() countryCode?: string;

  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private hasMoreData = signal(true);
  private readonly dataService = inject(CitiesService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly paginationService = inject(PaginationService);

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

  readonly isLoading = signal(false);
  public firstCityName!: string;

  readonly searchForm: FormGroup<{ searchInput: FormControl<string | null> }> =
    this.fb.group({
      searchInput: ['', [Validators.pattern(/^[A-Za-z\s]*$/)]],
    });

  private currentFilter: string | null = null;

  ngOnInit() {
    this.route.queryParams
      .pipe(
        tap(() => {
          this.isLoading.set(true);
        }),
        switchMap(() => {
          return this.loadCities();
        }),
        tap((res) => {
          this.isLoading.set(false);
          this.firstCityName = res.data[0].country;
          this.paginationService.setTotalCount(res.metadata.totalCount);
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
          this.paginationService.reset();
        }),
        switchMap(() => {
          return this.loadCities();
        }),
        tap((res) => {
          this.isLoading.set(false);
          this.paginationService.setTotalCount(res.metadata.totalCount);
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

  private loadCities(
    params?: Partial<GetLocationsParams>
  ): Observable<ApiResponse<CityData>> {
    this.isLoading.set(true);

    const queryParams = {
      ...this.paginationService.getQueryParams(),
      ...(this.currentFilter ? { namePrefix: this.currentFilter } : {}),
      ...(this.countryCode ? { countryIds: this.countryCode } : {}),
      ...params,
    };

    return this.dataService.getCities(queryParams).pipe(
      tap((res: ApiResponse<CityData>) => {
        this.dataSource.set(res.data);
        this.paginationService.setTotalCount(res.metadata.totalCount);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  onScroll(val: any): void {}

  //пагинатор
  onPageChange(event: PageEvent): void {
    this.paginationService.handlePageChange(event);
    this.loadCities().subscribe();
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
