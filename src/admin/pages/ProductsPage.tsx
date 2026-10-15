import { useMemo, useState } from 'react';
import { AdminShell } from '../components/AdminShell';
import { Icon } from '../components/Icon';
import { Badge, ButtonLink, EmptyState, ErrorNotice, Spinner } from '../components/ui';
import { categoriesQuery, productsQuery, useLiveQuery } from '../lib/data';
import { publicImageUrl } from '../lib/firebase';
import { money } from '../lib/format';
import type { CategoryDoc, ProductDoc, ProductStatus } from '../lib/types';

export default function ProductsPage() {
  return (
    <AdminShell
      title="Products"
      description="Add products, upload photos and control what is live on the store."
      actions={
        <ButtonLink href="/admin/products/edit/">
          <Icon name="plus" size={16} /> New product
        </ButtonLink>
      }
    >
      <ProductTable />
    </AdminShell>
  );
}

function ProductTable() {
  const products = useLiveQuery<ProductDoc>(productsQuery);
  const categories = useLiveQuery<CategoryDoc>(categoriesQuery);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<ProductStatus | ''>('');

  const categoryNames = useMemo(() => new Map((categories.data ?? []).map((c) => [c.id, c.name])), [categories.data]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (products.data ?? []).filter(
      (p) =>
        (!term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)) &&
        (!category || p.categoryId === category) &&
        (!status || p.status === status),
    );
  }, [products.data, search, category, status]);

  if (products.loading) return <Spinner />;
  if (products.data.length === 0) {
    return (
      <EmptyState
        title="No products yet"
        text="Create your first product to start selling."
        action={<ButtonLink href="/admin/products/edit/">New product</ButtonLink>}
      />
    );
  }

  return (
    <div className="a-card a-card--flush">
      <ErrorNotice error={products.error} />
      <div className="a-toolbar">
        <label className="a-search">
          <Icon name="search" size={16} />
          <input className="a-input" placeholder="Search by name or SKU" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" />
        </label>
        <select className="a-input" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {(categories.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="a-input" value={status} onChange={(e) => setStatus(e.target.value as ProductStatus | '')} aria-label="Filter by status">
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Category</th>
              <th scope="col">Status</th>
              <th scope="col" className="a-num">
                Stock
              </th>
              <th scope="col" className="a-num">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} onClick={() => (window.location.href = `/admin/products/edit/?id=${p.id}`)}>
                <td>
                  <a className="a-product-cell" href={`/admin/products/edit/?id=${p.id}`}>
                    {p.images[0] ? <img src={publicImageUrl(p.images[0].path)} alt="" loading="lazy" /> : <span className="a-thumb-empty" />}
                    <span>
                      <strong>{p.name}</strong>
                      <span className="a-muted">{p.sku}</span>
                    </span>
                  </a>
                </td>
                <td>{categoryNames.get(p.categoryId) ?? p.categoryId}</td>
                <td>
                  <Badge value={p.status} />
                </td>
                <td className={`a-num ${p.inventory <= 5 ? 'a-warn' : ''}`}>{p.inventory}</td>
                <td className="a-num">{money(p.price, p.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="a-muted a-pad">No products match these filters.</p>}
      </div>
    </div>
  );
}
