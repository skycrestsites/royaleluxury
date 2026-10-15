import type { ImageMetadata } from 'astro';

/** A local build-time asset or a remote URL with known dimensions. */
export type ImageSource = { src: ImageMetadata } | { src: string; width: number; height: number };

export type ProductImage = ImageSource & { alt: string };

export interface Category {
  slug: string;
  name: string;
  headline: string;
  summary: string;
  metaDescription: string;
  intro: string[];
  image: ImageSource;
  imageAlt: string;
}

export interface Review {
  author: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  body: string;
}

export interface Product {
  slug: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  badge?: string;
  summary: string;
  description: string[];
  highlights: string[];
  details: { label: string; value: string }[];
  care: string[];
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  images: ProductImage[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  featured?: boolean;
}

export interface Catalog {
  categories: Category[];
  products: Product[];
}

/** Props for `<Picture>` / `getImage()` that work for both local and remote images. */
export const imageProps = (image: ImageSource) =>
  'width' in image ? { src: image.src, width: image.width, height: image.height } : { src: image.src };

/** Absolute or root-relative URL of the original image, for meta tags and structured data. */
export const imageUrl = (image: ImageSource) => (typeof image.src === 'string' ? image.src : image.src.src);
