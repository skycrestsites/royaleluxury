import { catalog } from './catalog';

export type { Category } from './types';

export const categories = catalog.categories;

export const getCategory = (slug: string) => categories.find((category) => category.slug === slug);

export const categoryUrl = (slug: string) => `/collections/${slug}/`;
