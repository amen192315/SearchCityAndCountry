import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { PaginationService } from '../../services/pagination/pagination.service';
import { debounceTime, filter, Observable, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiResponse } from '../../models/apiResponse.interface';
import { GetLocationsParams } from '../../models/getLocationsParams.interface';

@Component({
  selector: 'app-shared-table',
  imports: [],
  templateUrl: './shared-table.component.html',
  styleUrl: './shared-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class SharedTableComponent<T> implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  protected readonly fb = inject(FormBuilder);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly paginationService = inject(PaginationService);

  readonly dataSource = signal<T[]>([]);
  readonly isLoading = signal(false);
  protected countriesInit = signal(true);

  @Input() searchPlaceholder: string = '';

  protected searchForm: FormGroup = this.fb.group({
    searchInput: ['', Validators.pattern(/^[A-Za-z\s]*$/)],
  });
  protected currentFilter: string | null = null;

  ngOnInit(): void {
    this.setupSearch();
    if (this.countriesInit()) {
      this.loadData().subscribe();
    }
  }

  //подписка на изменение формы
  protected setupSearch(): void {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        filter(() => this.searchForm.valid),
        tap((val) => {
          this.isLoading.set(true);
          this.currentFilter = val.searchInput ?? null;
          this.paginationService.reset();
        }),
        switchMap(() => this.loadData()),
        tap((res) => {
          this.isLoading.set(false);
          this.paginationService.setTotalCount(res.metadata.totalCount);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res: ApiResponse<T>) => {
          this.dataSource.set(res.data);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }
  //пагинатор
  onPageChange(event: PageEvent): void {
    this.paginationService.handlePageChange(event);
    this.loadData().subscribe();
  }

  abstract loadData(
    params?: Partial<GetLocationsParams>
  ): Observable<ApiResponse<T>>;

  ngOnDestroy(): void {
    this.paginationService.reset();
  }
}
