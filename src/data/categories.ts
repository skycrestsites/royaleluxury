import type { ImageMetadata } from 'astro';
import bedroom from '../assets/images/room-bedroom.jpg';
import living from '../assets/images/room-living.jpg';
import kitchen from '../assets/images/room-kitchen.jpg';
import bathroom from '../assets/images/room-bathroom.jpg';
import decor from '../assets/images/room-decor.jpg';

export interface Category {
  slug: string;
  name: string;
  headline: string;
  summary: string;
  metaDescription: string;
  intro: string[];
  image: ImageMetadata;
  imageAlt: string;
}

export const categories: Category[] = [
  {
    slug: 'bedroom',
    name: 'Bedroom',
    headline: 'Rest in quiet comfort',
    summary: 'Sateen bedding, linen sheets and soft layers for a calm, hotel-inspired retreat.',
    metaDescription:
      'Shop bedroom essentials from Royale Luxury: sateen duvet covers, linen sheet sets and soft layers that bring hotel-inspired comfort home.',
    intro: [
      'Your bedroom should feel like the calmest room in the house. Our bedding is cut from long-staple cotton and stonewashed linen, finished with clean hems and tailored details that look considered without feeling fussy.',
      'Every piece is designed to layer together in a restrained palette of white, ivory, taupe and charcoal, so you can build a bed that looks complete from day one and grows with you over time.',
    ],
    image: bedroom,
    imageAlt: 'Neatly made bed with layered white and taupe bedding beside a window',
  },
  {
    slug: 'living-room',
    name: 'Living Room',
    headline: 'Soft textures, easy living',
    summary: 'Throw pillows, woven rugs and accents that make shared spaces feel finished.',
    metaDescription:
      'Shop living room decor from Royale Luxury: throw pillow sets, hand-loomed rugs and textured accents for a warm, finished space.',
    intro: [
      'The living room is where the day slows down. We focus on pieces that add warmth and texture: generous throw pillows, hand-loomed rugs and soft accents that make a sofa feel inviting.',
      'Colours stay neutral and materials stay natural, so each piece works with the furniture you already own.',
    ],
    image: living,
    imageAlt: 'Bright living room with a neutral sofa, round coffee table and green plants',
  },
  {
    slug: 'kitchen',
    name: 'Kitchen',
    headline: 'Made for everyday cooking',
    summary: 'Enameled cookware and stoneware storage that look as good on the counter as they perform.',
    metaDescription:
      'Shop kitchen essentials from Royale Luxury: enameled cast iron cookware and stoneware storage built for daily use and made to be displayed.',
    intro: [
      'Good kitchenware earns its place on the counter. Our cookware is built from enameled cast iron for even heat and easy cleaning, and our stoneware storage keeps everyday staples close at hand.',
      'Each piece is chosen for how it performs on a busy weeknight and how it looks when guests come over.',
    ],
    image: kitchen,
    imageAlt: 'Modern white kitchen with pendant lights over a marble island',
  },
  {
    slug: 'bathroom',
    name: 'Bathroom',
    headline: 'A spa feel, every morning',
    summary: 'Bath mats and accessory sets that turn a busy routine into a small daily ritual.',
    metaDescription:
      'Shop bathroom essentials from Royale Luxury: absorbent bath mats and coordinated accessory sets for a calm, spa-inspired space.',
    intro: [
      'Small upgrades make the biggest difference in a bathroom. A plush, quick-drying mat and a coordinated accessory set instantly make the space feel calmer and more organized.',
      'Our bath collection uses absorbent, durable materials in soft neutral tones that suit any tile or fixture.',
    ],
    image: bathroom,
    imageAlt: 'Bright bathroom with a freestanding white bathtub and natural light',
  },
  {
    slug: 'decor',
    name: 'Decor',
    headline: 'The finishing touches',
    summary: 'Candles, vases and shelving that give every room a personal, collected feel.',
    metaDescription:
      'Shop home decor from Royale Luxury: hand-poured soy candles, ceramic vases and floating shelves that add warmth and personality to any room.',
    intro: [
      'Decor is what makes a house feel like your home. Our accents are designed to be lived with: candles with clean, lasting fragrance, ceramics with a handmade feel and shelving that keeps favourite pieces on display.',
      'Mix them across rooms to bring a consistent, collected look to your entire home.',
    ],
    image: decor,
    imageAlt: 'Styled living space with plants, a mirror and warm decorative accents',
  },
];

export const getCategory = (slug: string) => categories.find((category) => category.slug === slug);

export const categoryUrl = (slug: string) => `/collections/${slug}/`;
