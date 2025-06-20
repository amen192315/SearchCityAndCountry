import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { CountriesService } from '../../services/country.service';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-country-pagination',
  imports: [MatPaginatorModule],
  templateUrl: './country-pagination.component.html',
  styleUrl: './country-pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountryPaginationComponent {
  @Input() totalCount = 0;
  @Input() pageSize = 5;
  @Input() pageSizeOptions = [5, 10, 25, 100];

  @Output() pageChanged = new EventEmitter<{
    pageIndex: number;
    pageSize: number;
  }>();

  onPageChange(event: PageEvent) {
    this.pageChanged.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    });
  }
}
