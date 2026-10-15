import { site } from './site';
import type { Product } from './products';
import type { Faq } from './faqs';

export interface Crumb {
  name: string;
  href: string;
}

const absolute = (path: string) => new URL(path, site.url).href;

export const breadcrumbSchema = (items: Crumb[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: absolute(item.href),
  })),
});

export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  url: site.url,
  logo: absolute('/icon-512.png'),
  email: site.email,
  sameAs: Object.values(site.social),
});

export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: site.name,
  url: site.url,
  description: site.description,
});

export const faqSchema = (faqs: Faq[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
});

export const productSchema = (product: Product, url: string, imageUrls: string[]) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  sku: product.sku,
  description: product.summary,
  image: imageUrls.map(absolute),
  brand: { '@type': 'Brand', name: site.name },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: product.rating,
    reviewCount: product.reviewCount,
  },
  review: product.reviews.map((review) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: review.author },
    datePublished: review.date,
    name: review.title,
    reviewBody: review.body,
    reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5 },
  })),
  offers: {
    '@type': 'Offer',
    url: absolute(url),
    priceCurrency: site.currency,
    price: product.price.toFixed(2),
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@type': 'Organization', name: site.name },
  },
});
