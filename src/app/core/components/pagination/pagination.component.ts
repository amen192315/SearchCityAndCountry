import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  DEFAULT_PAGINATION_CONFIG,
  PaginationConfig,
} from '../../models/pagination.interface';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-pagination',
  imports: [MatPaginatorModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PaginationComponent {
  @Input() currentConfig: Partial<PaginationConfig> = {};
  @Output() pageChanged = new EventEmitter<PageEvent>();

  config: PaginationConfig = {
    ...DEFAULT_PAGINATION_CONFIG,
    ...this.currentConfig,
  };

  ngOnInit() {
    this.config = { ...this.config, ...this.currentConfig };
  }

  onPageChange(event: PageEvent) {
    this.config.pageSize = event.pageSize;
    this.config.pageIndex = event.pageIndex;
    this.pageChanged.emit(event);
  }

  updateTotalItems(total: number) {
    this.config.totalItems = total;
  }
}
