import { initializeApp } from 'firebase/app';
import { collection, connectFirestoreEmulator, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { EMULATOR_HOSTS, firebaseConfig, storageUrl } from '../../lib/firebase-config';
import type { Catalog, Category, Product, ProductImage } from '../types';

interface StoredImage {
  path: string;
  alt?: string;
  width: number;
  height: number;
}

const bySortOrder = (a: { sortOrder?: number }, b: { sortOrder?: number }) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0);

/**
 * Reads the public catalog at build time. Only active products are readable without signing in,
 * so the build needs no credentials.
 */
export async function loadFirestoreCatalog(useEmulator: boolean): Promise<Catalog> {
  const app = initializeApp(firebaseConfig, 'catalog-build');
  const db = getFirestore(app);
  if (useEmulator) connectFirestoreEmulator(db, EMULATOR_HOSTS.firestore.host, EMULATOR_HOSTS.firestore.port);

  const toImage = (image: StoredImage, fallbackAlt: string): ProductImage => ({
    src: storageUrl(image.path, useEmulator),
    width: image.width,
    height: image.height,
    alt: image.alt || fallbackAlt,
  });

  const [categorySnap, productSnap] = await Promise.all([
    getDocs(collection(db, 'categories')),
    getDocs(query(collection(db, 'products'), where('status', '==', 'active'))),
  ]);

  const categories = categorySnap.docs
    .map((doc) => ({ slug: doc.id, ...doc.data() }) as Record<string, any>)
    .sort(bySortOrder)
    .filter((data) => data.image?.path)
    .map(
      (data): Category => ({
        slug: data.slug,
        name: data.name,
        headline: data.headline,
        summary: data.summary,
        metaDescription: data.metaDescription ?? data.summary,
        intro: data.intro ?? [],
        image: toImage(data.image, data.name),
        imageAlt: data.image.alt ?? data.name,
      }),
    );

  const products = productSnap.docs
    .map((doc) => doc.data() as Record<string, any>)
    .sort(bySortOrder)
    .filter((data) => data.images?.length > 0)
    .map(
      (data): Product => ({
        slug: data.slug,
        sku: data.sku,
        name: data.name,
        category: data.categoryId,
        price: data.price,
        compareAtPrice: data.compareAtPrice ?? undefined,
        badge: data.badge || undefined,
        summary: data.summary ?? '',
        description: data.description ?? [],
        highlights: data.highlights ?? [],
        details: data.details ?? [],
        care: data.care ?? [],
        sizes: data.sizes?.length ? data.sizes : undefined,
        colors: data.colors?.length ? data.colors : undefined,
        images: data.images.map((image: StoredImage) => toImage(image, data.name)),
        rating: data.rating ?? 0,
        reviewCount: data.reviewCount ?? 0,
        reviews: data.reviews ?? [],
        featured: Boolean(data.featured),
      }),
    );

  return { categories, products };
}
