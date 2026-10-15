import type { ImageMetadata } from 'astro';
import seed from '../../../seed/catalog.json';
import type { Catalog, Product } from '../types';

const assets = import.meta.glob<ImageMetadata>('../../assets/images/*.jpg', { eager: true, import: 'default' });

function asset(file: string) {
  const image = assets[`../../assets/images/${file}`];
  if (!image) throw new Error(`Seed image not found: ${file}`);
  return image;
}

/** Builds the catalog from the bundled seed data, used before Firestore is connected. */
export function loadSeedCatalog(): Catalog {
  return {
    categories: seed.categories.map(({ image, sortOrder: _sortOrder, ...category }) => ({
      ...category,
      image: { src: asset(image.file) },
      imageAlt: image.alt,
    })),
    products: seed.products
      .filter((product) => product.status === 'active')
      .map(
        (product): Product => ({
          ...product,
          category: product.categoryId,
          images: product.images.map((image) => ({ src: asset(image.file), alt: image.alt })),
        }),
      ),
  };
}
