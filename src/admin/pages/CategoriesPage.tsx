import { useState, type FormEvent } from 'react';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { AdminShell, useAdmin } from '../components/AdminShell';
import { Icon } from '../components/Icon';
import { ImageManager } from '../components/ImageManager';
import { TextListEditor } from '../components/ListEditors';
import { Button, Card, EmptyState, ErrorNotice, Field, Spinner, useToast } from '../components/ui';
import { categoriesQuery, productsQuery, saveCategory, useLiveQuery } from '../lib/data';
import { db, publicImageUrl } from '../lib/firebase';
import { errorMessage, slugify } from '../lib/format';
import { deleteImage } from '../lib/uploads';
import type { CategoryDoc, ProductDoc } from '../lib/types';

const blankCategory = (sortOrder: number): CategoryDoc => ({
  id: '',
  name: '',
  headline: '',
  summary: '',
  metaDescription: '',
  intro: [''],
  image: null,
  sortOrder,
});

export default function CategoriesPage() {
  return (
    <AdminShell title="Categories" description="Rooms and collections shown in the store navigation.">
      <Categories />
    </AdminShell>
  );
}

function Categories() {
  const { isOwner } = useAdmin();
  const notify = useToast();
  const categories = useLiveQuery<CategoryDoc>(categoriesQuery);
  const products = useLiveQuery<ProductDoc>(productsQuery);
  const [editing, setEditing] = useState<{ category: CategoryDoc; isNew: boolean } | null>(null);

  if (categories.loading) return <Spinner />;

  const productCount = (id: string) => (products.data ?? []).filter((p) => p.categoryId === id).length;

  async function remove(category: CategoryDoc) {
    if (productCount(category.id) > 0) {
      notify('Move or delete the products in this category first.', 'error');
      return;
    }
    if (!window.confirm(`Delete the ${category.name} category?`)) return;
    try {
      await deleteDoc(doc(db, 'categories', category.id));
      if (category.image) await deleteImage(category.image.path);
      notify('Category deleted.');
    } catch (error) {
      notify(errorMessage(error), 'error');
    }
  }

  if (editing) {
    return (
      <CategoryForm
        initial={editing.category}
        isNew={editing.isNew}
        onDone={(saved) => {
          setEditing(null);
          if (saved) notify('Category saved. Publish the storefront to make it live.');
        }}
      />
    );
  }

  return (
    <>
      <ErrorNotice error={categories.error} />
      <div className="a-page-tools">
        <Button onClick={() => setEditing({ category: blankCategory((categories.data.at(-1)?.sortOrder ?? 0) + 1), isNew: true })}>
          <Icon name="plus" size={16} /> New category
        </Button>
      </div>
      {categories.data.length === 0 ? (
        <EmptyState title="No categories yet" text="Create a category, then add products to it." />
      ) : (
        <ul className="a-category-grid">
          {categories.data.map((category) => (
            <li key={category.id} className="a-category">
              <div className="a-category-image">
                {category.image ? <img src={publicImageUrl(category.image.path)} alt="" loading="lazy" /> : <span className="a-thumb-empty" />}
              </div>
              <div className="a-category-body">
                <h3>{category.name}</h3>
                <p className="a-muted">
                  /collections/{category.id}/ · {productCount(category.id)} products
                </p>
                <div className="a-category-actions">
                  <Button variant="secondary" onClick={() => setEditing({ category, isNew: false })}>
                    Edit
                  </Button>
                  {isOwner && (
                    <Button variant="ghost" onClick={() => remove(category)}>
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function CategoryForm({ initial, isNew, onDone }: { initial: CategoryDoc; isNew: boolean; onDone: (saved: boolean) => void }) {
  const notify = useToast();
  const [category, setCategory] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof CategoryDoc>(key: K, value: CategoryDoc[K]) => setCategory((c) => ({ ...c, [key]: value }));
  const id = isNew ? slugify(category.name) : category.id;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found: Record<string, string> = {};
    if (!category.name.trim()) found.name = 'Add a name.';
    if (!category.headline.trim()) found.headline = 'Add a headline.';
    if (!category.summary.trim()) found.summary = 'Add a short summary.';
    if (!category.image) found.image = 'Add a cover photo.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      if (isNew && (await getDoc(doc(db, 'categories', id))).exists()) {
        throw new Error('A category with this name already exists.');
      }
      await saveCategory({
        ...category,
        id,
        name: category.name.trim(),
        headline: category.headline.trim(),
        summary: category.summary.trim(),
        metaDescription: category.metaDescription.trim() || category.summary.trim(),
        intro: category.intro.map((s) => s.trim()).filter(Boolean),
      });
      if (initial.image && initial.image.path !== category.image?.path) await deleteImage(initial.image.path);
      onDone(true);
    } catch (error) {
      notify(errorMessage(error), 'error');
      setSaving(false);
    }
  }

  return (
    <form className="a-editor" onSubmit={onSubmit} noValidate>
      <div className="a-editor-main">
        <Card title={isNew ? 'New category' : `Edit ${initial.name}`}>
          <div className="a-form">
            <Field label="Name" error={errors.name} hint={id ? `royaleluxury.com/collections/${id}/` : undefined}>
              <input className="a-input" maxLength={60} value={category.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label="Headline" error={errors.headline} hint="The large heading on the collection page.">
              <input className="a-input" maxLength={120} value={category.headline} onChange={(e) => set('headline', e.target.value)} />
            </Field>
            <Field label="Summary" error={errors.summary} hint="Shown on room tiles and under the headline.">
              <textarea className="a-input" rows={2} maxLength={300} value={category.summary} onChange={(e) => set('summary', e.target.value)} />
            </Field>
            <Field label="Search description" hint="Used by Google. Defaults to the summary.">
              <textarea className="a-input" rows={2} maxLength={160} value={category.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} />
            </Field>
            <div className="a-field">
              <span className="a-field-label">Introduction</span>
              <TextListEditor items={category.intro} onChange={(v) => set('intro', v)} multiline addLabel="Add paragraph" />
            </div>
          </div>
        </Card>
      </div>
      <aside className="a-editor-side">
        <Card title="Cover photo">
          {errors.image && <p className="a-field-error">{errors.image}</p>}
          <ImageManager
            folder={`categories/${id || 'new'}`}
            images={category.image ? [category.image] : []}
            onChange={(images) => set('image', images[0] ?? null)}
            max={1}
          />
        </Card>
        <Card title="Order">
          <Field label="Sort order" hint="Lower numbers appear first in the menu.">
            <input className="a-input" type="number" step={1} value={category.sortOrder} onChange={(e) => set('sortOrder', Math.round(Number(e.target.value)))} />
          </Field>
        </Card>
        <div className="a-actions">
          <Button type="submit" busy={saving}>
            Save category
          </Button>
          <Button type="button" variant="ghost" onClick={() => onDone(false)}>
            Cancel
          </Button>
        </div>
      </aside>
    </form>
  );
}
