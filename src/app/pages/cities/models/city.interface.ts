import { Link } from '../../../core/models/link.interface';
import { Metadata } from '../../../core/models/metadata.interface';
import { CityData } from './cityData.interface';

//Главный Api ответ
export interface CityApiResponse {
  links: Link[];
  data: CityData[];
  metadata: Metadata;
}

//Нахождение страны по вводу через input
export interface SearchCity {
  data: CityData[];
  metadata: Metadata;
}
