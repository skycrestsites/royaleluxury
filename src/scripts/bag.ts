export interface BagItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
}

const STORAGE_KEY = 'royale-bag';
export const BAG_EVENT = 'bag:change';

export function readBag(): BagItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeBag(items: BagItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(BAG_EVENT));
}

export function addToBag(item: Omit<BagItem, 'id'>) {
  const id = [item.slug, item.size, item.color].filter(Boolean).join('|');
  const items = readBag();
  const existing = items.find((entry) => entry.id === id);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    items.push({ ...item, id });
  }
  writeBag(items);
}

export function updateQuantity(id: string, quantity: number) {
  const items = readBag()
    .map((item) => (item.id === id ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);
  writeBag(items);
}

export const bagCount = (items: BagItem[]) => items.reduce((total, item) => total + item.quantity, 0);

export const bagSubtotal = (items: BagItem[]) => items.reduce((total, item) => total + item.price * item.quantity, 0);
