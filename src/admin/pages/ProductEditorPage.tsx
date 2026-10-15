import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AdminShell, useAdmin } from '../components/AdminShell';
import { ImageManager } from '../components/ImageManager';
import { ColorsEditor, DetailsEditor, TextListEditor } from '../components/ListEditors';
import { Badge, Button, Card, EmptyState, Field, Spinner, useToast } from '../components/ui';
import { deleteProduct, getProduct, isSlugTaken, listCategories, newProductId, saveProduct } from '../lib/data';
import { errorMessage, slugify } from '../lib/format';
import { deleteImage } from '../lib/uploads';
import type { CategoryDoc, ProductDoc } from '../lib/types';

const blankProduct = (id: string): ProductDoc => ({
  id,
  name: '',
  slug: '',
  sku: '',
  categoryId: '',
  status: 'draft',
  price: 0,
  compareAtPrice: null,
  currency: 'USD',
  inventory: 0,
  badge: '',
  featured: false,
  summary: '',
  description: [''],
  highlights: [],
  details: [],
  care: [],
  sizes: [],
  colors: [],
  images: [],
  rating: 0,
  reviewCount: 0,
  reviews: [],
  sortOrder: 100,
  stripe: null,
});

export default function ProductEditorPage() {
  const [id] = useState(() => new URLSearchParams(window.location.search).get('id'));
  return (
    <AdminShell title={id ? 'Edit product' : 'New product'} back={{ href: '/admin/products/', label: 'Products' }}>
      <Editor existingId={id} />
    </AdminShell>
  );
}

type Errors = Partial<Record<'name' | 'slug' | 'sku' | 'categoryId' | 'price' | 'compareAtPrice' | 'images', string>>;

/** Matches the limit enforced by the Firestore rules. */
const MAX_PRICE = 100000;

