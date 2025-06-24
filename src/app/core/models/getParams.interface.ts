export interface GetParams {
  offset?: number;
  limit?: number;
  namePrefix?: string;
  countryIds?: string;
  [key: string]: any;
}
