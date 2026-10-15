import { catalog } from './catalog';
import type { Product } from './types';

export type { Product, ProductImage, Review } from './types';

export const products = catalog.products;

export const productUrl = (slug: string) => `/products/${slug}/`;

export const getProductsByCategory = (category: string) =>
  products.filter((product) => product.category === category);

export const getFeaturedProducts = () => products.filter((product) => product.featured);

export const getSimilarProducts = (product: Product, limit = 4) => {
  const sameCategory = products.filter((p) => p.category === product.category && p.slug !== product.slug);
  const others = products.filter((p) => p.category !== product.category);
  return [...sameCategory, ...others].slice(0, limit);
};