function Editor({ existingId }: { existingId: string | null }) {
  const { isOwner } = useAdmin();
  const notify = useToast();
  const [product, setProduct] = useState<ProductDoc | null>(null);
  const [original, setOriginal] = useState<ProductDoc | null>(null);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [missing, setMissing] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(existingId));
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    listCategories().then(setCategories);
    if (!existingId) {
      setProduct(blankProduct(newProductId()));
      return;
    }
    getProduct(existingId).then((doc) => {
      if (!doc) return setMissing(true);
      setProduct(doc);
      setOriginal(doc);
    });
  }, [existingId]);

  const dirty = useMemo(() => JSON.stringify(product) !== JSON.stringify(original), [product, original]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty && !saving) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, saving]);

  if (missing) {
    return <EmptyState title="Product not found" text="It may have been deleted." />;
  }
  if (!product) return <Spinner />;

  const set = <K extends keyof ProductDoc>(key: K, value: ProductDoc[K]) => setProduct((p) => (p ? { ...p, [key]: value } : p));

  function validate(p: ProductDoc): Errors {
    const found: Errors = {};
    if (!p.name.trim()) found.name = 'Add a product name.';
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) found.slug = 'Use lowercase letters, numbers and single dashes.';
    if (!p.sku.trim()) found.sku = 'Add a SKU.';
    if (!p.categoryId) found.categoryId = 'Choose a category.';
    if (!(p.price > 0)) found.price = 'Set a price above zero.';
    else if (p.price > MAX_PRICE) found.price = `Prices must be ${MAX_PRICE.toLocaleString()} or less.`;
    if (p.compareAtPrice !== null && !(p.compareAtPrice > p.price && p.compareAtPrice <= MAX_PRICE)) {
      found.compareAtPrice = 'Must be higher than the price, or leave it empty.';
    }
    if (p.status === 'active' && p.images.length === 0) found.images = 'Live products need at least one photo.';
    return found;
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (!product) return;
    const clean: ProductDoc = {
      ...product,
      name: product.name.trim(),
      sku: product.sku.trim(),
      description: product.description.map((s) => s.trim()).filter(Boolean),
      highlights: product.highlights.map((s) => s.trim()).filter(Boolean),
      care: product.care.map((s) => s.trim()).filter(Boolean),
      sizes: product.sizes.map((s) => s.trim()).filter(Boolean),
      details: product.details.filter((d) => d.label.trim() && d.value.trim()),
      colors: product.colors.filter((c) => c.name.trim()),
      stripe: product.stripe?.priceId.trim() ? product.stripe : null,
    };
    const found = validate(clean);
    setErrors(found);
    if (Object.keys(found).length) {
      notify('Please fix the highlighted fields.', 'error');
      return;
    }

    setSaving(true);
    try {
      if (await isSlugTaken(clean.slug, clean.id)) {
        setErrors({ slug: 'Another product already uses this URL.' });
        throw new Error('That URL is already in use.');
      }
      await saveProduct(clean, !original);
      const removed = (original?.images ?? []).filter((img) => !clean.images.some((i) => i.path === img.path));
      await Promise.all(removed.map((img) => deleteImage(img.path)));
      setProduct(clean);
      setOriginal(clean);
      notify('Product saved. Publish the storefront to make it live.');
      if (!original) window.history.replaceState(null, '', `/admin/products/edit/?id=${clean.id}`);
    } catch (error) {
      notify(errorMessage(error), 'error');
    }
    setSaving(false);
  }

  async function onDelete() {
    if (!product || !original) return;
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteProduct(product.id);
      await Promise.all(original.images.map((img) => deleteImage(img.path)));
      window.location.replace('/admin/products/');
    } catch (error) {
      notify(errorMessage(error), 'error');
      setDeleting(false);
    }
  }

  return (
    <form className="a-editor" onSubmit={onSave} noValidate>
      <div className="a-editor-main">
        <Card title="Details">
          <div className="a-form">
            <Field label="Name" error={errors.name}>
              <input
                className="a-input"
                value={product.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setProduct((p) => (p ? { ...p, name, slug: slugTouched ? p.slug : slugify(name) } : p));
                }}
              />
            </Field>
            <Field label="Short summary" hint="One or two sentences shown under the product name.">
              <textarea className="a-input" rows={2} maxLength={300} value={product.summary} onChange={(e) => set('summary', e.target.value)} />
            </Field>
            <div className="a-field">
              <span className="a-field-label">Description</span>
              <TextListEditor items={product.description} onChange={(v) => set('description', v)} multiline placeholder="A paragraph about the product" addLabel="Add paragraph" />
            </div>
          </div>
        </Card>

        <Card title="Photos">
          {errors.images && <p className="a-field-error">{errors.images}</p>}
          <ImageManager folder={`products/${product.id}`} images={product.images} onChange={(v) => set('images', v)} />
        </Card>

        <Card title="Highlights and specifications">
          <div className="a-form">
            <div className="a-field">
              <span className="a-field-label">Highlights</span>
              <TextListEditor items={product.highlights} onChange={(v) => set('highlights', v)} placeholder="e.g. Long-staple Egyptian cotton" addLabel="Add highlight" />
            </div>
            <div className="a-field">
              <span className="a-field-label">Specifications</span>
              <DetailsEditor items={product.details} onChange={(v) => set('details', v)} />
            </div>
            <div className="a-field">
              <span className="a-field-label">Care instructions</span>
              <TextListEditor items={product.care} onChange={(v) => set('care', v)} placeholder="e.g. Machine wash cold" addLabel="Add step" />
            </div>
          </div>
        </Card>

        <Card title="Options">
          <div className="a-form a-form--two">
            <div className="a-field">
              <span className="a-field-label">Sizes</span>
              <TextListEditor items={product.sizes} onChange={(v) => set('sizes', v)} placeholder="e.g. Queen" addLabel="Add size" />
            </div>
            <div className="a-field">
              <span className="a-field-label">Colours</span>
              <ColorsEditor items={product.colors} onChange={(v) => set('colors', v)} />
            </div>
          </div>
        </Card>
      </div>

      <aside className="a-editor-side">
        <Card title="Status" actions={dirty ? <Badge value="pending" label="Unsaved" /> : undefined}>
          <div className="a-form">
            <Field label="Visibility" hint="Only active products appear on the store.">
              <select className="a-input" value={product.status} onChange={(e) => set('status', e.target.value as ProductDoc['status'])}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
            <label className="a-check">
              <input type="checkbox" checked={product.featured} onChange={(e) => set('featured', e.target.checked)} />
              Feature on the home page
            </label>
            <Button type="submit" busy={saving}>
              Save product
            </Button>
          </div>
        </Card>

        <Card title="Organisation">
          <div className="a-form">
            <Field label="Category" error={errors.categoryId}>
              <select className="a-input" value={product.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
                <option value="">Choose a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="URL" error={errors.slug} hint={`royaleluxury.com/products/${product.slug || 'your-product'}/`}>
              <input
                className="a-input"
                value={product.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug', slugify(e.target.value));
                }}
              />
            </Field>
            <Field label="SKU" error={errors.sku}>
              <input className="a-input" value={product.sku} onChange={(e) => set('sku', e.target.value)} />
            </Field>
            <Field label="Badge" hint="Optional label on the product card, e.g. Bestseller.">
              <input className="a-input" maxLength={24} value={product.badge} onChange={(e) => set('badge', e.target.value)} />
            </Field>
            <Field label="Sort order" hint="Lower numbers appear first.">
              <input className="a-input" type="number" step={1} value={product.sortOrder} onChange={(e) => set('sortOrder', Math.round(Number(e.target.value)))} />
            </Field>
          </div>
        </Card>

        <Card title="Pricing and stock">
          <div className="a-form">
            <Field label="Price (USD)" error={errors.price}>
              <input className="a-input" type="number" min={0} step="0.01" value={product.price} onChange={(e) => set('price', Number(e.target.value))} />
            </Field>
            <Field label="Compare at price" hint="Optional original price, shown struck through." error={errors.compareAtPrice}>
              <input
                className="a-input"
                type="number"
                min={0}
                step="0.01"
                value={product.compareAtPrice ?? ''}
                onChange={(e) => set('compareAtPrice', e.target.value === '' ? null : Number(e.target.value))}
              />
            </Field>
            <Field label="Inventory">
              <input className="a-input" type="number" min={0} step={1} value={product.inventory} onChange={(e) => set('inventory', Math.max(0, Math.round(Number(e.target.value))))} />
            </Field>
          </div>
        </Card>

        <Card title="Stripe">
          <div className="a-form">
            <p className="a-muted">Optional until checkout is connected. Paste the IDs from your Stripe dashboard.</p>
            <Field label="Product ID">
              <input
                className="a-input"
                placeholder="prod_..."
                value={product.stripe?.productId ?? ''}
                onChange={(e) => set('stripe', { productId: e.target.value.trim(), priceId: product.stripe?.priceId ?? '' })}
              />
            </Field>
            <Field label="Price ID">
              <input
                className="a-input"
                placeholder="price_..."
                value={product.stripe?.priceId ?? ''}
                onChange={(e) => set('stripe', { productId: product.stripe?.productId ?? '', priceId: e.target.value.trim() })}
              />
            </Field>
          </div>
        </Card>

        {original && (
          <Card title="Reviews">
            <p className="a-muted">
              {product.reviewCount} reviews, {product.rating.toFixed(1)} average.
            </p>
          </Card>
        )}

        {original && isOwner && (
          <Button type="button" variant="danger" busy={deleting} onClick={onDelete}>
            Delete product
          </Button>
        )}
      </aside>
    </form>
  );
}
