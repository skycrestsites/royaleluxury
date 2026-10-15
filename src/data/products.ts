import type { ImageMetadata } from 'astro';
import duvet1 from '../assets/images/duvet-1.jpg';
import duvet2 from '../assets/images/duvet-2.jpg';
import duvet3 from '../assets/images/duvet-3.jpg';
import duvet4 from '../assets/images/duvet-4.jpg';
import sheets1 from '../assets/images/sheets-1.jpg';
import sheets2 from '../assets/images/sheets-2.jpg';
import pillowSet1 from '../assets/images/pillow-set-1.jpg';
import lumbar1 from '../assets/images/lumbar-1.jpg';
import rug1 from '../assets/images/rug-1.jpg';
import dutchOven1 from '../assets/images/dutch-oven-1.jpg';
import dutchOven2 from '../assets/images/dutch-oven-2.jpg';
import canisters1 from '../assets/images/canisters-1.jpg';
import bathMat1 from '../assets/images/bath-mat-1.jpg';
import bathSet1 from '../assets/images/bath-set-1.jpg';
import candle1 from '../assets/images/candle-1.jpg';
import candle2 from '../assets/images/candle-2.jpg';
import shelf1 from '../assets/images/shelf-1.jpg';
import vase1 from '../assets/images/vase-1.jpg';

