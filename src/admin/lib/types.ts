import type { Timestamp } from 'firebase/firestore';

export type Role = 'owner' | 'admin';

export interface StoredImage {
  path: string;
  alt: string;
  width: number;
  height: number;
}

export type ProductStatus = 'draft' | 'active' | 'archived';

export interface ProductDoc {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  status: ProductStatus;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  inventory: number;
  badge: string;
  featured: boolean;
  summary: string;
  description: string[];
  highlights: string[];
  details: { label: string; value: string }[];
  care: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: StoredImage[];
  rating: number;
  reviewCount: number;
  reviews: unknown[];
  sortOrder: number;
  stripe: { productId: string; priceId: string } | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  updatedBy?: string;
}

export interface CategoryDoc {
  id: string;
  name: string;
  headline: string;
  summary: string;
  metaDescription: string;
  intro: string[];
  image: StoredImage | null;
  sortOrder: number;
  updatedAt?: Timestamp;
}

export const ORDER_STATUSES = ['pending', 'paid', 'fulfilled', 'shipped', 'delivered', 'cancelled', 'refunded'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderDoc {
  id: string;
  number: string;
  status: OrderStatus;
  customer: { name: string; email: string; phone?: string };
  shippingAddress: { line1: string; line2?: string; city: string; region: string; postalCode: string; country: string };
  items: OrderItem[];
  totals: { subtotal: number; shipping: number; tax: number; total: number; currency: string };
  payment: { provider: string; status: string; sessionId?: string; paymentIntentId?: string };
  fulfillment?: { carrier?: string; trackingNumber?: string; shippedAt?: string };
  notes?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface AdminMember {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: Role;
  createdAt?: Timestamp;
}

export interface InviteDoc {
  id: string;
  email: string;
  role: Role;
  status: 'pending' | 'accepted' | 'revoked';
  invitedByEmail: string;
  emailStatus?: 'sent' | 'failed';
  createdAt?: Timestamp;
  expiresAt?: Timestamp;
}

export interface PublishState {
  status?: 'idle' | 'building' | 'published' | 'failed';
  pendingChanges?: boolean;
  lastChangeAt?: Timestamp;
  lastPublishedAt?: Timestamp;
  requestedAt?: Timestamp;
  requestedBy?: string;
}

export interface StorageStats {
  bytes?: number;
  files?: number;
  updatedAt?: Timestamp;
}
