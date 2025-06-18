import { Link } from '../link.interface';
import { Metadata } from '../metadata.interface';
import { DataCountry } from './dataCountry.interface';

//Главный Api ответ
export interface CountryApiResponse {
  links: Link[];
  data: DataCountry[];
  metadata: Metadata;
}

//Нахождение страны по вводу через input
export interface SearchCountry {
  data: DataCountry[];
  metadata: Metadata;
}
