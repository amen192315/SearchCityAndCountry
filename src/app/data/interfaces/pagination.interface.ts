export interface PaginationConfig {
  pageSize: number;
  pageIndex: number;
  pageSizeOptions: number[];
  totalItems: number;
}

export const DEFAULT_PAGINATION_CONFIG: PaginationConfig = {
  pageSize: 5,
  pageIndex: 0,
  pageSizeOptions: [5, 10, 25],
  totalItems: 0,
};
