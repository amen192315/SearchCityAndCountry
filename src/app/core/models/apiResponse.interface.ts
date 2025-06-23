import { Link } from './link.interface';
import { Metadata } from './metadata.interface';

//Главный Api ответ
export interface ApiResponse<T> {
  links: Link[];
  data: T[];
  metadata: Metadata;
}