export interface ProductImage {
  src: ImageMetadata;
  alt: string;
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

export const products: Product[] = [
  {
    slug: 'sateen-duvet-cover-set',
    sku: 'RL-BED-001',
    name: 'Sateen Duvet Cover Set',
    category: 'bedroom',
    price: 89,
    compareAtPrice: 119,
    badge: 'Bestseller',
    featured: true,
    summary:
      'A silky, softly lustrous 600 thread count cotton sateen duvet cover with matching shams, finished with a tailored hem.',
    description: [
      'Our Sateen Duvet Cover Set is the foundation of a well-dressed bed. Woven from long-staple cotton in a 600 thread count sateen weave, it has a smooth hand and a subtle sheen that catches the light without looking shiny.',
      'Hidden button closures keep your insert secure, interior corner ties stop it from shifting, and a clean flange edge on each sham gives the whole set a tailored, hotel-inspired finish.',
    ],
    highlights: [
      '600 thread count, 100% long-staple cotton sateen',
      'Includes one duvet cover and two matching shams',
      'Hidden button closure with interior corner ties',
      'Pre-washed for softness from the very first night',
    ],
    details: [
      { label: 'Material', value: '100% long-staple cotton sateen' },
      { label: 'Thread count', value: '600' },
      { label: 'Includes', value: '1 duvet cover, 2 shams (1 sham with Twin)' },
      { label: 'Closure', value: 'Hidden buttons, 4 interior corner ties' },
      { label: 'Certification', value: 'OEKO-TEX Standard 100' },
    ],
    care: [
      'Machine wash cold on a gentle cycle',
      'Tumble dry low and remove promptly',
      'Warm iron if desired',
      'Do not bleach',
    ],
    sizes: ['Twin', 'Full / Queen', 'King', 'California King'],
    colors: [
      { name: 'White', hex: '#ffffff' },
      { name: 'Ivory', hex: '#f2eadd' },
      { name: 'Taupe', hex: '#ac9c8f' },
      { name: 'Charcoal', hex: '#262a33' },
    ],
    images: [
      { src: duvet1, alt: 'Sateen duvet cover set in white on a made bed' },
      { src: duvet2, alt: 'Sateen duvet cover on a low platform bed with soft pillows' },
      { src: duvet3, alt: 'Bed dressed in the sateen duvet cover set with accent cushions' },
      { src: duvet4, alt: 'Close view of the sateen duvet cover and shams on a bed' },
    ],
    rating: 4.8,
    reviewCount: 214,
    reviews: [
      {
        author: 'Jessica M.',
        location: 'Austin, TX',
        rating: 5,
        date: '2026-09-18',
        title: 'Feels like a hotel bed',
        body: 'The fabric is smooth and cool without feeling slippery. It washed beautifully and somehow looks even better after a few weeks. The corner ties are a small detail I did not know I needed.',
      },
      {
        author: 'Daniel R.',
        location: 'Toronto, ON',
        rating: 5,
        date: '2026-08-30',
        title: 'Great quality for the price',
        body: 'I have paid twice as much for sateen that pilled within months. This set is heavier and better finished. The taupe colour is exactly as pictured.',
      },
      {
        author: 'Priya S.',
        location: 'Chicago, IL',
        rating: 4,
        date: '2026-08-12',
        title: 'Beautiful, runs slightly generous',
        body: 'Lovely sheen and very soft. The King is a little roomy on my insert, so I may size down next time, but I am keeping it because it looks so good.',
      },
      {
        author: 'Mark T.',
        location: 'Denver, CO',
        rating: 5,
        date: '2026-07-27',
        title: 'Second set ordered',
        body: 'Bought the white for our guest room and liked it so much that we ordered charcoal for our own bed. Delivery was quick and the packaging was neat.',
      },
    ],
  },
  {
    slug: 'stonewashed-linen-sheet-set',
    sku: 'RL-BED-002',
    name: 'Stonewashed Linen Sheet Set',
    category: 'bedroom',
    price: 129,
    badge: 'New',
    summary: 'Breathable European flax linen, stonewashed for a relaxed drape and softness that improves with every wash.',
    description: [
      'Made from European flax and stonewashed for a lived-in softness, this sheet set keeps you cool in summer and comfortable year round.',
      'Deep pockets fit mattresses up to 16 inches, and a relaxed texture means it looks effortlessly put together even when it is not perfectly made.',
    ],
    highlights: ['100% European flax linen', 'Stonewashed for softness', 'Deep pockets up to 16 inches', 'Includes flat sheet, fitted sheet and two pillowcases'],
    details: [
      { label: 'Material', value: '100% European flax linen' },
      { label: 'Includes', value: '1 flat sheet, 1 fitted sheet, 2 pillowcases' },
      { label: 'Pocket depth', value: 'Up to 16 inches' },
    ],
    care: ['Machine wash cold', 'Tumble dry low', 'Do not bleach'],
    sizes: ['Twin', 'Full', 'Queen', 'King'],
    colors: [
      { name: 'White', hex: '#ffffff' },
      { name: 'Ivory', hex: '#f2eadd' },
      { name: 'Taupe', hex: '#ac9c8f' },
    ],
    images: [
      { src: sheets1, alt: 'Bed made with stonewashed linen sheets in a bright room' },
      { src: sheets2, alt: 'Linen sheet set on a bed in a calm, neutral bedroom' },
    ],
    rating: 4.7,
    reviewCount: 96,
    reviews: [
      {
        author: 'Hannah L.',
        location: 'Portland, OR',
        rating: 5,
        date: '2026-09-02',
        title: 'Soft from day one',
        body: 'No break-in period at all. They are breathable and look lovely with a bit of texture.',
      },
      {
        author: 'Chris P.',
        location: 'Boston, MA',
        rating: 4,
        date: '2026-08-14',
        title: 'Very comfortable',
        body: 'Great for warm nights. Fitted sheet stays put on a deep mattress.',
      },
    ],
  },
  {
    slug: 'textured-throw-pillow-set',
    sku: 'RL-LIV-001',
    name: 'Textured Throw Pillow Set',
    category: 'living-room',
    price: 59,
    compareAtPrice: 72,
    featured: true,
    summary: 'A coordinated set of two woven covers with plush down-alternative inserts in soft neutral tones.',
    description: [
      'Two woven covers in complementary textures bring depth to any sofa or bed. Each cover includes a plush down-alternative insert that holds its shape.',
      'Concealed zippers make the covers easy to remove and wash.',
    ],
    highlights: ['Set of two 20 x 20 inch pillows', 'Down-alternative inserts included', 'Concealed zipper closure'],
    details: [
      { label: 'Cover', value: 'Cotton and linen blend' },
      { label: 'Insert', value: 'Down-alternative fill' },
      { label: 'Size', value: '20 x 20 inches' },
    ],
    care: ['Remove insert before washing', 'Machine wash cover cold', 'Line dry'],
    colors: [
      { name: 'Ivory', hex: '#f2eadd' },
      { name: 'Taupe', hex: '#ac9c8f' },
    ],
    images: [{ src: pillowSet1, alt: 'Textured throw pillows arranged on a bench' }],
    rating: 4.6,
    reviewCount: 73,
    reviews: [
      {
        author: 'Olivia W.',
        location: 'Seattle, WA',
        rating: 5,
        date: '2026-09-10',
        title: 'Instantly elevated my sofa',
        body: 'The inserts are full and the texture looks expensive. Exactly what our living room needed.',
      },
      {
        author: 'Sam K.',
        location: 'Miami, FL',
        rating: 4,
        date: '2026-08-21',
        title: 'Nice quality',
        body: 'Covers wash well. Colour is slightly warmer in person, which I actually prefer.',
      },
    ],
  },
  {
    slug: 'woven-stripe-lumbar-pillow',
    sku: 'RL-LIV-002',
    name: 'Woven Stripe Lumbar Pillow',
    category: 'living-room',
    price: 39,
    summary: 'A long lumbar pillow with a tonal woven stripe, ideal for layering on beds, sofas and accent chairs.',
    description: [
      'This lumbar pillow adds a subtle graphic note to a neutral room. The woven stripe is tonal, so it pairs easily with solids and other textures.',
    ],
    highlights: ['14 x 36 inch lumbar size', 'Insert included', 'Tonal woven stripe'],
    details: [
      { label: 'Cover', value: '100% cotton' },
      { label: 'Size', value: '14 x 36 inches' },
    ],
    care: ['Spot clean or machine wash cover cold', 'Line dry'],
    images: [{ src: lumbar1, alt: 'Striped lumbar pillow layered with cushions on a bed' }],
    rating: 4.5,
    reviewCount: 41,
    reviews: [
      {
        author: 'Rachel D.',
        location: 'Nashville, TN',
        rating: 5,
        date: '2026-08-05',
        title: 'Perfect finishing piece',
        body: 'It pulls the whole bed together. Well made and a generous size.',
      },
      {
        author: 'Leo F.',
        location: 'San Diego, CA',
        rating: 4,
        date: '2026-07-19',
        title: 'Looks great',
        body: 'Good weight and the stripe is understated. Insert could be slightly firmer.',
      },
    ],
  },
  {
    slug: 'hand-loomed-area-rug',
    sku: 'RL-LIV-003',
    name: 'Hand-Loomed Area Rug',
    category: 'living-room',
    price: 249,
    compareAtPrice: 299,
    summary: 'A flat-woven wool and cotton rug with a soft, low pile that grounds any seating area.',
    description: [
      'Hand-loomed by skilled artisans, this rug pairs wool for durability with cotton for softness. A low profile makes it easy to place under doors and furniture.',
    ],
    highlights: ['Wool and cotton blend', 'Hand-loomed flat weave', 'Low pile, easy to clean'],
    details: [
      { label: 'Material', value: '70% wool, 30% cotton' },
      { label: 'Pile height', value: '0.25 inches' },
    ],
    care: ['Vacuum regularly without a beater bar', 'Spot clean with mild detergent', 'Professional cleaning recommended'],
    sizes: ['5 x 8 ft', '8 x 10 ft', '9 x 12 ft'],
    images: [{ src: rug1, alt: 'Neutral hand-loomed rug beneath a sofa in a bright living room' }],
    rating: 4.7,
    reviewCount: 58,
    reviews: [
      {
        author: 'Emma G.',
        location: 'Atlanta, GA',
        rating: 5,
        date: '2026-09-12',
        title: 'Better than expected',
        body: 'Soft underfoot and the colour is a perfect warm neutral. No shedding after the first week.',
      },
      {
        author: 'Noah B.',
        location: 'Phoenix, AZ',
        rating: 4,
        date: '2026-08-02',
        title: 'Beautiful rug',
        body: 'Lies flat quickly. I recommend adding a rug pad.',
      },
    ],
  },
  {
    slug: 'enameled-cast-iron-dutch-oven',
    sku: 'RL-KIT-001',
    name: 'Enameled Cast Iron Dutch Oven',
    category: 'kitchen',
    price: 119,
    compareAtPrice: 149,
    badge: 'Bestseller',
    featured: true,
    summary: 'A 5.5 quart enameled cast iron Dutch oven for braising, baking and slow cooking, from stovetop to oven.',
    description: [
      'Heavy cast iron holds and distributes heat evenly, while a smooth enamel interior resists sticking and cleans up easily. A tight-fitting lid locks in moisture for tender braises and crusty bread.',
      'Safe on all cooktops including induction, and oven safe up to 500 degrees Fahrenheit.',
    ],
    highlights: ['5.5 quart capacity', 'Works on all cooktops, including induction', 'Oven safe to 500 F', 'Chip-resistant enamel'],
    details: [
      { label: 'Material', value: 'Enameled cast iron' },
      { label: 'Capacity', value: '5.5 quarts' },
      { label: 'Oven safe', value: 'Up to 500 F' },
    ],
    care: ['Hand wash recommended', 'Allow to cool before washing', 'Avoid metal utensils'],
    colors: [
      { name: 'Charcoal', hex: '#262a33' },
      { name: 'Ivory', hex: '#f2eadd' },
      { name: 'Paprika', hex: '#c4542c' },
    ],
    images: [
      { src: dutchOven1, alt: 'Enameled cast iron Dutch oven on a kitchen counter' },
      { src: dutchOven2, alt: 'Bright kitchen counter with fresh ingredients ready for cooking' },
    ],
    rating: 4.9,
    reviewCount: 187,
    reviews: [
      {
        author: 'Grace H.',
        location: 'Philadelphia, PA',
        rating: 5,
        date: '2026-09-20',
        title: 'Heirloom quality',
        body: 'Heavy, even heating and the enamel cleans up with almost no effort. Every bit as good as brands three times the price.',
      },
      {
        author: 'Ben C.',
        location: 'Toronto, ON',
        rating: 5,
        date: '2026-08-28',
        title: 'Bread comes out perfect',
        body: 'I bake sourdough in it twice a week. The lid fits tightly and the knob handles high heat.',
      },
    ],
  },
  {
    slug: 'stoneware-canister-set',
    sku: 'RL-KIT-002',
    name: 'Stoneware Canister Set',
    category: 'kitchen',
    price: 54,
    summary: 'Three nesting stoneware canisters with bamboo lids for coffee, sugar and everyday staples.',
    description: [
      'A set of three canisters with a soft matte glaze and natural bamboo lids. Silicone seals help keep contents fresh, and the nesting sizes make them easy to arrange.',
    ],
    highlights: ['Set of three sizes', 'Bamboo lids with silicone seals', 'Food-safe matte glaze'],
    details: [
      { label: 'Material', value: 'Stoneware, bamboo, silicone' },
      { label: 'Capacities', value: '20 oz, 34 oz, 54 oz' },
    ],
    care: ['Canisters are dishwasher safe', 'Hand wash bamboo lids'],
    images: [{ src: canisters1, alt: 'Matte stoneware canisters on a light surface' }],
    rating: 4.6,
    reviewCount: 64,
    reviews: [
      {
        author: 'Mia J.',
        location: 'Houston, TX',
        rating: 5,
        date: '2026-09-04',
        title: 'Clean and simple',
        body: 'They look great on the counter and the seals are tight. Coffee stays fresh.',
      },
      {
        author: 'Ethan V.',
        location: 'Columbus, OH',
        rating: 4,
        date: '2026-07-30',
        title: 'Lovely set',
        body: 'Good weight and nice glaze. Wish the largest one was slightly bigger.',
      },
    ],
  },
  {
    slug: 'plush-cotton-bath-mat',
    sku: 'RL-BTH-001',
    name: 'Plush Cotton Bath Mat',
    category: 'bathroom',
    price: 34,
    summary: 'A dense, quick-drying cotton bath mat with a non-slip backing and a soft, spa-like feel.',
    description: [
      'Thick cotton loops absorb water quickly and dry fast between uses. A non-slip backing keeps the mat in place on tile and stone floors.',
    ],
    highlights: ['100% cotton loops', 'Non-slip backing', 'Quick drying'],
    details: [
      { label: 'Material', value: '100% cotton, non-slip backing' },
      { label: 'Size', value: '21 x 34 inches' },
    ],
    care: ['Machine wash warm', 'Tumble dry low'],
    colors: [
      { name: 'White', hex: '#ffffff' },
      { name: 'Taupe', hex: '#ac9c8f' },
    ],
    images: [{ src: bathMat1, alt: 'Bright modern bathroom with a glass shower and neutral finishes' }],
    rating: 4.5,
    reviewCount: 52,
    reviews: [
      {
        author: 'Zoe A.',
        location: 'Dallas, TX',
        rating: 5,
        date: '2026-09-08',
        title: 'So soft',
        body: 'Thick and absorbent and it does not slide around. Washes well.',
      },
      {
        author: 'Ryan M.',
        location: 'Vancouver, BC',
        rating: 4,
        date: '2026-08-11',
        title: 'Good mat',
        body: 'Dries quicker than our old one. Colour is a nice warm white.',
      },
    ],
  },
  {
    slug: 'ceramic-bath-accessory-set',
    sku: 'RL-BTH-002',
    name: 'Ceramic Bath Accessory Set',
    category: 'bathroom',
    price: 48,
    summary: 'A four-piece matte ceramic set with soap dispenser, tumbler, toothbrush holder and soap dish.',
    description: [
      'Coordinated pieces bring order and calm to a busy countertop. The matte glaze is easy to wipe clean and resists water spots.',
    ],
    highlights: ['Four coordinated pieces', 'Rust-resistant pump', 'Matte, easy-clean glaze'],
    details: [
      { label: 'Material', value: 'Ceramic, stainless steel pump' },
      { label: 'Includes', value: 'Dispenser, tumbler, toothbrush holder, soap dish' },
    ],
    care: ['Wipe clean with a damp cloth', 'Hand wash only'],
    images: [{ src: bathSet1, alt: 'Clean bathroom vanity with plants and natural light' }],
    rating: 4.4,
    reviewCount: 37,
    reviews: [
      {
        author: 'Lily N.',
        location: 'Minneapolis, MN',
        rating: 5,
        date: '2026-08-25',
        title: 'Looks high end',
        body: 'The matte finish is beautiful and the pump works smoothly.',
      },
      {
        author: 'Jack E.',
        location: 'Raleigh, NC',
        rating: 4,
        date: '2026-07-22',
        title: 'Nice upgrade',
        body: 'Simple and well made. Made our bathroom feel much tidier.',
      },
    ],
  },
  {
    slug: 'amber-glass-soy-candle',
    sku: 'RL-DEC-001',
    name: 'Amber Glass Soy Candle',
    category: 'decor',
    price: 32,
    badge: 'New',
    featured: true,
    summary: 'A hand-poured soy wax candle in amber glass with notes of cedar, vanilla and soft amber.',
    description: [
      'Hand-poured in small batches with a clean-burning soy blend and a cotton wick. A warm, balanced fragrance of cedar, vanilla and amber fills the room without overpowering it.',
    ],
    highlights: ['Approximately 50 hour burn time', 'Natural soy wax blend', 'Lead-free cotton wick'],
    details: [
      { label: 'Wax', value: 'Soy wax blend' },
      { label: 'Burn time', value: 'Approximately 50 hours' },
      { label: 'Notes', value: 'Cedar, vanilla, amber' },
    ],
    care: ['Trim wick to 1/4 inch before each burn', 'Burn no longer than 4 hours at a time', 'Never leave a burning candle unattended'],
    images: [
      { src: candle1, alt: 'Lit amber glass soy candle beside a small plant' },
      { src: candle2, alt: 'Soy candle glowing in a cozy, softly lit room' },
    ],
    rating: 4.8,
    reviewCount: 121,
    reviews: [
      {
        author: 'Sophie R.',
        location: 'New York, NY',
        rating: 5,
        date: '2026-09-15',
        title: 'My favourite scent',
        body: 'Warm and clean, not sweet. Burns evenly all the way down.',
      },
      {
        author: 'Owen T.',
        location: 'Calgary, AB',
        rating: 5,
        date: '2026-08-19',
        title: 'Great gift',
        body: 'Bought three as gifts and kept one for myself. The glass looks beautiful once it is empty too.',
      },
    ],
  },
  {
    slug: 'floating-wall-shelf-set',
    sku: 'RL-DEC-002',
    name: 'Floating Wall Shelf Set',
    category: 'decor',
    price: 69,
    summary: 'A set of three solid wood floating shelves with concealed brackets for a clean, minimal display.',
    description: [
      'Solid wood shelves with concealed steel brackets give books, plants and favourite objects a clean place to live. Mounting hardware is included.',
    ],
    highlights: ['Set of three shelves', 'Concealed steel brackets', 'Holds up to 30 lb each when mounted into studs'],
    details: [
      { label: 'Material', value: 'Solid pine, steel brackets' },
      { label: 'Sizes', value: '16, 20 and 24 inches wide' },
    ],
    care: ['Dust with a soft dry cloth'],
    images: [{ src: shelf1, alt: 'Floating wooden shelves styled with plants and decor' }],
    rating: 4.6,
    reviewCount: 45,
    reviews: [
      {
        author: 'Ava C.',
        location: 'Charlotte, NC',
        rating: 5,
        date: '2026-08-29',
        title: 'Easy install',
        body: 'Took about twenty minutes. The brackets are completely hidden.',
      },
      {
        author: 'Lucas H.',
        location: 'Ottawa, ON',
        rating: 4,
        date: '2026-07-15',
        title: 'Sturdy and clean',
        body: 'Solid wood and very sturdy. Wood tone is slightly lighter than shown.',
      },
    ],
  },
  {
    slug: 'ribbed-ceramic-vase',
    sku: 'RL-DEC-003',
    name: 'Ribbed Ceramic Vase',
    category: 'decor',
    price: 44,
    summary: 'A tall ribbed ceramic vase with a soft matte finish, made for dried stems and fresh branches alike.',
    description: [
      'A sculptural ribbed silhouette and matte glaze make this vase a statement even when empty. Glazed inside to hold water for fresh stems.',
    ],
    highlights: ['Watertight glazed interior', 'Matte exterior finish', '14 inches tall'],
    details: [
      { label: 'Material', value: 'Ceramic' },
      { label: 'Height', value: '14 inches' },
    ],
    care: ['Hand wash only'],
    images: [{ src: vase1, alt: 'Ceramic vase with dried pampas grass beside a sofa' }],
    rating: 4.7,
    reviewCount: 39,
    reviews: [
      {
        author: 'Chloe B.',
        location: 'Salt Lake City, UT',
        rating: 5,
        date: '2026-09-06',
        title: 'Stunning',
        body: 'Heavier than expected in a good way. Looks great with dried grasses.',
      },
      {
        author: 'Isaac W.',
        location: 'Montreal, QC',
        rating: 4,
        date: '2026-08-09',
        title: 'Beautiful texture',
        body: 'The ribbing catches the light nicely. Packaging was very secure.',
      },
    ],
  },
];

export const productUrl = (slug: string) => `/products/${slug}/`;

export const getProductsByCategory = (category: string) =>
  products.filter((product) => product.category === category);

export const getFeaturedProducts = () => products.filter((product) => product.featured);

export const getSimilarProducts = (product: Product, limit = 4) => {
  const sameCategory = products.filter((p) => p.category === product.category && p.slug !== product.slug);
  const others = products.filter((p) => p.category !== product.category);
  return [...sameCategory, ...others].slice(0, limit);
};
