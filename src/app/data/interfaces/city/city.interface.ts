import { Link } from '../link.interface';
import { Metadata } from '../metadata.interface';
import { DataCity } from './dataCity.interface';

//Главный Api ответ
export interface CityApiResponse {
  links: Link[];
  data: DataCity[];
  metadata: Metadata;
}

//Нахождение страны по вводу через input
export interface SearchCity {
  data: DataCity[];
  metadata: Metadata;
}
