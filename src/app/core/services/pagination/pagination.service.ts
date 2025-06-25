// pagination.service.ts
import { computed, Injectable, signal } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Injectable({
  providedIn: 'root',
})
export class PaginationService {
  private readonly _pageSize = signal(5);
  private readonly _offset = signal(0);
  private readonly _totalCount = signal(0);

  readonly pageIndex = computed(() =>
    Math.floor(this._offset() / this._pageSize())
  );
  public readonly pageSize = this._pageSize.asReadonly();
  public readonly offset = this._offset.asReadonly();
  public readonly totalCount = this._totalCount.asReadonly();

  //базовый конфиг пагинатора
  readonly paginatorConfig = {
    pageSizeOptions: [5, 10],
    showFirstLastButtons: true,
  };

  //обновление параметров при рендере страницы
  handlePageChange(event: PageEvent): void {
    const newOffset = event.pageIndex * event.pageSize;
    this._pageSize.set(event.pageSize);
    this._offset.set(newOffset);
  }

  //общее кол-во эл-ов
  setTotalCount(count: number): void {
    this._totalCount.set(count);
  }

  //текущие параметры
  getQueryParams() {
    return {
      offset: this._offset(),
      limit: this._pageSize(),
    };
  }

  //cброс
  reset(): void {
    this._offset.set(0);
    this._pageSize.set(5);
    this._totalCount.set(0);
  }
}
