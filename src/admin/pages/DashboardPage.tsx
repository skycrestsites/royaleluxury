import { AdminShell } from '../components/AdminShell';
import { PublishPanel } from '../components/PublishPanel';
import { Badge, ButtonLink, Card, ErrorNotice, Spinner } from '../components/ui';
import { ordersQuery, productsQuery, useLiveDoc, useLiveQuery, type StorageStats } from '../lib/data';
import { bytes, date, money } from '../lib/format';
import type { OrderDoc, ProductDoc } from '../lib/types';

const OPEN_STATUSES = new Set(['pending', 'paid', 'fulfilled']);
const COUNTED_STATUSES = new Set(['paid', 'fulfilled', 'shipped', 'delivered']);

export default function DashboardPage() {
  return (
    <AdminShell title="Dashboard" description="A quick look at the store.">
      <Overview />
    </AdminShell>
  );
}

function Overview() {
  const products = useLiveQuery<ProductDoc>(productsQuery);
  const orders = useLiveQuery<OrderDoc>(() => ordersQuery(200));
  const { data: storage } = useLiveDoc<StorageStats>('stats/storage');

  if (products.loading || orders.loading) return <Spinner />;

  const active = products.data.filter((p) => p.status === 'active').length;
  const lowStock = products.data.filter((p) => p.status === 'active' && p.inventory <= 5);
  const open = orders.data.filter((o) => OPEN_STATUSES.has(o.status));
  const revenue = orders.data.filter((o) => COUNTED_STATUSES.has(o.status)).reduce((sum, o) => sum + o.totals.total, 0);

  return (
    <>
      <ErrorNotice error={products.error ?? orders.error} />
      <div className="a-stats">
        <Stat label="Revenue" value={money(revenue)} note={`${orders.data.length} orders total`} />
        <Stat label="Orders to fulfil" value={String(open.length)} note="Pending, paid or packed" href="/admin/orders/" />
        <Stat label="Live products" value={String(active)} note={`${products.data.length} in catalog`} href="/admin/products/" />
        <Stat label="Storage used" value={bytes(storage?.bytes ?? 0)} note={`${storage?.files ?? 0} files`} href="/admin/settings/" />
      </div>

      <div className="a-two-col">
        <Card title="Recent orders" actions={<ButtonLink variant="ghost" href="/admin/orders/">View all</ButtonLink>}>
          {orders.data.length === 0 ? (
            <p className="a-muted">No orders yet.</p>
          ) : (
            <ul className="a-rows">
              {orders.data.slice(0, 6).map((order) => (
                <li key={order.id}>
                  <a href={`/admin/orders/view/?id=${order.id}`} className="a-row-link">
                    <span>
                      <strong>{order.number}</strong>
                      <span className="a-muted">
                        {order.customer.name} · {date(order.createdAt)}
                      </span>
                    </span>
                    <span className="a-row-end">
                      <Badge value={order.status} />
                      <span>{money(order.totals.total, order.totals.currency)}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="a-stack">
          <PublishPanel />
          <Card title="Low stock">
            {lowStock.length === 0 ? (
              <p className="a-muted">Every live product has more than 5 units.</p>
            ) : (
              <ul className="a-rows">
                {lowStock.map((p) => (
                  <li key={p.id}>
                    <a href={`/admin/products/edit/?id=${p.id}`} className="a-row-link">
                      <span>{p.name}</span>
                      <span className="a-row-end">{p.inventory} left</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, note, href }: { label: string; value: string; note: string; href?: string }) {
  const body = (
    <>
      <span className="a-stat-label">{label}</span>
      <span className="a-stat-value">{value}</span>
      <span className="a-stat-note">{note}</span>
    </>
  );
  return href ? (
    <a className="a-stat" href={href}>
      {body}
    </a>
  ) : (
    <div className="a-stat">{body}</div>
  );
}
