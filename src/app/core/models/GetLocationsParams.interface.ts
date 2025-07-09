export interface BaseGetLocationsParams {
  offset: number;
  limit: number;
  namePrefix: string;
  countryIds: string;
  [key: string]: any;
}

export type GetLocationsParams = Partial<BaseGetLocationsParams> & {
  [key: string]: any;
};
