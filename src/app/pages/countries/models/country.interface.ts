import { Link } from '../../../core/models/link.interface';
import { Metadata } from '../../../core/models/metadata.interface';
import { CoutryData } from './countryData.interface';

//Главный Api ответ
export interface CountryApiResponse {
  links: Link[];
  data: CoutryData[];
  metadata: Metadata;
}

//Нахождение страны по вводу через input
export interface SearchCountry {
  data: CoutryData[];
  metadata: Metadata;
}
