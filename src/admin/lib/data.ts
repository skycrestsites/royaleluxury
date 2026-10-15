import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import type { AdminMember, CategoryDoc, InviteDoc, OrderDoc, ProductDoc, PublishState, StorageStats } from './types';

const withId = <T,>(snap: { id: string; data: () => DocumentData | undefined }) => ({ id: snap.id, ...snap.data() }) as T;

export type Live<T> = { loading: true; data: null; error: null } | { loading: false; data: T; error: Error | null };

/** Subscribes to a Firestore query and keeps React state in sync. */
export function useLiveQuery<T>(build: () => Query | null, deps: unknown[] = []): Live<T[]> {
  const [state, setState] = useState<Live<T[]>>({ loading: true, data: null, error: null });
  useEffect(() => {
    const q = build();
    if (!q) return;
    return onSnapshot(
      q,
      (snap) => setState({ loading: false, data: snap.docs.map((d) => withId<T>(d)), error: null }),
      (error) => setState({ loading: false, data: [], error }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

/** Subscribes to a single document. */
export function useLiveDoc<T>(path: string | null): Live<T | null> {
  const [state, setState] = useState<Live<T | null>>({ loading: true, data: null, error: null });
  useEffect(() => {
    if (!path) return setState({ loading: false, data: null, error: null });
    return onSnapshot(
      doc(db, path),
      (snap) => setState({ loading: false, data: snap.exists() ? withId<T>(snap) : null, error: null }),
      (error) => setState({ loading: false, data: null, error }),
    );
  }, [path]);
  return state;
}

const stamp = () => ({ updatedAt: serverTimestamp(), updatedBy: auth.currentUser?.uid ?? '' });

// ---------- Products ----------

export const productsQuery = () => query(collection(db, 'products'), orderBy('sortOrder'));

export const newProductId = () => doc(collection(db, 'products')).id;

export async function getProduct(id: string) {
  const snap = await getDoc(doc(db, 'products', id));
  return snap.exists() ? withId<ProductDoc>(snap) : null;
}

export async function isSlugTaken(slug: string, exceptId: string) {
  const snap = await getDocs(query(collection(db, 'products'), where('slug', '==', slug), limit(2)));
  return snap.docs.some((d) => d.id !== exceptId);
}

export async function saveProduct({ id, createdAt: _c, updatedAt: _u, updatedBy: _b, ...product }: ProductDoc, isNew: boolean) {
  await setDoc(
    doc(db, 'products', id),
    { ...product, ...stamp(), ...(isNew ? { createdAt: serverTimestamp() } : {}) },
    { merge: true },
  );
}

export const deleteProduct = (id: string) => deleteDoc(doc(db, 'products', id));

// ---------- Categories ----------

export const categoriesQuery = () => query(collection(db, 'categories'), orderBy('sortOrder'));

export async function listCategories() {
  const snap = await getDocs(categoriesQuery());
  return snap.docs.map((d) => withId<CategoryDoc>(d));
}

export async function saveCategory({ id, updatedAt: _u, ...category }: CategoryDoc) {
  await setDoc(doc(db, 'categories', id), { ...category, updatedAt: serverTimestamp() });
}

// ---------- Orders ----------

export const ordersQuery = (max = 200) => query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(max));

export function updateOrder(id: string, changes: Pick<OrderDoc, 'status'> & Partial<Pick<OrderDoc, 'fulfillment' | 'notes'>>) {
  return updateDoc(doc(db, 'orders', id), { ...changes, ...stamp() });
}

// ---------- Team and system ----------

export const membersQuery = () => query(collection(db, 'admins'), orderBy('email'));
export const pendingInvitesQuery = () => query(collection(db, 'invites'), where('status', '==', 'pending'));

export type { AdminMember, InviteDoc, PublishState, StorageStats };
