import { Metadata } from './metadata.interface';

//Нахождение страны по вводу через input
export interface SearchData<T> {
  data: T[];
  metadata: Metadata;
}
