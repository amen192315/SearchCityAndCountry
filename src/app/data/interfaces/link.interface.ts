export type LinkRelation = 'first' | 'next' | 'prev' | 'last' | 'self';

export interface Link {
  rel: LinkRelation;
  href: string;
}
