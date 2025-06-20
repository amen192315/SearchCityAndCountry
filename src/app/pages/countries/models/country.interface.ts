import { Link } from '../../../core/models/link.interface';
import { Metadata } from '../../../core/models/metadata.interface';
import { CountryData } from './countryData.interface';

//Главный Api ответ
export interface CountryApiResponse {
  links: Link[];
  data: CountryData[];
  metadata: Metadata;
}

//Нахождение страны по вводу через input
export interface SearchCountry {
  data: CountryData[];
  metadata: Metadata;
}
